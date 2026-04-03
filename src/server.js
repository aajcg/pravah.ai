import "dotenv/config";
import express from "express";
import axios from "axios";
import { extractHandoff } from "./extractHandoff.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const CHAT_FALLBACK_ANSWER = "Not specified in handoff";
const HANDOFF_KEYS = [
  "blockers",
  "tasks",
  "owners",
  "deadlines",
  "decisions",
  "dependencies",
];

app.use(express.json());

app.get("/health", (_req, res) => {
  return res.json({ status: "ok" });
});

function getEmptyHandoff() {
  return {
    blockers: [],
    tasks: [],
    owners: [],
    deadlines: [],
    decisions: [],
    dependencies: [],
  };
}

function sanitizeHandoffOutput(output) {
  const source = output && typeof output === "object" && !Array.isArray(output) ? output : {};
  const sanitized = {};

  for (const key of HANDOFF_KEYS) {
    if (!Array.isArray(source[key])) {
      sanitized[key] = [];
      continue;
    }

    sanitized[key] = source[key]
      .filter((item) => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return sanitized;
}

function answerFromStructuredHandoff(question, handoff) {
  const q = String(question ?? "").toLowerCase();

  if (q.includes("owner") || q.includes("owns") || q.includes("responsible")) {
    return handoff.owners[0] ?? CHAT_FALLBACK_ANSWER;
  }

  if (q.includes("blocker") || q.includes("blocked")) {
    return handoff.blockers[0] ?? CHAT_FALLBACK_ANSWER;
  }

  if (q.includes("deadline") || q.includes("due") || q.includes("when")) {
    return handoff.deadlines[0] ?? CHAT_FALLBACK_ANSWER;
  }

  if (q.includes("decision") || q.includes("decided")) {
    return handoff.decisions[0] ?? CHAT_FALLBACK_ANSWER;
  }

  if (q.includes("depend") || q.includes("prerequisite")) {
    return handoff.dependencies[0] ?? CHAT_FALLBACK_ANSWER;
  }

  if (q.includes("task") || q.includes("action") || q.includes("next")) {
    return handoff.tasks[0] ?? CHAT_FALLBACK_ANSWER;
  }

  return CHAT_FALLBACK_ANSWER;
}

async function answerFromHandoff(question, handoff) {
  const safeHandoff = sanitizeHandoffOutput(handoff);
  const deterministicAnswer = answerFromStructuredHandoff(question, safeHandoff);

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return deterministicAnswer;
  }

  const isHandoffEmpty = HANDOFF_KEYS.every((key) => safeHandoff[key].length === 0);
  if (isHandoffEmpty) {
    return CHAT_FALLBACK_ANSWER;
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: "mistralai/mixtral-8x7b-instruct",
        temperature: 0.1,
        max_tokens: 120,
        messages: [
          {
            role: "system",
            content:
              "You answer questions using ONLY the given handoff JSON. Keep answers short and actionable. If information is missing, reply exactly: Not specified in handoff.",
          },
          {
            role: "user",
            content: [
              "Question:",
              question,
              "Handoff JSON:",
              JSON.stringify(safeHandoff),
            ].join("\n"),
          },
        ],
      },
      {
        timeout: 15000,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const answer = String(response?.data?.choices?.[0]?.message?.content ?? "").trim();
    if (!answer || answer === CHAT_FALLBACK_ANSWER) {
      return deterministicAnswer;
    }

    return answer;
  } catch (error) {
    console.error("/chat OpenRouter request failed", error?.message ?? error);
    return deterministicAnswer;
  }
}

app.post("/handoff/extract", async (req, res) => {
  const { messages } = req.body ?? {};
  const isValidInput = Array.isArray(messages) && messages.every((item) => typeof item === "string");

  if (!isValidInput) {
    return res.status(400).json({
      error: "Invalid input: body must be { messages: string[] }",
    });
  }

  try {
    const output = await extractHandoff(messages);
    const sanitized = sanitizeHandoffOutput(output);
    return res.json(sanitized);
  } catch (error) {
    console.error("/handoff/extract failed", error);
    return res.status(500).json(getEmptyHandoff());
  }
});

app.post("/chat", async (req, res) => {
  const { question, handoff } = req.body ?? {};
  const isValidQuestion = typeof question === "string" && question.trim().length > 0;
  const isValidHandoff = handoff && typeof handoff === "object" && !Array.isArray(handoff);

  if (!isValidQuestion || !isValidHandoff) {
    return res.status(400).json({
      error: "Invalid input: body must be { question: string, handoff: object }",
    });
  }

  const answer = await answerFromHandoff(question.trim(), handoff);
  return res.json({ answer });
});

app.use((error, _req, res, next) => {
  if (error && error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  return next(error);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

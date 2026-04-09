import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
export const CHAT_FALLBACK_ANSWER = "Not specified in handoff";
export const HANDOFF_KEYS = [
  "blockers",
  "tasks",
  "owners",
  "deadlines",
  "decisions",
  "dependencies",
];

export function getEmptyHandoff() {
  return {
    blockers: [],
    tasks: [],
    owners: [],
    deadlines: [],
    decisions: [],
    dependencies: [],
  };
}

export function sanitizeHandoffOutput(output) {
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

export function answerFromStructuredHandoff(question, handoff) {
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

export async function answerFromHandoff(question, handoff) {
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
            content: ["Question:", question, "Handoff JSON:", JSON.stringify(safeHandoff)].join(
              "\n"
            ),
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

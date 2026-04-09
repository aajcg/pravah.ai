import "dotenv/config";
import express from "express";
import cors from "cors";
import { extractHandoff } from "./extractHandoff.js";
import {
  answerFromHandoff,
  getEmptyHandoff,
  sanitizeHandoffOutput,
} from "./handoffChat.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGINS = (process.env.CORS_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: CORS_ORIGINS,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  return res.json({ status: "ok" });
});

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

import { answerFromHandoff } from "../src/handoffChat.js";
import { applyCors, handleOptions, parseJsonBody } from "./_lib/http.js";

const ALLOWED_METHODS = "POST,OPTIONS";

export default async function handler(req, res) {
  if (handleOptions(req, res, ALLOWED_METHODS)) {
    return;
  }

  applyCors(req, res, ALLOWED_METHODS);

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = await parseJsonBody(req);
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  const { question, handoff } = body ?? {};
  const isValidQuestion = typeof question === "string" && question.trim().length > 0;
  const isValidHandoff = handoff && typeof handoff === "object" && !Array.isArray(handoff);

  if (!isValidQuestion || !isValidHandoff) {
    return res.status(400).json({
      error: "Invalid input: body must be { question: string, handoff: object }",
    });
  }

  const answer = await answerFromHandoff(question.trim(), handoff);
  return res.status(200).json({ answer });
}

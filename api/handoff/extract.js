import { extractHandoff } from "../../src/extractHandoff.js";
import { getEmptyHandoff, sanitizeHandoffOutput } from "../../src/handoffChat.js";
import { applyCors, handleOptions, parseJsonBody } from "../_lib/http.js";

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

  const { messages } = body ?? {};
  const isValidInput = Array.isArray(messages) && messages.every((item) => typeof item === "string");

  if (!isValidInput) {
    return res.status(400).json({
      error: "Invalid input: body must be { messages: string[] }",
    });
  }

  try {
    const output = await extractHandoff(messages);
    const sanitized = sanitizeHandoffOutput(output);
    return res.status(200).json(sanitized);
  } catch (error) {
    console.error("/handoff/extract failed", error);
    return res.status(500).json(getEmptyHandoff());
  }
}

import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const EMPTY_HANDOFF = Object.freeze({
  blockers: [],
  tasks: [],
  owners: [],
  deadlines: [],
  decisions: [],
  dependencies: [],
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

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripCodeFences(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractJSONObject(rawText) {
  const text = stripCodeFences(rawText);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    return "";
  }

  return text.slice(start, end + 1);
}

function toStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeHandoff(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return getEmptyHandoff();
  }

  return {
    blockers: toStringArray(parsed.blockers),
    tasks: toStringArray(parsed.tasks),
    owners: toStringArray(parsed.owners),
    deadlines: toStringArray(parsed.deadlines),
    decisions: toStringArray(parsed.decisions),
    dependencies: toStringArray(parsed.dependencies),
  };
}

function buildMessagesPrompt(messages) {
  return [
    "You are a structured extraction engine for work handoffs.",
    "Return strict JSON only. No markdown. No comments. No extra keys.",
    "Required JSON schema exactly:",
    '{"blockers":[],"tasks":[],"owners":[],"deadlines":[],"decisions":[],"dependencies":[]}',
    "Definitions:",
    "- blockers: unresolved issues preventing progress.",
    "- tasks: clear actionable items.",
    "- owners: responsibility mapping in format Name -> responsibility, else unassigned -> task.",
    "- deadlines: explicit time commitments.",
    "- decisions: finalized choices.",
    "- dependencies: prerequisite relationships in format X before Y.",
    "Rules:",
    "- Each item must be a concise one-line string.",
    "- Extract only actionable and important information.",
    "- If unclear, infer reasonably without inventing facts.",
    "- If a category has nothing, use an empty array.",
    "Conversation messages:",
    JSON.stringify(messages),
  ].join("\n");
}

/**
 * Convert a conversation message array into a strict actionable handoff JSON.
 * @param {string[]} messages - Slack-like message strings.
 * @param {object} [options]
 * @param {string} [options.model] - OpenRouter model override.
 * @param {number} [options.temperature] - Sampling temperature.
 * @param {number} [options.maxTokens] - Max completion tokens.
 * @param {number} [options.timeoutMs] - Request timeout in milliseconds.
 * @param {(message: string, error?: unknown) => void} [options.logger] - Optional logger.
 * @returns {Promise<{blockers:string[],tasks:string[],owners:string[],deadlines:string[],decisions:string[],dependencies:string[]}>}
 */
export async function extractHandoff(messages, options = {}) {
  const {
    model = "mistralai/mixtral-8x7b-instruct",
    temperature = 0.1,
    maxTokens = 700,
    timeoutMs = 15000,
    logger,
  } = options;

  const safeMessages = sanitizeMessages(messages);
  if (safeMessages.length === 0) {
    return getEmptyHandoff();
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    logger?.("OPENROUTER_API_KEY is missing; returning fallback JSON.");
    return getEmptyHandoff();
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          {
            role: "system",
            content:
              "You transform conversations into strict actionable JSON and output only valid JSON.",
          },
          {
            role: "user",
            content: buildMessagesPrompt(safeMessages),
          },
        ],
      },
      {
        timeout: timeoutMs,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const rawContent = response?.data?.choices?.[0]?.message?.content;
    if (typeof rawContent !== "string" || rawContent.trim() === "") {
      logger?.("OpenRouter returned empty content; returning fallback JSON.");
      return getEmptyHandoff();
    }

    const jsonText = extractJSONObject(rawContent);
    if (!jsonText) {
      logger?.("No JSON object found in model response; returning fallback JSON.");
      return getEmptyHandoff();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      logger?.("Failed to parse model JSON; returning fallback JSON.", parseError);
      return getEmptyHandoff();
    }

    return normalizeHandoff(parsed);
  } catch (error) {
    logger?.("OpenRouter request failed; returning fallback JSON.", error);
    return getEmptyHandoff();
  }
}

export { EMPTY_HANDOFF };

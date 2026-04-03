import axios from "axios";
import { EMPTY_HANDOFF, type HandoffKey, type HandoffPayload } from "@/types/handoff";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "mistralai/mixtral-8x7b-instruct";
const CHAT_FALLBACK_ANSWER = "Not specified in handoff";
const HANDOFF_KEYS: HandoffKey[] = [
  "blockers",
  "tasks",
  "owners",
  "deadlines",
  "decisions",
  "dependencies",
];

export type AiSource = "openrouter" | "fallback";

export interface ExtractHandoffResult {
  handoff: HandoffPayload;
  source: AiSource;
}

export interface ChatAnswerResult {
  answer: string;
  source: AiSource;
}

interface ExtractHandoffOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  logger?: (message: string, error?: unknown) => void;
}

function getOpenRouterModel(modelOverride?: string): string {
  const model = modelOverride?.trim() || process.env.OPENROUTER_MODEL?.trim();
  return model && model.length > 0 ? model : DEFAULT_OPENROUTER_MODEL;
}

function getOpenRouterTimeout(timeoutOverride?: number): number {
  if (typeof timeoutOverride === "number" && Number.isFinite(timeoutOverride) && timeoutOverride > 0) {
    return timeoutOverride;
  }

  const fromEnv = Number(process.env.OPENROUTER_TIMEOUT_MS ?? 15000);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 15000;
}

function getOpenRouterHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const siteUrl = process.env.OPENROUTER_SITE_URL?.trim();
  if (siteUrl) {
    headers["HTTP-Referer"] = siteUrl;
  }

  const appName = process.env.OPENROUTER_APP_NAME?.trim();
  if (appName) {
    headers["X-Title"] = appName;
  }

  return headers;
}

export function getEmptyHandoff(): HandoffPayload {
  return {
    blockers: [],
    tasks: [],
    owners: [],
    deadlines: [],
    decisions: [],
    dependencies: [],
  };
}

function sanitizeMessages(messages: unknown): string[] {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function stripCodeFences(value: unknown): string {
  const text = String(value ?? "").trim();
  if (!text) {
    return "";
  }

  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractJSONObject(rawText: string): string {
  const text = stripCodeFences(rawText);
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");

  if (start === -1 || end === -1 || end < start) {
    return "";
  }

  return text.slice(start, end + 1);
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeHandoff(parsed: unknown): HandoffPayload {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return getEmptyHandoff();
  }

  const input = parsed as Partial<Record<HandoffKey, unknown>>;

  return {
    blockers: toStringArray(input.blockers),
    tasks: toStringArray(input.tasks),
    owners: toStringArray(input.owners),
    deadlines: toStringArray(input.deadlines),
    decisions: toStringArray(input.decisions),
    dependencies: toStringArray(input.dependencies),
  };
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function extractHandoffLocally(messages: string[]): HandoffPayload {
  const result = getEmptyHandoff();

  for (const message of messages) {
    const original = message.trim();
    const text = original.toLowerCase();

    if (
      includesAny(text, [
        "blocked",
        "blocker",
        "failing",
        "failure",
        "issue",
        "error",
        "timeout",
      ])
    ) {
      result.blockers.push(original);
    }

    if (
      includesAny(text, [
        "working on",
        "fix",
        "implement",
        "deploy",
        "investigate",
        "todo",
        "action",
      ])
    ) {
      result.tasks.push(original);
    }

    if (includesAny(text, ["deadline", "by ", "tonight", "tomorrow", "eod", "eta"])) {
      result.deadlines.push(original);
    }

    if (includesAny(text, ["decided", "decision", "we will", "we won't", "do not", "not to"])) {
      result.decisions.push(original);
    }

    if (includesAny(text, ["depends", "dependency", "before", "after", "prerequisite"])) {
      result.dependencies.push(original);
    }

    const ownerMatch = original.match(
      /([A-Z][a-zA-Z]+)\s+(is working on|owns|will handle|will fix|to handle)\s+(.+)/
    );

    if (ownerMatch) {
      const owner = ownerMatch[1].trim();
      const responsibility = ownerMatch[3].trim();
      result.owners.push(`${owner} -> ${responsibility}`);
    }
  }

  result.blockers = unique(result.blockers);
  result.tasks = unique(result.tasks);
  result.owners = unique(result.owners);
  result.deadlines = unique(result.deadlines);
  result.decisions = unique(result.decisions);
  result.dependencies = unique(result.dependencies);

  return result;
}

function buildMessagesPrompt(messages: string[]): string {
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

export function sanitizeHandoffOutput(output: unknown): HandoffPayload {
  if (!output || typeof output !== "object" || Array.isArray(output)) {
    return getEmptyHandoff();
  }

  const source = output as Partial<Record<HandoffKey, unknown>>;
  const sanitized = getEmptyHandoff();

  for (const key of HANDOFF_KEYS) {
    if (!Array.isArray(source[key])) {
      sanitized[key] = [];
      continue;
    }

    sanitized[key] = source[key]
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return sanitized;
}

function answerFromStructuredHandoff(question: string, handoff: HandoffPayload): string {
  const q = question.toLowerCase();

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

export async function answerFromHandoffWithSource(
  question: string,
  handoff: unknown
): Promise<ChatAnswerResult> {
  const safeHandoff = sanitizeHandoffOutput(handoff);
  const deterministicAnswer = answerFromStructuredHandoff(question, safeHandoff);

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey || apiKey.length === 0) {
    return {
      answer: deterministicAnswer,
      source: "fallback",
    };
  }

  const isHandoffEmpty = HANDOFF_KEYS.every((key) => safeHandoff[key].length === 0);
  if (isHandoffEmpty) {
    return {
      answer: CHAT_FALLBACK_ANSWER,
      source: "fallback",
    };
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: getOpenRouterModel(),
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
        timeout: getOpenRouterTimeout(),
        headers: getOpenRouterHeaders(apiKey),
      }
    );

    const answer = String(response?.data?.choices?.[0]?.message?.content ?? "").trim();
    if (!answer || answer === CHAT_FALLBACK_ANSWER) {
      return {
        answer: deterministicAnswer,
        source: "fallback",
      };
    }

    return {
      answer,
      source: "openrouter",
    };
  } catch (error) {
    console.error("/chat OpenRouter request failed", error);
    return {
      answer: deterministicAnswer,
      source: "fallback",
    };
  }
}

export async function answerFromHandoff(question: string, handoff: unknown): Promise<string> {
  const { answer } = await answerFromHandoffWithSource(question, handoff);
  return answer;
}

export async function extractHandoffWithSource(
  messages: string[],
  options: ExtractHandoffOptions = {}
): Promise<ExtractHandoffResult> {
  const {
    model,
    temperature = 0.1,
    maxTokens = 700,
    timeoutMs,
    logger,
  } = options;
  const resolvedModel = getOpenRouterModel(model);
  const resolvedTimeoutMs = getOpenRouterTimeout(timeoutMs);

  const safeMessages = sanitizeMessages(messages);
  if (safeMessages.length === 0) {
    return {
      handoff: { ...EMPTY_HANDOFF },
      source: "fallback",
    };
  }

  const localFallback = extractHandoffLocally(safeMessages);
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!apiKey || apiKey.length === 0) {
    logger?.("OPENROUTER_API_KEY is missing; returning fallback JSON.");
    return {
      handoff: localFallback,
      source: "fallback",
    };
  }

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: resolvedModel,
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
        timeout: resolvedTimeoutMs,
        headers: getOpenRouterHeaders(apiKey),
      }
    );

    const rawContent = response?.data?.choices?.[0]?.message?.content;
    if (typeof rawContent !== "string" || rawContent.trim() === "") {
      logger?.("OpenRouter returned empty content; returning fallback JSON.");
      return {
        handoff: localFallback,
        source: "fallback",
      };
    }

    const jsonText = extractJSONObject(rawContent);
    if (!jsonText) {
      logger?.("No JSON object found in model response; returning fallback JSON.");
      return {
        handoff: localFallback,
        source: "fallback",
      };
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      logger?.("Failed to parse model JSON; returning fallback JSON.", parseError);
      return {
        handoff: localFallback,
        source: "fallback",
      };
    }

    const normalized = normalizeHandoff(parsed);
    const isEmpty = HANDOFF_KEYS.every((key) => normalized[key].length === 0);
    if (isEmpty) {
      return {
        handoff: localFallback,
        source: "fallback",
      };
    }

    return {
      handoff: normalized,
      source: "openrouter",
    };
  } catch (error) {
    logger?.("OpenRouter request failed; returning fallback JSON.", error);
    return {
      handoff: localFallback,
      source: "fallback",
    };
  }
}

export async function extractHandoff(
  messages: string[],
  options: ExtractHandoffOptions = {}
): Promise<HandoffPayload> {
  const { handoff } = await extractHandoffWithSource(messages, options);
  return handoff;
}
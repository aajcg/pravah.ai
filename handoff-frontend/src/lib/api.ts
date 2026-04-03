import axios from "axios";
import {
  EMPTY_HANDOFF,
  type HandoffKey,
  type HandoffPayload,
} from "@/types/handoff";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

const api = axios.create({
  baseURL: apiBaseUrl && apiBaseUrl.length > 0 ? apiBaseUrl : "/",
  timeout: 20_000,
  headers: {
    "Content-Type": "application/json",
  },
});

const HANDOFF_KEYS: HandoffKey[] = [
  "blockers",
  "tasks",
  "owners",
  "deadlines",
  "decisions",
  "dependencies",
];

function sanitizeHandoff(payload: unknown): HandoffPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { ...EMPTY_HANDOFF };
  }

  const source = payload as Partial<Record<HandoffKey, unknown>>;
  const result: HandoffPayload = { ...EMPTY_HANDOFF };

  for (const key of HANDOFF_KEYS) {
    const maybeList = source[key];

    if (!Array.isArray(maybeList)) {
      result[key] = [];
      continue;
    }

    result[key] = maybeList
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return result;
}

export async function extractHandoffRequest(
  messages: string[]
): Promise<HandoffPayload> {
  const { data } = await api.post("/handoff/extract", { messages });
  return sanitizeHandoff(data);
}

export async function chatAboutHandoff(
  question: string,
  handoff: HandoffPayload
): Promise<string> {
  const { data } = await api.post("/chat", {
    question,
    handoff,
  });

  const answer =
    data && typeof data === "object" && "answer" in data
      ? String((data as { answer?: unknown }).answer ?? "")
      : "";

  return answer.trim() || "Not specified in handoff";
}

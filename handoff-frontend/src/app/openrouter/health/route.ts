import axios from "axios";
import { NextResponse } from "next/server";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_OPENROUTER_MODEL = "mistralai/mixtral-8x7b-instruct";

export const runtime = "nodejs";
export const maxDuration = 30;

function getOpenRouterModel(): string {
  const model = process.env.OPENROUTER_MODEL?.trim();
  return model && model.length > 0 ? model : DEFAULT_OPENROUTER_MODEL;
}

function getOpenRouterTimeout(): number {
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const runLiveCheck = url.searchParams.get("live") === "1";
  const model = getOpenRouterModel();
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();

  if (!runLiveCheck) {
    return NextResponse.json({
      ok: true,
      configured: Boolean(apiKey && apiKey.length > 0),
      model,
      endpoint: OPENROUTER_URL,
      liveCheck: "/openrouter/health?live=1",
    });
  }

  if (!apiKey || apiKey.length === 0) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error: "OPENROUTER_API_KEY is missing",
      },
      { status: 500 }
    );
  }

  const startedAt = Date.now();

  try {
    const response = await axios.post(
      OPENROUTER_URL,
      {
        model,
        temperature: 0,
        max_tokens: 16,
        messages: [
          {
            role: "user",
            content: "Reply with exactly: OPENROUTER_OK",
          },
        ],
      },
      {
        timeout: getOpenRouterTimeout(),
        headers: getOpenRouterHeaders(apiKey),
      }
    );

    const content = String(response?.data?.choices?.[0]?.message?.content ?? "").trim();

    return NextResponse.json({
      ok: content.length > 0,
      configured: true,
      model,
      latencyMs: Date.now() - startedAt,
      response: content || null,
    });
  } catch (error) {
    const message = axios.isAxiosError(error)
      ? `${error.response?.status ?? "ERR"} ${error.message}`
      : "OpenRouter request failed";

    return NextResponse.json(
      {
        ok: false,
        configured: true,
        model,
        latencyMs: Date.now() - startedAt,
        error: message,
      },
      { status: 502 }
    );
  }
}

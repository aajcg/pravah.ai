import { NextResponse } from "next/server";
import { extractHandoffWithSource, getEmptyHandoff } from "@/lib/handoff-server";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ExtractRequestBody {
  messages?: unknown;
}

export async function POST(request: Request) {
  let body: ExtractRequestBody;

  try {
    body = (await request.json()) as ExtractRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages } = body;
  const isValidInput =
    Array.isArray(messages) && messages.every((item) => typeof item === "string");

  if (!isValidInput) {
    return NextResponse.json(
      { error: "Invalid input: body must be { messages: string[] }" },
      { status: 400 }
    );
  }

  try {
    const { handoff, source } = await extractHandoffWithSource(messages);
    const response = NextResponse.json(handoff);
    response.headers.set("x-pravah-ai-source", source);
    return response;
  } catch (error) {
    console.error("/handoff/extract failed", error);
    const response = NextResponse.json(getEmptyHandoff(), { status: 500 });
    response.headers.set("x-pravah-ai-source", "fallback");
    return response;
  }
}
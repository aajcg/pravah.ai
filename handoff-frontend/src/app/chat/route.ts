import { NextResponse } from "next/server";
import { answerFromHandoffWithSource } from "@/lib/handoff-server";

export const runtime = "nodejs";
export const maxDuration = 30;

interface ChatRequestBody {
  question?: unknown;
  handoff?: unknown;
}

export async function POST(request: Request) {
  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawQuestion = body.question;
  const question = typeof rawQuestion === "string" ? rawQuestion.trim() : "";
  const handoff = body.handoff;

  const isValidQuestion = question.length > 0;
  const isValidHandoff = !!handoff && typeof handoff === "object" && !Array.isArray(handoff);

  if (!isValidQuestion || !isValidHandoff) {
    return NextResponse.json(
      { error: "Invalid input: body must be { question: string, handoff: object }" },
      { status: 400 }
    );
  }

  const { answer, source } = await answerFromHandoffWithSource(question, handoff);
  const response = NextResponse.json({ answer });
  response.headers.set("x-pravah-ai-source", source);
  return response;
}
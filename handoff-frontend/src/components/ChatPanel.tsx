"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, SendHorizontal } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHandoffStore } from "@/store/use-handoff-store";
import { cn } from "@/lib/utils";

interface TypingTextProps {
  text: string;
  animate: boolean;
}

function TypingText({ text, animate }: TypingTextProps) {
  if (!animate) {
    return <span>{text}</span>;
  }

  return (
    <span className="relative inline-flex max-w-full items-end overflow-hidden">
      <motion.span
        className="inline-block overflow-hidden whitespace-pre-wrap"
        initial={{ maxWidth: 0 }}
        animate={{ maxWidth: "100%" }}
        transition={{
          duration: Math.max(0.8, text.length * 0.02),
          ease: "linear",
        }}
      >
        {text}
      </motion.span>
      <motion.span
        className="ml-0.5 inline-block h-[1.05em] w-[2px] bg-slate-100"
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.95, repeat: Number.POSITIVE_INFINITY }}
      />
    </span>
  );
}

export default function ChatPanel() {
  const { chatMessages, isChatLoading, askQuestion } = useHandoffStore(
    useShallow((state) => ({
      chatMessages: state.chatMessages,
      isChatLoading: state.isChatLoading,
      askQuestion: state.askQuestion,
    }))
  );

  const [question, setQuestion] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatLoading]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!question.trim()) {
      return;
    }

    const value = question;
    setQuestion("");
    await askQuestion(value);
  };

  return (
    <motion.div
      whileHover={{ y: -3, rotateX: 2, rotateY: 2 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Q&A Insight</CardTitle>
          <CardDescription>
            Ask anything about this handoff and get focused answers.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="max-h-[290px] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/35 p-3">
            {chatMessages.length === 0 && (
              <p className="text-sm text-slate-300/80">
                Try: Who owns checkout retry logic? What is blocking release?
              </p>
            )}

            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "max-w-[92%] rounded-xl px-3 py-2 text-sm",
                  message.role === "user"
                    ? "ml-auto bg-cyan-500/20 text-cyan-50"
                    : "border border-violet-300/25 bg-violet-500/15 text-violet-50"
                )}
              >
                {message.role === "assistant" ? (
                  <TypingText text={message.content} animate={message.animate} />
                ) : (
                  message.content
                )}
              </div>
            ))}

            {isChatLoading && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-violet-300/30 bg-violet-500/15 px-3 py-2 text-sm text-violet-50">
                <Bot className="h-4 w-4 animate-pulse" />
                AI is reasoning...
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form className="flex gap-2" onSubmit={handleSubmit}>
            <Input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask anything about this handoff"
              disabled={isChatLoading}
            />
            <Button type="submit" size="icon" disabled={isChatLoading}>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

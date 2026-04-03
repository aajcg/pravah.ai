"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useHandoffStore } from "@/store/use-handoff-store";

const typingHints = [
  "Payment API timeout is blocking deployment...",
  "Rahul owns retry logic and needs infra input...",
  "Decision: keep webhook payload unchanged...",
];

export default function MessageInput() {
  const {
    messagesInput,
    isExtracting,
    processingLabel,
    setMessagesInput,
    fillWithExample,
    runExtraction,
  } = useHandoffStore(
    useShallow((state) => ({
      messagesInput: state.messagesInput,
      isExtracting: state.isExtracting,
      processingLabel: state.processingLabel,
      setMessagesInput: state.setMessagesInput,
      fillWithExample: state.fillWithExample,
      runExtraction: state.runExtraction,
    }))
  );

  const [hintValue, setHintValue] = useState("");

  const canShowTypingHint = useMemo(
    () => messagesInput.trim().length === 0,
    [messagesInput]
  );

  useEffect(() => {
    if (!canShowTypingHint) {
      return;
    }

    let hintIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const timer = window.setInterval(() => {
      const activeHint = typingHints[hintIndex];

      if (!deleting) {
        charIndex += 1;
        setHintValue(activeHint.slice(0, charIndex));

        if (charIndex >= activeHint.length) {
          deleting = true;
          return;
        }
      } else {
        charIndex -= 1;
        setHintValue(activeHint.slice(0, Math.max(0, charIndex)));

        if (charIndex <= 0) {
          deleting = false;
          hintIndex = (hintIndex + 1) % typingHints.length;
        }
      }
    }, 42);

    return () => {
      window.clearInterval(timer);
    };
  }, [canShowTypingHint]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runExtraction();
  };

  return (
    <motion.div
      whileHover={{ y: -3, rotateX: 2, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Raw Message Input</CardTitle>
          <CardDescription>
            Paste noisy team updates and let the system extract structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="relative">
              <Textarea
                value={messagesInput}
                onChange={(event) => setMessagesInput(event.target.value)}
                placeholder="Drop chat snippets, standup notes, or email fragments..."
                className="min-h-[220px]"
              />

              {canShowTypingHint && (
                <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg border border-cyan-300/20 bg-slate-950/60 px-3 py-2 text-xs text-cyan-200">
                  <span className="font-medium">Typing preview:</span> {hintValue}
                  <span className="typing-cursor">|</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={fillWithExample}
                disabled={isExtracting}
              >
                <Wand2 className="h-4 w-4" />
                Autofill Example
              </Button>
              <Button type="submit" disabled={isExtracting}>
                <Sparkles className="h-4 w-4" />
                {isExtracting ? "Processing" : "Extract Intelligence"}
              </Button>
            </div>

            {isExtracting && (
              <div className="rounded-xl border border-white/15 bg-white/5 p-3 text-sm text-cyan-100 shimmer">
                {processingLabel}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}

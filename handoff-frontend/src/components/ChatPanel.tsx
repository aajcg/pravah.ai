"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bot, SendHorizontal } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useHandoffStore } from "@/store/use-handoff-store";

interface TypingTextProps {
  text: string;
  animate: boolean;
}

function TypingText({ text, animate }: TypingTextProps) {
  if (!animate) return <span>{text}</span>;
  return (
    <span style={{ position: "relative", display: "inline-flex", maxWidth: "100%", alignItems: "flex-end", overflow: "hidden" }}>
      <motion.span
        style={{ display: "inline-block", overflow: "hidden", whiteSpace: "pre-wrap" }}
        initial={{ maxWidth: 0 }}
        animate={{ maxWidth: "100%" }}
        transition={{ duration: Math.max(0.8, text.length * 0.02), ease: "linear" }}
      >
        {text}
      </motion.span>
      <motion.span
        style={{
          marginLeft: 1,
          display: "inline-block",
          height: "1.05em",
          width: 2,
          background: "var(--gold)",
        }}
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.95, repeat: Infinity }}
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;
    const val = question;
    setQuestion("");
    await askQuestion(val);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      style={{ height: "100%" }}
    >
      <div style={{
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.015)",
        backdropFilter: "blur(4px)",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.3s",
      }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(212,164,76,0.3)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        {/* Top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(212,164,76,0.4), transparent)",
        }} />

        <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginBottom: 8,
            }}>
              Agent 03 / Q&A
            </div>
            <h3 style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "var(--paper)",
              marginBottom: 4,
              letterSpacing: "-0.3px",
            }}>
              Q&A Insight
            </h3>
            <p style={{
              fontFamily: "var(--font-epilogue), sans-serif",
              fontSize: 13,
              color: "var(--paper3)",
              lineHeight: 1.6,
            }}>
              Ask anything about this handoff and get focused answers.
            </p>
          </div>

          {/* Chat messages */}
          <div style={{
            flex: 1,
            maxHeight: 290,
            overflowY: "auto",
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.02)",
            padding: 14,
            marginBottom: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            {chatMessages.length === 0 && (
              <p style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                letterSpacing: "0.06em",
                color: "var(--paper3)",
                lineHeight: 1.7,
              }}>
                Try: Who owns checkout retry logic? What is blocking release?
              </p>
            )}

            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  maxWidth: "92%",
                  padding: "10px 14px",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 12,
                  letterSpacing: "0.03em",
                  lineHeight: 1.65,
                  ...(msg.role === "user"
                    ? {
                        marginLeft: "auto",
                        background: "rgba(212,164,76,0.1)",
                        border: "1px solid rgba(212,164,76,0.25)",
                        color: "var(--paper)",
                        borderRadius: 2,
                      }
                    : {
                        background: "rgba(42,157,143,0.08)",
                        border: "1px solid rgba(42,157,143,0.2)",
                        color: "var(--paper2)",
                        borderRadius: 2,
                      }),
                }}
              >
                {msg.role === "assistant"
                  ? <TypingText text={msg.content} animate={msg.animate} />
                  : msg.content}
              </div>
            ))}

            {isChatLoading && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 14px",
                background: "rgba(42,157,143,0.08)",
                border: "1px solid rgba(42,157,143,0.2)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                color: "var(--teal2)",
                borderRadius: 2,
              }}>
                <Bot size={12} style={{ animation: "dotPulse 1.5s ease-in-out infinite" }} />
                AI is reasoning...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about this handoff"
              disabled={isChatLoading}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.025)",
                border: "1px solid var(--border)",
                color: "var(--paper)",
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                letterSpacing: "0.03em",
                padding: "10px 14px",
                outline: "none",
                borderRadius: 2,
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(212,164,76,0.4)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <button
              type="submit"
              disabled={isChatLoading}
              style={{
                width: 40,
                height: 40,
                background: isChatLoading ? "rgba(212,164,76,0.4)" : "var(--gold)",
                border: "none",
                cursor: isChatLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                flexShrink: 0,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { if (!isChatLoading) (e.currentTarget as HTMLButtonElement).style.background = "var(--gold2)"; }}
              onMouseLeave={(e) => { if (!isChatLoading) (e.currentTarget as HTMLButtonElement).style.background = "var(--gold)"; }}
            >
              <SendHorizontal size={14} color="var(--ink)" />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
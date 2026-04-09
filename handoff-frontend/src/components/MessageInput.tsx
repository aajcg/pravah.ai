"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useHandoffStore } from "@/store/use-handoff-store";
import { SlackConnect } from "@/components/SlackConnect";

const typingHints = [
  "Payment API timeout is blocking deployment...",
  "Rahul owns retry logic and needs infra input...",
  "Decision: keep webhook payload unchanged...",
];

const slackFeatureEnabled = process.env.NEXT_PUBLIC_ENABLE_SLACK === "true";

export default function MessageInput() {
  const {
    messagesInput,
    isExtracting,
    processingLabel,
    setMessagesInput,
    runExtraction,
  } = useHandoffStore(
    useShallow((state) => ({
      messagesInput: state.messagesInput,
      isExtracting: state.isExtracting,
      processingLabel: state.processingLabel,
      setMessagesInput: state.setMessagesInput,
      runExtraction: state.runExtraction,
    }))
  );

  const [hintValue, setHintValue] = useState("");
  const canShowHint = useMemo(() => messagesInput.trim().length === 0, [messagesInput]);

  useEffect(() => {
    if (!canShowHint) return;
    let hintIdx = 0, charIdx = 0, deleting = false;
    const timer = setInterval(() => {
      const hint = typingHints[hintIdx];
      if (!deleting) {
        setHintValue(hint.slice(0, ++charIdx));
        if (charIdx >= hint.length) deleting = true;
      } else {
        setHintValue(hint.slice(0, Math.max(0, --charIdx)));
        if (charIdx <= 0) { deleting = false; hintIdx = (hintIdx + 1) % typingHints.length; }
      }
    }, 42);
    return () => clearInterval(timer);
  }, [canShowHint]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await runExtraction();
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      style={{ height: "100%" }}
    >
      <div className="glass-panel glass-panel--strong" style={{
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

        <div style={{ padding: "28px 24px" }}>
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
              Agent 01 / Input
            </div>
            <h3 style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 700,
              fontSize: 20,
              color: "var(--paper)",
              marginBottom: 4,
              letterSpacing: "-0.3px",
            }}>
              Raw Message Input
            </h3>
            <p style={{
              fontFamily: "var(--font-epilogue), sans-serif",
              fontSize: 13,
              color: "var(--paper3)",
              lineHeight: 1.6,
            }}>
              Import real Slack conversations or paste backup updates.
            </p>
          </div>

          <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ position: "relative" }}>
              <textarea
                value={messagesInput}
                onChange={(e) => setMessagesInput(e.target.value)}
                placeholder="Import Slack messages below, or paste fallback chat snippets..."
                disabled={isExtracting}
                style={{
                  width: "100%",
                  minHeight: 200,
                  resize: "vertical",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid var(--border)",
                  color: "var(--paper)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 12,
                  lineHeight: 1.7,
                  letterSpacing: "0.03em",
                  padding: "14px 16px",
                  outline: "none",
                  borderRadius: 0,
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "rgba(212,164,76,0.4)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />

              {canShowHint && (
                <div style={{
                  position: "absolute",
                  insetInline: 12,
                  bottom: 12,
                  background: "rgba(7,8,13,0.85)",
                  border: "1px solid rgba(212,164,76,0.2)",
                  padding: "6px 12px",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  color: "var(--gold2)",
                  letterSpacing: "0.04em",
                  pointerEvents: "none",
                  borderRadius: 2,
                }}>
                  <span style={{ opacity: 0.6 }}>preview:</span> {hintValue}
                  <span className="typing-cursor">|</span>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              <button
                type="submit"
                disabled={isExtracting}
                style={{
                  fontFamily: "var(--font-syne), sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                  padding: "10px 22px",
                  border: "none",
                  background: isExtracting ? "rgba(212,164,76,0.5)" : "var(--gold)",
                  cursor: isExtracting ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  borderRadius: 2,
                  transition: "background 0.2s, transform 0.15s",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!isExtracting) (e.currentTarget as HTMLButtonElement).style.background = "var(--gold2)";
                }}
                onMouseLeave={(e) => {
                  if (!isExtracting) (e.currentTarget as HTMLButtonElement).style.background = "var(--gold)";
                }}
              >
                <Sparkles size={12} />
                {isExtracting ? "Processing..." : "Extract Intelligence"}
              </button>
            </div>

            {isExtracting && (
              <div
                className="shimmer"
                style={{
                  padding: "10px 14px",
                  border: "1px solid rgba(212,164,76,0.2)",
                  background: "rgba(212,164,76,0.04)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: "var(--gold2)",
                }}
              >
                {processingLabel}
              </div>
            )}
          </form>

          <div style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: "1px solid var(--border)",
          }}>
            <div style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--paper3)",
              marginBottom: 10,
            }}>
              Import directly from Slack:
            </div>

            {!slackFeatureEnabled && (
              <div
                style={{
                  marginBottom: 10,
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 10,
                  letterSpacing: "0.05em",
                  color: "var(--gold2)",
                }}
              >
                NEXT_PUBLIC_ENABLE_SLACK is off. Turn it on in .env.local and restart dev server.
              </div>
            )}

            <SlackConnect />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
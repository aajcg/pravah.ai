"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Copy, Database } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { useHandoffStore } from "@/store/use-handoff-store";
import { HANDOFF_FIELD_LABELS, type HandoffKey } from "@/types/handoff";

const visibleKeys: HandoffKey[] = [
  "blockers",
  "tasks",
  "owners",
  "deadlines",
  "decisions",
  "dependencies",
];

// Color accent per field
const fieldAccents: Record<HandoffKey, string> = {
  blockers: "rgba(224,82,82,0.6)",
  tasks: "rgba(212,164,76,0.6)",
  owners: "rgba(42,157,143,0.6)",
  deadlines: "rgba(58,134,255,0.6)",
  decisions: "rgba(212,164,76,0.4)",
  dependencies: "rgba(42,157,143,0.4)",
};

export default function StructuredOutput() {
  const { handoff, isExtracting } = useHandoffStore(
    useShallow((state) => ({
      handoff: state.handoff,
      isExtracting: state.isExtracting,
    }))
  );

  const hasData = useMemo(
    () => visibleKeys.some((k) => handoff[k].length > 0),
    [handoff]
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(JSON.stringify(handoff, null, 2));
    toast.success("Structured JSON copied.");
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
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <div style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--gold)",
                marginBottom: 8,
              }}>
                Agent 02 / Output
              </div>
              <h3 style={{
                fontFamily: "var(--font-syne), sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: "var(--paper)",
                marginBottom: 4,
                letterSpacing: "-0.3px",
              }}>
                Structured Data
              </h3>
              <p style={{
                fontFamily: "var(--font-epilogue), sans-serif",
                fontSize: 13,
                color: "var(--paper3)",
                lineHeight: 1.6,
              }}>
                Visualized extraction result for handoff decisions.
              </p>
            </div>
            <button
              onClick={handleCopy}
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--paper3)",
                padding: "8px 14px",
                border: "1px solid var(--border)",
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 2,
                flexShrink: 0,
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--gold)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,164,76,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = "var(--paper3)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
              }}
            >
              <Copy size={11} />
              Copy JSON
            </button>
          </div>

          {/* Loading skeletons */}
          {isExtracting && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="shimmer"
                  style={{
                    height: 52,
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isExtracting && !hasData && (
            <div style={{
              minHeight: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px dashed rgba(212,164,76,0.15)",
              padding: 24,
              textAlign: "center",
            }}>
              <div>
                <Database
                  size={18}
                  color="var(--gold)"
                  style={{ display: "block", margin: "0 auto 12px" }}
                />
                <p style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: "var(--paper3)",
                  lineHeight: 1.7,
                }}>
                  Submit raw messages to generate<br />structured handoff intelligence.
                </p>
              </div>
            </div>
          )}

          {/* Data grid */}
          {!isExtracting && hasData && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {visibleKeys.map((key, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  style={{
                    border: "1px solid var(--border)",
                    background: "rgba(255,255,255,0.02)",
                    padding: "14px 16px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Left accent */}
                  <div style={{
                    position: "absolute",
                    top: 0, left: 0, bottom: 0,
                    width: 2,
                    background: fieldAccents[key] || "var(--gold)",
                  }} />

                  <h4 style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 9,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    marginBottom: 10,
                    paddingLeft: 10,
                  }}>
                    {HANDOFF_FIELD_LABELS[key]}
                  </h4>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, paddingLeft: 10 }}>
                    {handoff[key].length === 0 ? (
                      <span style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 9,
                        letterSpacing: "0.08em",
                        color: "var(--paper3)",
                        padding: "3px 8px",
                        border: "1px solid var(--border)",
                        borderRadius: 2,
                      }}>
                        No signals
                      </span>
                    ) : (
                      handoff[key].map((entry) => (
                        <span
                          key={`${key}-${entry}`}
                          style={{
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                            fontSize: 10,
                            letterSpacing: "0.04em",
                            color: "var(--paper2)",
                            padding: "4px 9px",
                            border: "1px solid rgba(212,164,76,0.2)",
                            background: "rgba(212,164,76,0.06)",
                            borderRadius: 2,
                            wordBreak: "break-word",
                          }}
                        >
                          {entry}
                        </span>
                      ))
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
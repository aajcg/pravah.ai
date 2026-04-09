"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { Binary, Volume2, VolumeX } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useHandoffStore } from "@/store/use-handoff-store";
import ExtractionFlow from "@/components/ExtractionFlow";
import MessageInput from "@/components/MessageInput";
import StructuredOutput from "@/components/StructuredOutput";
import ChatPanel from "@/components/ChatPanel";
import FlowVisualizer3D from "@/components/FlowVisualizer3D";
import { useEffect, useRef } from "react";

// Scroll reveal hook
function useScrollReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("on"); },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref]);
}

function RevealDiv({ children, delay = 0, style = {}, className = "" }: {
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollReveal(ref);
  return (
    <div
      ref={ref}
      className={`rv ${className}`}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
}

export default function Pipeline() {
  const {
    activeStage,
    isExtracting,
    processingLabel,
    thinkingLogs,
    showSystemFlow,
    soundEnabled,
    toggleSystemFlow,
    toggleSound,
  } = useHandoffStore(
    useShallow((state) => ({
      activeStage: state.activeStage,
      isExtracting: state.isExtracting,
      processingLabel: state.processingLabel,
      thinkingLogs: state.thinkingLogs,
      showSystemFlow: state.showSystemFlow,
      soundEnabled: state.soundEnabled,
      toggleSystemFlow: state.toggleSystemFlow,
      toggleSound: state.toggleSound,
    }))
  );

  const { scrollY } = useScroll();
  const auraLeftY = useTransform(scrollY, [240, 2200], [0, -170]);
  const auraRightY = useTransform(scrollY, [240, 2200], [0, 120]);

  // Activate rv elements on mount
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("on"); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll(".rv").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="pipeline"
      style={{
        padding: "130px 64px",
        position: "relative",
        zIndex: 1,
        overflow: "hidden",
      }}
    >
      <motion.div
        aria-hidden
        className="parallax-aura"
        style={{
          width: 360,
          height: 360,
          left: -140,
          top: 24,
          background: "rgba(56,196,180,0.38)",
          y: auraLeftY,
        }}
      />
      <motion.div
        aria-hidden
        className="parallax-aura"
        style={{
          width: 420,
          height: 420,
          right: -180,
          top: 340,
          background: "rgba(212,164,76,0.32)",
          y: auraRightY,
        }}
      />

      <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>

        {/* Section header */}
        <RevealDiv style={{ marginBottom: 60 }}>
          <div className="sec-tag">Interactive Pipeline</div>
          <h2 style={{
            fontFamily: "var(--font-syne), sans-serif",
            fontWeight: 800,
            fontSize: "clamp(34px, 4vw, 58px)",
            lineHeight: 1.0,
            letterSpacing: "-1.5px",
            color: "var(--paper)",
            margin: 0,
          }}>
            Real-time<br />
            <span style={{ color: "var(--gold)" }}>Handoff Intelligence.</span>
          </h2>
        </RevealDiv>

        {/* Controls strip */}
        <RevealDiv delay={0.1} style={{ marginBottom: 48 }}>
          <div className="glass-panel" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 24,
            padding: "14px 24px",
          }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--paper3)",
              cursor: "pointer",
            }}>
              <Binary size={14} color="var(--gold)" />
              System Flow
              <button
                onClick={toggleSystemFlow}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  border: "1px solid var(--border2)",
                  background: showSystemFlow ? "var(--gold)" : "rgba(255,255,255,0.06)",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <span style={{
                  position: "absolute",
                  top: 2,
                  left: showSystemFlow ? 18 : 2,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: showSystemFlow ? "var(--ink)" : "var(--paper3)",
                  transition: "left 0.2s",
                }} />
              </button>
            </label>

            <div style={{ width: 1, height: 20, background: "var(--border)" }} />

            <label style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--paper3)",
              cursor: "pointer",
            }}>
              {soundEnabled
                ? <Volume2 size={14} color="var(--gold)" />
                : <VolumeX size={14} color="var(--paper3)" />
              }
              UI Sound
              <button
                onClick={toggleSound}
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  border: "1px solid var(--border2)",
                  background: soundEnabled ? "var(--gold)" : "rgba(255,255,255,0.06)",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  flexShrink: 0,
                }}
              >
                <span style={{
                  position: "absolute",
                  top: 2,
                  left: soundEnabled ? 18 : 2,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: soundEnabled ? "var(--ink)" : "var(--paper3)",
                  transition: "left 0.2s",
                }} />
              </button>
            </label>
          </div>
        </RevealDiv>

        {/* Extraction flow stages */}
        <RevealDiv delay={0.12} style={{ marginBottom: 48 }}>
          <ExtractionFlow activeStage={activeStage} isExtracting={isExtracting} />
        </RevealDiv>

        {/* Three-column panel */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 24,
          marginBottom: 40,
        }}>
          <RevealDiv delay={0.0}><MessageInput /></RevealDiv>
          <RevealDiv delay={0.12}><StructuredOutput /></RevealDiv>
          <RevealDiv delay={0.24}><ChatPanel /></RevealDiv>
        </div>

        {/* AI Thinking Logs */}
        <RevealDiv delay={0.1}>
          <div className="glass-panel glass-panel--strong" style={{
            padding: "24px 28px",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}>
              <span style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--gold)",
              }}>
                AI Thinking Logs
              </span>
              <span style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 9,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "4px 10px",
                borderRadius: 2,
                border: isExtracting
                  ? "1px solid rgba(42,157,143,0.3)"
                  : "1px solid var(--border)",
                color: isExtracting ? "var(--teal2)" : "var(--paper3)",
                background: isExtracting ? "rgba(42,157,143,0.08)" : "rgba(7,8,13,0.3)",
              }}>
                {isExtracting ? "● Live" : "Idle"}
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {thinkingLogs.length === 0 && (
                <span style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  color: "var(--paper3)",
                  padding: "5px 12px",
                  border: "1px solid var(--border)",
                  borderRadius: 2,
                }}>
                  Waiting for new messages...
                </span>
              )}
              {thinkingLogs.map((log) => (
                <motion.span
                  key={log}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    padding: "5px 12px",
                    border: "1px solid rgba(212,164,76,0.2)",
                    borderRadius: 2,
                    background: "rgba(212,164,76,0.05)",
                  }}
                >
                  {log}
                </motion.span>
              ))}
            </div>

            {isExtracting && processingLabel && (
              <div
                className="shimmer"
                style={{
                  marginTop: 16,
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
          </div>
        </RevealDiv>

        {/* 3D System Flow */}
        <AnimatePresence>
          {showSystemFlow && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              style={{ marginTop: 32 }}
            >
              <FlowVisualizer3D />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #pipeline > div > div[style*="grid-template-columns: repeat(3"] {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 900px) {
          #pipeline { padding: 80px 20px !important; }
        }
      `}</style>
    </section>
  );
}
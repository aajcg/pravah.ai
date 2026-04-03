"use client";

import { motion } from "framer-motion";
import { HANDOFF_PIPELINE_STAGES } from "@/types/handoff";

interface ExtractionFlowProps {
  activeStage: number;
  isExtracting: boolean;
}

const connectorLabels = ["POST /handoff/extract", "LLM Processing", "JSON Output"];

export default function ExtractionFlow({ activeStage, isExtracting }: ExtractionFlowProps) {
  return (
    <div>
      {/* Stage cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1,
        background: "var(--border)",
        border: "1px solid var(--border)",
        marginBottom: 24,
      }}>
        {HANDOFF_PIPELINE_STAGES.map((stage, index) => {
          const isActive = activeStage >= index;
          return (
            <div
              key={stage.id}
              style={{
                background: isActive ? "rgba(212,164,76,0.04)" : "var(--ink)",
                padding: "28px 24px",
                position: "relative",
                overflow: "hidden",
                transition: "background 0.3s",
              }}
            >
              {/* Top accent bar */}
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 2,
                background: isActive
                  ? "linear-gradient(90deg, var(--gold), transparent)"
                  : "transparent",
                transition: "background 0.4s",
              }} />

              {/* Glow */}
              {isActive && (
                <div style={{
                  position: "absolute",
                  bottom: -40, left: "50%",
                  transform: "translateX(-50%)",
                  width: 100, height: 100,
                  borderRadius: "50%",
                  background: "var(--glow)",
                  filter: "blur(30px)",
                }} />
              )}

              <div style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: isActive ? "var(--gold)" : "var(--paper3)",
                marginBottom: 14,
                transition: "color 0.3s",
              }}>
                Stage {index + 1}
              </div>

              <div style={{
                width: 36, height: 36,
                background: isActive ? "rgba(212,164,76,0.1)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${isActive ? "rgba(212,164,76,0.25)" : "var(--border)"}`,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-syne), sans-serif",
                fontWeight: 800,
                fontSize: 13,
                color: isActive ? "var(--gold)" : "var(--paper3)",
                marginBottom: 14,
                transition: "all 0.3s",
              }}>
                0{index + 1}
              </div>

              <h3 style={{
                fontFamily: "var(--font-syne), sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: isActive ? "var(--paper)" : "var(--paper3)",
                marginBottom: 6,
                letterSpacing: "-0.3px",
                transition: "color 0.3s",
              }}>
                {stage.title}
              </h3>
              <p style={{
                fontFamily: "var(--font-epilogue), sans-serif",
                fontSize: 13,
                lineHeight: 1.7,
                color: "var(--paper3)",
              }}>
                {stage.detail}
              </p>
            </div>
          );
        })}
      </div>

      {/* Flow connector SVG */}
      <div style={{ position: "relative", height: 80, width: "100%" }}>
        <svg viewBox="0 0 1000 80" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4a44c" stopOpacity="0.2" />
              <stop offset="50%" stopColor="#d4a44c" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#2a9d8f" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {[0, 1, 2].map((seg) => {
            const start = 120 + seg * 250;
            const end = start + 250;
            const center = start + 125;

            return (
              <g key={seg}>
                <path
                  d={`M ${start} 24 C ${center - 30} 8, ${center + 30} 40, ${end} 24`}
                  stroke="url(#flow-grad)"
                  strokeWidth={1.5}
                  fill="none"
                  opacity={activeStage >= seg + 1 ? 1 : 0.3}
                />
                <text
                  x={center}
                  y={68}
                  textAnchor="middle"
                  style={{
                    fill: "var(--paper3)",
                    fontSize: "10px",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    letterSpacing: "0.1em",
                  }}
                >
                  {connectorLabels[seg]}
                </text>
              </g>
            );
          })}

          {/* Animated packet */}
          {isExtracting && [0, 1, 2].map((seg) => {
            const start = 120 + seg * 250;
            const end = start + 250;
            return (
              <motion.circle
                key={`pkt-${seg}`}
                r={5}
                fill="#d4a44c"
                initial={{ cx: start, opacity: 0 }}
                animate={{ cx: [start, end], opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "linear",
                  delay: seg * 0.32,
                }}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
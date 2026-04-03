"use client";

import { motion } from "framer-motion";
import { HANDOFF_PIPELINE_STAGES } from "@/types/handoff";
import { cn } from "@/lib/utils";

interface ExtractionFlowProps {
  activeStage: number;
  isExtracting: boolean;
}

const connectorLabels = ["POST /handoff/extract", "LLM Processing", "JSON Output"];

export default function ExtractionFlow({ activeStage, isExtracting }: ExtractionFlowProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        {HANDOFF_PIPELINE_STAGES.map((stage, index) => {
          const isActive = activeStage >= index;

          return (
            <motion.article
              key={stage.id}
              whileHover={{ y: -4, rotateX: 3, rotateY: -2 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              style={{ transformStyle: "preserve-3d" }}
              className={cn(
                "rounded-2xl border p-4 backdrop-blur-xl transition-all duration-300",
                isActive
                  ? "border-cyan-300/45 bg-cyan-400/12 shadow-[0_0_28px_rgba(56,189,248,0.25)]"
                  : "border-white/15 bg-white/5"
              )}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-slate-300/70">
                Stage {index + 1}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-100">{stage.title}</h3>
              <p className="mt-1 text-sm text-slate-300/80">{stage.detail}</p>
            </motion.article>
          );
        })}
      </div>

      <div className="relative hidden h-28 w-full md:block">
        <svg viewBox="0 0 1000 120" className="h-full w-full">
          <defs>
            <linearGradient id="flow-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.28" />
              <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.35" />
            </linearGradient>
          </defs>

          {[0, 1, 2].map((segment) => {
            const start = 120 + segment * 250;
            const end = start + 250;
            const center = start + 125;

            return (
              <g key={segment}>
                <path
                  d={`M ${start} 32 C ${center - 30} 12, ${center + 30} 52, ${end} 32`}
                  stroke="url(#flow-gradient)"
                  strokeWidth={2}
                  fill="none"
                  opacity={activeStage >= segment + 1 ? 1 : 0.4}
                />
                <text
                  x={center}
                  y={90}
                  textAnchor="middle"
                  className="fill-cyan-100/90 text-[11px] tracking-wide"
                >
                  {connectorLabels[segment]}
                </text>
              </g>
            );
          })}

          {isExtracting &&
            [0, 1, 2].map((segment) => {
              const start = 120 + segment * 250;
              const end = start + 250;

              return (
                <motion.circle
                  key={`packet-${segment}`}
                  cx={start}
                  cy={32}
                  r={5}
                  fill="#67e8f9"
                  initial={{ cx: start, opacity: 0 }}
                  animate={{
                    cx: [start, end],
                    opacity: [0, 1, 1, 0],
                    scale: [0.7, 1, 1, 0.8],
                  }}
                  transition={{
                    duration: 1.6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                    delay: segment * 0.32,
                  }}
                />
              );
            })}
        </svg>
      </div>
    </div>
  );
}

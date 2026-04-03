"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Binary, Volume2, VolumeX } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useHandoffStore } from "@/store/use-handoff-store";
import ExtractionFlow from "@/components/ExtractionFlow";
import MessageInput from "@/components/MessageInput";
import StructuredOutput from "@/components/StructuredOutput";
import ChatPanel from "@/components/ChatPanel";
import FlowVisualizer3D from "@/components/FlowVisualizer3D";

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

  return (
    <section id="pipeline" className="relative px-6 pb-20 lg:px-12">
      <div className="mx-auto w-full max-w-7xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200/70">
              Interactive Pipeline
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
              Real-time Handoff Intelligence Flow
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-slate-200">
              <Binary className="h-4 w-4 text-cyan-200" />
              Show System Flow
              <Switch checked={showSystemFlow} onCheckedChange={toggleSystemFlow} />
            </div>
            <div className="h-6 w-px bg-white/15" />
            <div className="flex items-center gap-2 text-sm text-slate-200">
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-cyan-200" />
              ) : (
                <VolumeX className="h-4 w-4 text-slate-300" />
              )}
              UI Sound
              <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
            </div>
          </div>
        </div>

        <ExtractionFlow activeStage={activeStage} isExtracting={isExtracting} />

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr_1fr]">
          <MessageInput />
          <StructuredOutput />
          <ChatPanel />
        </div>

        <div className="rounded-2xl border border-white/15 bg-slate-950/55 p-4 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200/80">
              AI Thinking Logs
            </h3>
            {isExtracting ? <Badge>Live</Badge> : <Badge variant="neutral">Idle</Badge>}
          </div>

          <div className="flex flex-wrap gap-2">
            {thinkingLogs.length === 0 && (
              <Badge variant="neutral">Waiting for new messages...</Badge>
            )}
            {thinkingLogs.map((log) => (
              <motion.div
                key={log}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-full border border-cyan-300/35 bg-cyan-500/10 px-3 py-1 text-xs text-cyan-100"
              >
                {log}
              </motion.div>
            ))}
          </div>

          {isExtracting && processingLabel && (
            <div className="mt-4 rounded-xl border border-cyan-300/25 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100 shimmer">
              {processingLabel}
            </div>
          )}
        </div>

        <AnimatePresence>
          {showSystemFlow && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <FlowVisualizer3D />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

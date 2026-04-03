"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Copy, Database, Send } from "lucide-react";
import { toast } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function StructuredOutput() {
  const { handoff, isExtracting, isSendingSlack, sendToSlack } = useHandoffStore(
    useShallow((state) => ({
      handoff: state.handoff,
      isExtracting: state.isExtracting,
      isSendingSlack: state.isSendingSlack,
      sendToSlack: state.sendToSlack,
    }))
  );

  const hasData = useMemo(
    () => visibleKeys.some((key) => handoff[key].length > 0),
    [handoff]
  );

  const handleCopy = async () => {
    const payload = JSON.stringify(handoff, null, 2);
    await navigator.clipboard.writeText(payload);
    toast.success("Structured JSON copied.");
  };

  const handleSendToSlack = async () => {
    await sendToSlack();
  };

  return (
    <motion.div
      whileHover={{ y: -3, rotateX: 2, rotateY: -2 }}
      transition={{ type: "spring", stiffness: 220, damping: 16 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <Card className="h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Structured Data</CardTitle>
              <CardDescription>
                Visualized extraction result for handoff decisions.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  void handleCopy();
                }}
                disabled={isExtracting || !hasData}
              >
                <Copy className="h-4 w-4" />
                Copy JSON
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  void handleSendToSlack();
                }}
                disabled={isExtracting || !hasData || isSendingSlack}
              >
                <Send className="h-4 w-4" />
                {isSendingSlack ? "Sending..." : "Send to Slack"}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {isExtracting && (
            <div className="space-y-3">
              {[0, 1, 2].map((slot) => (
                <div
                  key={slot}
                  className="h-14 rounded-xl border border-white/10 bg-white/5 shimmer"
                />
              ))}
            </div>
          )}

          {!isExtracting && !hasData && (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-cyan-300/25 bg-slate-900/30 p-6 text-center text-sm text-slate-300">
              <div>
                <Database className="mx-auto mb-3 h-5 w-5 text-cyan-200" />
                Submit raw messages to generate structured handoff intelligence.
              </div>
            </div>
          )}

          {!isExtracting && hasData && (
            <div className="grid gap-3 sm:grid-cols-2">
              {visibleKeys.map((key, index) => (
                <motion.section
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.05 }}
                  className="rounded-xl border border-white/12 bg-slate-900/45 p-3"
                >
                  <h4 className="mb-2 text-sm font-semibold text-cyan-100">
                    {HANDOFF_FIELD_LABELS[key]}
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {handoff[key].length === 0 ? (
                      <Badge variant="neutral">No signals</Badge>
                    ) : (
                      handoff[key].map((entry) => (
                        <Badge key={`${key}-${entry}`} className="max-w-full break-words">
                          {entry}
                        </Badge>
                      ))
                    )}
                  </div>
                </motion.section>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

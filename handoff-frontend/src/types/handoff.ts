export interface HandoffPayload {
  blockers: string[];
  tasks: string[];
  owners: string[];
  deadlines: string[];
  decisions: string[];
  dependencies: string[];
}

export type HandoffKey = keyof HandoffPayload;

export const HANDOFF_FIELD_LABELS: Record<HandoffKey, string> = {
  blockers: "Blockers",
  tasks: "Tasks",
  owners: "Owners",
  deadlines: "Deadlines",
  decisions: "Decisions",
  dependencies: "Dependencies",
};

export const HANDOFF_PIPELINE_STAGES = [
  {
    id: "raw",
    title: "Raw Messages",
    detail: "Unstructured handoff updates",
  },
  {
    id: "extract",
    title: "AI Extraction",
    detail: "LLM + deterministic parsing",
  },
  {
    id: "structured",
    title: "Structured Data",
    detail: "JSON with ownership and blockers",
  },
  {
    id: "insight",
    title: "Q&A Insight",
    detail: "Question answering over handoff",
  },
] as const;

export type PipelineStageId = (typeof HANDOFF_PIPELINE_STAGES)[number]["id"];

export const EMPTY_HANDOFF: HandoffPayload = {
  blockers: [],
  tasks: [],
  owners: [],
  deadlines: [],
  decisions: [],
  dependencies: [],
};

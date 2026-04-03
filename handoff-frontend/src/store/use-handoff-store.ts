"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { chatAboutHandoff, extractHandoffRequest } from "@/lib/api";
import { playUiClick } from "@/lib/sound";
import { splitMessages } from "@/lib/utils";
import { EMPTY_HANDOFF, type HandoffPayload } from "@/types/handoff";

export const EXAMPLE_MESSAGES: string[] = [
  "Rahul is finishing retry logic for checkout before EOD.",
  "Payment API timeout is blocking deployment for staging.",
  "Mira decided to keep the webhook payload format unchanged.",
  "Need dependency from infra team: new Redis credentials.",
  "Deadline for QA sign-off is tomorrow 11 AM.",
];

export const PROCESSING_STEPS: string[] = [
  "Analyzing messages...",
  "Extracting blockers...",
  "Structuring data...",
];

const THINKING_LOGS: string[] = [
  "Identifying blockers...",
  "Assigning ownership...",
  "Parsing deadlines...",
  "Capturing dependencies...",
  "Composing summary map...",
];

type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  animate: boolean;
}

interface HandoffStore {
  messagesInput: string;
  handoff: HandoffPayload;
  isExtracting: boolean;
  processingLabel: string;
  activeStage: number;
  thinkingLogs: string[];
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  showSystemFlow: boolean;
  soundEnabled: boolean;
  extractionError: string | null;
  chatError: string | null;
  setMessagesInput: (value: string) => void;
  fillWithExample: () => void;
  runExtraction: () => Promise<void>;
  askQuestion: (question: string) => Promise<void>;
  toggleSystemFlow: () => void;
  toggleSound: () => void;
  clearExtractionError: () => void;
  clearChatError: () => void;
}

const makeId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useHandoffStore = create<HandoffStore>((set, get) => ({
  messagesInput: "",
  handoff: { ...EMPTY_HANDOFF },
  isExtracting: false,
  processingLabel: "",
  activeStage: 0,
  thinkingLogs: [],
  chatMessages: [],
  isChatLoading: false,
  showSystemFlow: false,
  soundEnabled: true,
  extractionError: null,
  chatError: null,

  setMessagesInput: (value) => {
    set({ messagesInput: value });
  },

  fillWithExample: () => {
    const soundEnabled = get().soundEnabled;
    playUiClick(soundEnabled);

    set({
      messagesInput: EXAMPLE_MESSAGES.join("\n"),
    });
  },

  runExtraction: async () => {
    const { messagesInput, soundEnabled } = get();
    const messages = splitMessages(messagesInput);

    if (!messages.length) {
      toast.error("Add at least one message to continue.");
      return;
    }

    playUiClick(soundEnabled);

    set({
      isExtracting: true,
      processingLabel: PROCESSING_STEPS[0],
      activeStage: 1,
      extractionError: null,
      thinkingLogs: [THINKING_LOGS[0]],
    });

    let statusIndex = 0;
    let logIndex = 0;

    const ticker = window.setInterval(() => {
      statusIndex = (statusIndex + 1) % PROCESSING_STEPS.length;
      logIndex = (logIndex + 1) % THINKING_LOGS.length;

      set((state) => ({
        processingLabel: PROCESSING_STEPS[statusIndex],
        activeStage: Math.min(2, state.activeStage + 1),
        thinkingLogs: [...state.thinkingLogs.slice(-3), THINKING_LOGS[logIndex]],
      }));
    }, 1_100);

    try {
      const handoff = await extractHandoffRequest(messages);
      window.clearInterval(ticker);

      set((state) => ({
        handoff,
        isExtracting: false,
        processingLabel: "",
        activeStage: 2,
        thinkingLogs: [...state.thinkingLogs.slice(-3), "Ready for Q&A insights."],
      }));

      window.setTimeout(() => {
        set({ activeStage: 3 });
      }, 450);
    } catch (error) {
      window.clearInterval(ticker);
      console.error(error);

      set({
        isExtracting: false,
        extractionError: "Extraction failed. Check backend.",
        processingLabel: "",
      });

      toast.error("Extraction failed. Check backend.");
    }
  },

  askQuestion: async (question) => {
    const trimmed = question.trim();
    const { handoff, soundEnabled } = get();

    if (!trimmed) {
      return;
    }

    playUiClick(soundEnabled);

    const userMessage: ChatMessage = {
      id: makeId(),
      role: "user",
      content: trimmed,
      animate: false,
    };

    set((state) => ({
      isChatLoading: true,
      chatError: null,
      activeStage: 3,
      chatMessages: [...state.chatMessages, userMessage],
    }));

    try {
      const answer = await chatAboutHandoff(trimmed, handoff);
      const assistantMessage: ChatMessage = {
        id: makeId(),
        role: "assistant",
        content: answer,
        animate: true,
      };

      set((state) => ({
        isChatLoading: false,
        chatMessages: [...state.chatMessages, assistantMessage],
      }));
    } catch (error) {
      console.error(error);
      set({
        isChatLoading: false,
        chatError: "Chat failed. Check backend.",
      });
      toast.error("Chat failed. Check backend.");
    }
  },

  toggleSystemFlow: () => {
    const soundEnabled = get().soundEnabled;
    playUiClick(soundEnabled);

    set((state) => ({ showSystemFlow: !state.showSystemFlow }));
  },

  toggleSound: () => {
    const soundEnabled = get().soundEnabled;
    playUiClick(soundEnabled);

    set((state) => ({ soundEnabled: !state.soundEnabled }));
  },

  clearExtractionError: () => {
    set({ extractionError: null });
  },

  clearChatError: () => {
    set({ chatError: null });
  },
}));

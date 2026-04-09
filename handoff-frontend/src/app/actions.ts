"use server";

import { WebClient } from "@slack/web-api";
import { auth } from "@/auth";

const CHANNEL_LIST_LIMIT = 200;
const CHANNEL_HISTORY_LIMIT = 120;

export interface SlackChannel {
  id: string;
  name: string;
  isPrivate: boolean;
  memberCount: number | null;
}

export interface SlackConversationImport {
  channelId: string;
  channelName: string;
  transcript: string;
  messages: string[];
  importedCount: number;
  hasMore: boolean;
}

type SlackErrorResult = {
  error: string;
};

export type SlackChannelsResult = SlackChannel[] | SlackErrorResult;
export type SlackMessagesResult = SlackConversationImport | SlackErrorResult;

function getSlackErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "data" in error) {
    const maybeData = (error as { data?: { error?: unknown } }).data;
    if (maybeData && typeof maybeData.error === "string" && maybeData.error.trim().length > 0) {
      return maybeData.error;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Slack request failed. Please try again.";
}

function normalizeText(value: unknown): string {
  if (typeof value !== "string") {
    return "";
  }

  return value.replace(/\s+/g, " ").trim();
}

function formatSlackTimestamp(value: unknown): string {
  if (typeof value !== "string") {
    return "unknown-time";
  }

  const ts = Number(value);
  if (!Number.isFinite(ts)) {
    return "unknown-time";
  }

  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
    hour12: false,
  }).format(new Date(ts * 1000));
}

async function getUserLabelMap(client: WebClient, userIds: string[]): Promise<Map<string, string>> {
  const pairs = await Promise.all(
    userIds.map(async (userId) => {
      try {
        const response = await client.users.info({ user: userId });
        const profile = response.user?.profile;
        const displayName =
          profile?.display_name?.trim() ||
          profile?.real_name?.trim() ||
          response.user?.name?.trim() ||
          userId;

        return [userId, displayName] as const;
      } catch {
        return [userId, userId] as const;
      }
    })
  );

  return new Map<string, string>(pairs);
}

async function getSlackClientFromSession(): Promise<WebClient | SlackErrorResult> {
  const session = await auth();
  const token = session?.accessToken?.trim();

  if (!token) {
    return { error: "Not authenticated. Please sign in with Slack first." };
  }

  return new WebClient(token);
}

export async function fetchSlackChannels(): Promise<SlackChannelsResult> {
  const clientOrError = await getSlackClientFromSession();
  if ("error" in clientOrError) {
    return clientOrError;
  }

  try {
    const channels: SlackChannel[] = [];
    let cursor: string | undefined;

    do {
      const response = await clientOrError.conversations.list({
        types: "public_channel,private_channel",
        exclude_archived: true,
        limit: CHANNEL_LIST_LIMIT,
        cursor,
      });

      if (!response.ok) {
        return { error: response.error ?? "Unable to fetch channels from Slack." };
      }

      for (const channel of response.channels ?? []) {
        if (!channel.id || !channel.name || channel.is_archived) {
          continue;
        }

        channels.push({
          id: channel.id,
          name: channel.name,
          isPrivate: Boolean(channel.is_private),
          memberCount: typeof channel.num_members === "number" ? channel.num_members : null,
        });
      }

      const nextCursor = response.response_metadata?.next_cursor;
      cursor =
        typeof nextCursor === "string" && nextCursor.trim().length > 0
          ? nextCursor
          : undefined;
    } while (cursor && channels.length < 500);

    channels.sort((a, b) => a.name.localeCompare(b.name));
    return channels;
  } catch (error) {
    return { error: getSlackErrorMessage(error) };
  }
}

export async function fetchSlackMessages(channelId: string): Promise<SlackMessagesResult> {
  const normalizedChannelId = channelId.trim();
  if (!normalizedChannelId) {
    return { error: "Channel ID is required." };
  }

  const clientOrError = await getSlackClientFromSession();
  if ("error" in clientOrError) {
    return clientOrError;
  }

  try {
    const [historyResponse, channelInfoResponse] = await Promise.all([
      clientOrError.conversations.history({
        channel: normalizedChannelId,
        limit: CHANNEL_HISTORY_LIMIT,
        inclusive: true,
      }),
      clientOrError.conversations.info({
        channel: normalizedChannelId,
      }),
    ]);

    if (!historyResponse.ok) {
      return { error: historyResponse.error ?? "Unable to read channel history." };
    }

    if (!channelInfoResponse.ok) {
      return { error: channelInfoResponse.error ?? "Unable to resolve channel metadata." };
    }

    const channelName = channelInfoResponse.channel?.name ?? normalizedChannelId;
    const messages = [...(historyResponse.messages ?? [])].reverse();

    const normalizedMessages = messages
      .map((message) => {
        const text = normalizeText(message.text);
        if (!text) {
          return null;
        }

        const subtype = normalizeText(message.subtype);
        if (subtype === "channel_join" || subtype === "channel_leave") {
          return null;
        }

        const userId = typeof message.user === "string" ? message.user : "";
        const isBot = typeof message.bot_id === "string" && message.bot_id.trim().length > 0;
        const isThreadReply =
          typeof message.thread_ts === "string" && message.thread_ts !== message.ts;

        return {
          text,
          userId,
          isBot,
          isThreadReply,
          timestamp: formatSlackTimestamp(message.ts),
        };
      })
      .filter(
        (
          message
        ): message is {
          text: string;
          userId: string;
          isBot: boolean;
          isThreadReply: boolean;
          timestamp: string;
        } => message !== null
      );

    if (normalizedMessages.length === 0) {
      return { error: "No readable text messages found in this channel." };
    }

    const userIds = [
      ...new Set(
        normalizedMessages
          .map((message) => message.userId)
          .filter((value) => value.trim().length > 0)
      ),
    ];

    const userMap = await getUserLabelMap(clientOrError, userIds);
    const renderedMessages = normalizedMessages.map((message) => {
      const author = message.isBot
        ? "Bot"
        : (userMap.get(message.userId) ?? message.userId) || "Unknown user";
      const threadTag = message.isThreadReply ? " (thread)" : "";
      return `[${message.timestamp}] ${author}${threadTag}: ${message.text}`;
    });

    return {
      channelId: normalizedChannelId,
      channelName,
      transcript: renderedMessages.join("\n"),
      messages: renderedMessages,
      importedCount: renderedMessages.length,
      hasMore: Boolean(historyResponse.has_more),
    };
  } catch (error) {
    return { error: getSlackErrorMessage(error) };
  }
}

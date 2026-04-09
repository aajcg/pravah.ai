"use client";

import { useEffect, useMemo, useState } from "react";
import { getProviders, signIn, signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  fetchSlackChannels,
  fetchSlackMessages,
  type SlackChannel,
} from "@/app/actions";
import { useHandoffStore } from "@/store/use-handoff-store";

interface SessionShape {
  user?: {
    name?: string | null;
    email?: string | null;
  };
  accessToken?: string;
}

export function SlackConnect() {
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [importingChannelId, setImportingChannelId] = useState<string | null>(null);
  const [session, setSession] = useState<SessionShape | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [slackProviderReady, setSlackProviderReady] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastImportSummary, setLastImportSummary] = useState<string | null>(null);

  const setMessagesInput = useHandoffStore((state) => state.setMessagesInput);
  const runExtraction = useHandoffStore((state) => state.runExtraction);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch("/api/auth/session").then((r) => r.json()),
      getProviders(),
    ])
      .then(([payload, providers]) => {
        if (cancelled) {
          return;
        }

        if (payload && typeof payload === "object" && "user" in payload) {
          setSession(payload as SessionShape);
        } else {
          setSession(null);
        }

        const slackProvider = providers?.slack;
        setSlackProviderReady(Boolean(slackProvider));
      })
      .catch(() => {
        if (!cancelled) {
          setSession(null);
          setSlackProviderReady(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCheckingSession(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredChannels = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) {
      return channels;
    }

    return channels.filter((channel) => channel.name.toLowerCase().includes(term));
  }, [channels, searchQuery]);

  const loadChannels = async () => {
    setLoadingChannels(true);
    setLastImportSummary(null);

    const data = await fetchSlackChannels();
    if ("error" in data) {
      setChannels([]);
      toast.error(data.error);
      setLoadingChannels(false);
      return;
    }

    setChannels(data);
    if (data.length === 0) {
      toast.error("No channels available with current Slack access.");
    }

    setLoadingChannels(false);
  };

  const handleChannelImport = async (channelId: string) => {
    setImportingChannelId(channelId);
    setLastImportSummary(null);

    const result = await fetchSlackMessages(channelId);
    if ("error" in result) {
      toast.error(result.error);
      setImportingChannelId(null);
      return;
    }

    setMessagesInput(result.transcript);
    setChannels([]);
    setSearchQuery("");

    const summary = `Imported ${result.importedCount} messages from #${result.channelName}.${
      result.hasMore ? " Showing latest window only." : ""
    }`;
    setLastImportSummary(summary);
    toast.success(summary);

    await runExtraction();
    setImportingChannelId(null);
  };

  const btnBase: React.CSSProperties = {
    fontFamily: "var(--font-jetbrains-mono), monospace",
    fontSize: 11,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "10px 18px",
    borderRadius: 2,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  if (checkingSession) {
    return (
      <button
        disabled
        style={{
          ...btnBase,
          width: "100%",
          justifyContent: "center",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid var(--border)",
          color: "var(--paper3)",
          cursor: "default",
        }}
      >
        Checking Slack session...
      </button>
    );
  }

  if (!session) {
    if (!slackProviderReady) {
      return (
        <button
          disabled
          style={{
            ...btnBase,
            width: "100%",
            justifyContent: "center",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
            color: "var(--paper3)",
            cursor: "default",
          }}
        >
          Slack auth not configured (set Slack env vars)
        </button>
      );
    }

    return (
      <button
        onClick={() => signIn("slack", { callbackUrl: "/#pipeline" })}
        style={{
          ...btnBase,
          width: "100%",
          justifyContent: "center",
          background: "transparent",
          border: "1px solid rgba(212,164,76,0.25)",
          color: "var(--gold)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,164,76,0.06)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,164,76,0.5)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(212,164,76,0.25)";
        }}
      >
        {/* Slack logo */}
        <svg viewBox="0 0 122.8 122.8" width="14" height="14" style={{ flexShrink: 0 }}>
          <path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"/>
          <path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"/>
          <path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"/>
          <path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"/>
        </svg>
        Sign in to Slack
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 10,
          letterSpacing: "0.08em",
          color: "var(--paper3)",
        }}
      >
        Connected as {session.user?.name ?? session.user?.email ?? "Slack user"}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={loadChannels}
          disabled={loadingChannels || importingChannelId !== null}
          style={{
            ...btnBase,
            flex: 1,
            justifyContent: "center",
            background: loadingChannels ? "rgba(42,157,143,0.4)" : "var(--teal)",
            border: "none",
            color: "white",
          }}
          onMouseEnter={(e) => {
            if (!loadingChannels) {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--teal2)";
            }
          }}
          onMouseLeave={(e) => {
            if (!loadingChannels) {
              (e.currentTarget as HTMLButtonElement).style.background = "var(--teal)";
            }
          }}
        >
          {loadingChannels ? "Loading channels..." : "Import from Slack"}
        </button>
        <button
          onClick={() => signOut({ callbackUrl: "/#pipeline" })}
          disabled={importingChannelId !== null}
          style={{
            ...btnBase,
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--paper3)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--paper)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "var(--paper3)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
          }}
        >
          Logout
        </button>
      </div>

      {lastImportSummary && (
        <div
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 10,
            letterSpacing: "0.06em",
            color: "var(--gold2)",
            border: "1px solid rgba(212,164,76,0.25)",
            background: "rgba(212,164,76,0.06)",
            padding: "8px 10px",
          }}
        >
          {lastImportSummary}
        </div>
      )}

      {channels.length > 0 && (
        <div
          style={{
            maxHeight: 220,
            overflowY: "auto",
            border: "1px solid var(--border)",
            background: "rgba(255,255,255,0.02)",
            padding: 8,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 9,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--paper3)",
              marginBottom: 6,
              padding: "0 4px",
            }}
          >
            Select channel:
          </div>

          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Filter channels..."
            style={{
              width: "100%",
              marginBottom: 8,
              background: "rgba(7,8,13,0.5)",
              border: "1px solid var(--border)",
              color: "var(--paper)",
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              letterSpacing: "0.04em",
              padding: "8px 10px",
              outline: "none",
            }}
          />

          {filteredChannels.map((channel) => {
            const isImportingThisChannel = importingChannelId === channel.id;

            return (
              <button
                key={channel.id}
                onClick={() => handleChannelImport(channel.id)}
                disabled={importingChannelId !== null}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  background: "transparent",
                  border: "none",
                  color: "var(--paper2)",
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 12,
                  letterSpacing: "0.04em",
                  cursor: importingChannelId !== null ? "not-allowed" : "pointer",
                  borderRadius: 2,
                  transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                  if (importingChannelId === null) {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "rgba(212,164,76,0.06)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--gold)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--paper2)";
                }}
              >
                {isImportingThisChannel ? "Importing..." : `# ${channel.name}`}
                <span
                  style={{
                    marginLeft: 8,
                    fontSize: 10,
                    color: "var(--paper3)",
                  }}
                >
                  {channel.isPrivate ? "private" : "public"}
                  {typeof channel.memberCount === "number"
                    ? ` • ${channel.memberCount} members`
                    : ""}
                </span>
              </button>
            );
          })}

          {filteredChannels.length === 0 && (
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 10,
                letterSpacing: "0.06em",
                color: "var(--paper3)",
                padding: "8px 10px",
              }}
            >
              No channels matched this filter.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
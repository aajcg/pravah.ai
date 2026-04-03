"use client";

import { useState, useEffect } from "react";
import { signIn, signOut } from "next-auth/react";
import { fetchSlackChannels, fetchSlackMessages } from "@/app/actions";
import { useHandoffStore } from "@/store/use-handoff-store";

export function SlackConnect() {
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<object | null>(null);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => { if (d && Object.keys(d).length > 0) setSession(d); });
  }, []);

  const loadChannels = async () => {
    setLoading(true);
    const data = await fetchSlackChannels();
    if (!("error" in data)) setChannels(data as { id: string; name: string }[]);
    setLoading(false);
  };

  const handleChannel = async (id: string) => {
    setLoading(true);
    const text = await fetchSlackMessages(id);
    if (typeof text === "string") {
      useHandoffStore.getState().setMessagesInput(text);
      setChannels([]);
    }
    setLoading(false);
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

  if (!session) {
    return (
      <button
        onClick={() => signIn("slack")}
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
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={loadChannels}
          disabled={loading}
          style={{
            ...btnBase,
            flex: 1,
            justifyContent: "center",
            background: loading ? "rgba(42,157,143,0.4)" : "var(--teal)",
            border: "none",
            color: "white",
          }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "var(--teal2)"; }}
          onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "var(--teal)"; }}
        >
          {loading ? "Loading..." : "Import from Slack"}
        </button>
        <button
          onClick={() => signOut()}
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

      {channels.length > 0 && (
        <div style={{
          maxHeight: 160,
          overflowY: "auto",
          border: "1px solid var(--border)",
          background: "rgba(255,255,255,0.02)",
          padding: 8,
        }}>
          <div style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 9,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--paper3)",
            marginBottom: 6,
            padding: "0 4px",
          }}>
            Select channel:
          </div>
          {channels.map((c) => (
            <button
              key={c.id}
              onClick={() => handleChannel(c.id)}
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
                cursor: "pointer",
                borderRadius: 2,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(212,164,76,0.06)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--gold)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--paper2)";
              }}
            >
              # {c.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
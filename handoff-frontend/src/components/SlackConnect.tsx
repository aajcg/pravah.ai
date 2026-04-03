"use client";

import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { fetchSlackChannels, fetchSlackMessages } from "@/app/actions";
import { useHandoffStore } from "@/store/use-handoff-store";

export function SlackConnect() {
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [session, setSession] = useState<any>(null);

  // We fetch the session manually here since NextAuth beta is sometimes tricky with SessionProvider
  useEffect(() => {
    fetch('/api/auth/session').then(res => res.json()).then(data => {
      if (data && Object.keys(data).length > 0) setSession(data);
    })
  }, []);

  const loadChannels = async () => {
    setLoading(true);
    const data = await fetchSlackChannels();
    if (!data.error) setChannels(data);
    setLoading(false);
  };

  const handleChannelSelect = async (channelId: string) => {
    setLoading(true);
    const text = await fetchSlackMessages(channelId);
    if (typeof text === 'string') {
      useHandoffStore.getState().setMessagesInput(text);
      setChannels([]); // Close selector
    } else {
      alert("Error fetching messages: " + text.error);
    }
    setLoading(false);
  };

  if (!session) {
    return (
      <Button variant="outline" className="border-cyan-500/50 hover:bg-cyan-950/30 w-full" onClick={() => signIn("slack")}>
        <svg className="w-5 h-5 mr-2" viewBox="0 0 122.8 122.8"><path d="M25.8 77.6c0 7.1-5.8 12.9-12.9 12.9S0 84.7 0 77.6s5.8-12.9 12.9-12.9h12.9v12.9zm6.5 0c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v32.3c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V77.6z" fill="#e01e5a"/><path d="M45.2 25.8c-7.1 0-12.9-5.8-12.9-12.9S38.1 0 45.2 0s12.9 5.8 12.9 12.9v12.9H45.2zm0 6.5c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H12.9C5.8 58.1 0 52.3 0 45.2s5.8-12.9 12.9-12.9h32.3z" fill="#36c5f0"/><path d="M97 45.2c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9H97V45.2zm-6.5 0c0 7.1-5.8 12.9-12.9 12.9s-12.9-5.8-12.9-12.9V12.9C64.7 5.8 70.5 0 77.6 0s12.9 5.8 12.9 12.9v32.3z" fill="#2eb67d"/><path d="M77.6 97c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9-12.9-5.8-12.9-12.9V97h12.9zm0-6.5c-7.1 0-12.9-5.8-12.9-12.9s5.8-12.9 12.9-12.9h32.3c7.1 0 12.9 5.8 12.9 12.9s-5.8 12.9-12.9 12.9H77.6z" fill="#ecb22e"/></svg>
        Sign in to Slack
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 w-full mt-2">
      <div className="flex gap-2">
        <Button className="flex-1 bg-cyan-600 hover:bg-cyan-700" onClick={loadChannels} disabled={loading}>
          {loading ? "Loading..." : "Import from Slack Channel"}
        </Button>
        <Button variant="ghost" onClick={() => signOut()}>Logout</Button>
      </div>

      {channels.length > 0 && (
        <div className="mt-2 flex flex-col gap-1 max-h-40 overflow-auto rounded-md border p-2 bg-slate-900 border-slate-800">
          <p className="text-xs text-slate-400 mb-1">Select channel:</p>
          {channels.map((c) => (
             <Button key={c.id} variant="ghost" size="sm" className="justify-start" onClick={() => handleChannelSelect(c.id)}>
               #{c.name}
             </Button>
          ))}
        </div>
      )}
    </div>
  );
}

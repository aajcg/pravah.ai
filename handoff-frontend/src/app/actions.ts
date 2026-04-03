"use server"

import { auth } from "@/auth"

export async function fetchSlackChannels() {
  const session = await auth()
  //@ts-ignore
  if (!session?.accessToken) return { error: "Not authenticated" }

  const res = await fetch('https://slack.com/api/conversations.list?types=public_channel,private_channel', {
    //@ts-ignore
    headers: { Authorization: `Bearer ${session.accessToken}` }
  })
  
  const data = await res.json()
  return data.channels || []
}

export async function fetchSlackMessages(channelId: string) {
  const session = await auth()
  //@ts-ignore
  if (!session?.accessToken) return { error: "Not authenticated" }

  const res = await fetch(`https://slack.com/api/conversations.history?channel=${channelId}&limit=50`, {
    //@ts-ignore
    headers: { Authorization: `Bearer ${session.accessToken}` }
  })
  
  const data = await res.json()
  if (!data.messages) return { error: data.error }
  
  // Return just the text from the slack messages to put in the textbox
  return data.messages.map((m: any) => m.text).filter(Boolean).reverse().join("\n\n")
}

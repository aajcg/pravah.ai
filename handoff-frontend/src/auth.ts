import NextAuth from "next-auth"
import SlackProvider from "next-auth/providers/slack"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID,
      clientSecret: process.env.SLACK_CLIENT_SECRET,
      // We need more than just identity scopes to read messages
      authorization: {
        params: {
          scope: "openid profile email",
          user_scope: "channels:read channels:history"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the Slack access token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      // @ts-expect-error - NextAuth types mismatch for appending custom properties
      session.accessToken = token.accessToken
      return session
    }
  }
})

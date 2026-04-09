import NextAuth from "next-auth";
import SlackProvider from "next-auth/providers/slack";

const hasSlackCredentials = Boolean(
  process.env.SLACK_CLIENT_ID?.trim() && process.env.SLACK_CLIENT_SECRET?.trim()
);

if (!hasSlackCredentials) {
  console.warn(
    "Slack auth is not configured: set SLACK_CLIENT_ID and SLACK_CLIENT_SECRET."
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: hasSlackCredentials
    ? [
        SlackProvider({
          clientId: process.env.SLACK_CLIENT_ID,
          clientSecret: process.env.SLACK_CLIENT_SECRET,
          authorization: {
            params: {
              scope: "openid profile email",
              user_scope:
                "channels:read,channels:history,groups:read,groups:history,users:read",
            },
          },
        }),
      ]
    : [],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider === "slack" && typeof account.access_token === "string") {
        token.accessToken = account.access_token;
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;
      return session;
    },
  },
});

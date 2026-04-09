import NextAuth from "next-auth";
import SlackProvider from "next-auth/providers/slack";

const hasSlackCredentials = Boolean(
  process.env.SLACK_CLIENT_ID?.trim() && process.env.SLACK_CLIENT_SECRET?.trim()
);
const slackUiEnabled = process.env.NEXT_PUBLIC_ENABLE_SLACK === "true";

if (slackUiEnabled && !hasSlackCredentials) {
  console.warn(
    "Slack UI is enabled, but SLACK_CLIENT_ID or SLACK_CLIENT_SECRET is missing."
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
                "channels:read channels:history groups:read groups:history",
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

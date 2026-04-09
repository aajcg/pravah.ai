# Pravah Frontend

This is the Next.js frontend for Pravah.ai. It now includes serverless API routes for:

- `POST /handoff/extract`
- `POST /chat`
- `GET /health`

When deployed on Vercel, these routes run as Node.js serverless functions.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from the example file:

```bash
cp .env.local.example .env.local
```

3. Fill `.env.local`:

```env
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
OPENROUTER_MODEL=mistralai/mixtral-8x7b-instruct
OPENROUTER_SITE_URL=https://localhost:3002
OPENROUTER_APP_NAME=Pravah Local

# Optional external backend override
# NEXT_PUBLIC_API_BASE_URL=

# Enable Slack login + Slack chat import UI
NEXT_PUBLIC_ENABLE_SLACK=true

# Auth.js
AUTH_SECRET=YOUR_AUTH_SECRET
AUTH_URL=https://localhost:3002

# Slack OAuth app credentials
SLACK_CLIENT_ID=YOUR_SLACK_CLIENT_ID
SLACK_CLIENT_SECRET=YOUR_SLACK_CLIENT_SECRET
```

4. Start the app:

```bash
npm run dev
```

5. Verify health endpoint:

```bash
curl -k https://localhost:3002/health
```

6. Verify OpenRouter wiring:

```bash
curl -k https://localhost:3002/openrouter/health
curl -k "https://localhost:3002/openrouter/health?live=1"
```

7. Verify Slack login and real-message import:

- Open the app and click Sign in to Slack.
- In the input panel, click Import from Slack.
- Choose a channel; the app imports real Slack conversation history and runs extraction automatically.

## Deploy to Vercel

1. Deploy from this directory (`handoff-frontend`):

```bash
npx vercel
```

2. Set environment variables in Vercel for Preview and Production:

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (optional)
- `OPENROUTER_SITE_URL` (optional)
- `OPENROUTER_APP_NAME` (optional)

3. Verify live OpenRouter check after deploy:

```text
https://your-app.vercel.app/openrouter/health?live=1
```

4. Deploy production:

```bash
npx vercel --prod
```

## Slack App Configuration

Slack setup is optional and only needed when `NEXT_PUBLIC_ENABLE_SLACK=true`.

### Slack Inputs Checklist

- `NEXT_PUBLIC_ENABLE_SLACK=true`
- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`
- `AUTH_SECRET`
- `AUTH_URL`

You do not manually paste xoxb or xoxp tokens. OAuth tokens are generated automatically per user at login.

Set the redirect URL in Slack app settings:

```text
https://YOUR_VERCEL_DOMAIN/api/auth/callback/slack
```

For local HTTPS development, use:

```text
https://localhost:3002/api/auth/callback/slack
```

Add these user scopes:

- `openid`
- `profile`
- `email`
- `channels:read`
- `channels:history`
- `groups:read`
- `groups:history`

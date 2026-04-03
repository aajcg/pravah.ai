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

2. Create `.env.local` (OpenRouter first):

```env
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
OPENROUTER_MODEL=mistralai/mixtral-8x7b-instruct
OPENROUTER_SITE_URL=https://localhost:3002
OPENROUTER_APP_NAME=Pravah Local

# Optional Slack integration
# NEXT_PUBLIC_ENABLE_SLACK=true
# SLACK_CLIENT_ID=YOUR_SLACK_CLIENT_ID
# SLACK_CLIENT_SECRET=YOUR_SLACK_CLIENT_SECRET
# AUTH_SECRET=YOUR_AUTH_SECRET
# AUTH_URL=https://localhost:3002
```

3. Start the app:

```bash
npm run dev
```

4. Verify health endpoint:

```bash
curl -k https://localhost:3002/health
```

5. Verify OpenRouter wiring:

```bash
curl -k https://localhost:3002/openrouter/health
curl -k "https://localhost:3002/openrouter/health?live=1"
```

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

Set the redirect URL in Slack app settings:

```text
https://YOUR_VERCEL_DOMAIN/api/auth/callback/slack
```

Add these user scopes:

- `channels:read`
- `channels:history`

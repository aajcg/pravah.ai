# Slack + OpenRouter Setup Commands

## 1) Install and configure env (Terminal 1)

```bash
cd "/home/murga/Desktop/Projects/Hackathons/RESONATE 2.0-MLSA/PRAVAH.ai/handoff-frontend"
npm install

cat > .env.local <<EOF
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
OPENROUTER_MODEL=mistralai/mixtral-8x7b-instruct
OPENROUTER_SITE_URL=https://localhost:3002
OPENROUTER_APP_NAME=Pravah Local

NEXT_PUBLIC_ENABLE_SLACK=true
SLACK_CLIENT_ID=YOUR_SLACK_CLIENT_ID
SLACK_CLIENT_SECRET=YOUR_SLACK_CLIENT_SECRET

AUTH_SECRET=$(openssl rand -base64 32 | tr -d '\n')
AUTH_URL=https://localhost:3002
EOF

npm run dev
```

## 2) Slack app configuration (required for login)

In your Slack app settings:

1. OAuth redirect URLs:

```text
https://localhost:3002/api/auth/callback/slack
https://YOUR_VERCEL_DOMAIN/api/auth/callback/slack
```

2. User token scopes:

```text
openid
profile
email
channels:read
channels:history
groups:read
groups:history
users:read
```

After changing scopes in Slack app settings, reinstall/re-authorize the app for your workspace and sign in again in Pravah.

## 3) Verify backend routes (Terminal 2)

```bash
curl -k https://localhost:3002/health
curl -k https://localhost:3002/openrouter/health
curl -k "https://localhost:3002/openrouter/health?live=1"
```

## 4) Verify extraction endpoint (Terminal 2)

```bash
curl -k -X POST https://localhost:3002/handoff/extract \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      "Rahul is fixing checkout retries today",
      "Payment timeout is blocking release",
      "Deadline is tomorrow 11 AM"
    ]
  }'
```

## 5) Verify Slack login and real chat import

```bash
xdg-open https://localhost:3002
```

Then in the app:

1. Click Sign in to Slack.
2. Click Import from Slack.
3. Select a channel.
4. Real Slack messages are imported into input and extraction runs automatically.

## 6) Deploy to Vercel

```bash
cd "/home/murga/Desktop/Projects/Hackathons/RESONATE 2.0-MLSA/PRAVAH.ai/handoff-frontend"
npx vercel
```

Set these Vercel variables for Preview + Production:

- OPENROUTER_API_KEY
- OPENROUTER_MODEL
- OPENROUTER_SITE_URL
- OPENROUTER_APP_NAME
- NEXT_PUBLIC_ENABLE_SLACK
- SLACK_CLIENT_ID
- SLACK_CLIENT_SECRET
- AUTH_SECRET
- AUTH_URL

Deploy production:

```bash
npx vercel --prod
```

## Inputs checklist (Slack auth and tokens)

- NEXT_PUBLIC_ENABLE_SLACK
- SLACK_CLIENT_ID
- SLACK_CLIENT_SECRET
- AUTH_SECRET
- AUTH_URL

You do not manually paste xoxb/xoxp tokens in env. Tokens are minted automatically after each user signs in with Slack OAuth.

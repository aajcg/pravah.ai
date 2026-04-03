# OpenRouter Setup Commands

## 1) App + OpenRouter (Terminal 1)

```bash
cd "/home/murga/Desktop/Projects/Hackathons/RESONATE 2.0-MLSA/PRAVAH.ai/handoff-frontend"
npm install

cat > .env.local <<EOF
OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
OPENROUTER_MODEL=mistralai/mixtral-8x7b-instruct
OPENROUTER_SITE_URL=https://localhost:3002
OPENROUTER_APP_NAME=Pravah Local

# Optional: enable Slack integration later
# NEXT_PUBLIC_ENABLE_SLACK=true
# SLACK_CLIENT_ID=YOUR_SLACK_CLIENT_ID
# SLACK_CLIENT_SECRET=YOUR_SLACK_CLIENT_SECRET
# AUTH_SECRET=$(openssl rand -base64 32 | tr -d '\n')
# AUTH_URL=https://localhost:3002
EOF

npm run dev
```

## 2) Basic Health Check (Terminal 2)

```bash
curl -k https://localhost:3002/health
```

## 3) OpenRouter Config Check (Terminal 2)

```bash
curl -k https://localhost:3002/openrouter/health
```

## 4) OpenRouter Live Check (Terminal 2)

```bash
curl -k "https://localhost:3002/openrouter/health?live=1"
```

## 5) Extraction Smoke Test (Terminal 2)

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

## 6) Open App

```bash
xdg-open https://localhost:3002
```

## 7) Deploy to Vercel (Serverless)

```bash
cd "/home/murga/Desktop/Projects/Hackathons/RESONATE 2.0-MLSA/PRAVAH.ai/handoff-frontend"
npm install
npx vercel
```

Set these Vercel environment variables (Production + Preview):

- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL` (optional)
- `OPENROUTER_SITE_URL` (optional)
- `OPENROUTER_APP_NAME` (optional)

Slack vars are optional unless you enable Slack login.

Deploy production:

```bash
npx vercel --prod
```

## 8) Slack App Settings (Optional)

Only needed when you turn on `NEXT_PUBLIC_ENABLE_SLACK=true`.

1. Add redirect URL:
   `https://YOUR_VERCEL_DOMAIN/api/auth/callback/slack`
2. Add user scopes:
   `channels:read` and `channels:history`

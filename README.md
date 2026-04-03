# 🚀 PRAVAH.ai  
Turn messy conversations into **structured engineering handoffs** automatically.

![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/API-Express-black?logo=express)
![JavaScript](https://img.shields.io/badge/Language-JavaScript-yellow?logo=javascript)
![OpenRouter](https://img.shields.io/badge/LLM-OpenRouter-blue)
![Slack](https://img.shields.io/badge/Input-Slack-4A154B?logo=slack)
![Tests](https://img.shields.io/badge/Tests-node:test-green)

---

## ✨ Overview

**PRAVAH.ai** converts chat messages (Slack, discussions, or shift updates) into a **structured JSON handoff** that engineering teams can immediately act on.

Instead of manually summarizing conversations, the system extracts:

- Tasks
- Owners
- Blockers
- Deadlines
- Decisions
- Dependencies

This enables **clean shift handoffs, async collaboration, and automation-ready updates.**

---

## 🔗 Slack Integration

PRAVAH.ai integrates with **Slack** so team conversations can be directly used as input.

Why this matters:

- Engineering discussions already happen in Slack
- No manual summarization required
- Important context is never lost
- Instant structured handoffs for the next shift or team

---

## 📦 Example Output

Input messages:

```json
[
 "Rahul is working on retry logic for checkout service",
 "Payment API timeout is blocking deployment",
 "Fix by tonight"
]
```

Generated handoff:

```json
{
 "blockers": ["Payment API timeout is blocking deployment"],
 "tasks": ["Rahul is working on retry logic for checkout service"],
 "owners": ["Rahul -> retry logic for checkout service"],
 "deadlines": ["Fix by tonight"],
 "decisions": [],
 "dependencies": []
}
```

---

## 🏗 Architecture

```
Slack / Client
      │
      ▼
 Express API Server
      │
      ▼
Extraction Engine
 (LLM + fallback)
      │
      ▼
Structured Handoff JSON
      │
      ▼
Chat QA on Handoff
```

### Core Components

**API Layer**
`src/server.js`  
Handles requests and exposes REST endpoints.

**Extraction Engine**
`src/extractHandoff.js`  
Uses **OpenRouter LLM** with a **rule-based fallback** to always return structured JSON.

**Test Layer**
`test/extractHandoff.test.js`  
Validates extraction behavior.

**Landing Page**
`landing page/index.html`

---

## 📂 Project Structure

```
PRAVAH.ai
│
├── landing page/
│   └── index.html
├── src/
│   ├── server.js
│   └── extractHandoff.js
├── test/
│   └── extractHandoff.test.js
├── .env.example
└── README.md
```

---

## ⚙️ API Endpoints

### Health Check
```
GET /health
```

### Extract Handoff
```
POST /handoff/extract
```

### Ask Questions on Handoff
```
POST /chat
```

---

## 🛠 Local Development

Install dependencies

```
npm install
```

Create environment file

```
cp .env.example .env
```

Add key:

```
OPENROUTER_API_KEY=your_key_here
PORT=3000
```

Start server

```
node src/server.js
```

Run tests

```
node --test
```

---

## 🛡 Reliability Design

PRAVAH.ai always returns **schema-safe JSON**.

If LLM extraction fails or no API key exists, the system automatically switches to **local rule-based extraction**, ensuring reliable handoffs.

---

## 👥 Contributors

- Lavansh Choubey  
- Aksh Garg

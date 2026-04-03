<div align="center">

<!-- Animated wave header -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:003d1f,50:00cc6a,100:00ff88&height=200&section=header&text=PRAVAH.ai&fontSize=72&fontColor=ffffff&fontAlignY=38&desc=AI-powered%20Engineering%20Handoff%20Generator&descAlignY=58&descSize=18&animation=fadeIn" width="100%"/>

<!-- Animated typing banner -->
<a href="https://github.com">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&duration=3000&pause=1000&color=00FF88&center=true&vCenter=true&multiline=false&repeat=true&width=600&height=60&lines=Slack+thread+%E2%86%92+Structured+Handoff;No+more+lost+context.+Ever.;Built+for+engineering+teams.;Tasks+%E2%80%A2+Owners+%E2%80%A2+Blockers+%E2%80%A2+Deadlines" alt="Typing SVG" />
</a>

<br/>

<!-- Tech Badges -->
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM-4FC3F7?style=for-the-badge&logo=openai&logoColor=white)
![Slack](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white)
![Tested](https://img.shields.io/badge/Tests-node:test-00FF88?style=for-the-badge&logo=jest&logoColor=black)

<br/>

<!-- Status Badges -->
![Status](https://img.shields.io/badge/Status-Active-00cc6a?style=flat-square&logo=checkmarx&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square&logo=github)
![Made with ❤](https://img.shields.io/badge/Made%20with-❤-red?style=flat-square)

</div>

---

<div align="center">

## 🌊 What is PRAVAH.ai?

</div>

> **PRAVAH** *(Sanskrit: प्रवाह — "flow")* — because critical engineering context should *flow*, not disappear in a Slack thread.

Engineering teams **bleed time** searching through:
- 🧵 Endless Slack threads
- 📋 Unstructured standups
- 💬 Long chat discussions

**PRAVAH.ai** plugs directly into your conversations and spits out a clean, structured JSON handoff — automatically.

<div align="center">

| ✅ Tasks | 👤 Owners | 🚧 Blockers | ⏰ Deadlines | 🗳 Decisions | 🔗 Dependencies |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Extracted | Assigned | Surfaced | Tracked | Logged | Mapped |

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🧠 LLM Extraction
Uses **OpenRouter** to intelligently parse tasks, blockers, owners, and deadlines from raw unstructured chat. No regex, no guessing — actual language understanding.

</td>
<td width="50%">

### 🛡️ Rule-Based Fallback
If the LLM fails or no API key is present, a deterministic rule-based parser takes over — **always returning schema-safe JSON**. No silent failures.

</td>
</tr>
<tr>
<td width="50%">

### 💬 Slack Integration
PRAVAH connects natively to Slack. Engineering conversations turn into structured handoffs without any manual copy-paste or summarization.

</td>
<td width="50%">

### 🤖 Chat QA Agent
Interrogate your handoff object conversationally via the `/chat` endpoint. Ask *"who owns the payment service retry?"* — get a direct answer.

</td>
</tr>
<tr>
<td width="50%">

### ⚡ Machine-Ready JSON
Output is always automation-ready. Pipe it to Jira, Linear, Notion, or your own tooling — structured handoffs become first-class data.

</td>
<td width="50%">

### 🧪 Unit Tested Logic
Extraction logic is covered by unit tests using Node's native `node:test` runner. Ship with confidence across edge cases.

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRAVAH.ai PIPELINE                           │
└─────────────────────────────────────────────────────────────────────┘

  💬 Slack / Chat                                      📊 Output
  ┌───────────┐                                      ┌───────────────┐
  │  Messages │                                      │ Handoff JSON  │
  │           │                                      │               │
  │ "Rahul is │                                      │ tasks: [...]  │
  │  working  │                                      │ blockers:[...]│
  │  on retry │                                      │ owners: [...] │
  │  logic.." │                                      │ deadlines:[]  │
  └─────┬─────┘                                      └───────┬───────┘
        │ messages                                           │
        ▼                                                    ▲
  ┌───────────┐    request    ┌──────────────────────────────┴──────┐
  │  Express  │──────────────▶│                                     │
  │  API :3000│               │      🤖 PRAVAH Orchestrator         │
  └───────────┘               │         Agent (core logic)          │
                              │                                     │
                              └────────┬──────────────┬────────────┘
                                       │              │
                          ┌────────────▼──┐      ┌────▼──────────────┐
                          │  🧠 LLM Layer  │      │  🛡️ Rule Parser   │
                          │  (OpenRouter)  │      │  (fallback)       │
                          │               │      │                   │
                          │  • GPT-style  │      │  • Regex-based    │
                          │    reasoning  │      │  • Always-on      │
                          │  • Context    │      │  • No API needed  │
                          │    aware      │      │                   │
                          └──────┬────────┘      └────────┬──────────┘
                                 │                        │
                                 └───────────┬────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────┐
                              │  📦 Structuring Engine   │
                              │                          │
                              │  Merges, deduplicates,   │
                              │  and validates schema    │
                              └─────────────┬────────────┘
                                            │
                              ┌─────────────▼────────────┐
                              │  💡 Chat QA Agent        │
                              │  /chat endpoint          │
                              │  Query your handoff!     │
                              └──────────────────────────┘
```

### Flow Diagram

```mermaid
flowchart LR
    A([💬 Slack / Chat]) -->|messages| B

    subgraph API["🚀 Express Server :3000"]
        B[Request Handler]
    end

    B -->|route| C

    subgraph AGENT["🤖 PRAVAH Orchestrator"]
        C{Route Logic}
    end

    C -->|primary| D
    C -->|fallback| E

    subgraph INTEL["🧠 Intelligence Layer"]
        D[LLM Extraction\nOpenRouter]
        E[Rule-Based Parser\nDeterministic]
    end

    D --> F
    E --> F

    subgraph OUTPUT["📦 Output Layer"]
        F[Structuring Engine]
        G[(Handoff JSON)]
        H[💡 Chat QA Agent]
    end

    F --> G
    G -->|/chat queries| H

    style API fill:#0a2540,stroke:#4fc3f7,color:#4fc3f7
    style AGENT fill:#1a1a35,stroke:#b39ddb,color:#b39ddb
    style INTEL fill:#0e1419,stroke:#00ff88,color:#00ff88
    style OUTPUT fill:#003d1f,stroke:#00cc6a,color:#00cc6a
```

---

## 📦 Input → Output

**Input** — raw conversation messages:

```json
[
  "Rahul is working on retry logic for checkout service",
  "Payment API timeout is blocking deployment",
  "Fix by tonight"
]
```

**Output** — structured engineering handoff:

```json
{
  "tasks":        ["Rahul is working on retry logic for checkout service"],
  "blockers":     ["Payment API timeout is blocking deployment"],
  "owners":       ["Rahul → retry logic for checkout service"],
  "deadlines":    ["Fix by tonight"],
  "decisions":    [],
  "dependencies": []
}
```

> ✅ Always schema-safe. Always machine-readable. Always pipe-able.

---

## ⚙️ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check — confirm the server is live |
| `POST` | `/handoff/extract` | Core endpoint — submit messages, get handoff JSON |
| `POST` | `/chat` | Query your handoff object conversationally |

<details>
<summary><b>📖 Example: POST /handoff/extract</b></summary>

**Request:**
```bash
curl -X POST http://localhost:3000/handoff/extract \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      "Priya is fixing the auth token bug",
      "DB migration is blocking the release",
      "Deadline is end of sprint"
    ]
  }'
```

**Response:**
```json
{
  "tasks":        ["Priya is fixing the auth token bug"],
  "blockers":     ["DB migration is blocking the release"],
  "owners":       ["Priya → auth token bug"],
  "deadlines":    ["End of sprint"],
  "decisions":    [],
  "dependencies": ["DB migration"]
}
```

</details>

<details>
<summary><b>📖 Example: POST /chat</b></summary>

**Request:**
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "handoff": { ... },
    "question": "Who owns the auth bug?"
  }'
```

**Response:**
```json
{ "answer": "Priya owns the auth token bug fix." }
```

</details>

---

## 🚀 Quick Start

**1. Clone & install**
```bash
git clone https://github.com/your-org/pravah-ai.git
cd pravah-ai
npm install
```

**2. Configure environment**
```bash
cp .env.example .env
```

```env
OPENROUTER_API_KEY=your_key_here
PORT=3000
```

**3. Start the server**
```bash
node src/server.js
```

**4. Run tests**
```bash
node --test
```

---

## 📂 Project Structure

```
PRAVAH.ai/
│
├── 📁 landing page/
│   └── index.html              # Product landing page
│
├── 📁 src/
│   ├── server.js               # Express API server
│   └── extractHandoff.js       # Core extraction logic (LLM + fallback)
│
├── 📁 test/
│   └── extractHandoff.test.js  # Unit tests (node:test)
│
├── .env.example                # Environment template
└── README.md
```

---

## 🛡️ Reliability Design

```
          LLM Available?
               │
        ┌──────┴──────┐
        YES           NO
        │              │
        ▼              ▼
   LLM Extract    Rule Parser
        │              │
        └──────┬────────┘
               ▼
        Schema Validation
               │
               ▼
        ✅ Safe JSON Output
          (always returned)
```

PRAVAH.ai never crashes silently. The fallback parser guarantees output regardless of API availability, key errors, or LLM timeouts.

---

## 👥 Contributors

<table>
<tr>
  <td align="center">
    <b>Lavansh Choubey</b><br/>
    <sub>Co-creator</sub>
  </td>
  <td align="center">
    <b>Aksh Garg</b><br/>
    <sub>Co-creator</sub>
  </td>
</tr>
</table>

---

<div align="center">

<!-- Footer wave -->
<img src="https://capsule-render.vercel.app/api?type=waving&color=0:00ff88,50:00cc6a,100:003d1f&height=120&section=footer&animation=fadeIn" width="100%"/>

**If PRAVAH saves your team from lost context, leave a ⭐**

*Built with care for engineering teams everywhere.*

</div>

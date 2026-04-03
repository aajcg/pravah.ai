# 🚀 PRAVAH.ai  
### AI-powered Engineering Handoff Generator

<p align="center">

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-black?style=for-the-badge&logo=express)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge&logo=javascript)
![OpenRouter](https://img.shields.io/badge/LLM-OpenRouter-blue?style=for-the-badge)
![Slack](https://img.shields.io/badge/Slack-Integration-4A154B?style=for-the-badge&logo=slack)
![Tests](https://img.shields.io/badge/Tested-node:test-green?style=for-the-badge)

</p>

---

# ✨ What is PRAVAH.ai?

Engineering teams lose critical context inside **Slack threads, standups, and long chat discussions**.

**PRAVAH.ai** converts those conversations into a **structured engineering handoff JSON** automatically.

Instead of scrolling through chats, teams instantly see:

✔ Tasks  
✔ Owners  
✔ Blockers  
✔ Deadlines  
✔ Decisions  
✔ Dependencies  

This enables **clean shift handoffs, async collaboration, and automation-ready workflows.**

---

# 🎬 Demo

<p align="center">

*(Add your demo GIF here)*

</p>

```
/assets/demo.gif
```

Example flow:

Slack conversation → PRAVAH.ai → Structured engineering handoff.

---

# 🧩 Key Features

| Feature | Description |
|------|------|
| 🧠 **LLM Extraction** | Uses OpenRouter LLM to intelligently extract tasks, blockers, and owners |
| 🛡 **Reliable Fallback** | Rule-based parser ensures extraction works even if LLM fails |
| 💬 **Slack Integration** | Conversations from Slack can directly generate handoffs |
| ⚡ **Instant Structure** | Converts unstructured chat into machine-readable JSON |
| 🤖 **Ask Questions** | Query the handoff object with `/chat` endpoint |
| 🧪 **Tested Logic** | Unit tests validate extraction reliability |

---

# 🔗 Slack Integration

Most engineering communication already happens in **Slack**.

PRAVAH.ai integrates with Slack so teams can:

- capture discussions automatically  
- avoid manual summarization  
- generate structured handoffs instantly  

This transforms **team communication into structured engineering intelligence.**

---

# 📦 Example Output

Input:

```json
[
 "Rahul is working on retry logic for checkout service",
 "Payment API timeout is blocking deployment",
 "Fix by tonight"
]
```

Output:

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

# 🏗 Architecture

```mermaid
flowchart TD

A[Slack / Chat Messages] --> B[Express API Server]

B --> C[Extraction Engine]

C --> D[OpenRouter LLM]
C --> E[Rule-based Fallback Parser]

D --> F[Structured Handoff JSON]
E --> F

F --> G[/chat QA Engine]
```

---

# 📂 Project Structure

```
PRAVAH.ai
│
├── landing page/
│   └── index.html
│
├── src/
│   ├── server.js
│   └── extractHandoff.js
│
├── test/
│   └── extractHandoff.test.js
│
├── .env.example
└── README.md
```

---

# ⚙️ API Endpoints

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

# 🛠 Local Setup

Install dependencies

```
npm install
```

Create environment file

```
cp .env.example .env
```

Add key

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

# 🛡 Reliability Design

PRAVAH.ai always returns **schema-safe JSON**.

If LLM extraction fails or no API key is present, the system automatically switches to a **rule-based fallback parser**, ensuring consistent output.

---

# 👥 Contributors

- **Lavansh Choubey**  
- **Aksh Garg**

---

⭐ If you like this project, consider **starring the repo!**

# 🤖 AI War Game — AI vs AI Battleship Arena

A modern AI-native web application built with [Next.js](https://nextjs.org) and [shadcn/ui](https://ui.shadcn.com). This project simulates a turn-based war game between two AI agents (e.g., GPT-4, Claude 3, Gemini) in a classic Battleship-style competition.

---

## 🧠 AI-Facing Overview

This project is designed to be **AI-friendly** by:
- Using declarative UI components and semantic structure
- Providing selectable AI models as structured data
- Planning for future endpoints and agent-accessible protocols
- Easily adaptable for API access, MCP integration, and LangChain tools

> For AI agents: The list of AI participants can be found in the source under `aiModels`. Future plans include exposing game state, battle logs, and model performance via a JSON API.

---

## 🚀 Getting Started

To run the app locally:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Then open:  
👉 `http://localhost:3000`

You’ll land on a page to choose two AI models (Player 1 and Player 2). Game logic is currently a placeholder.

---

## 🛠 Project Structure

- `app/page.tsx` – Main UI for selecting AI agents
- `components/ui/` – Reusable UI elements (via shadcn/ui)
- `aiModels` – Local list of supported AI agents
- Future: `/api/battles` for tracking match results and metadata

---

## 📦 Tech Stack

- **Framework**: Next.js 14+
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui
- **Language**: TypeScript
- **AI Interface Ready**: Designed for easy JSON export, API exposure, and embedding in LLM workflows

---

## 🧪 Future Enhancements

- [ ] Add battleship game engine
- [ ] Expose `/api/models` and `/api/battles`
- [ ] Track match results and performance metrics
- [ ] Add `.well-known/ai-resources.json` for AI agent discovery
- [ ] Support MCP-compatible schema for AI integration

---

## 📚 Learn More

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com/docs)
- [LangChain Tools](https://js.langchain.com/docs/tools/)
- [Model Context Protocol](https://docs.openrouter.ai/docs/mcp)

---

## 🛰️ Deployment

Deploy with [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) or any modern serverless platform. The app is optimized for edge environments.

---

## 🤝 License

MIT — Feel free to fork, expand, and AI-ify further.

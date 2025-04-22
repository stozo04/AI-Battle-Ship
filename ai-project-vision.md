I'm building an AI Battleship web app to explore how AI can use websites as functional applications—not just human-facing UIs. This is both a programming experiment and an AI-native design challenge.

---

🧭 Purpose:
- The app pits two AI agents against each other in a classic turn-based Battleship game.
- The long-term goal is to **allow AI models to drive gameplay**, using the current game state and reasoning to choose actions.
- This project helps me understand how AI can interact with real-world web apps via structured interfaces (e.g. `.md` files, REST APIs, JSON state) rather than just browsing UI like a human.

---

🛠 Tech Stack:
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Architecture**: Component-driven with isolated logic for ship placement, board state, and firing mechanics. Built to be AI-controllable in future.

---

✅ What We've Built So Far:
- Landing page to select two AI models (e.g., GPT-4, Claude 3)
- `/game` page with two 10x10 grids (one per player)
- Ships are auto-placed via random placement logic
- Option to regenerate ships before locking in
- “Begin Battle” button starts the match
- Turn system with `currentTurn` tracker
- A “Next Turn” button that randomly selects a target
- Boards track and display hits (🔴), misses (⚪), and ships (🔵) for the current player
- Firing logic is **isolated and AI-ready** — easily swappable with a real AI model call (e.g., OpenAI API)

---

📌 What’s Next (Future Steps):
- Add a win condition (detect when all ships are sunk)
- Enhance shot logic to simulate basic AI strategy (hunt mode, etc.)
- Replace random firing with **real AI model input** (passing game state to GPT-4 via API or LangChain)
- Add `/api/state` or `.md` summary for AI agents to read context
- Implement a `.well-known/ai-resources.json` file to expose data/tools to autonomous agents
- Add battle history log (wins, turns taken, models used)
- Eventually make the game fully playable by AI agents via button-less flows

---

📁 Learning Focus:
- Making apps that **AI can use** (not just humans)
- Using markdown and structured data as inputs for agents
- Architecting interfaces that work well with LLMs, agent tools, and reasoning systems

---

I want to pick up where we left off and keep going in small, deliberate, modular steps.

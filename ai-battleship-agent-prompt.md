# AI Battleship Agent Prompt

## 1. Optimal State Representation

Provide the AI with a concise JSON snapshot of its knowledge:

```json
{
  "size": 10,
  "shots": [
    { "row": 0, "col": 1, "result": "miss" },
    { "row": 2, "col": 5, "result": "hit" },
    { "row": 2, "col": 6, "result": "hit" }
  ],
  "sunkShips": ["Cruiser"]
}
```

- **size**: board dimensions (10×10).  
- **shots**: history of fired shots, each with `row`, `col`, and `"hit"`/`"miss"`.  
- **sunkShips** *(optional)*: list of ships already sunk.

---

## 2. Example Prompt Template

Use a structured prompt so the model can parse and reason clearly:

```markdown
You are a Battleship-playing agent.
Board size: 10×10, rows and columns indexed 0–9.
You know only your own shots and their outcomes.

Here is the current game state:

```json
{
  "size": 10,
  "shots": [
    { "row": 0, "col": 1, "result": "miss" },
    { "row": 2, "col": 5, "result": "hit" },
    { "row": 2, "col": 6, "result": "hit" }
  ],
  "sunkShips": ["Cruiser"]
}
```

Your task:
1. Analyze where the remaining ships must be.
2. Pick the single best next shot coordinate (`row`, `col`).
3. Explain your reasoning in 1–2 sentences.

Respond **only** as JSON:

```json
{
  "nextShot": { "row": X, "col": Y },
  "reason": "…short explanation…"
}
```
```

---

## 3. Why This Works

- **JSON** is unambiguous and easy to parse.  
- Listing only your own `shots` + `sunkShips` forces the agent to infer hidden ship positions.  
- A strict output schema (`nextShot` + `reason`) simplifies integration.

---

## 4. Next Steps

1. Add an `/api/state` endpoint to serve this JSON to your AI agent.  
2. In `fireNextShot`, call your LLM API with this prompt instead of random logic.  
3. Parse the `nextShot` from the response and feed it back into your game loop.


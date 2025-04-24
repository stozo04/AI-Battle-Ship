// src/app/api/next-shot/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

function unwrapCodeBlock(str: string): string {
  // remove leading ```json or ``` and trailing ```
  return str
    .trim()
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "")
    .trim();
}

export async function POST(req: Request) {
  const { shots, sunkShips } = await req.json();
  // (ignore any server‐side store entirely)

  const payload = { size: 10, shots, sunkShips };

    const prompt = `
      You are an elite, master-level Battleship strategist AI.

**Game Context:**
* **Board:** Standard 10x10 grid (rows 0-9, columns 0-9).
* **Fleet:** The opponent has hidden the standard fleet:
    * 1 Carrier (5 squares)
    * 1 Battleship (4 squares)
    * 1 Cruiser (3 squares)
    * 1 Submarine (3 squares)
    * 1 Destroyer (2 squares)
* **Objective:** Sink the entire enemy fleet efficiently by suggesting coordinates {row: R, column: C}. You'll receive feedback ("hit", "miss", "sunk") for each shot.

**Your Task:**
Analyze the provided game history, which includes:
* 'shots': An array of past shots taken. Each entry is an object like **'{row: R, column: C, result: 'hit' | 'miss'}'**, indicating the coordinate fired upon and whether it was a hit or a miss.
* 'sunkShips': A list of ship types (e.g., "Carrier", "Destroyer") that have already been sunk.

Based on this history, determine the single optimal coordinate for the **next shot**. You must use the 'result' field in the 'shots' array, combined with the 'sunkShips' list, to track damage to individual ships and inform your targeting decisions.

**Strategic Directives & Constraints:**
1.  **Primary Goal:** Win the game by sinking all 5 enemy ships with the minimum number of shots.
2.  **Shot Validity:**
    * All coordinates must be within the grid: $0 \le \text{row} \le 9$ and $0 \le \text{column} \le 9$.
    * **Crucially, never suggest a coordinate that already exists in the 'shots' history.**
3.  **Targeting Logic (Target Mode):**
    * If the 'shots' history indicates a "hit" on a coordinate belonging to a ship type *not* yet listed in 'sunkShips', prioritize finding and sinking that specific ship.
    * Systematically explore valid, untried, orthogonally adjacent squares (up, down, left, right) to known hits associated with the target ship.
    * Use the pattern of hits and misses ('result' field in 'shots') around the initial hit(s) to deduce the ship's orientation (horizontal or vertical) and length.
    * Continue firing along the deduced axis until the ship is sunk (which will be confirmed by its addition to the 'sunkShips' list). Use adjacent misses as boundaries – do not fire past a miss when pursuing a specific hit pattern.
4.  **Searching Logic (Hunt Mode):**
    * If you are not actively pursuing a known, unsunk hit (based on 'shots' and 'sunkShips'), switch to hunting for new ships.
    * Employ strategies (like probability maps, checkerboarding, targeting areas where larger ships might fit) to maximize the chances of hitting an undiscovered ship. Avoid clustering shots unnecessarily unless targeting.
5.  **Reasoning:** Your suggested shot must be logically derived from the current game state and the strategic directives.

**Output Requirements:**
Return your decision as a JSON object with two fields:
* 'nextShot': An object '{row: R, column: C}' representing your chosen coordinate (where R and C are integers between 0 and 9, inclusive).
* 'reason': A concise string explaining your strategic thinking for selecting 'nextShot'. Reference the current mode (Hunt or Target), relevant past shots (e.g., "Targeting adjacent to hit at [3,4] which is part of an unsunk ship"), and why this specific coordinate is optimal based on the directives (e.g., "Exploring vertical orientation based on hit at [3,4] and miss at [3,5]", "Highest probability area for remaining 4-length ship", "Eliminating this square based on miss at [5,6]").

Now, analyze the provided 'shots' and 'sunkShips' history and determine the best 'nextShot'.
    Your input payload will look like this:


  \`\`\`json
  ${JSON.stringify(payload, null, 2)}
  \`\`\`

  Your reply must include only:
  \`\`\`json
  {
    "nextShot": { "row": X, "col": Y },
     "reason": "Your concise, situation-based targeting rationale here (must match the chosen coordinates)." }
  \`\`\`
  `;
  // gpt-4.1-nano-2025-04-14
  console.log('new prompt');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "o4-mini",
    messages: [{ role: "user", content: prompt }],
  });

  const raw = completion.choices[0].message?.content;
  if (!raw) {
    return NextResponse.json(
      { error: "Empty AI response" },
      { status: 500 }
    );
  }
  
  // 1️⃣ strip any markdown fences
  const jsonText = unwrapCodeBlock(raw);
  
  // 2️⃣ try to parse
  let responseJson;
  try {
    responseJson = JSON.parse(jsonText);
    const { nextShot, reason } = responseJson;
    const row = Math.min(Math.max(nextShot.row, 0), 9);
    const col = Math.min(Math.max(nextShot.col, 0), 9);

    return NextResponse.json({
      nextShot: { row, col },
      reason: (row !== nextShot.row || col !== nextShot.col)
        ? `${reason} (clamped into 0–9 bounds)`
        : reason
    });

  } catch {
    return NextResponse.json(
      { error: "Bad JSON from AI", detail: jsonText },
      { status: 500 }
    );
  }
}

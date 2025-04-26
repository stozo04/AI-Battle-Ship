// src/app/api/next-shot/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

function unwrapCodeBlock(str: string): string {
  // remove leading ```json or ``` and trailing ```
  return str
    .trim()
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "")
    .trim();
}

export async function POST(req: Request) {
  const { shots, sunkShips, model } = await req.json();
  // (ignore any server‐side store entirely)

  console.log("shots", shots);
  console.log("sunkShips", sunkShips);
  console.log("model", model);
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
IMPORTANT: Your response must be a valid JSON object with exactly these fields:
{
  "nextShot": {
    "row": <number between 0 and 9>,
    "col": <number between 0 and 9>
  },
  "reason": "<your strategic explanation>"
}

CRITICAL FORMATTING RULES:
1. Do not include any markdown formatting (no \`\`\`json or \`\`\`)
2. Do not include any newlines in the JSON
3. Do not include any extra text before or after the JSON
4. The reason field should be a single line of text
5. Do not escape any characters in the JSON
6. Do not add any extra whitespace or formatting

Your input payload will look like this:
${JSON.stringify(payload, null, 2)}

Now, analyze the provided 'shots' and 'sunkShips' history and determine the best 'nextShot'.
`;

console.log("prompt", prompt);
  let raw: string | undefined;

  if (model.startsWith("OpenAI")) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [{ role: "user", content: prompt }],
    });
    raw = completion.choices[0].message?.content || undefined;
  } else if (model.startsWith("Google")) {
    const genAI = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY || "" });
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-pro-preview-03-25",
      contents: prompt
    });
    raw = result.text || undefined;
  } 
  // else if (model.startsWith("Claude")) {
  //   // For now, we'll use OpenAI's API for Claude as well
  //   // TODO: Implement proper Claude API when available
  //   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  //   const completion = await openai.chat.completions.create({
  //     model: "o4-mini",
  //     messages: [{ role: "user", content: prompt }],
  //   });
  //   raw = completion.choices[0].message?.content || undefined;
  // } else {
  //   return NextResponse.json(
  //     { error: "Unsupported model" },
  //     { status: 400 }
  //   );
  // }

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
    // First attempt: direct parse
    responseJson = JSON.parse(jsonText);
  } catch {
    try {
      // Second attempt: try to extract JSON from the text
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedJson = jsonMatch[0];
        try {
          // Try parsing the extracted JSON directly
          responseJson = JSON.parse(extractedJson);
        } catch {
          // If that fails, try parsing it as a string that might be double-encoded
          const unescaped = extractedJson.replace(/\\n/g, ' ').replace(/\\"/g, '"');
          responseJson = JSON.parse(unescaped);
        }
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch {
      return NextResponse.json(
        { error: "Bad JSON from AI", detail: jsonText },
        { status: 500 }
      );
    }
  }

  // 3️⃣ validate and extract required fields
  const { nextShot, reason } = responseJson;
  if (!nextShot || typeof nextShot.row !== 'number' || typeof nextShot.col !== 'number') {
    return NextResponse.json(
      { error: "Invalid shot coordinates in AI response", detail: jsonText },
      { status: 500 }
    );
  }

  // 4️⃣ clamp coordinates to valid range
  const row = Math.min(Math.max(nextShot.row, 0), 9);
  const col = Math.min(Math.max(nextShot.col, 0), 9);

  return NextResponse.json({
    nextShot: { row, col },
    reason: (row !== nextShot.row || col !== nextShot.col)
      ? `${reason || "No reason provided"} (clamped into 0–9 bounds)`
      : (reason || "No reason provided")
  });
}

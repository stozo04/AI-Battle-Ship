// src/app/api/ping/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// A simple ping route to test the API
export async function GET() {
  // a trivial "ping": ask the model to repeat back "pong"
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano-2025-04-14",
    messages: [
      { role: "user", content: "Say pong" }
    ]
  });

  // grab the assistant's reply
  const reply = completion.choices[0].message.content;
  return NextResponse.json({ reply });
}

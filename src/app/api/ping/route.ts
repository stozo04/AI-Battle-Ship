// src/app/api/ping/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const genAI = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY || ""
});

// A simple ping route to test both APIs
export async function GET() {
  try {
    // Test OpenAI
    const openaiCompletion = await openai.chat.completions.create({
      model: "gpt-4.1-nano-2025-04-14",
      messages: [
        { role: "user", content: "Say pong" }
      ]
    });
    const openaiReply = openaiCompletion.choices[0].message.content;

    // Test Gemini
    const geminiResult = await genAI.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: "Say pong"
    });
    const geminiReply = geminiResult.text;

    return NextResponse.json({
      openai: { status: "success", reply: openaiReply },
      gemini: { status: "success", reply: geminiReply }
    });
  } catch (error) {
    console.error("API test failed:", error);
    return NextResponse.json(
      { error: "API test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

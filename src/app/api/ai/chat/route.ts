import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { meetingId, meetingName,text } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // ✅ FIXED
    });

    const prompt = `
You are an AI assistant helping a user understand a completed meeting.

Meeting Name: ${meetingName}
Meeting ID: ${meetingId}

User Question:
${text}

Answer clearly, simply, and professionally.
`;

    const result = await model.generateContent(prompt);
    const textdata = result.response.text();
    console.log(result)
    console.log(textdata)

    return NextResponse.json({ textdata });
  } catch (err) {
    console.error("Gemini error:", err);
    return NextResponse.json(
      { error: "Gemini failed" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // 1. Get the Discord Webhook URL from your Vercel environment variables
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Missing DISCORD_WEBHOOK_URL in Vercel env vars." }, { status: 500 });
  }

  // 2. Read the RAW string from the Java mod (DO NOT PARSE IT TO AN OBJECT)
  const rawBody = await request.text();
  
  if (!rawBody || rawBody.length < 5) {
    return NextResponse.json({ error: "Request body is empty." }, { status: 400 });
  }

  // Log it to Vercel dashboard so you can verify exactly what is coming in
  console.log("Forwarding to Discord:", rawBody);

  try {
    // 3. Send the exact string to Discord
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: rawBody, // Send the string exactly as the mod made it
    });

    if (!discordResponse.ok) {
      const detail = await discordResponse.text();
      console.error("Discord rejected it:", detail);
      return NextResponse.json(
        { error: "Discord rejected the webhook request.", detail },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Fetch failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const apiKey = process.env.PROXY_API_KEY;

  if (!webhookUrl || !apiKey) {
    return NextResponse.json({ error: "Server is missing environment variables." }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization") ?? "";
  if (authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const rawBody = await request.text();
    
    if (!rawBody || rawBody.length < 10) {
      return NextResponse.json({ error: "Request body is empty." }, { status: 400 });
    }

    const discordResponse = await fetch(webhookUrl + "?wait=true", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: rawBody,
    });

    if (!discordResponse.ok) {
      const detail = await discordResponse.text();
      return NextResponse.json(
        { error: "Discord rejected the webhook request.", detail: detail },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

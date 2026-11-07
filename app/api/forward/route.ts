import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 64 * 1024; // 64 KB

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const apiKey = process.env.PROXY_API_KEY;

  if (!webhookUrl || !apiKey) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  // Verify the webhook is a valid Discord URL
  let parsedWebhook: URL;
  try {
    parsedWebhook = new URL(webhookUrl);
  } catch {
    return NextResponse.json({ error: "Webhook configuration is invalid." }, { status: 500 });
  }

  if (
    parsedWebhook.protocol !== "https:" ||
    !["discord.com", "discordapp.com"].includes(parsedWebhook.hostname) ||
    !parsedWebhook.pathname.startsWith("/api/webhooks/")
  ) {
    return NextResponse.json({ error: "Webhook configuration is invalid." }, { status: 500 });
  }

  // Verify API Key
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedKey = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  const a = Buffer.from(suppliedKey);
  const b = Buffer.from(apiKey);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // Verify Content-Type
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }

  // Safely parse the JSON body
  let payload: any;
  try {
    const body = await request.text();
    if (!body || Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request body is empty or exceeds 64 KB." }, { status: 413 });
    }
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  // Ensure the payload is a valid object with an embeds array
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "JSON body must be an object." }, { status: 400 });
  }

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!discordResponse.ok) {
      const detail = await discordResponse.text();
      return NextResponse.json(
        {
          error: "Discord rejected the webhook request.",
          discordStatus: discordResponse.status,
          detail: detail.slice(0, 500),
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Fetch to Discord failed:", error);
    return NextResponse.json({ error: "Could not reach Discord." }, { status: 502 });
  }
}

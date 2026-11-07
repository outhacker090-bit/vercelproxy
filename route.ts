import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 64 * 1024; // 64 KB

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const apiKey = process.env.PROXY_API_KEY;

  if (!webhookUrl || !apiKey) {
    return NextResponse.json({ error: "Server is not configured." }, { status: 500 });
  }

  // Only accept a valid Discord webhook URL configured by the site owner.
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

  const authorization = request.headers.get("authorization") ?? "";
  const suppliedKey = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  // Constant-time comparison for equal-length keys.
  const a = Buffer.from(suppliedKey);
  const b = Buffer.from(apiKey);
  if (a.length !== b.length || !require("node:crypto").timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json." }, { status: 415 });
  }

  const body = await request.text();
  if (!body || Buffer.byteLength(body, "utf8") > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request body is empty or exceeds 64 KB." }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "JSON body must be an object." }, { status: 400 });
  }

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store"
    });

    if (!discordResponse.ok) {
      const detail = await discordResponse.text();
      return NextResponse.json(
        { error: "Discord rejected the webhook request.", discordStatus: discordResponse.status, detail: detail.slice(0, 500) },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not reach Discord." }, { status: 502 });
  }
}

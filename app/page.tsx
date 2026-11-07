export default function Home() {
  return (
    <main style={{ maxWidth: 760, margin: "12vh auto", padding: 24 }}>
      <div style={{ color: "#8ea2ff", fontWeight: 700, letterSpacing: 2, fontSize: 12 }}>SERVER-SIDE INTEGRATION</div>
      <h1 style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)", marginBottom: 12 }}>Discord Webhook Proxy</h1>
      <p style={{ color: "#b7c1d8", lineHeight: 1.7 }}>
        This endpoint securely relays authorized JSON requests to a Discord webhook.
        The Discord webhook URL is stored on the server and is not sent to your browser.
      </p>
      <div style={{ background: "#151d33", border: "1px solid #293653", borderRadius: 14, padding: 20, marginTop: 28 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Endpoint</div>
        <code style={{ color: "#9db0ff" }}>POST /api/forward</code>
        <p style={{ color: "#b7c1d8", marginBottom: 0, lineHeight: 1.6 }}>
          Send a JSON body with an Authorization bearer token matching your configured API key.
        </p>
      </div>
      <p style={{ color: "#8793ad", fontSize: 13, marginTop: 24 }}>
        Keep your API key private. Do not put it in public frontend code or publish it in a repository.
      </p>
    </main>
  );
}

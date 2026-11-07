import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discord Webhook Proxy",
  description: "A private server-side Discord webhook proxy"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0b1020", color: "#eef2ff" }}>
        {children}
      </body>
    </html>
  );
}

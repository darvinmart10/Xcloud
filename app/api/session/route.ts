import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const apiKey = process.env.HB_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing HB_API_KEY. Add your Hyperbeam API key to .env.local or Vercel Environment Variables." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://engine.hyperbeam.com/v0/vm", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        start_url: "https://trickybird.com
          ",
        offline_timeout: 300
      }),
      cache: "no-store"
    });

    const payload = await response.json();
    if (!response.ok) {
      console.error("Hyperbeam session creation failed:", response.status, payload);
      return NextResponse.json({ error: "Hyperbeam could not create a session. Check your API key and account quota." }, { status: 502 });
    }

    if (!payload.embed_url) {
      return NextResponse.json({ error: "Hyperbeam returned no embed URL." }, { status: 502 });
    }

    return NextResponse.json({
      embed_url: payload.embed_url,
      session_id: payload.session_id,
      admin_token: payload.admin_token
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Hyperbeam request error:", error);
    return NextResponse.json({ error: "Could not reach Hyperbeam. Please try again." }, { status: 502 });
  }
}

import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      {
        error:
          "ElevenLabs is not configured. Set ELEVENLABS_API_KEY and ELEVENLABS_AGENT_ID, or use Sample mode.",
      },
      { status: 503 },
    );
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${encodeURIComponent(agentId)}`,
    {
      headers: {
        "xi-api-key": apiKey,
      },
    },
  );

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to get an ElevenLabs signed URL." },
      { status: 502 },
    );
  }

  const body = (await response.json()) as { signed_url?: string };
  if (!body.signed_url) {
    return NextResponse.json(
      { error: "ElevenLabs did not return a signed URL." },
      { status: 502 },
    );
  }

  return NextResponse.json({ signedUrl: body.signed_url });
}

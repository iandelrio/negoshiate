import { NextResponse } from "next/server";
import { getScenarioMarkdown } from "@/lib/scenario-files";
import { isScenarioId } from "@/lib/scenarios";

export async function GET(
  _request: Request,
  context: { params: Promise<{ scenarioId: string }> },
) {
  const { scenarioId } = await context.params;

  if (!isScenarioId(scenarioId)) {
    return NextResponse.json({ error: "Unknown scenario." }, { status: 404 });
  }

  return NextResponse.json({ markdown: getScenarioMarkdown(scenarioId) });
}

import fs from "node:fs";
import path from "node:path";
import type { ScenarioId } from "./types";

export function getScenarioMarkdown(id: ScenarioId) {
  const filePath = path.join(process.cwd(), "scenarios", `${id}.md`);
  return fs.readFileSync(filePath, "utf8");
}

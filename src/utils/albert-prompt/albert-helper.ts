import fs from "node:fs";
import path from "node:path";

export default function readAlbertPrompt(): string {
  const absoluteFilePath = path.join(process.cwd(), "src/utils/albert-prompt/albert-prompt.md");

  return fs.readFileSync(absoluteFilePath, "utf-8");
};

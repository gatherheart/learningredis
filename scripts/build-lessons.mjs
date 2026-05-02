// Build script: for every lesson in lessons/meta.json, build the corresponding
// Rust binary, run it, capture stdout, and emit src/data/lessons.json containing
// { id, bin, topic, code, expectedOutput, quizzes } per lesson.
//
// Run with: node scripts/build-lessons.mjs
// Used by: `npm run build:lessons` (also runs as part of `npm run build`).

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = resolve(dirname(__filename), "..");
const lessonsDir = resolve(root, "lessons");
const outFile = resolve(root, "src/data/lessons.json");

const meta = JSON.parse(readFileSync(resolve(lessonsDir, "meta.json"), "utf8"));

console.log(`[lessons] building ${meta.length} lesson(s)...`);

const built = meta.map((lesson) => {
  const binPath = resolve(lessonsDir, `src/bin/${lesson.bin}.rs`);
  const code = readFileSync(binPath, "utf8");

  // cargo run prints status to stderr; we only want program stdout.
  const stdout = execFileSync(
    "cargo",
    ["run", "--quiet", "--release", "--bin", lesson.bin],
    { cwd: lessonsDir, encoding: "utf8" },
  );

  console.log(`  ✓ ${lesson.id}  (${stdout.split("\n").length - 1} line(s) of output)`);

  return {
    ...lesson,
    code,
    expectedOutput: stdout,
  };
});

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, JSON.stringify(built, null, 2));
console.log(`[lessons] wrote ${outFile}`);

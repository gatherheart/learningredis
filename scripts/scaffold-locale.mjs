// Scaffold a translation file from src/i18n/locales/en.json by deep-cloning
// every leaf string and prefixing it with "__TODO__ ", so translators have
// a clean checklist they can grep for. Existing target files are merged:
// keys already translated are preserved; only missing keys get the stub.
//
// Usage:
//   node scripts/scaffold-locale.mjs ja
//   node scripts/scaffold-locale.mjs zh-CN --force      # overwrite every value
//   node scripts/scaffold-locale.mjs ko --check-only    # report missing keys
//
// After scaffolding, register the new file in src/i18n/index.ts so
// react-i18next loads it.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const root = resolve(dirname(__filename), "..");
const localesDir = resolve(root, "src/i18n/locales");

const args = process.argv.slice(2);
const code = args.find((a) => !a.startsWith("--"));
const force = args.includes("--force");
const checkOnly = args.includes("--check-only");

if (!code) {
  console.error("usage: node scripts/scaffold-locale.mjs <locale-code> [--force] [--check-only]");
  process.exit(1);
}

const en = JSON.parse(readFileSync(resolve(localesDir, "en.json"), "utf8"));
const targetPath = resolve(localesDir, `${code}.json`);
const existing = existsSync(targetPath)
  ? JSON.parse(readFileSync(targetPath, "utf8"))
  : {};

const TODO = "__TODO__ ";
const missing = [];

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

function merge(enNode, exNode, path) {
  if (Array.isArray(enNode)) {
    // Arrays are treated as a unit. If the existing value is an array of the
    // same length and every entry is non-stub, keep it. Otherwise reset.
    if (
      Array.isArray(exNode) &&
      exNode.length === enNode.length &&
      exNode.every((v, i) =>
        typeof v === "string" && !v.startsWith(TODO) && !force ? true : false,
      ) &&
      !force
    ) {
      return exNode;
    }
    if (Array.isArray(exNode) && !force) {
      // Per-element merge: keep translated entries, stub the rest.
      return enNode.map((v, i) => {
        const ex = exNode[i];
        if (typeof v !== "string") return v;
        if (typeof ex === "string" && ex && !ex.startsWith(TODO)) return ex;
        missing.push(`${path}[${i}]`);
        return TODO + v;
      });
    }
    return enNode.map((v, i) => {
      if (typeof v !== "string") return v;
      missing.push(`${path}[${i}]`);
      return TODO + v;
    });
  }

  if (isPlainObject(enNode)) {
    const out = {};
    for (const key of Object.keys(enNode)) {
      const child = path ? `${path}.${key}` : key;
      out[key] = merge(enNode[key], isPlainObject(exNode) ? exNode[key] : undefined, child);
    }
    return out;
  }

  // Leaf string.
  if (typeof enNode === "string") {
    if (!force && typeof exNode === "string" && exNode && !exNode.startsWith(TODO)) {
      return exNode;
    }
    missing.push(path);
    return TODO + enNode;
  }

  // Other primitive — pass through.
  return enNode;
}

const result = merge(en, existing, "");

if (checkOnly) {
  if (missing.length === 0) {
    console.log(`[i18n] ${code}: all keys translated.`);
  } else {
    console.log(`[i18n] ${code}: ${missing.length} key(s) missing or stubbed:`);
    for (const k of missing) console.log(`  - ${k}`);
  }
  process.exit(0);
}

writeFileSync(targetPath, JSON.stringify(result, null, 2) + "\n");
console.log(
  `[i18n] wrote ${targetPath}` +
    (missing.length ? `  (${missing.length} __TODO__ marker(s))` : "  (no missing keys)"),
);
console.log(
  `[i18n] register the locale in src/i18n/index.ts:\n` +
    `       import ${code.replace(/-/g, "")} from "./locales/${code}.json";\n` +
    `       and add it to the resources map.`,
);

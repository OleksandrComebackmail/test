// Run on push to main. If "## [Unreleased]" has content, cut it into a new
// versioned section, bump package.json, and emit outputs for the workflow to
// commit + tag + release. If Unreleased is empty, do nothing (released=false).
import { readFileSync, writeFileSync, existsSync, appendFileSync } from "node:fs";

const FILE = "CHANGELOG.md";
const PKG = "package.json";
const DATE = process.env.RELEASE_DATE || "";

const out = (k, v) => {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`);
};

if (!existsSync(FILE)) {
  out("released", "false");
  process.exit(0);
}

const content = readFileSync(FILE, "utf8");
const lines = content.split("\n");
const start = lines.findIndex((l) => l.startsWith("## [Unreleased]"));
if (start === -1) {
  out("released", "false");
  process.exit(0);
}
let end = lines.findIndex((l, i) => i > start && l.startsWith("## "));
if (end === -1) end = lines.length;

const blockLines = lines.slice(start + 1, end);
if (!blockLines.join("\n").trim()) {
  console.log("Unreleased empty — nothing to release.");
  out("released", "false");
  process.exit(0);
}

// Determine bump from the Unreleased content.
const block = blockLines.join("\n");
let bump = "patch";
if (/^### Added/m.test(block)) bump = "minor";
if (/\*\*\(BREAKING\)\*\*/.test(block)) bump = "major";

const pkg = JSON.parse(readFileSync(PKG, "utf8"));
let version;
if (pkg.version === "0.0.0") {
  version = "1.0.0";
} else {
  let [maj, min, pat] = pkg.version.split(".").map(Number);
  if (bump === "major") { maj++; min = 0; pat = 0; }
  else if (bump === "minor") { min++; pat = 0; }
  else { pat++; }
  version = `${maj}.${min}.${pat}`;
}

pkg.version = version;
writeFileSync(PKG, JSON.stringify(pkg, null, 2) + "\n");

const newBlock = ["## [Unreleased]", "", `## [${version}] - ${DATE}`, ...blockLines];
const newLines = [...lines.slice(0, start), ...newBlock, ...lines.slice(end)];
writeFileSync(FILE, newLines.join("\n").replace(/\n{3,}/g, "\n\n"));

console.log(`Released ${version} (${bump}).`);
out("released", "true");
out("version", version);

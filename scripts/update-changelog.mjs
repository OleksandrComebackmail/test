// Appends/updates this PR's entry under "## [Unreleased]" in CHANGELOG.md.
// Idempotent: keyed by (#PR_NUMBER), so re-runs (synchronize/edited) replace
// the existing bullet instead of duplicating it.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const FILE = "CHANGELOG.md";
const title = (process.env.TITLE || "").trim();
const num = process.env.NUM;
const author = process.env.AUTHOR;

// Parse a Conventional Commit title: type(scope)!: description
const m = title.match(/^(\w+)(\([^)]*\))?(!)?:\s*(.+)$/);
if (!m) {
  console.log(`Title "${title}" is not conventional — skipping changelog.`);
  process.exit(0);
}
const [, type, , bang, desc] = m;

const SECTION = {
  feat: "Added",
  fix: "Fixed",
  perf: "Performance",
  refactor: "Changed",
  revert: "Reverted",
};
const section = SECTION[type];
if (!section) {
  console.log(`Type "${type}" is hidden — no changelog entry.`);
  process.exit(0);
}

const tag = `(#${num})`;
const breaking = bang ? " **(BREAKING)**" : "";
const bullet = `- ${desc} ${tag} (@${author})${breaking}`;

let content = existsSync(FILE)
  ? readFileSync(FILE, "utf8")
  : "# Changelog\n\n## [Unreleased]\n";
if (!content.includes("## [Unreleased]")) {
  content = content.replace(/^(# Changelog\s*\n)/, "$1\n## [Unreleased]\n");
}

const lines = content.split("\n");
const start = lines.findIndex((l) => l.startsWith("## [Unreleased]"));
let end = lines.findIndex((l, i) => i > start && l.startsWith("## "));
if (end === -1) end = lines.length;

const head = lines.slice(0, start + 1);
const tail = lines.slice(end);

// Parse existing Unreleased bullets per section; drop any bullet for this PR.
const sections = {};
let current = null;
for (const l of lines.slice(start + 1, end)) {
  const hm = l.match(/^### (.+)$/);
  if (hm) {
    current = hm[1];
    sections[current] ??= [];
  } else if (l.trim().startsWith("- ") && current && !l.includes(tag)) {
    sections[current].push(l.trim());
  }
}
sections[section] ??= [];
sections[section].push(bullet);

const ORDER = ["Added", "Fixed", "Performance", "Changed", "Reverted"];
const block = [""];
for (const name of ORDER) {
  if (sections[name]?.length) {
    block.push(`### ${name}`, ...sections[name], "");
  }
}

const out = [...head, ...block, ...tail]
  .join("\n")
  .replace(/\n{3,}/g, "\n\n");
writeFileSync(FILE, out);
console.log(`Changelog updated: ${bullet}`);

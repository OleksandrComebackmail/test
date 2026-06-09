// Regenerates THIS PR's unreleased entries in CHANGELOG.md from the conventional
// commits on the PR branch (vs the base branch). Runs on every push to the PR, so
// adding/removing commits re-renders the PR's block. Idempotent: all bullets keyed
// by (#PR_NUMBER) are removed and rebuilt from the current branch state.
//
// Format notes:
// - Pending entries live below an invisible `<!-- unreleased -->` anchor (no
//   visible "Unreleased" heading).
// - Version sections are level-1 headings: `# X.Y.Z — DATE` (written by release.mjs).
// - Bullets carry no author.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";

const FILE = "CHANGELOG.md";
const ANCHOR = "<!-- unreleased -->";
const num = process.env.NUM;
const base = process.env.BASE || "main";

const SECTION = {
  feat: "Added",
  fix: "Fixed",
  perf: "Performance",
  refactor: "Changed",
  revert: "Reverted",
};
const ORDER = ["Added", "Fixed", "Performance", "Changed", "Reverted"];
const tag = `(#${num})`;
const isVersion = (l) => /^# \d/.test(l);

// Commits on this branch since it diverged from the base.
const baseSha = execSync(`git merge-base origin/${base} HEAD`).toString().trim();
const raw = execSync(`git log ${baseSha}..HEAD --pretty=format:%H%x1f%an%x1f%s`)
  .toString()
  .trim();
const commits = raw ? raw.split("\n").map((l) => l.split("\x1f")) : [];

// Build this PR's bullets per section, in commit order (oldest first).
const collected = {};
for (const [, an, subject] of commits.reverse()) {
  if (an === "github-actions[bot]") continue;
  if (/^docs: update changelog/.test(subject) || subject.includes("[skip ci]")) continue;
  const m = subject.match(/^(\w+)(\([^)]*\))?(!)?:\s*(.+)$/);
  if (!m) continue;
  const [, type, , bang, desc] = m;
  const section = SECTION[type];
  if (!section) continue;
  const breaking = bang ? " **(BREAKING)**" : "";
  (collected[section] ??= []).push(`- ${desc} ${tag}${breaking}`);
}

let content = existsSync(FILE)
  ? readFileSync(FILE, "utf8")
  : `# Changelog\n\n${ANCHOR}\n`;
// Re-create the invisible anchor just above the latest version (release.mjs
// removes it on release, so pending entries only show while they exist).
if (!content.includes(ANCHOR)) {
  const ls = content.split("\n");
  const firstVer = ls.findIndex(isVersion);
  if (firstVer === -1) content = content.replace(/\s*$/, "\n") + `\n${ANCHOR}\n`;
  else {
    ls.splice(firstVer, 0, ANCHOR, "");
    content = ls.join("\n");
  }
}

const lines = content.split("\n");
const start = lines.findIndex((l) => l.trim() === ANCHOR);
let end = lines.findIndex((l, i) => i > start && isVersion(l));
if (end === -1) end = lines.length;

const head = lines.slice(0, start + 1);
const tail = lines.slice(end);

// Existing pending bullets per section, minus this PR's old set.
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
for (const [section, bullets] of Object.entries(collected)) {
  (sections[section] ??= []).push(...bullets);
}

const block = [""];
for (const name of ORDER) {
  if (sections[name]?.length) block.push(`### ${name}`, ...sections[name], "");
}

const out = [...head, ...block, ...tail].join("\n").replace(/\n{3,}/g, "\n\n");
writeFileSync(FILE, out);
console.log(
  `Changelog regenerated for PR #${num}: ${Object.values(collected).flat().length} entr(y/ies).`,
);

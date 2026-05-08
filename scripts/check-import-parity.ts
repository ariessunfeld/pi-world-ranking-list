import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { loadRecords } from "../src/lib/data";
import { filterRecords, rankRecords } from "../src/lib/rankings";
import type { Constant, RankedRecord } from "../src/lib/types";

const root = fileURLToPath(new URL("../", import.meta.url));
const rawRoot = new URL("archive/current-site/raw/", `file://${root}/`);

const checks: Array<{
  constant: Constant;
  file: string;
  expectedTopName: string;
  expectedTopDigits: number;
}> = [
  { constant: "pi", file: "pi-digits.html", expectedTopName: "Sharma, Suresh Kumar", expectedTopDigits: 70030 },
  { constant: "e", file: "e-digits.html", expectedTopName: "Sharma, Rahul", expectedTopDigits: 25000 },
  { constant: "sqrt2", file: "sqrt2-digits.html", expectedTopName: "Sharma, Anushree", expectedTopDigits: 6002 },
];

function clean(value: string) {
  const normalized = value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
  if (!/[ÃÂâ]/.test(normalized)) return normalized.normalize("NFC");
  const repaired = Buffer.from(normalized, "latin1").toString("utf8");
  return repaired.includes("\uFFFD") ? normalized.normalize("NFC") : repaired.normalize("NFC");
}

function parseOldRows(file: string) {
  const html = readFileSync(new URL(file, rawRoot), "utf8");
  const $ = load(html);
  return $("tr.rankingentry")
    .map((_index, row) => {
      const element = $(row);
      const rank = Number(clean(element.find("td.ranking").text()).replace(/\D/g, ""));
      const name = clean(element.find("td.name").text()).replace(/,\s*$/, "");
      const digits = Number(clean(element.find("td.digits").text()).replace(/\D/g, ""));
      return { rank, name, digits };
    })
    .get()
    .filter((row) => row.name && row.digits > 0);
}

function findRanked(ranked: RankedRecord[], oldRow: { name: string; digits: number }) {
  return ranked.find((record) => record.display_name === oldRow.name && record.digits === oldRow.digits);
}

const records = loadRecords();
const errors: string[] = [];

for (const check of checks) {
  const oldRows = parseOldRows(check.file);
  const ranked = rankRecords(filterRecords(records, check.constant));
  const top = ranked[0];

  if (ranked.length !== oldRows.length) {
    errors.push(
      `${check.constant}: normal row count mismatch, old ${oldRows.length}, generated ${ranked.length}`,
    );
  }

  if (!top || top.display_name !== check.expectedTopName || top.digits !== check.expectedTopDigits) {
    errors.push(
      `${check.constant}: expected top ${check.expectedTopName} (${check.expectedTopDigits}), got ${top?.display_name} (${top?.digits})`,
    );
  }

  for (const oldRow of oldRows.slice(0, 100)) {
    const match = findRanked(ranked, oldRow);
    if (!match) {
      errors.push(`${check.constant}: missing imported row ${oldRow.name} (${oldRow.digits})`);
      continue;
    }
    if (match.rank !== oldRow.rank) {
      errors.push(
        `${check.constant}: rank mismatch for ${oldRow.name} (${oldRow.digits}): old ${oldRow.rank}, generated ${match.rank}`,
      );
    }
  }
}

const piRanked = rankRecords(filterRecords(records, "pi"));
const tied10000 = piRanked.filter((record) => record.digits === 10000);
if (tied10000.length < 4 || new Set(tied10000.map((record) => record.rank)).size !== 1) {
  errors.push("pi: expected multiple 10,000 digit records to share the same rank");
}

if (records.some((record) => record.is_public && record.digits < 20 && !record.category_tags.includes("nonstandard"))) {
  errors.push("normal public records include a row under 20 digits");
}

if (errors.length > 0) {
  for (const error of errors) console.error(`error: ${error}`);
  process.exit(1);
}

console.log("Import parity checks passed for pi, e, sqrt2 top rows, ranks, and tie behavior.");

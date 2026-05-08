import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import yaml from "js-yaml";
import { countrySchema, validateRecords } from "./validation";
import type { Country, RankingRecord, SpecialPage } from "./types";

const root = fileURLToPath(new URL("../..", import.meta.url));

function readRootFile(path: string) {
  return readFileSync(new URL(path, `file://${root}/`), "utf8");
}

export function loadCountries(): Country[] {
  const parsed = yaml.load(readRootFile("data/countries.yaml"));
  const result = countrySchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data.countries;
}

export function loadRecords(): RankingRecord[] {
  const rows = parse(readRootFile("data/records.csv"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });
  const countries = loadCountries();
  const countryMap = new Map(countries.map((country) => [country.name, country.continent]));
  const result = validateRecords(rows, countryMap);
  if (result.errors.length > 0) {
    throw new Error(result.errors.join("\n"));
  }
  return result.records;
}

export function loadSpecialPages(): SpecialPage[] {
  const parsed = yaml.load(readRootFile("data/special-records.yaml")) as { pages?: SpecialPage[] };
  return parsed.pages ?? [];
}

export function loadLinks(): Array<{ title: string; url: string; description?: string }> {
  const parsed = yaml.load(readRootFile("data/links.yaml")) as {
    links?: Array<{ title: string; url: string; description?: string }>;
  };
  return parsed.links ?? [];
}

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse } from "csv-parse/sync";
import yaml from "js-yaml";
import { countrySchema, validateRecords } from "../src/lib/validation";

const root = fileURLToPath(new URL("../", import.meta.url));

function read(path: string) {
  return readFileSync(new URL(path, `file://${root}/`), "utf8");
}

const rows = parse(read("data/records.csv"), {
  columns: true,
  skip_empty_lines: true,
  bom: true,
});
const countriesYaml = yaml.load(read("data/countries.yaml"));
const countries = countrySchema.parse(countriesYaml).countries;
const countryMap = new Map(countries.map((country) => [country.name, country.continent]));
const result = validateRecords(rows, countryMap);

for (const warning of result.warnings) {
  console.warn(`warning: ${warning}`);
}

if (result.errors.length > 0) {
  for (const error of result.errors) {
    console.error(`error: ${error}`);
  }
  process.exit(1);
}

console.log(
  `Validated ${result.records.length} records across ${countries.length} countries. ${result.warnings.length} warnings.`,
);

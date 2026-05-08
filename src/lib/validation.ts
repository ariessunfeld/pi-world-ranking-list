import { z } from "zod";
import type { RankingRecord } from "./types";

const datePattern = /^$|^\d{4}$|^\d{4}-\d{2}$|^\d{4}-\d{2}-\d{2}$/;

const booleanFromCsv = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.trim().toLowerCase() === "true";
  return value;
}, z.boolean());

const tagsFromCsv = z.preprocess((value) => {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return [];
  return value
    .split("|")
    .map((tag) => tag.trim())
    .filter(Boolean);
}, z.array(z.string()));

export const recordSchema = z.object({
  id: z.string().min(3).regex(/^[a-z0-9][a-z0-9-]*$/),
  constant: z.enum(["pi", "e", "sqrt2"]),
  display_name: z.string().min(1),
  sort_name: z.string().min(1),
  country: z.string().min(1),
  continent: z.string().min(1),
  digits: z.coerce.number().int().positive(),
  date: z.string().regex(datePattern),
  date_text: z.string(),
  date_precision: z.enum(["day", "month", "year", "unknown"]),
  notes: z.string(),
  source_url: z.string().url(),
  category_tags: tagsFromCsv,
  is_juggling: booleanFromCsv,
  is_public: booleanFromCsv,
});

export const countrySchema = z.object({
  countries: z.array(
    z.object({
      name: z.string().min(1),
      continent: z.string().min(1),
    }),
  ),
});

export type ValidationResult = {
  records: RankingRecord[];
  errors: string[];
  warnings: string[];
};

export function validateRecords(
  inputRows: unknown[],
  countryMap: Map<string, string>,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const records: RankingRecord[] = [];
  const ids = new Set<string>();
  const performanceKeys = new Map<string, string>();

  inputRows.forEach((row, index) => {
    const parsed = recordSchema.safeParse(row);
    if (!parsed.success) {
      const detail = parsed.error.issues.map((issue) => issue.path.join(".") + ": " + issue.message);
      errors.push(`row ${index + 1}: ${detail.join("; ")}`);
      return;
    }

    const record = parsed.data as RankingRecord;
    if (ids.has(record.id)) {
      errors.push(`duplicate id: ${record.id}`);
    }
    ids.add(record.id);

    const expectedContinent = countryMap.get(record.country);
    if (!expectedContinent) {
      errors.push(`${record.id}: country "${record.country}" is missing from data/countries.yaml`);
    } else if (expectedContinent !== record.continent) {
      errors.push(
        `${record.id}: continent "${record.continent}" does not match country map "${expectedContinent}"`,
      );
    }

    if (record.is_public && record.digits < 20 && !record.category_tags.includes("nonstandard")) {
      errors.push(`${record.id}: public normal records must have at least 20 digits`);
    }

    if (/witness|address|phone|scan|passport|email/i.test(record.source_url)) {
      errors.push(`${record.id}: source_url appears to reference private evidence`);
    }

    const performanceKey = [
      record.constant,
      record.display_name.toLocaleLowerCase(),
      record.country.toLocaleLowerCase(),
      record.digits,
      record.date || record.date_text.toLocaleLowerCase(),
    ].join("|");
    const existingId = performanceKeys.get(performanceKey);
    if (existingId) {
      warnings.push(`${record.id}: possible duplicate performance also seen as ${existingId}`);
    } else {
      performanceKeys.set(performanceKey, record.id);
    }

    records.push(record);
  });

  return { records, errors, warnings };
}

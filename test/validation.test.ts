import { describe, expect, it } from "vitest";
import { validateRecords } from "../src/lib/validation";

const countryMap = new Map([
  ["USA", "North America"],
  ["India", "Asia"],
]);

const validRow = {
  id: "pi-alpha-100",
  constant: "pi",
  display_name: "Alpha",
  sort_name: "Alpha",
  country: "USA",
  continent: "North America",
  digits: "100",
  date: "2024-03-14",
  date_text: "14 March 2024",
  date_precision: "day",
  notes: "",
  source_url: "https://www.pi-world-ranking-list.com/",
  category_tags: "",
  is_juggling: "false",
  is_public: "true",
};

describe("validateRecords", () => {
  it("accepts a valid imported CSV row", () => {
    const result = validateRecords([validRow], countryMap);
    expect(result.errors).toEqual([]);
    expect(result.records[0].digits).toBe(100);
  });

  it("rejects malformed records", () => {
    const result = validateRecords([{ ...validRow, id: "bad id", digits: "0" }], countryMap);
    expect(result.errors.join("\n")).toContain("id");
    expect(result.errors.join("\n")).toContain("digits");
  });

  it("rejects public normal records under 20 digits", () => {
    const result = validateRecords([{ ...validRow, id: "pi-alpha-19", digits: "19" }], countryMap);
    expect(result.errors.join("\n")).toContain("at least 20 digits");
  });
});

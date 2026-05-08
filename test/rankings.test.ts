import { describe, expect, it } from "vitest";
import { filterRecords, groupRankedRecords, rankRecords } from "../src/lib/rankings";
import type { RankingRecord } from "../src/lib/types";

function record(
  id: string,
  constant: "pi" | "e" | "sqrt2",
  displayName: string,
  country: string,
  continent: string,
  digits: number,
): RankingRecord {
  return {
    id,
    constant,
    display_name: displayName,
    sort_name: displayName,
    country,
    continent,
    digits,
    date: "2024-03-14",
    date_text: "14 March 2024",
    date_precision: "day",
    notes: "",
    source_url: "https://www.pi-world-ranking-list.com/",
    category_tags: ["normal"],
    is_juggling: false,
    is_public: true,
  };
}

describe("rankRecords", () => {
  it("uses competition ranking for ties", () => {
    const ranked = rankRecords([
      record("a", "pi", "Alpha", "USA", "North America", 100),
      record("b", "pi", "Beta", "USA", "North America", 90),
      record("c", "pi", "Gamma", "USA", "North America", 100),
      record("d", "pi", "Delta", "USA", "North America", 80),
    ]);

    expect(ranked.map((entry) => [entry.display_name, entry.rank, entry.digits])).toEqual([
      ["Alpha", 1, 100],
      ["Gamma", 1, 100],
      ["Beta", 3, 90],
      ["Delta", 4, 80],
    ]);
  });

  it("keeps constants separate", () => {
    const records = [
      record("pi-a", "pi", "Pi", "USA", "North America", 100),
      record("e-a", "e", "E", "USA", "North America", 200),
    ];

    expect(filterRecords(records, "pi")).toHaveLength(1);
    expect(filterRecords(records, "e")[0].display_name).toBe("E");
  });

  it("groups country and continent rankings independently", () => {
    const records = [
      record("a", "pi", "Alpha", "USA", "North America", 100),
      record("b", "pi", "Beta", "USA", "North America", 90),
      record("c", "pi", "Gamma", "India", "Asia", 120),
    ];

    const groups = groupRankedRecords(records, "country");
    expect(groups.map((group) => group.group)).toEqual(["India", "USA"]);
    expect(groups.find((group) => group.group === "USA")?.records.map((entry) => entry.rank)).toEqual([1, 2]);
  });
});

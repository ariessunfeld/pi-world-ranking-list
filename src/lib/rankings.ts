import type { Constant, RankedRecord, RankingRecord } from "./types";

export type SortKey = "digits" | "name" | "country" | "continent" | "date";

const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });

function compareDate(a: RankingRecord, b: RankingRecord) {
  const aDate = a.date || "9999";
  const bDate = b.date || "9999";
  const byDate = collator.compare(aDate, bDate);
  if (byDate !== 0) return byDate;
  return collator.compare(a.date_text, b.date_text);
}

export function compareRecords(a: RankingRecord, b: RankingRecord, sortKey: SortKey = "digits") {
  if (sortKey === "digits") {
    const byDigits = b.digits - a.digits;
    if (byDigits !== 0) return byDigits;
  }

  if (sortKey === "name") {
    const byName = collator.compare(a.sort_name, b.sort_name);
    if (byName !== 0) return byName;
  }

  if (sortKey === "country") {
    const byCountry = collator.compare(a.country, b.country);
    if (byCountry !== 0) return byCountry;
  }

  if (sortKey === "continent") {
    const byContinent = collator.compare(a.continent, b.continent);
    if (byContinent !== 0) return byContinent;
  }

  if (sortKey === "date") {
    const byDate = compareDate(a, b);
    if (byDate !== 0) return byDate;
  }

  const byDigits = b.digits - a.digits;
  if (byDigits !== 0) return byDigits;
  const byName = collator.compare(a.sort_name, b.sort_name);
  if (byName !== 0) return byName;
  const byCountry = collator.compare(a.country, b.country);
  if (byCountry !== 0) return byCountry;
  const byDate = compareDate(a, b);
  if (byDate !== 0) return byDate;
  return collator.compare(a.id, b.id);
}

export function rankRecords(records: RankingRecord[]): RankedRecord[] {
  const sorted = [...records].sort((a, b) => compareRecords(a, b, "digits"));
  let previousDigits: number | undefined;
  let currentRank = 0;

  return sorted.map((record, index) => {
    if (record.digits !== previousDigits) {
      currentRank = index + 1;
      previousDigits = record.digits;
    }
    return { ...record, rank: currentRank };
  });
}

export function filterRecords(
  records: RankingRecord[],
  constant: Constant,
  options: { juggling?: boolean } = {},
) {
  return records.filter((record) => {
    if (!record.is_public || record.constant !== constant) return false;
    if (options.juggling === true) return record.is_juggling;
    if (options.juggling === false) return record.category_tags.includes("normal");
    return record.category_tags.includes("normal");
  });
}

export function groupRankedRecords(
  records: RankingRecord[],
  groupBy: "country" | "continent",
): Array<{ group: string; records: RankedRecord[] }> {
  const groups = new Map<string, RankingRecord[]>();
  for (const record of records) {
    const key = groupBy === "country" ? record.country : record.continent;
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => collator.compare(a, b))
    .map(([group, groupRecords]) => ({ group, records: rankRecords(groupRecords) }));
}

export function topRecord(records: RankingRecord[], constant: Constant) {
  return rankRecords(filterRecords(records, constant))[0];
}

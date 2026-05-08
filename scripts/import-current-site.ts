import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { load } from "cheerio";
import { stringify } from "csv-stringify/sync";
import yaml from "js-yaml";
import type { Constant, DatePrecision, RankingRecord, SpecialPage } from "../src/lib/types";
import { rankRecords } from "../src/lib/rankings";

const root = new URL("..", import.meta.url).pathname;
const rawDir = join(root, "archive/current-site/raw");
const dataDir = join(root, "data");
const publicDataDir = join(root, "public/data");

const baseUrl = "https://www.pi-world-ranking-list.com";

const pageManifest: Array<{ file: string; url: string }> = [
  { file: "home-root.html", url: `${baseUrl}/` },
  { file: "home.html", url: `${baseUrl}/index.php?page=home` },
  { file: "news.html", url: `${baseUrl}/index.php?page=news` },
  { file: "listoverview.html", url: `${baseUrl}/index.php?page=listoverview` },
  { file: "rules.html", url: `${baseUrl}/index.php?page=rules` },
  { file: "background.html", url: `${baseUrl}/index.php?page=background` },
  { file: "links.html", url: `${baseUrl}/index.php?page=links` },
  { file: "registration.html", url: `${baseUrl}/index.php?page=registration` },
  { file: "pi-digits.html", url: `${baseUrl}/?page=lists&category=pi&sort=digits` },
  { file: "pi-digits-index.html", url: `${baseUrl}/index.php?page=lists&category=pi&sort=digits` },
  {
    file: "pi-country.html",
    url: `${baseUrl}/index.php?page=lists&category=pi&sort=country&asc=true`,
  },
  {
    file: "pi-continent.html",
    url: `${baseUrl}/index.php?page=lists&category=pi&sort=continent&asc=true`,
  },
  { file: "e-digits.html", url: `${baseUrl}/index.php?page=lists&category=e&sort=digits` },
  {
    file: "sqrt2-digits.html",
    url: `${baseUrl}/index.php?page=lists&category=sqrt2&sort=digits`,
  },
  {
    file: "pi-juggling.html",
    url: `${baseUrl}/index.php?page=lists&category=pi&juggling=1&sort=digits`,
  },
  {
    file: "e-juggling.html",
    url: `${baseUrl}/index.php?page=lists&category=e&juggling=1&sort=digits`,
  },
  {
    file: "sqrt2-juggling.html",
    url: `${baseUrl}/index.php?page=lists&category=sqrt2&juggling=1&sort=digits`,
  },
  { file: "amazing.html", url: `${baseUrl}/index.php?page=amazing` },
  { file: "matrix.html", url: `${baseUrl}/index.php?page=matrix` },
  { file: "ultimate.html", url: `${baseUrl}/index.php?page=ultimate` },
  { file: "rules-ultimate.html", url: `${baseUrl}/index.php?page=rules-ultimate` },
  { file: "pi-permutation.html", url: `${baseUrl}/index.php?page=pi-permutation` },
];

const rankingPages: Array<{
  constant: Constant;
  file: string;
  url: string;
  isJuggling: boolean;
}> = [
  { constant: "pi", file: "pi-digits.html", url: `${baseUrl}/?page=lists&category=pi&sort=digits`, isJuggling: false },
  { constant: "e", file: "e-digits.html", url: `${baseUrl}/index.php?page=lists&category=e&sort=digits`, isJuggling: false },
  { constant: "sqrt2", file: "sqrt2-digits.html", url: `${baseUrl}/index.php?page=lists&category=sqrt2&sort=digits`, isJuggling: false },
  { constant: "pi", file: "pi-juggling.html", url: `${baseUrl}/index.php?page=lists&category=pi&juggling=1&sort=digits`, isJuggling: true },
  { constant: "e", file: "e-juggling.html", url: `${baseUrl}/index.php?page=lists&category=e&juggling=1&sort=digits`, isJuggling: true },
  { constant: "sqrt2", file: "sqrt2-juggling.html", url: `${baseUrl}/index.php?page=lists&category=sqrt2&juggling=1&sort=digits`, isJuggling: true },
];

type ImportedRow = Omit<RankingRecord, "id"> & {
  source_rank: number;
  source_page: string;
};

const monthNumbers = new Map(
  [
    "january",
    "february",
    "march",
    "april",
    "may",
    "june",
    "july",
    "august",
    "september",
    "october",
    "november",
    "december",
  ].map((month, index) => [month, String(index + 1).padStart(2, "0")]),
);
monthNumbers.set("jan", "01");
monthNumbers.set("feb", "02");
monthNumbers.set("mar", "03");
monthNumbers.set("apr", "04");
monthNumbers.set("jun", "06");
monthNumbers.set("jul", "07");
monthNumbers.set("aug", "08");
monthNumbers.set("sep", "09");
monthNumbers.set("sept", "09");
monthNumbers.set("oct", "10");
monthNumbers.set("nov", "11");
monthNumbers.set("dec", "12");

function cleanText(value: string) {
  const normalized = value
    .replace(/\uFEFF/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return repairMojibake(normalized);
}

function repairMojibake(value: string) {
  if (!/[ÃÂâ]/.test(value)) return value.normalize("NFC");
  const repaired = Buffer.from(value, "latin1").toString("utf8");
  return repaired.includes("\uFFFD") ? value.normalize("NFC") : repaired.normalize("NFC");
}

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function parseDate(value: string): { date: string; precision: DatePrecision; text: string } {
  const text = cleanText(value);
  if (!text) return { date: "", precision: "unknown", text: "" };

  const full = text.match(/^(\d{1,2})\s+([A-Za-z.]+)\s+(\d{4})$/);
  if (full) {
    const month = monthNumbers.get(full[2].replace(/\.$/, "").toLowerCase());
    if (month) {
      return {
        date: `${full[3]}-${month}-${full[1].padStart(2, "0")}`,
        precision: "day",
        text,
      };
    }
  }

  const monthYear = text.match(/^([A-Za-z.]+)\s+(\d{4})$/);
  if (monthYear) {
    const month = monthNumbers.get(monthYear[1].replace(/\.$/, "").toLowerCase());
    if (month) return { date: `${monthYear[2]}-${month}`, precision: "month", text };
  }

  if (/^\d{4}$/.test(text)) return { date: text, precision: "year", text };
  return { date: "", precision: "unknown", text };
}

function normalizeSourceUrl(href: string | undefined, fallback: string) {
  if (!href) return fallback;
  const clean = href.trim();
  if (clean.startsWith("mailto:")) return fallback;
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  if (clean.startsWith("//")) return `https:${clean}`;
  if (clean.startsWith("/")) return `${baseUrl}${clean}`;
  return `${baseUrl}/${clean}`;
}

function parseRankingPage(page: (typeof rankingPages)[number], warnings: string[]) {
  const html = readFileSync(join(rawDir, page.file), "utf8");
  const $ = load(html);
  const rows: ImportedRow[] = [];

  $("tr.rankingentry").each((_index, element) => {
    const row = $(element);
    const sourceRank = Number(cleanText(row.find("td.ranking").text()).replace(/\D/g, ""));
    const displayName = cleanText(row.find("td.name").text()).replace(/,\s*$/, "");
    const country = cleanText(row.find("td.country").text());
    const continent = cleanText(row.find("td.continent").text());
    const digits = Number(cleanText(row.find("td.digits").text()).replace(/[^\d]/g, ""));
    const dateInfo = parseDate(row.find("td.date").text());
    const noteCell = row.find("td.notes");
    const notes = cleanText(noteCell.text());
    const sourceUrl = normalizeSourceUrl(noteCell.find("a").first().attr("href"), page.url);

    if (!displayName || !country || !continent || !Number.isFinite(digits) || digits <= 0) {
      warnings.push(`${page.file}: skipped bogus or blank row "${cleanText(row.text()).slice(0, 80)}"`);
      return;
    }

    if (dateInfo.precision === "unknown" && dateInfo.text) {
      warnings.push(`${page.file}: unparsed date "${dateInfo.text}" for ${displayName}`);
    }

    rows.push({
      constant: page.constant,
      display_name: displayName,
      sort_name: displayName,
      country,
      continent,
      digits,
      date: dateInfo.date,
      date_text: dateInfo.text,
      date_precision: dateInfo.precision,
      notes,
      source_url: sourceUrl,
      category_tags: page.isJuggling ? ["juggling"] : ["normal"],
      is_juggling: page.isJuggling,
      is_public: true,
      source_rank: sourceRank,
      source_page: page.file,
    });
  });

  return rows;
}

function mergeRows(rows: ImportedRow[], warnings: string[]) {
  const merged = new Map<string, ImportedRow>();

  rows.forEach((row, index) => {
    const key = [
      row.constant,
      row.display_name.toLocaleLowerCase(),
      row.country.toLocaleLowerCase(),
      row.digits,
      row.date || row.date_text.toLocaleLowerCase(),
    ].join("|");
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, { ...row, category_tags: [...row.category_tags] });
      return;
    }

    const isSubsetMerge =
      existing.category_tags.includes("normal") !== row.category_tags.includes("normal") ||
      existing.category_tags.includes("juggling") !== row.category_tags.includes("juggling");

    if (isSubsetMerge) {
      existing.is_juggling = existing.is_juggling || row.is_juggling;
      existing.source_url = existing.source_url === row.source_url ? existing.source_url : existing.source_url;
      existing.category_tags = [...new Set([...existing.category_tags, ...row.category_tags])];
      if (!existing.notes && row.notes) existing.notes = row.notes;
      warnings.push(`merged normal/juggling subset row for ${row.display_name} (${row.constant}, ${row.digits})`);
      return;
    }

    const duplicateKey = `${key}|duplicate-${row.source_page}-${row.source_rank}-${index}`;
    merged.set(duplicateKey, { ...row, category_tags: [...row.category_tags] });
    warnings.push(`preserved possible duplicate row for ${row.display_name} (${row.constant}, ${row.digits})`);
  });

  const idCounts = new Map<string, number>();
  return [...merged.values()].map((row): RankingRecord => {
    const baseId = slugify(
      [
        row.constant,
        row.display_name,
        row.country,
        row.digits,
        row.date || row.date_text || "undated",
      ].join("-"),
    );
    const seen = idCounts.get(baseId) ?? 0;
    idCounts.set(baseId, seen + 1);
    return {
      id: seen === 0 ? baseId : `${baseId}-${seen + 1}`,
      constant: row.constant,
      display_name: row.display_name,
      sort_name: row.sort_name,
      country: row.country,
      continent: row.continent,
      digits: row.digits,
      date: row.date,
      date_text: row.date_text,
      date_precision: row.date_precision,
      notes: row.notes,
      source_url: row.source_url,
      category_tags: row.category_tags,
      is_juggling: row.is_juggling,
      is_public: row.is_public,
    };
  });
}

function reconcileContinents(records: RankingRecord[], warnings: string[]) {
  const counts = new Map<string, Map<string, number>>();
  for (const record of records) {
    const countryCounts = counts.get(record.country) ?? new Map<string, number>();
    countryCounts.set(record.continent, (countryCounts.get(record.continent) ?? 0) + 1);
    counts.set(record.country, countryCounts);
  }

  const continentByCountry = new Map<string, string>();
  for (const [country, countryCounts] of counts) {
    const sorted = [...countryCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    continentByCountry.set(country, sorted[0][0]);
    if (sorted.length > 1) {
      warnings.push(
        `normalized conflicting continents for ${country}: ${sorted
          .map(([continent, count]) => `${continent} (${count})`)
          .join(", ")}`,
      );
    }
  }

  return records.map((record) => {
    const expected = continentByCountry.get(record.country);
    if (expected && expected !== record.continent) {
      warnings.push(`${record.id}: normalized continent ${record.continent} -> ${expected}`);
      return { ...record, continent: expected };
    }
    return record;
  });
}

function extractLinks() {
  const html = readFileSync(join(rawDir, "links.html"), "utf8");
  const $ = load(html);
  return $("#contentinner a")
    .map((_index, element) => ({
      title: cleanText($(element).text()),
      url: normalizeSourceUrl($(element).attr("href"), `${baseUrl}/index.php?page=links`),
    }))
    .get()
    .filter((link) => link.title && !link.url.startsWith("mailto:"));
}

function extractMatrixEntries($: ReturnType<typeof load>) {
  const table = $("#contentinner table").first();
  return table
    .find("tr")
    .map((_index, row) => {
      const cells = $(row)
        .find("td")
        .map((_cellIndex, cell) => cleanText($(cell).text()))
        .get()
        .filter(Boolean);
      if (cells.length < 4 || !/^\d+$/.test(cells[0])) return undefined;
      const dateInfo = parseDate(cells[2]);
      return {
        rank: Number(cells[0]),
        name: cells[1],
        date: dateInfo.date || cells[2],
        time: cells[3],
        notes: cells[4] ?? "",
      };
    })
    .get()
    .filter(Boolean) as Array<Record<string, string | number>>;
}

function extractSpecialPages(): SpecialPage[] {
  const specialFiles = [
    {
      id: "amazing-performances",
      file: "amazing.html",
      title: "Amazing Performances",
      url: `${baseUrl}/index.php?page=amazing`,
    },
    {
      id: "pi-matrix",
      file: "matrix.html",
      title: "Pi Matrix Records",
      url: `${baseUrl}/index.php?page=matrix`,
    },
    {
      id: "ultimate-test",
      file: "ultimate.html",
      title: "The Ultimate Test of Pi",
      url: `${baseUrl}/index.php?page=ultimate`,
    },
    {
      id: "pi-permutation",
      file: "pi-permutation.html",
      title: "The Pi Permutation",
      url: `${baseUrl}/index.php?page=pi-permutation`,
    },
  ];

  return specialFiles.map((page) => {
    const html = readFileSync(join(rawDir, page.file), "utf8");
    const $ = load(html);
    $("#contentinner script, #contentinner style").remove();
    const body = cleanText($("#contentinner").text()).replace(/\s+(Rules|Records|Explanation):/g, "\n\n$1:");
    const entries =
      page.id === "pi-matrix"
        ? [
            {
              name: "Creighton Carvello",
              digits: "10050",
              date: "1999-10-09",
              notes: "Passed all Pi Matrix tests on first 10,050 digits.",
            },
            ...extractMatrixEntries($),
          ]
        : [];

    if (page.id === "amazing-performances") {
      entries.push(
        {
          name: "Sim Pohann",
          digits: "67053",
          date: "1999-04-14",
          notes: "Recited with 15 errors; not a world record because exact error positions are unknown.",
        },
        {
          name: "Dr. Yip Swe Chooi",
          digits: "60000",
          date: "1998-07-25",
          notes: "Recited with 44 errors; not a world record because exact error positions are unknown.",
        },
        {
          name: "Dave Turner",
          digits: "1250",
          date: "2005-07-05",
          notes: "Recited digits forwards and backwards.",
        },
        {
          name: "James Smith",
          digits: "3000",
          date: "2014-04-24",
          notes: "Recited digits forwards and backwards.",
        },
      );
    }

    if (page.id === "ultimate-test") {
      entries.push({
        name: "Jan van Koningsveld",
        digits: "1000",
        date: "2002-09-07",
        time: "51 min 40 sec",
        notes: "Answered all 30 Ultimate Test of Pi questions correctly.",
      });
    }

    if (page.id === "pi-permutation") {
      entries.push(
        {
          name: "Ulrich Voigt",
          date: "2002-06-28",
          discipline: "P(N=5000, n=2, k=2500)",
          time: "6h 5m",
        },
        {
          name: "Fabian Saal",
          date: "2015-05-23",
          discipline: "P(N=100, n=1, k=100)",
          time: "35.88 seconds",
        },
      );
    }

    return { id: page.id, title: page.title, source_url: page.url, body, entries };
  });
}

function writeCsv(records: RankingRecord[]) {
  const columns = [
    "id",
    "constant",
    "display_name",
    "sort_name",
    "country",
    "continent",
    "digits",
    "date",
    "date_text",
    "date_precision",
    "notes",
    "source_url",
    "category_tags",
    "is_juggling",
    "is_public",
  ];

  const rows = records.map((record) => ({
    ...record,
    category_tags: record.category_tags.join("|"),
    is_juggling: String(record.is_juggling),
    is_public: String(record.is_public),
  }));

  return stringify(rows, { header: true, columns });
}

async function fetchPages() {
  mkdirSync(rawDir, { recursive: true });
  for (const page of pageManifest) {
    const response = await fetch(page.url);
    if (!response.ok) throw new Error(`Failed ${page.url}: ${response.status}`);
    writeFileSync(join(rawDir, page.file), await response.text());
  }
}

function main() {
  const shouldFetch = process.argv.includes("--fetch");
  const warnings: string[] = [];
  if (shouldFetch) {
    return fetchPages().then(() => mainWithoutFetch(warnings));
  }
  return mainWithoutFetch(warnings);
}

function mainWithoutFetch(warnings: string[]) {
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(publicDataDir, { recursive: true });

  const importedRows = rankingPages.flatMap((page) => parseRankingPage(page, warnings));
  const records = reconcileContinents(mergeRows(importedRows, warnings), warnings).sort((a, b) =>
    a.id.localeCompare(b.id),
  );

  const countryMap = new Map<string, string>();
  for (const record of records) {
    const existing = countryMap.get(record.country);
    if (existing && existing !== record.continent) {
      warnings.push(`country continent conflict for ${record.country}: ${existing} vs ${record.continent}`);
    }
    countryMap.set(record.country, record.continent);
  }

  const countries = [...countryMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, continent]) => ({ name, continent }));

  const recordsCsv = writeCsv(records);
  writeFileSync(join(dataDir, "records.csv"), recordsCsv);
  writeFileSync(join(publicDataDir, "records.csv"), recordsCsv);
  writeFileSync(join(publicDataDir, "records.json"), JSON.stringify(records, null, 2) + "\n");
  writeFileSync(join(dataDir, "countries.yaml"), yaml.dump({ countries }, { lineWidth: 100 }));
  writeFileSync(join(dataDir, "links.yaml"), yaml.dump({ links: extractLinks() }, { lineWidth: 100 }));
  writeFileSync(
    join(dataDir, "special-records.yaml"),
    yaml.dump({ pages: extractSpecialPages() }, { lineWidth: 100 }),
  );

  const report = {
    generated_at: new Date().toISOString(),
    archive_directory: rawDir,
    imported_rows: importedRows.length,
    merged_records: records.length,
    skipped_or_warning_count: warnings.length,
    constants: {
      pi: records.filter((record) => record.constant === "pi").length,
      e: records.filter((record) => record.constant === "e").length,
      sqrt2: records.filter((record) => record.constant === "sqrt2").length,
    },
    juggling_records: records.filter((record) => record.is_juggling).length,
    countries: countries.length,
    top_records: {
      pi: rankRecords(records.filter((record) => record.constant === "pi"))[0],
      e: rankRecords(records.filter((record) => record.constant === "e"))[0],
      sqrt2: rankRecords(records.filter((record) => record.constant === "sqrt2"))[0],
    },
    warnings,
    archived_pages: pageManifest.map((page) => basename(page.file)),
  };
  writeFileSync(join(root, "archive/current-site/import-report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(
    `Imported ${records.length} canonical records from ${importedRows.length} public table rows. ${warnings.length} warnings written to archive/current-site/import-report.json.`,
  );
}

await main();

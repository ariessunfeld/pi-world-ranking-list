# Pi World Ranking List

This is a production-ready static rebuild of the public Pi World Ranking List.

It is intended to be a **new separate GitHub repository** named `pi-world-ranking-list`.
Do not put this project inside, or use it to replace, `ariessunfeld.github.io`.

Initial GitHub Pages project URL:

```text
https://ariessunfeld.github.io/pi-world-ranking-list/
```

On Ari's GitHub Pages account, that project URL currently redirects to the
custom-domain URL:

```text
https://www.ariessunfeld.com/pi-world-ranking-list/
```

## Stack

- Astro
- TypeScript
- Static generation
- CSV/YAML source data
- Zod validation
- Vitest tests
- GitHub Actions deployment to GitHub Pages

Astro is configured for a GitHub Pages project site under the project path:

```js
site: "https://www.ariessunfeld.com"
base: "/pi-world-ranking-list"
```

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Build locally:

```bash
npm run build
npm run preview
```

## Import Current Site Data

Archived raw HTML lives in:

```text
archive/current-site/raw/
```

Rebuild canonical data from the archive:

```bash
npm run import
```

Fetch the live pages again before importing:

```bash
npm run import -- --fetch
```

The importer writes:

- `data/records.csv`
- `data/countries.yaml`
- `data/links.yaml`
- `data/special-records.yaml`
- `public/data/records.csv`
- `public/data/records.json`
- `archive/current-site/import-report.json`

## Validate Data

```bash
npm run validate:data
npm run check:parity
npm run test
```

The build runs data validation before Astro builds:

```bash
npm run build
```

## Add A New Record

Edit `data/records.csv` and add one row. Use an existing row as the template.

Required fields:

- `id`: stable lowercase slug, unique in the file.
- `constant`: `pi`, `e`, or `sqrt2`.
- `display_name`: public display name.
- `sort_name`: usually the same as display name.
- `country`: must exist in `data/countries.yaml`.
- `continent`: must match the country mapping.
- `digits`: decimal places memorized.
- `date`: ISO date where known, such as `2026-03-14`.
- `date_text`: original display date.
- `date_precision`: `day`, `month`, `year`, or `unknown`.
- `notes`: public notes only.
- `source_url`: public source URL only.
- `category_tags`: `normal`, `juggling`, or `normal|juggling`.
- `is_juggling`: `true` or `false`.
- `is_public`: `true` for public ranking records.

Then run:

```bash
npm run validate:data
npm run check:parity
npm run test
npm run build
```

## Ranking Generation

Rank numbers are never hand-maintained.

The ranking code sorts records by descending `digits`. Ties share the same rank.
After ties, rank numbering skips positions using competition ranking. For example:

```text
1, 2, 2, 4
```

Normal pages use records tagged `normal`. Juggling pages use records where
`is_juggling` is true. Some performances appear in both sets.

Country and continent rankings are generated from the same canonical rows.

## Private Evidence Policy

Do not commit private verification material to this repository.

Keep all witness names, witness emails, addresses, phone numbers, scans, photos,
birth dates, and non-public correspondence in a separate private storage system.
See `docs/private-evidence-policy.md`.

## Deploy To GitHub Pages

Create a new repository:

1. Go to GitHub and create a new repository named `pi-world-ranking-list`.
2. Do not use the existing `ariessunfeld.github.io` repository.
3. Push this project to the new repository.
4. In repository Settings -> Pages, set Source to GitHub Actions if GitHub has not selected it automatically.
5. Confirm the published URL is:

```text
https://ariessunfeld.github.io/pi-world-ranking-list/
```

If GitHub Pages redirects to Ari's custom domain, the live URL is:

```text
https://www.ariessunfeld.com/pi-world-ranking-list/
```

Initial push commands:

```bash
git init
git add .
git commit -m "Build static Pi World Ranking List site"
git branch -M main
git remote add origin git@github.com:ariessunfeld/pi-world-ranking-list.git
git push -u origin main
```

## Custom Domain Later

After the project site is reviewed, a custom domain such as
`pi-world-ranking-list.com` can be attached in GitHub Pages settings.

When doing that, update `astro.config.mjs`:

```js
site: "https://www.pi-world-ranking-list.com"
base: "/"
```

Then add `public/CNAME` with the custom domain and configure DNS according to
GitHub Pages instructions.

## Imported Pages

The archive/import covers:

- Home, News, List overview, Rules, Background, Links, Registration
- Pi by digits, country, continent
- Pi juggling
- e by digits and e juggling
- sqrt(2) by digits and sqrt(2) juggling
- Amazing Performances
- Pi Matrix
- Ultimate Test
- Pi Permutation
- Ultimate rules page
- CSS, images, and legacy public registration form assets

## Known Migration Caveats

Current import report:

- 3,379 canonical records imported from 3,402 public table rows.
- One bogus blank zero-digit row was skipped.
- Juggling subset rows were merged with matching normal rows where appropriate.
- Three possible duplicate normal Pi rows were preserved to keep parity with the public table.
- Two `Great Britain` rows had `North America` as continent on the old site and were normalized to Europe.
- Public detail pages linked from notes are kept as source URLs, but their content is not migrated into first-class pages.

See `archive/current-site/import-report.json` and `docs/migration-notes.md`.

## Maintenance Checklist

- Reimport only when intentionally syncing from the old site.
- Validate data after every data edit.
- Check generated ranks before merging.
- Keep private evidence outside the repo.
- Review GitHub Actions after dependency updates.
- Confirm pages still work under `/pi-world-ranking-list/`.

# Migration Notes

The raw live-site archive is in `archive/current-site/raw/`.

The importer produced 3,379 canonical records from 3,402 public table rows.

## Imported Routes

- `/`
- `index.php?page=home`
- `index.php?page=news`
- `index.php?page=listoverview`
- `index.php?page=rules`
- `index.php?page=background`
- `index.php?page=links`
- `index.php?page=registration`
- Pi, e, and sqrt(2) ranking tables
- Pi, e, and sqrt(2) juggling tables
- Pi country and continent views for parity context
- Amazing Performances
- Pi Matrix
- Ultimate Test
- Pi Permutation
- Ultimate rules page

## Data Fixes

- Skipped one bogus blank zero-digit row from the Pi table.
- Repaired common mojibake during import.
- Merged juggling subset rows with matching normal performances.
- Preserved three possible duplicate normal Pi rows so generated public ranks match the old table.
- Normalized two `Great Britain` rows from `North America` to `Europe`.

## Caveats

- Public note detail links remain as `source_url` values.
- Old photo/detail pages have not been rebuilt as first-class pages.
- The legacy site displayed a hold notice. The replacement preserves that status
  in site copy until Ari updates the process.
- The legacy form is archived as a public blank form only. Completed forms are
  private evidence and must not be committed.

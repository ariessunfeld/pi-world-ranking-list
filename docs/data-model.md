# Data Model

The canonical ranking data is `data/records.csv`.

Each row represents a public performance, not a precomputed rank. Rank numbers
are generated during build.

## Record Fields

- `id`: stable unique slug.
- `constant`: `pi`, `e`, or `sqrt2`.
- `display_name`: public name shown in tables.
- `sort_name`: deterministic sort key.
- `country`: public country name.
- `continent`: derived from `data/countries.yaml`.
- `digits`: decimal places memorized.
- `date`: ISO date where possible.
- `date_text`: original display text for the date.
- `date_precision`: `day`, `month`, `year`, or `unknown`.
- `notes`: public notes.
- `source_url`: public source URL.
- `category_tags`: pipe-separated tags such as `normal|juggling`.
- `is_juggling`: whether the performance belongs to a juggling ranking.
- `is_public`: whether the row can be published.

## Countries

`data/countries.yaml` maps country names to continents. Validation fails if a
record country is missing or if the record continent does not match.

## Special Records

`data/special-records.yaml` stores nonstandard historical pages such as Amazing
Performances, Pi Matrix, Ultimate Test, and Pi Permutation. These entries do not
affect normal digit rankings.

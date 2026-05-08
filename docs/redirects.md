# Redirects

GitHub Pages cannot provide true server-side redirects for arbitrary query
strings.

This project implements the best practical static compatibility:

- The root page checks old query parameters and redirects with client-side JavaScript.
- `public/index.php` provides a static compatibility shim for old `index.php?page=...` URLs.

Handled mappings:

- `?page=lists&category=pi&sort=digits` -> `/pi/`
- `?page=lists&category=pi&sort=country` -> `/pi/countries/`
- `?page=lists&category=pi&sort=continent` -> `/pi/continents/`
- `?page=lists&category=e&sort=digits` -> `/e/`
- `?page=lists&category=sqrt2&sort=digits` -> `/sqrt2/`
- `?page=amazing` -> `/special/amazing-performances/`
- `?page=matrix` -> `/special/pi-matrix/`
- `?page=ultimate` -> `/special/ultimate-test/`
- `?page=pi-permutation` -> `/special/pi-permutation/`
- `?page=rules` -> `/rules/`
- `?page=background` -> `/background/`
- `?page=links` -> `/links/`
- `?page=registration` -> `/rules/`

Cloudflare Pages, Netlify, or a custom server could provide cleaner HTTP-level
redirects later.

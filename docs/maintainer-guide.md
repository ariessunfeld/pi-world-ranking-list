# Maintainer Guide

## Common Workflow

1. Review the submission and evidence privately.
2. Add or update one row in `data/records.csv`.
3. Add a country to `data/countries.yaml` if needed.
4. Run validation and tests.
5. Review the generated table locally.
6. Commit and push.

## Commands

```bash
npm run validate:data
npm run check:parity
npm run test
npm run build
```

## Reimport From Current Site Archive

```bash
npm run import
```

## Reimport From Live Site

```bash
npm run import -- --fetch
```

Review `archive/current-site/import-report.json` after every import.

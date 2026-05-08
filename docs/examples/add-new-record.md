# Add A New Record

Add a row to `data/records.csv`:

```csv
pi-example-person-usa-314-2026-03-14,pi,"Person, Example","Person, Example",USA,North America,314,2026-03-14,14 March 2026,day,"Example note",https://www.pi-world-ranking-list.com/,normal,false,true
```

Then run:

```bash
npm run validate:data
npm run check:parity
npm run test
npm run build
```

Do not include private witness or verification information in the row.

# Weekboard demo

- URL: `https://family-weekboard.sociobot.in/demo/` (local: `http://127.0.0.1:4173/demo/`).
- Entry: select **Try it with sample data** on the first screen, or open the URL directly.
- Sample: Asha, Ravi, and Kids with school drop-off, dentist, football practice, and grocery plans in the current week.
- Storage: the demo uses IndexedDB database `demo:weekboard-local-v1`. The real board uses `weekboard-local-v1`; demo code never opens the real database.
- Reset: **Reset demo** replaces only the demo database with its original sample.
- Exit: **Start for real** resets the sample database, then opens the real board. Demo changes are not copied.
- Claim verification: every command is declared in `.factory/claims.json` and runs from a fresh browser context.

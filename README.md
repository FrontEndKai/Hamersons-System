# Hamersons Hotel Accounting System

A Vite + React hotel accounting workspace for recording expenses and income once, then viewing the same ledger through dashboards, reports, calendar history, monthly records, analytics, and comparisons.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Validate

```bash
npm run build
npm run lint
```

## Main Workflows

- **Manual Entry**: record an expense or income transaction with date, category, department, payment method, amount, supplier, and reference.
- **Dashboard**: review overall income, expenses, net income, and monthly movement.
- **Calendar**: choose an exact day, month, or year and view its records.
- **Records**: review, add, edit, and delete historical transactions.
- **Monthly Records**: calculate monthly totals, category/department/payment breakdowns, and an automatic management income statement.
- **Analytics**: compare expense and income categories with charts, percentages, and period changes.
- **Income Statement**: view revenue, expenses, and net income from the active records.
- **Import/Export**: import XLSX/CSV rows and export filtered records or a full JSON backup.

## Data Model

Each transaction is stored once in IndexedDB through `src/services/dataService.js`. Date, month, year, category, department, payment method, reports, and charts are derived views of that same record. Categories, payment methods, and departments use stable IDs so labels can be managed without breaking historical transactions.

The default timezone is `Asia/Manila`. Hotel name, address, currency symbol, and timezone can be configured in Settings.

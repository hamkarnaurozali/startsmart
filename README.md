# StartSmart

StartSmart helps people in Afghanistan check whether they can afford to start a small business.
It is a simple planning tool for phones and computers. It works fully in the browser:
no backend, no account, no paid service, no external requests.

- Languages: English, Dari (دری), Pashto (پښتو), with right-to-left layout for Dari and Pashto.
- Currency: AFN.
- Data: saved in your browser (`localStorage`) on the device you use.

> **Important.** Results are estimates, not a guarantee of success. Sample numbers are illustrative
> examples, **not verified local market prices**. The Dari and Pashto text has **not** been checked by
> professional translators.

## Requirements

- Node.js 18 or newer (https://nodejs.org)

## Install and run

```bash
npm install
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173).

To try it on a phone on the same Wi-Fi network:

```bash
npm run dev -- --host
```

Then open the "Network" address shown in the terminal on the phone.

## Other commands

```bash
npm test            # checks the financial calculations
npm run typecheck   # TypeScript check
npm run build       # production build into ./dist (also runs the type check)
npm run preview     # serve the production build locally
```

The built `dist` folder is static and can be hosted on any simple web server or opened from a USB drive
by serving it with `npm run preview`.

## How the numbers are calculated

Startup costs, the emergency reserve, and monthly operating expenses are kept separate.

| Result | Formula |
| --- | --- |
| Total startup costs | rent deposit + equipment + starting inventory + transport + licenses + other startup costs |
| Money needed to start | total startup costs + emergency reserve |
| Cash left after startup costs | savings − total startup costs |
| Money left after startup costs and reserve | savings − total startup costs − emergency reserve |
| Extra funding needed | the shortfall if the line above is negative, otherwise 0 |
| Monthly gross profit | monthly sales × gross margin % |
| Monthly operating expenses | rent + electricity/fuel + wages + transport + phone + other |
| Monthly operating profit | gross profit − operating expenses |
| Break-even monthly sales | operating expenses ÷ (gross margin % ÷ 100); only when margin is above 0 |
| Months to earn back startup costs | total startup costs ÷ monthly operating profit; only when profit is above 0 |

Rules used to avoid wrong results:

- **No double counting.** Gross margin already removes the cost of goods sold, so the monthly expenses
  do not include stock or materials. Starting inventory is a one-time startup cost.
- **Nothing is silently treated as zero.** An empty box means "not entered". A result that needs it shows
  "—" until every needed number is entered. If a cost really is 0, enter 0 (or use the
  "Set empty cost boxes to 0" button, which asks for confirmation first).
- Operating profit is before tax and before the owner's own living costs, unless those are entered as wages.
- Plans are alternatives, so the dashboard shows **one plan at a time** (you choose which) instead of
  adding different plans together.

## Using the app

1. **New plan** – choose a business type. You can fill in sample numbers, then replace each number with your own.
2. **Edit** – changes save automatically on this device. Results update as you type.
3. **My plans** – rename, copy, delete (with confirmation), and tick 2 or 3 plans to **Compare**.
4. **Print** and **Download CSV** are available from the dashboard and plan pages (CSV opens in Excel or Google Sheets).

You may type numbers with Latin (123), Persian (۱۲۳) or Arabic-Indic (١٢٣) digits.

## Improving the translations

All interface text is in `src/i18n/`:

- `en.ts` – English (the reference; it defines every key)
- `fa.ts` – Dari
- `ps.ts` – Pashto

TypeScript reports an error if `fa.ts` or `ps.ts` is missing a key from `en.ts`.
To add a language, create a new dictionary of type `Dict`, then add it in `src/i18n/index.tsx`.

## Changing sample numbers

Edit `src/templates.ts`. All values are illustrative AFN amounts, not verified prices.

## Project structure

```
src/
  calc.ts            financial calculations (pure functions)
  calc.test.ts       tests for the calculations
  templates.ts       illustrative sample numbers per business type
  storage.ts         localStorage load/save and data cleaning
  store.ts           plan state (create, update, copy, delete)
  csv.ts             CSV export
  route.ts           small hash-based navigation
  i18n/              translation dictionaries and formatting
  components/        Field, BarChart, Modal, Verdict, PlanCard, ...
  views/             Dashboard, Plans, Editor, Compare
  App.tsx            page shell, language selector, navigation
  styles.css         all styling (uses logical properties for RTL)
```

## Limits

- Data lives only in the browser on one device. Clearing browser data deletes the plans. Use CSV export for a copy.
- StartSmart does not include tax, inflation, seasonality, or loan interest.

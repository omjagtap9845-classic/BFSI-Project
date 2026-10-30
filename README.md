# Ledger - AI Loan Eligibility Checker

A BFSI (Banking, Financial Services & Insurance) web app that puts four tools in one dark-glassmorphism interface:

| Tool | What it does |
|---|---|
| **Loan Eligibility Checker** | Estimates maximum loan, EMI affordability and an Approved / Borderline / Unlikely verdict |
| **Credit Score Analyzer** | Rates a 300-900 score and its four key factors, with an improvement plan |
| **EMI Calculator** | Live sliders for amount, rate and tenure; shows EMI, total interest and total payable |
| **AI Financial Tips** | Quick topics or free-text questions answered for Indian borrowers |

**Live demo:** `https://<your-username>.github.io/BFSI-Project/` *(enable GitHub Pages: Settings -> Pages -> Deploy from branch `main` / root)*

![Screenshot](docs/screenshot.png)

## Tech stack
HTML5, CSS3 (glassmorphism, CSS variables, responsive grid, light/dark theme), vanilla JavaScript (no build step), Claude AI via an optional backend, optional Google Sheets sync, Node.js for unit tests.

## Run locally
```bash
git clone https://github.com/<your-username>/BFSI-Project.git
cd BFSI-Project
# just open index.html in a browser, or:
python3 -m http.server 8000      # then visit http://localhost:8000
node tests/calculators.test.js   # run unit tests
```

## Project structure
```
BFSI-Project/
├── index.html              # markup for all four tools
├── css/style.css           # theme and layout
├── js/
│   ├── config.js           # settings (AI proxy URL, Sheets webhook)
│   ├── calculators.js      # pure finance logic (EMI, FOIR eligibility, credit bands)
│   ├── advisor.js          # offline rule-based advice (fallback)
│   ├── ai.js               # Claude AI call with automatic fallback
│   ├── storage.js          # localStorage history + optional Google Sheets sync
│   └── app.js              # UI wiring
├── tests/calculators.test.js
└── docs/                   # architecture + Google Sheets setup
```

## How the calculations work
- **EMI** = `P x r x (1+r)^n / ((1+r)^n - 1)`, where `r` = annual rate / 12 / 100 and `n` = months.
- **Eligibility (FOIR method):** affordable EMI = income x FOIR - existing EMIs (FOIR = 50% salaried, 45% others). Maximum loan is the principal that affordable EMI can repay (inverse of the EMI formula).
- **Indicative rate** = base rate by loan type (Home 8.6%, Car 9.2%, Education 9.5%, Personal 11%) + a premium that grows as the credit score falls.
- **Verdict:** Unlikely (score < 600 or no EMI room), Likely eligible (EMI fits and score >= 680), Borderline (EMI within 15% of limit and score >= 650), otherwise Needs changes.

## AI and data storage
- **AI:** by default an offline rule-based advisor answers, so the app works anywhere. Set `AI_PROXY_URL` in `js/config.js` to your own backend that calls the Claude API; the API key stays on the server (see `docs/ARCHITECTURE.md`).
- **Storage:** history is kept in the browser (`localStorage`). Set `SHEETS_WEBHOOK` to also log each activity to Google Sheets (see `docs/google-sheets-setup.md`).

## Disclaimer
Results are estimates for education only, not financial advice. Real lending decisions depend on the lender.

## Author
Built by **<Your Name>** as part of the Skillwallet AI Specialist BFSI virtual internship. Mentor: Sai Prathyusha Nagilla.

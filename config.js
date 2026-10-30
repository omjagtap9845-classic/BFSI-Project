/**
 * config.js - runtime settings. Edit this file; never commit secrets here.
 *
 * AI_PROXY_URL    : URL of YOUR backend that calls the Claude API (see docs/ARCHITECTURE.md).
 *                   Leave "" to use the built-in rule-based advisor (works offline / on GitHub Pages).
 * SHEETS_WEBHOOK  : Google Apps Script web-app URL for optional cloud sync
 *                   (see docs/google-sheets-setup.md). Leave "" to store data in the browser only.
 */
window.LEDGER_CONFIG = {
  AI_PROXY_URL: "",
  SHEETS_WEBHOOK: "",
  HISTORY_LIMIT: 30
};

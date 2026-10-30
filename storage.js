/**
 * storage.js - activity history. Always saved in localStorage; optionally mirrored to Google Sheets
 * through an Apps Script web app (see docs/google-sheets-setup.md).
 */
const Storage = (() => {
  const KEY = "ledger_hist";
  const limit = () => window.LEDGER_CONFIG.HISTORY_LIMIT;

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, limit()))); } catch { /* private mode */ }
  }
  async function pushToSheet(record) {
    const url = window.LEDGER_CONFIG.SHEETS_WEBHOOK;
    if (!url) return false;
    try {
      // text/plain avoids a CORS preflight that Apps Script does not answer
      await fetch(url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(record) });
      return true;
    } catch { return false; }
  }
  return { load, save, pushToSheet };
})();

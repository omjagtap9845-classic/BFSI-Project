# Google Sheets sync (optional)

1. Create a Google Sheet. Row 1 headers: `time | type | summary | data`.
2. Extensions -> Apps Script, paste:
```js
function doPost(e) {
  const r = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSheet().appendRow([new Date(r.t), r.k, r.s, JSON.stringify(r.d)]);
  return ContentService.createTextOutput("ok");
}
```
3. Deploy -> New deployment -> type **Web app** -> Execute as *Me*, access *Anyone* -> copy the URL.
4. Paste it into `SHEETS_WEBHOOK` in `js/config.js`.

Each calculation then appends a row. Do not enter real personal data (PAN, Aadhaar) in a public demo.

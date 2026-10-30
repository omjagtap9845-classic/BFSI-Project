# Architecture

```
Browser (index.html)
 ├─ app.js ──► calculators.js   pure functions, unit-tested
 │         ├─► ai.js ─────────► [optional] your backend ──► Claude API
 │         │        └─(fallback)► advisor.js (offline rules)
 │         └─► storage.js ────► localStorage ──► [optional] Google Apps Script ──► Google Sheet
```

## Design decisions
- **No build step / framework:** plain HTML, CSS, JS so it deploys to GitHub Pages as-is.
- **Separation of concerns:** finance logic has no DOM code, so it can be tested with Node.
- **Graceful degradation:** if the AI backend is missing or fails, the offline advisor responds; the app never shows a dead feature.
- **Security:** an API key in browser JavaScript is public. AI calls therefore go through a backend proxy.

## Adding the Claude AI backend
Minimal Node/Express proxy (deploy on Render, Vercel, etc.):
```js
import express from "express";
import cors from "cors";
import Anthropic from "@anthropic-ai/sdk";

const app = express();
app.use(cors({ origin: "https://<your-username>.github.io" }), express.json());
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.post("/ask", async (req, res) => {
  const { system, prompt } = req.body;
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6", max_tokens: 400, system,
    messages: [{ role: "user", content: prompt }]
  });
  res.json({ text: msg.content.map(b => b.text ?? "").join("") });
});
app.listen(process.env.PORT || 3000);
```
Then set `AI_PROXY_URL: "https://your-backend.example.com/ask"` in `js/config.js`.

## Testing
`node tests/calculators.test.js` checks the EMI formula against a known value, the maxLoan/EMI inverse relationship, rate premiums, eligibility verdicts and credit bands.

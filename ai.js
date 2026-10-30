/**
 * ai.js - AI layer with graceful fallback:
 *   1. If CONFIG.AI_PROXY_URL is set -> POST {system, prompt} to YOUR backend, which calls the Claude API.
 *      (The API key stays on the server - never put it in browser code.)
 *   2. Otherwise -> offline rule-based Advisor.
 */
const AI = (() => {
  const SYSTEM = "You are Ledger's financial assistant for Indian retail borrowers. Be concrete, warm and concise (under 160 words), use Rs/INR, plain text, no markdown headers. Never guarantee approval.";

  async function ask(prompt, fallbackText) {
    const url = window.LEDGER_CONFIG.AI_PROXY_URL;
    if (!url) return { text: fallbackText, source: "Offline advisor" };
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM, prompt })
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      return { text: data.text || fallbackText, source: "Claude AI" };
    } catch (err) {
      console.warn("AI backend failed, using offline advisor:", err);
      return { text: fallbackText, source: "Offline advisor" };
    }
  }
  return { ask };
})();

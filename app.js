/**
 * app.js - UI wiring: tabs, forms, rendering. Business logic lives in calculators.js.
 */
(() => {
  const $ = (id) => document.getElementById(id);
  const inr = (n) => "\u20B9" + Math.round(n).toLocaleString("en-IN");
  const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const num = (id) => +$(id).value;

  /* ---------- Tabs ---------- */
  $("nav").onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("on", b === btn));
    document.querySelectorAll(".tab").forEach((s) => (s.hidden = s.id !== btn.dataset.t));
  };

  /* ---------- History ---------- */
  let history = Storage.load();
  function renderHistory() {
    $("hist").innerHTML = history.length
      ? history.slice(0, 6).map((h) =>
          `<div class="it"><span><b>${esc(h.k)}</b> \u00B7 ${esc(h.s)}</span><span>${new Date(h.t).toLocaleDateString()}</span></div>`).join("")
      : '<span class="muted">Nothing yet.</span>';
  }
  async function record(kind, summary, data) {
    const rec = { k: kind, s: summary, t: Date.now(), d: data };
    history.unshift(rec);
    history = history.slice(0, window.LEDGER_CONFIG.HISTORY_LIMIT);
    Storage.save(history);
    renderHistory();
    const synced = await Storage.pushToSheet(rec);
    $("sv").textContent = synced ? "Saved locally and synced to Google Sheets." : "Saved in this browser.";
  }

  /* ---------- AI panel ---------- */
  async function showAI(el, prompt, fallback) {
    el.innerHTML = "<h4>Ledger AI</h4>Thinking\u2026";
    const r = await AI.ask(prompt, fallback);
    el.innerHTML = `<h4>Ledger AI \u00B7 ${esc(r.source)}</h4>${esc(r.text)}`;
  }

  /* ---------- Loan eligibility ---------- */
  $("e_go").onclick = () => {
    const input = {
      income: num("e_inc"), existingEmi: num("e_ex"), score: num("e_cs"),
      amount: num("e_amt"), years: num("e_ten"),
      loanType: $("e_type").value, employment: $("e_emp").value
    };
    const name = $("e_name").value.trim() || "Applicant";
    if (!(input.income > 0 && input.amount > 0 && input.years > 0)) {
      $("e_out").innerHTML = '<p class="muted">Please fill income, amount and tenure.</p>';
      return;
    }
    const r = Calc.eligibility(input);
    $("e_out").innerHTML = `<span class="pill ${r.tone}">${r.verdict}</span>
      <div class="big">${inr(r.maxAmount)}</div>
      <div class="muted">estimated maximum loan at ${r.rate}% for ${input.years} yrs</div>
      <div class="stats">
        <div class="stat"><small>Requested EMI</small><b>${inr(r.requestedEmi)}</b></div>
        <div class="stat"><small>Affordable EMI</small><b>${inr(r.affordableEmi)}</b></div>
        <div class="stat"><small>Indicative rate</small><b>${r.rate}%</b></div>
        <div class="stat"><small>Debt-to-income after loan</small><b>${r.debtRatioPct}%</b></div>
      </div><div class="ai" id="e_ai"></div>`;
    record("Eligibility", `${name} \u00B7 ${input.loanType} ${inr(input.amount)} \u00B7 ${r.verdict}`, input);
    const prompt = `Loan eligibility. Type ${input.loanType}, ${input.employment}, income ${inr(input.income)}/mo, existing EMIs ${inr(input.existingEmi)}, score ${input.score}, requested ${inr(input.amount)} for ${input.years} yrs at ~${r.rate}%. Requested EMI ${inr(r.requestedEmi)}, affordable ${inr(r.affordableEmi)}, max loan ${inr(r.maxAmount)}, verdict ${r.verdict}. Explain the verdict and give 3 specific ways to improve chances or reduce the EMI.`;
    showAI($("e_ai"), prompt, Advisor.eligibility({ ...r, ...input, fmt: inr }));
  };

  /* ---------- Credit score ---------- */
  $("c_go").onclick = () => {
    const d = { score: num("c_s"), utilization: num("c_u"), onTime: num("c_p"), ageYears: num("c_a"), enquiries: num("c_e"), accounts: num("c_l") };
    const r = Calc.creditAnalysis(d);
    $("c_out").innerHTML = `<span class="pill ${r.band[1]}">${r.band[0]}</span><div class="big">${d.score}</div>
      <div class="gauge"><i style="left:${r.gaugePct}%"></i></div>
      <div class="muted" style="display:flex;justify-content:space-between"><span>300</span><span>900</span></div>
      <div class="stats">${r.factors.map((f) => `<div class="stat"><small>${f[0]}</small><b class="${f[2]}" style="background:none">${f[1]}</b></div>`).join("")}</div>
      <div class="ai" id="c_ai"></div>`;
    record("Credit score", `${d.score} \u00B7 ${r.band[0]}`, d);
    const prompt = `Credit report (CIBIL-style 300-900). Score ${d.score}, utilization ${d.utilization}%, on-time ${d.onTime}%, age ${d.ageYears} yrs, ${d.enquiries} enquiries in 12 months, ${d.accounts} active accounts. Give a prioritised 4-step plan to raise the score with realistic timeframes.`;
    showAI($("c_ai"), prompt, Advisor.credit(d));
  };

  /* ---------- EMI calculator (live) ---------- */
  function renderEmi() {
    const P = num("m_a"), R = num("m_r"), T = num("m_t");
    $("m_ap").textContent = inr(P); $("m_rp").textContent = R + "%"; $("m_tp").textContent = T + " yrs";
    const E = Calc.emi(P, R, T), total = E * T * 12, interest = total - P, pPct = (P / total) * 100;
    $("m_out").innerHTML = `<div class="muted">Monthly EMI</div><div class="big">${inr(E)}</div>
      <div class="bar"><span style="width:${pPct}%;background:var(--ac)"></span><span style="width:${100 - pPct}%;background:var(--ac2)"></span></div>
      <div class="muted" style="display:flex;justify-content:space-between"><span>Principal</span><span>Interest</span></div>
      <div class="stats">
        <div class="stat"><small>Principal</small><b>${inr(P)}</b></div>
        <div class="stat"><small>Total interest</small><b>${inr(interest)}</b></div>
        <div class="stat"><small>Total payable</small><b>${inr(total)}</b></div>
        <div class="stat"><small>Interest share</small><b>${Math.round(100 - pPct)}%</b></div></div>`;
  }
  ["m_a", "m_r", "m_t"].forEach((id) => {
    $(id).oninput = renderEmi;
    $(id).onchange = () => record("EMI", `${inr(num("m_a"))} @ ${num("m_r")}% \u00B7 ${num("m_t")} yrs`, {});
  });

  /* ---------- AI tips ---------- */
  ["How to build credit from zero", "Prepay loan or invest?", "Reduce my EMI burden", "Emergency fund basics", "Avoid loan rejection"].forEach((t) => {
    const b = document.createElement("button");
    b.className = "chip"; b.textContent = t;
    b.onclick = () => { $("t_q").value = t; askTip(); };
    $("chips").appendChild(b);
  });
  function askTip() {
    const q = $("t_q").value.trim();
    if (!q) return;
    record("AI tip", q.slice(0, 50), {});
    showAI($("t_out"), `The user asks: "${q}". Answer for an Indian retail borrower with practical steps and one common mistake to avoid.`, Advisor.tip(q));
  }
  $("t_go").onclick = askTip;
  $("t_q").onkeydown = (e) => { if (e.key === "Enter") askTip(); };

  renderHistory();
  renderEmi();
})();

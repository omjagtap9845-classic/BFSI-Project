/**
 * calculators.js - pure financial logic (no DOM). Unit-tested in tests/calculators.test.js.
 */
const Calc = (() => {
  /** EMI = P*r*(1+r)^n / ((1+r)^n - 1), r = monthly rate, n = months. */
  function emi(principal, annualRatePct, years) {
    const r = annualRatePct / 1200, n = years * 12;
    if (n <= 0) return 0;
    if (!r) return principal / n;
    const f = Math.pow(1 + r, n);
    return (principal * r * f) / (f - 1);
  }

  /** Largest principal whose EMI fits a given monthly budget. */
  function maxLoan(monthlyEmi, annualRatePct, years) {
    const r = annualRatePct / 1200, n = years * 12;
    if (monthlyEmi <= 0 || n <= 0) return 0;
    if (!r) return monthlyEmi * n;
    return (monthlyEmi * (1 - Math.pow(1 + r, -n))) / r;
  }

  const BASE_RATE = { Personal: 11, Home: 8.6, Car: 9.2, Education: 9.5 };

  /** Indicative rate = loan-type base + credit-score premium. */
  function indicativeRate(loanType, score) {
    const premium = score >= 780 ? 0 : score >= 740 ? 0.6 : score >= 700 ? 1.4 : score >= 650 ? 2.6 : 4.5;
    return +((BASE_RATE[loanType] ?? 11) + premium).toFixed(1);
  }

  /**
   * Eligibility using the FOIR method (Fixed Obligation to Income Ratio):
   * salaried 50%, others 45% of income may go to total EMIs.
   */
  function eligibility({ income, existingEmi, score, amount, years, loanType, employment }) {
    const rate = indicativeRate(loanType, score);
    const foir = employment === "Salaried" ? 0.5 : 0.45;
    const affordableEmi = Math.max(0, income * foir - existingEmi);
    const requestedEmi = emi(amount, rate, years);
    const maxAmount = maxLoan(affordableEmi, rate, years);
    let verdict, tone;
    if (score < 600 || affordableEmi <= 0) { verdict = "Unlikely"; tone = "er"; }
    else if (requestedEmi <= affordableEmi && score >= 680) { verdict = "Likely eligible"; tone = "ok"; }
    else if (requestedEmi <= affordableEmi * 1.15 && score >= 650) { verdict = "Borderline"; tone = "wr"; }
    else { verdict = "Needs changes"; tone = "er"; }
    return { rate, foir, affordableEmi, requestedEmi, maxAmount, verdict, tone,
             debtRatioPct: Math.round(((existingEmi + requestedEmi) / income) * 100) };
  }

  /** Score band + qualitative rating of each credit factor. */
  function creditAnalysis({ score, utilization, onTime, ageYears, enquiries }) {
    const band = score >= 780 ? ["Excellent", "ok"] : score >= 720 ? ["Very good", "ok"]
      : score >= 680 ? ["Good", "ok"] : score >= 620 ? ["Fair", "wr"] : ["Needs work", "er"];
    const factors = [
      ["Payment history", onTime >= 98 ? "Strong" : onTime >= 90 ? "Okay" : "Weak", onTime >= 98 ? "ok" : onTime >= 90 ? "wr" : "er"],
      ["Utilization", utilization <= 30 ? "Healthy" : utilization <= 50 ? "Elevated" : "High", utilization <= 30 ? "ok" : utilization <= 50 ? "wr" : "er"],
      ["Credit age", ageYears >= 7 ? "Strong" : ageYears >= 3 ? "Building" : "Short", ageYears >= 7 ? "ok" : ageYears >= 3 ? "wr" : "er"],
      ["Enquiries", enquiries <= 2 ? "Low" : enquiries <= 4 ? "Moderate" : "Many", enquiries <= 2 ? "ok" : enquiries <= 4 ? "wr" : "er"]
    ];
    return { band, factors, gaugePct: Math.min(100, Math.max(0, (score - 300) / 6)) };
  }

  const api = { emi, maxLoan, indicativeRate, eligibility, creditAnalysis };
  if (typeof module !== "undefined") module.exports = api;
  return api;
})();

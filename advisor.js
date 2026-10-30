/**
 * advisor.js - offline, rule-based advisor. Used when no AI backend is configured,
 * so every feature works on GitHub Pages with zero setup.
 */
const Advisor = {
  eligibility(d) {
    const tips = [];
    if (d.verdict === "Likely eligible") tips.push("Your numbers fit lender norms. Compare offers from 3+ lenders; even 0.5% lower rate saves a lot.");
    if (d.requestedEmi > d.affordableEmi) tips.push(`Your EMI (${d.fmt(d.requestedEmi)}) exceeds the affordable ${d.fmt(d.affordableEmi)}. Lower the amount toward ${d.fmt(d.maxAmount)} or extend tenure.`);
    if (d.score < 750) tips.push("Raise your score above 750: keep card use under 30% and pay every due date.");
    if (d.existingEmi > 0) tips.push("Closing a small existing loan frees EMI room and raises eligibility.");
    tips.push("Adding a co-applicant with income can lift your eligible amount.");
    return tips.slice(0, 4).map((t, i) => `${i + 1}. ${t}`).join("\n");
  },
  credit(d) {
    const steps = [];
    if (d.utilization > 30) steps.push("Bring card utilization under 30% (1-2 months).");
    if (d.onTime < 98) steps.push("Set auto-pay for at least the minimum due; late payments hurt most (3-6 months to recover).");
    if (d.enquiries > 2) steps.push("Pause new credit applications for 6 months.");
    if (d.ageYears < 5) steps.push("Keep your oldest account open; credit age builds over time.");
    steps.push("Check your free credit report yearly and dispute errors.");
    return steps.slice(0, 4).map((t, i) => `${i + 1}. ${t}`).join("\n");
  },
  tip(q) {
    const s = q.toLowerCase();
    if (/zero|build|first|no credit/.test(s)) return "Start with a secured card or small credit-builder loan, use under 30% of the limit, and pay in full each month. Mistake to avoid: applying for many cards at once.";
    if (/prepay|invest/.test(s)) return "Compare your loan rate with expected after-tax returns. If the loan costs more than ~9-10%, prepaying is a guaranteed return; below that, investing may win. Keep an emergency fund first. Mistake: draining all savings to prepay.";
    if (/emi|burden|reduce/.test(s)) return "Options: extend tenure, balance-transfer to a lower rate, prepay the highest-rate loan first. Mistake: extending tenure without checking total interest.";
    if (/emergency/.test(s)) return "Aim for 3-6 months of expenses in a liquid account (savings/liquid fund). Build it before any prepayment. Mistake: keeping it in volatile assets.";
    if (/reject/.test(s)) return "Keep score 750+, FOIR under 50%, stable employment, and apply to one lender at a time. Mistake: applying to many lenders in a short period.";
    return "Track income vs. EMIs, keep total EMIs under 40-50% of income, build an emergency fund, and review your credit report yearly. Mistake: borrowing to repay other debt.";
  }
};

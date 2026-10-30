// Run: node tests/calculators.test.js
const assert = require("assert");
const Calc = require("../js/calculators.js");

// Known value: 10 lakh @ 10.5% for 5 yrs -> EMI ~ 21,494
assert.ok(Math.abs(Calc.emi(1000000, 10.5, 5) - 21494) < 5, "EMI formula");
// Zero-interest loan
assert.strictEqual(Math.round(Calc.emi(120000, 0, 1)), 10000);
// maxLoan is the inverse of emi
const e = Calc.emi(750000, 9, 10);
assert.ok(Math.abs(Calc.maxLoan(e, 9, 10) - 750000) < 1, "maxLoan inverse");
// Rate premium by score
assert.strictEqual(Calc.indicativeRate("Home", 790), 8.6);
assert.strictEqual(Calc.indicativeRate("Personal", 640), 15.5);
// Eligibility verdicts
const base = { income: 60000, existingEmi: 8000, score: 740, amount: 500000, years: 5, loanType: "Personal", employment: "Salaried" };
assert.strictEqual(Calc.eligibility(base).verdict, "Likely eligible");
assert.strictEqual(Calc.eligibility({ ...base, score: 550 }).verdict, "Unlikely");
assert.strictEqual(Calc.eligibility({ ...base, amount: 5000000 }).verdict, "Needs changes");
// Credit bands
assert.strictEqual(Calc.creditAnalysis({ score: 800, utilization: 10, onTime: 100, ageYears: 8, enquiries: 1 }).band[0], "Excellent");
console.log("All tests passed");

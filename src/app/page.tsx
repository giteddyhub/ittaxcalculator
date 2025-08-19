"use client";

import { useMemo, useState } from "react";
import { calculateItalianTaxes, EmploymentType, formatCurrencyEUR } from "@/lib/tax/italy";
import { Checkbox } from "@/components/ui/Checkbox";

type RegionPreset = {
  name: string;
  regionalRatePct: number;
  municipalRatePct: number;
};

const REGION_PRESETS: RegionPreset[] = [
  { name: "Lombardia (Milano)", regionalRatePct: 1.73, municipalRatePct: 0.8 },
  { name: "Lazio (Roma)", regionalRatePct: 3.33, municipalRatePct: 0.9 },
  { name: "Piemonte (Torino)", regionalRatePct: 2.13, municipalRatePct: 0.8 },
  { name: "Veneto (Venezia)", regionalRatePct: 1.23, municipalRatePct: 0.8 },
  { name: "Toscana (Firenze)", regionalRatePct: 2.5, municipalRatePct: 0.8 },
  { name: "Campania (Napoli)", regionalRatePct: 2.03, municipalRatePct: 0.8 },
  { name: "Default / Other", regionalRatePct: 1.5, municipalRatePct: 0.6 },
];

export default function Home() {
  const [grossIncomeStr, setGrossIncomeStr] = useState<string>("40000");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("employee");
  const [regionIdx, setRegionIdx] = useState<number>(0);
  const [applyEmployeeCredit, setApplyEmployeeCredit] = useState<boolean>(true);
  const [trattamentoIntegrativo, setTrattamentoIntegrativo] = useState<boolean>(false);
  const [extraPensionStr, setExtraPensionStr] = useState<string>("");
  const [otherCreditsStr, setOtherCreditsStr] = useState<string>("");
  const [inpsOverridePct, setInpsOverridePct] = useState<string>("");

  const preset = REGION_PRESETS[regionIdx] ?? REGION_PRESETS[REGION_PRESETS.length - 1];

  const breakdown = useMemo(() => {
    const grossIncome = parseFloat((grossIncomeStr || "0").replace(",", ".")) || 0;
    const extraPension = parseFloat((extraPensionStr || "0").replace(",", ".")) || 0;
    const otherCredits = parseFloat((otherCreditsStr || "0").replace(",", ".")) || 0;
    const inpsRatePct = inpsOverridePct === "" ? undefined : Number(inpsOverridePct);
    return calculateItalianTaxes({
      grossIncome,
      employmentType,
      inpsRatePct,
      deduciblePensionContributions: extraPension,
      otherTaxCredits: otherCredits,
      regionalRatePct: preset.regionalRatePct,
      municipalRatePct: preset.municipalRatePct,
      applyEmployeeCredit,
      trattamentoIntegrativoEligible: trattamentoIntegrativo,
    });
  }, [grossIncomeStr, employmentType, inpsOverridePct, extraPensionStr, otherCreditsStr, preset, applyEmployeeCredit, trattamentoIntegrativo]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Italian Tax Calculator</h1>
          <p className="mt-2 text-sm text-gray-600">Estimate IRPEF, regional/municipal taxes, and INPS. Styled with an Untitled UI–inspired system.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="u-card p-6">
            <h2 className="text-base font-medium">Inputs</h2>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <label className="u-label">Gross annual income (EUR)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={grossIncomeStr}
                  onChange={(e) => setGrossIncomeStr(e.target.value)}
                  className="u-input"
                />
              </div>

              <div>
                <label className="u-label">Employment type</label>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { key: "employee", label: "Employee" },
                      { key: "freelancer_gestione_separata", label: "Freelancer (GS)" },
                      { key: "self_employed", label: "Self-employed" },
                    ] as { key: EmploymentType; label: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setEmploymentType(opt.key)}
                      className={`u-button ${
                        employmentType === opt.key ? "u-button--primary" : "u-button--ghost"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="u-label">Region / Municipality preset</label>
                <select
                  className="u-input"
                  value={regionIdx}
                  onChange={(e) => setRegionIdx(Number(e.target.value))}
                >
                  {REGION_PRESETS.map((r, i) => (
                    <option key={r.name} value={i}>
                      {r.name} — Reg {r.regionalRatePct}% · Mun {r.municipalRatePct}%
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="u-label">INPS rate override (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="auto"
                    value={inpsOverridePct}
                    onChange={(e) => setInpsOverridePct(e.target.value)}
                    className="u-input"
                  />
                </div>
                <div>
                  <label className="u-label">Extra pension deductible (EUR)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={extraPensionStr}
                    onChange={(e) => setExtraPensionStr(e.target.value)}
                    className="u-input"
                  />
                </div>
                <div>
                  <label className="u-label">Other tax credits (EUR)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={otherCreditsStr}
                    onChange={(e) => setOtherCreditsStr(e.target.value)}
                    className="u-input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <Checkbox label="Apply employee credit" checked={applyEmployeeCredit} onChange={setApplyEmployeeCredit} />
                <Checkbox label="Trattamento integrativo (approx)" checked={trattamentoIntegrativo} onChange={setTrattamentoIntegrativo} />
              </div>
            </div>
          </section>

          <section className="u-card p-6">
            <h2 className="text-base font-medium">Estimate</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Gross income" value={formatCurrencyEUR(breakdown.inputs.grossIncome)} />
              <Row label="INPS contributions" value={formatCurrencyEUR(breakdown.inpsContributions)} subtle />
              <Row label="Taxable income" value={formatCurrencyEUR(breakdown.taxableIncome)} />

              <div className="mt-5 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900">IRPEF</h3>
                {breakdown.irpefPerBracket.map((b, idx) => (
                  <Row
                    key={idx}
                    label={`Bracket ${idx + 1} (${(b.rate * 100).toFixed(0)}%)`}
                    value={formatCurrencyEUR(b.amount)}
                    subtle
                  />
                ))}
                <Row label="IRPEF total" value={formatCurrencyEUR(breakdown.irpef)} />
              </div>

              <Row label={`Regional tax (${breakdown.inputs.regionalRatePct}%)`} value={formatCurrencyEUR(breakdown.regionalTax)} subtle />
              <Row label={`Municipal tax (${breakdown.inputs.municipalRatePct}%)`} value={formatCurrencyEUR(breakdown.municipalTax)} subtle />

              <div className="mt-5 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900">Credits</h3>
                {breakdown.credits.employeeCredit > 0 && (
                  <Row label="Employee credit" value={formatCurrencyEUR(breakdown.credits.employeeCredit)} subtle />
                )}
                {breakdown.credits.trattamentoIntegrativo > 0 && (
                  <Row label="Trattamento integrativo" value={formatCurrencyEUR(breakdown.credits.trattamentoIntegrativo)} subtle />
                )}
                {breakdown.credits.otherTaxCredits > 0 && (
                  <Row label="Other credits" value={formatCurrencyEUR(breakdown.credits.otherTaxCredits)} subtle />
                )}
                <Row label="Total credits" value={formatCurrencyEUR(breakdown.credits.totalCredits)} />
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4">
                <Row label="Taxes before credits" value={formatCurrencyEUR(breakdown.grossTaxesBeforeCredits)} />
                <Row label="Total tax after credits" value={formatCurrencyEUR(breakdown.totalTaxAfterCredits)} />
              </div>

              <div className="mt-5 border-t border-gray-200 pt-4">
                <Row label="Net income" value={formatCurrencyEUR(breakdown.netIncome)} />
                <Row label="Effective tax rate" value={`${(breakdown.effectiveTaxRate * 100).toFixed(1)}%`} subtle />
              </div>
            </div>
          </section>
        </div>

        <p className="mt-8 text-xs text-gray-500">
          This is an estimate for educational purposes. For accuracy, consult official guidance from the Italian tax authorities and professional advice. Sources: EY summary of 2025 brackets; ranges for addizionali regionali/comunali and INPS rates.
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, subtle }: { label: string; value: string; subtle?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-gray-700 ${subtle ? "text-xs" : "text-sm"}`}>{label}</span>
      <span className={`font-medium ${subtle ? "text-gray-700" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

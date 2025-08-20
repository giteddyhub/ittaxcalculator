"use client";

import { useMemo, useState } from "react";
import { calculateItalianTaxes, EmploymentType, formatCurrencyEUR } from "@/lib/tax/italy";
import { calculateForfettario, QUICK_COEFFICIENTS, ForfettarioInpsPath, formatCurrencyEUR as formatEURForf } from "@/lib/tax/forfettario";
import { Switch } from "@/components/ui/Switch";
import { BackLink } from "@/components/ui/BackLink";

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

type Regime = "ordinario" | "forfettario";

export default function Home() {
  const [regime, setRegime] = useState<Regime>("ordinario");
  const [showRegimeInfo, setShowRegimeInfo] = useState<boolean>(false);
  const [grossIncomeStr, setGrossIncomeStr] = useState<string>("40000");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("employee");
  const [regionIdx, setRegionIdx] = useState<number>(0);
  const [applyEmployeeCredit, setApplyEmployeeCredit] = useState<boolean>(true);
  const [trattamentoIntegrativo, setTrattamentoIntegrativo] = useState<boolean>(false);
  const [extraPensionStr, setExtraPensionStr] = useState<string>("");
  const [otherCreditsStr, setOtherCreditsStr] = useState<string>("");
  const [inpsOverridePct, setInpsOverridePct] = useState<string>("");

  // Forfettario state
  const [revenuesStr, setRevenuesStr] = useState<string>("");
  const [coeffPctStr, setCoeffPctStr] = useState<string>("78");
  const [forfPath, setForfPath] = useState<ForfettarioInpsPath>("gestione_separata");
  const [gsRateStr, setGsRateStr] = useState<string>("");
  const [ivsAnnualStr, setIvsAnnualStr] = useState<string>("");
  const [ivs35, setIvs35] = useState<boolean>(false);
  const [fivePct, setFivePct] = useState<boolean>(false);

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

  const forfBreakdown = useMemo(() => {
    const revenues = parseFloat((revenuesStr || "0").replace(",", ".")) || 0;
    const coeffPct = parseFloat((coeffPctStr || "0").replace(",", ".")) || 0;
    const gsRatePct = gsRateStr === "" ? undefined : Number(gsRateStr);
    const ivsAnnual = ivsAnnualStr === "" ? undefined : Number(ivsAnnualStr);
    return calculateForfettario({
      revenues,
      coefficientPct: coeffPct,
      inpsPath: forfPath,
      gsRatePct,
      ivsAnnualContributions: ivsAnnual,
      applyIVS35Reduction: ivs35,
      startupFivePct: fivePct,
    });
  }, [revenuesStr, coeffPctStr, forfPath, gsRateStr, ivsAnnualStr, ivs35, fivePct]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <BackLink href="https://www.italiantaxes.com/" label="Back" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">Italian Tax Calculator</h1>
            </div>
          </div>
          <div className="sm:hidden mt-3">
            <BackLink href="https://www.italiantaxes.com/" label="Back" />
          </div>
          <p className="mt-2 text-sm text-gray-600">Estimate IRPEF, regional/municipal taxes, and INPS.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="u-card p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">Regime</h2>
              <button
                type="button"
                aria-label="What are these regimes?"
                title="What are these regimes?"
                className="u-button u-button--sm u-button--ghost"
                onClick={() => setShowRegimeInfo((v)=>!v)}
              >
                i
              </button>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                className={`u-button ${regime === "ordinario" ? "border-[#6941c6] bg-[#6941c6] text-white hover:bg-[#5a35b0]" : "u-button--ghost"}`}
                onClick={() => setRegime("ordinario")}
              >
                Ordinary
              </button>
              <button
                type="button"
                className={`u-button ${regime === "forfettario" ? "border-[#6941c6] bg-[#6941c6] text-white hover:bg-[#5a35b0]" : "u-button--ghost"}`}
                onClick={() => setRegime("forfettario")}
              >
                Flat‑rate (forfettario)
              </button>
            </div>
            {showRegimeInfo && (
              <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3 text-xs text-gray-700">
                <p className="mb-2"><strong>Ordinary</strong>: Progressive IRPEF (23% &le; €28k, 35% €28–50k, 43% &gt; €50k), plus regional (≈1.23–3.33%) and municipal (≈0–0.9%) add-ons. INPS contributions reduce taxable income. Credits/deductions may apply.</p>
                <p className="mb-1"><strong>Flat‑rate (forfettario)</strong>: Substitute tax of 15% (5% for first 5 years if eligible). Tax base = revenues × coefficient (e.g., 78% professions, 67% commerce, 40% hospitality), then minus INPS. No IRPEF/add-ons. Thresholds: €85k (entry), exit if &gt; €100k during the year.</p>
              </div>
            )}
            {regime === "ordinario" && (
            <>
            <h2 className="text-base font-medium mt-6">Inputs</h2>
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
                        employmentType === opt.key
                          ? "border-[#6941c6] bg-[#6941c6] text-white hover:bg-[#5a35b0]"
                          : "u-button--ghost"
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Switch label="Apply employee credit" checked={applyEmployeeCredit} onChange={setApplyEmployeeCredit} />
                <Switch label="Trattamento integrativo (approx)" checked={trattamentoIntegrativo} onChange={setTrattamentoIntegrativo} />
              </div>
            </div>
            </>
            )}

            {regime === "forfettario" && (
            <>
            <h2 className="text-base font-medium mt-6">Inputs (Flat‑rate)</h2>
            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <label className="u-label">Annual revenues (EUR)</label>
                <input type="text" inputMode="decimal" value={revenuesStr} onChange={(e) => setRevenuesStr(e.target.value)} className="u-input" />
              </div>
              <div>
                <label className="u-label">Coefficient (%)</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {QUICK_COEFFICIENTS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCoeffPctStr(String(c.value))}
                      className={`u-button w-full text-center whitespace-normal break-words leading-snug ${
                        Number(coeffPctStr)===c.value?"border-[#6941c6] bg-[#6941c6] text-white hover:bg-[#5a35b0]":"u-button--ghost"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <input type="text" inputMode="decimal" value={coeffPctStr} onChange={(e) => setCoeffPctStr(e.target.value)} className="u-input" />
              </div>

              <div>
                <label className="u-label">INPS path</label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button type="button" className={`u-button truncate ${forfPath==="gestione_separata"?"border-[#6941c6] bg-[#6941c6] text-white hover:bg-[#5a35b0]":"u-button--ghost"}`} onClick={()=>setForfPath("gestione_separata")}>Gestione Separata (GS)</button>
                  <button type="button" className={`u-button truncate ${forfPath==="ivs_artigiani_commercianti"?"border-[#6941c6] bg-[#6941c6] text-white hover:bg-[#5a35b0]":"u-button--ghost"}`} onClick={()=>setForfPath("ivs_artigiani_commercianti")}>IVS Artisans/Traders</button>
                </div>
              </div>

              {forfPath === "gestione_separata" && (
                <div>
                  <label className="u-label">GS rate override (%)</label>
                  <input type="text" inputMode="decimal" placeholder="auto" value={gsRateStr} onChange={(e)=>setGsRateStr(e.target.value)} className="u-input" />
                </div>
              )}

              {forfPath === "ivs_artigiani_commercianti" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="u-label">IVS annual contributions (EUR)</label>
                    <input type="text" inputMode="decimal" placeholder="minimums + excess" value={ivsAnnualStr} onChange={(e)=>setIvsAnnualStr(e.target.value)} className="u-input" />
                  </div>
                  <div className="mt-6">
                    <Switch label="Apply 35% IVS reduction (if eligible)" checked={ivs35} onChange={setIvs35} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Switch label="Startup 5% rate (first 5 years, if eligible)" checked={fivePct} onChange={setFivePct} />
              </div>
            </div>
            </>
            )}
          </section>

          {regime === "ordinario" && (
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
          )}

          {regime === "forfettario" && (
          <section className="u-card p-6">
            <h2 className="text-base font-medium">Estimate (Forfettario)</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Row label="Revenues" value={formatEURForf(forfBreakdown.inputs.revenues)} />
              <Row label={`Forfait income (${forfBreakdown.inputs.coefficientPct}%)`} value={formatEURForf(forfBreakdown.forfaitIncome)} />
              <Row label="INPS contributions" value={formatEURForf(forfBreakdown.inpsContributions)} subtle />
              <Row label="Taxable base" value={formatEURForf(forfBreakdown.taxableBase)} />
              <Row label={`Imposta sostitutiva (${forfBreakdown.impostaSostitutivaRatePct}%)`} value={formatEURForf(forfBreakdown.impostaSostitutiva)} />
              <div className="mt-5 border-t border-gray-200 pt-4">
                <Row label="Net income" value={formatEURForf(forfBreakdown.netIncome)} />
              </div>
            </div>
          </section>
          )}
        </div>

        <p className="mt-8 text-xs text-gray-500">
          This is an estimate for educational purposes. To accurately determine your tax obligations please complete your tax filing at <a className="underline hover:no-underline" href="https://www.italiantaxes.com/" target="_blank" rel="noopener noreferrer">ItalianTaxes.com</a> or <a className="underline hover:no-underline" href="https://www.italiantaxes.com/standard-consultation-booking" target="_blank" rel="noopener noreferrer">book a consultation</a>. Sources: EY summary of 2025 brackets; ranges for addizionali regionali/comunali and INPS rates.
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

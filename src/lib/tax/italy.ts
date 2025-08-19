export type EmploymentType = "employee" | "freelancer_gestione_separata" | "self_employed";

export interface TaxInput {
	grossIncome: number;
	employmentType: EmploymentType;
	/** Optional override. If not provided, defaults based on employmentType. Percentage in [0,100]. */
	inpsRatePct?: number;
	/** Additional deductible pension contributions (EUR) beyond mandatory INPS contributions. */
	deduciblePensionContributions?: number;
	/** Other tax credits (detrazioni) as euro amount directly deducted from IRPEF. */
	otherTaxCredits?: number;
	/** Regional addizionale IRPEF percentage (e.g., 1.23 => 1.23%). */
	regionalRatePct: number;
	/** Municipal addizionale IRPEF percentage (e.g., 0.8 => 0.8%). */
	municipalRatePct: number;
	/** If true and employmentType is employee, apply an approximate employee tax credit. */
	applyEmployeeCredit?: boolean;
	/** If true and thresholds are met, apply the 1,200 EUR trattamento integrativo (approx). */
	trattamentoIntegrativoEligible?: boolean;
}

export interface BracketTax {
	rate: number; // 0-1
	amount: number; // EUR paid in this bracket
	from: number; // inclusive
	to: number; // exclusive (Infinity possible)
}

export interface TaxBreakdown {
	inputs: Required<Omit<TaxInput, "inpsRatePct">> & { inpsRatePct: number };
	inpsContributions: number;
	taxableIncome: number;
	irpef: number;
	irpefPerBracket: BracketTax[];
	regionalTax: number;
	municipalTax: number;
	credits: {
		employeeCredit: number;
		trattamentoIntegrativo: number;
		otherTaxCredits: number;
		totalCredits: number;
	};
	grossTaxesBeforeCredits: number;
	totalTaxAfterCredits: number;
	netIncome: number;
	effectiveTaxRate: number; // totalTaxAfterCredits / grossIncome
}

const IRPEF_BRACKETS: { upTo: number; rate: number }[] = [
	{ upTo: 28_000, rate: 0.23 },
	{ upTo: 50_000, rate: 0.35 },
	{ upTo: Number.POSITIVE_INFINITY, rate: 0.43 },
];

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function getDefaultInpsRatePct(employmentType: EmploymentType): number {
	switch (employmentType) {
		case "employee":
			// Typical employee share around ~9-10%. Using 9.19% as a common reference.
			return 9.19;
		case "freelancer_gestione_separata":
			// Gestione Separata 2025 indicative rate ~26.07%
			return 26.07;
		case "self_employed":
			// Self-employed rates vary by fund/category; use a conservative default.
			return 26.0;
	}
}

export function calculateIrpefProgressive(taxableIncome: number): { total: number; perBracket: BracketTax[] } {
	let remaining = Math.max(0, taxableIncome);
	let lastCap = 0;
	const perBracket: BracketTax[] = [];
	let total = 0;
	for (const bracket of IRPEF_BRACKETS) {
		const slice = Math.max(0, Math.min(remaining, bracket.upTo - lastCap));
		const amount = slice * bracket.rate;
		total += amount;
		perBracket.push({ rate: bracket.rate, amount, from: lastCap, to: bracket.upTo });
		remaining -= slice;
		lastCap = bracket.upTo;
		if (remaining <= 0) break;
	}
	return { total, perBracket };
}

/**
 * Approximate detrazione per lavoro dipendente (employee tax credit).
 * NOTE: This is a simplified model intended for estimation only.
 * It loosely follows the piecewise structure used in recent years.
 */
export function estimateEmployeeTaxCredit(annualIncome: number): number {
	const income = Math.max(0, annualIncome);
	if (income <= 15_000) {
		// Floor around ~1,955 EUR for very low incomes.
		return 1955;
	}
	if (income <= 28_000) {
		// Linear fade between ~1,955 and ~1,910 across this band with additional taper.
		const span = 28_000 - 15_000;
		const t = (28_000 - income) / span; // 1 -> 0 as income goes 15k -> 28k
		return 1910 + 1190 * t; // heuristic
	}
	if (income <= 50_000) {
		const span = 50_000 - 28_000;
		const t = (50_000 - income) / span; // 1 -> 0 as income goes 28k -> 50k
		return 1910 * t;
	}
	return 0;
}

export function calculateItalianTaxes(input: TaxInput): TaxBreakdown {
	const inpsRatePct = input.inpsRatePct ?? getDefaultInpsRatePct(input.employmentType);
	const regionalRatePct = clamp(input.regionalRatePct, 0, 10);
	const municipalRatePct = clamp(input.municipalRatePct, 0, 5);

	const inpsContributions = Math.max(0, input.grossIncome) * (inpsRatePct / 100);
	const deductiblePension = Math.max(0, input.deduciblePensionContributions ?? 0);
	const taxableIncome = Math.max(0, input.grossIncome - inpsContributions - deductiblePension);

	const { total: irpefBeforeCredits, perBracket } = calculateIrpefProgressive(taxableIncome);
	const regionalTax = taxableIncome * (regionalRatePct / 100);
	const municipalTax = taxableIncome * (municipalRatePct / 100);

	const employeeCredit = input.applyEmployeeCredit && input.employmentType === "employee"
		? estimateEmployeeTaxCredit(input.grossIncome)
		: 0;
	const trattamentoIntegrativo = input.trattamentoIntegrativoEligible ? 1200 : 0;
	const otherTaxCredits = Math.max(0, input.otherTaxCredits ?? 0);
	const totalCredits = employeeCredit + trattamentoIntegrativo + otherTaxCredits;

	const grossTaxesBeforeCredits = irpefBeforeCredits + regionalTax + municipalTax;
	const totalTaxAfterCredits = Math.max(0, grossTaxesBeforeCredits - totalCredits);
	const netIncome = input.grossIncome - inpsContributions - totalTaxAfterCredits;
	const effectiveTaxRate = input.grossIncome > 0 ? totalTaxAfterCredits / input.grossIncome : 0;

	return {
		inputs: {
			grossIncome: input.grossIncome,
			employmentType: input.employmentType,
			inpsRatePct,
			regionalRatePct,
			municipalRatePct,
			applyEmployeeCredit: Boolean(input.applyEmployeeCredit),
			trattamentoIntegrativoEligible: Boolean(input.trattamentoIntegrativoEligible),
			deduciblePensionContributions: deductiblePension,
			otherTaxCredits,
		},
		inpsContributions,
		taxableIncome,
		irpef: irpefBeforeCredits,
		irpefPerBracket: perBracket,
		regionalTax,
		municipalTax,
		credits: {
			employeeCredit,
			trattamentoIntegrativo,
			otherTaxCredits,
			totalCredits,
		},
		grossTaxesBeforeCredits,
		totalTaxAfterCredits,
		netIncome,
		effectiveTaxRate,
	};
}

export function formatCurrencyEUR(value: number): string {
	return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
		value
	);
}



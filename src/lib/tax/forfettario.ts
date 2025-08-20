export type ForfettarioInpsPath = "gestione_separata" | "ivs_artigiani_commercianti";

export interface ForfettarioInput {
	revenues: number; // Ricavi/compensi annui
	coefficientPct: number; // Coefficiente di redditività (es. 78)
	inpsPath: ForfettarioInpsPath;
	// Gestione separata default ~26.07%
	gsRatePct?: number;
	// IVS: contributi annui (minimi + eventuale eccedenza). Si può applicare riduzione 35%.
	ivsAnnualContributions?: number;
	applyIVS35Reduction?: boolean;
	// 5% per i primi 5 anni se condizioni rispettate, altrimenti 15%
	startupFivePct?: boolean;
}

export interface ForfettarioBreakdown {
	inputs: Required<Omit<ForfettarioInput, "gsRatePct" | "ivsAnnualContributions" | "applyIVS35Reduction">> & {
		gsRatePct: number;
		ivsAnnualContributions: number;
		applyIVS35Reduction: boolean;
	};
	forfaitIncome: number; // ricavi * coefficiente
	inpsContributions: number;
	taxableBase: number; // base imponibile sostitutiva
	impostaSostitutivaRatePct: number;
	impostaSostitutiva: number;
	netIncome: number; // ricavi - INPS - imposta sostitutiva
}

export function calculateForfettario(input: ForfettarioInput): ForfettarioBreakdown {
	const coefficientPct = clamp(input.coefficientPct, 0, 100);
	const gsRatePct = input.gsRatePct ?? 26.07;
	const ivsAnnualContributions = Math.max(0, input.ivsAnnualContributions ?? 4000);
	const applyIVS35Reduction = Boolean(input.applyIVS35Reduction);

	const forfaitIncome = Math.max(0, input.revenues) * (coefficientPct / 100);

	let inpsContributions = 0;
	if (input.inpsPath === "gestione_separata") {
		inpsContributions = forfaitIncome * (gsRatePct / 100);
	} else {
		inpsContributions = applyIVS35Reduction ? ivsAnnualContributions * 0.65 : ivsAnnualContributions;
	}

	const taxableBase = Math.max(0, forfaitIncome - inpsContributions);
	const impostaRate = input.startupFivePct ? 0.05 : 0.15;
	const impostaSostitutiva = taxableBase * impostaRate;
	const netIncome = input.revenues - inpsContributions - impostaSostitutiva;

	return {
		inputs: {
			revenues: input.revenues,
			coefficientPct,
			inpsPath: input.inpsPath,
			gsRatePct,
			ivsAnnualContributions,
			applyIVS35Reduction,
			startupFivePct: Boolean(input.startupFivePct),
		},
		forfaitIncome,
		inpsContributions,
		taxableBase,
		impostaSostitutivaRatePct: impostaRate * 100,
		impostaSostitutiva,
		netIncome,
	};
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function formatCurrencyEUR(value: number): string {
	return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(
		value
	);
}

export const QUICK_COEFFICIENTS: { label: string; value: number }[] = [
	{ label: "Professions (78%)", value: 78 },
	{ label: "Commerce (67%)", value: 67 },
	{ label: "Accommodation/Food (40%)", value: 40 },
];



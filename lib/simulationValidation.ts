import type { CoinSearchResult, SimulationInput } from "@/lib/types";

type ValidationContext = {
  coinQuery: string;
  selectedCoin: CoinSearchResult | null;
  today: string;
};

export function validateSimulationDraft(
  input: SimulationInput,
  { coinQuery, selectedCoin, today }: ValidationContext
) {
  const trimmedQuery = coinQuery.trim();

  if (!selectedCoin?.id || !input.coinId || !trimmedQuery) {
    return "Sélectionnez une crypto-monnaie dans la liste.";
  }

  if (!isSelectedCoinQuery(trimmedQuery, selectedCoin)) {
    return "Sélectionnez une crypto-monnaie dans la liste avant de valider.";
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return "Le montant investi doit être supérieur à zéro.";
  }

  if (!isDateInput(input.startDate) || !isDateInput(input.endDate)) {
    return "Renseignez une date de début et une date de fin valides.";
  }

  if (input.startDate > input.endDate) {
    return "La date de début doit précéder la date de fin.";
  }

  if (input.endDate > today) {
    return "La date de fin ne peut pas être dans le futur.";
  }

  return null;
}

function isSelectedCoinQuery(query: string, selectedCoin: CoinSearchResult) {
  const normalizedQuery = normalizeCoinText(query);

  return (
    normalizedQuery === normalizeCoinText(selectedCoin.name) ||
    normalizedQuery === normalizeCoinText(selectedCoin.symbol)
  );
}

function normalizeCoinText(value: string) {
  return value.trim().toLocaleLowerCase("fr-FR");
}

function isDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

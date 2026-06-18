import type {
  InvestmentFrequency,
  PricePoint,
  SimulationInput,
  SimulationResult
} from "@/lib/types";

const DAY_MS = 24 * 60 * 60 * 1000;

type Transaction = {
  timestamp: number;
  amount: number;
  price: number;
  units: number;
};

export function runCryptoSimulation(
  input: SimulationInput,
  prices: PricePoint[]
): SimulationResult {
  validateInput(input);

  const normalizedPrices = prices
    .filter((point) => Number.isFinite(point.timestamp) && point.price > 0)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (normalizedPrices.length === 0) {
    throw new Error("Aucun historique de prix disponible pour cette période.");
  }

  const start = startOfUtcDay(input.startDate);
  const end = endOfUtcDay(input.endDate);

  if (start > end) {
    throw new Error("La date de début doit précéder la date de fin.");
  }

  const schedule = buildInvestmentSchedule(start, end, input.frequency);
  const transactions = schedule
    .map((timestamp) => {
      const price = findPriceAtOrAfter(normalizedPrices, timestamp);
      if (!price || price.timestamp > end) {
        return null;
      }

      return {
        timestamp: price.timestamp,
        amount: input.amount,
        price: price.price,
        units: input.amount / price.price
      };
    })
    .filter((transaction): transaction is Transaction => transaction !== null);

  if (transactions.length === 0) {
    throw new Error("Aucun achat possible avec les prix disponibles.");
  }

  let appliedTransactionIndex = 0;
  let totalInvested = 0;
  let totalUnits = 0;

  const series = normalizedPrices
    .filter((point) => point.timestamp >= start && point.timestamp <= end)
    .map((point) => {
      while (
        appliedTransactionIndex < transactions.length &&
        transactions[appliedTransactionIndex].timestamp <= point.timestamp
      ) {
        const transaction = transactions[appliedTransactionIndex];
        totalInvested += transaction.amount;
        totalUnits += transaction.units;
        appliedTransactionIndex += 1;
      }

      return {
        timestamp: point.timestamp,
        date: new Date(point.timestamp).toISOString().slice(0, 10),
        invested: roundMoney(totalInvested),
        value: roundMoney(totalUnits * point.price)
      };
    });

  const lastPrice = findPriceAtOrBefore(normalizedPrices, end) ?? normalizedPrices.at(-1);
  const finalTotalInvested = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );
  const finalTotalUnits = transactions.reduce(
    (sum, transaction) => sum + transaction.units,
    0
  );
  const finalValue = finalTotalUnits * (lastPrice?.price ?? 0);
  const gain = finalValue - finalTotalInvested;

  return {
    totalInvested: roundMoney(finalTotalInvested),
    finalValue: roundMoney(finalValue),
    gain: roundMoney(gain),
    gainPercent:
      finalTotalInvested > 0 ? roundPercent((gain / finalTotalInvested) * 100) : 0,
    averageBuyPrice:
      finalTotalUnits > 0 ? roundMoney(finalTotalInvested / finalTotalUnits) : 0,
    totalUnits: roundUnits(finalTotalUnits),
    series,
    transactionsCount: transactions.length
  };
}

function validateInput(input: SimulationInput) {
  if (!input.coinId) {
    throw new Error("Sélectionnez une crypto-monnaie.");
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error("Le montant investi doit être supérieur à zéro.");
  }
}

export function buildInvestmentSchedule(
  startTimestamp: number,
  endTimestamp: number,
  frequency: InvestmentFrequency
) {
  if (frequency === "once") {
    return [startTimestamp];
  }

  const dates: number[] = [];
  let current = startTimestamp;
  const originalDay = new Date(startTimestamp).getUTCDate();

  while (current <= endTimestamp) {
    dates.push(current);

    if (frequency === "daily") {
      current += DAY_MS;
    } else if (frequency === "weekly") {
      current += 7 * DAY_MS;
    } else {
      current = addUtcMonth(current, originalDay);
    }
  }

  return dates;
}

function addUtcMonth(timestamp: number, preferredDay: number) {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const daysInTargetMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const day = Math.min(preferredDay, daysInTargetMonth);

  return Date.UTC(year, month, day);
}

function findPriceAtOrAfter(prices: PricePoint[], timestamp: number) {
  return prices.find((point) => point.timestamp >= timestamp);
}

function findPriceAtOrBefore(prices: PricePoint[], timestamp: number) {
  for (let index = prices.length - 1; index >= 0; index -= 1) {
    if (prices[index].timestamp <= timestamp) {
      return prices[index];
    }
  }

  return undefined;
}

function startOfUtcDay(date: string) {
  return Date.parse(`${date}T00:00:00.000Z`);
}

function endOfUtcDay(date: string) {
  return Date.parse(`${date}T23:59:59.999Z`);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function roundPercent(value: number) {
  return Math.round(value * 10) / 10;
}

function roundUnits(value: number) {
  return Math.round(value * 100_000_000) / 100_000_000;
}

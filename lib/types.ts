export type InvestmentFrequency = "once" | "daily" | "weekly" | "monthly";

export type Currency = "eur";

export type PricePoint = {
  timestamp: number;
  price: number;
};

export type SimulationInput = {
  coinId: string;
  amount: number;
  frequency: InvestmentFrequency;
  startDate: string;
  endDate: string;
  currency: Currency;
};

export type SimulationSeriesPoint = {
  timestamp: number;
  date: string;
  invested: number;
  value: number;
};

export type SimulationResult = {
  totalInvested: number;
  finalValue: number;
  gain: number;
  gainPercent: number;
  averageBuyPrice: number;
  totalUnits: number;
  series: SimulationSeriesPoint[];
  transactionsCount: number;
};

export type CoinSearchResult = {
  id: string;
  name: string;
  symbol: string;
  thumb?: string;
};

import { describe, expect, it } from "vitest";

import { buildInvestmentSchedule, runCryptoSimulation } from "@/lib/simulation";
import type { PricePoint, SimulationInput } from "@/lib/types";

const baseInput: SimulationInput = {
  coinId: "bitcoin",
  amount: 100,
  frequency: "monthly",
  startDate: "2024-01-01",
  endDate: "2024-04-01",
  currency: "eur"
};

describe("runCryptoSimulation", () => {
  it("calculates a one-shot investment", () => {
    const result = runCryptoSimulation(
      { ...baseInput, frequency: "once", startDate: "2024-01-01", endDate: "2024-01-03" },
      prices([
        ["2024-01-01", 100],
        ["2024-01-02", 150],
        ["2024-01-03", 200]
      ])
    );

    expect(result.totalInvested).toBe(100);
    expect(result.finalValue).toBe(200);
    expect(result.gain).toBe(100);
    expect(result.gainPercent).toBe(100);
    expect(result.transactionsCount).toBe(1);
  });

  it("calculates a monthly DCA strategy", () => {
    const result = runCryptoSimulation(
      baseInput,
      prices([
        ["2024-01-01", 100],
        ["2024-02-01", 100],
        ["2024-03-01", 200],
        ["2024-04-01", 200]
      ])
    );

    expect(result.totalInvested).toBe(400);
    expect(result.totalUnits).toBe(3);
    expect(result.finalValue).toBe(600);
    expect(result.gain).toBe(200);
    expect(result.transactionsCount).toBe(4);
  });

  it("supports daily and weekly schedules", () => {
    const daily = buildInvestmentSchedule(
      Date.parse("2024-01-01T00:00:00.000Z"),
      Date.parse("2024-01-03T23:59:59.999Z"),
      "daily"
    );
    const weekly = buildInvestmentSchedule(
      Date.parse("2024-01-01T00:00:00.000Z"),
      Date.parse("2024-01-16T23:59:59.999Z"),
      "weekly"
    );

    expect(daily).toHaveLength(3);
    expect(weekly).toHaveLength(3);
  });

  it("rejects an invalid date range", () => {
    expect(() =>
      runCryptoSimulation(
        { ...baseInput, startDate: "2024-04-01", endDate: "2024-01-01" },
        prices([["2024-01-01", 100]])
      )
    ).toThrow("La date de début doit précéder la date de fin.");
  });

  it("handles losses", () => {
    const result = runCryptoSimulation(
      { ...baseInput, frequency: "once", startDate: "2024-01-01", endDate: "2024-01-02" },
      prices([
        ["2024-01-01", 100],
        ["2024-01-02", 80]
      ])
    );

    expect(result.gain).toBe(-20);
    expect(result.gainPercent).toBe(-20);
  });
});

function prices(values: Array<[string, number]>): PricePoint[] {
  return values.map(([date, price]) => ({
    timestamp: Date.parse(`${date}T00:00:00.000Z`),
    price
  }));
}

import { describe, expect, it } from "vitest";

import { validateSimulationDraft } from "@/lib/simulationValidation";
import type { CoinSearchResult, SimulationInput } from "@/lib/types";

const bitcoin: CoinSearchResult = {
  id: "bitcoin",
  name: "Bitcoin",
  symbol: "BTC"
};

const baseInput: SimulationInput = {
  coinId: "bitcoin",
  amount: 100,
  frequency: "monthly",
  startDate: "2025-01-01",
  endDate: "2025-02-01",
  currency: "eur"
};

describe("validateSimulationDraft", () => {
  it("accepts a valid selected coin query", () => {
    expect(
      validateSimulationDraft(baseInput, {
        coinQuery: "Bitcoin",
        selectedCoin: bitcoin,
        today: "2025-03-01"
      })
    ).toBeNull();
  });

  it("rejects non-positive amounts", () => {
    expect(
      validateSimulationDraft(
        { ...baseInput, amount: 0 },
        {
          coinQuery: "Bitcoin",
          selectedCoin: bitcoin,
          today: "2025-03-01"
        }
      )
    ).toBe("Le montant investi doit être supérieur à zéro.");
  });

  it("rejects malformed and inverted dates", () => {
    expect(
      validateSimulationDraft(
        { ...baseInput, startDate: "", endDate: "2025-02-01" },
        {
          coinQuery: "Bitcoin",
          selectedCoin: bitcoin,
          today: "2025-03-01"
        }
      )
    ).toBe("Renseignez une date de début et une date de fin valides.");

    expect(
      validateSimulationDraft(
        { ...baseInput, startDate: "2025-02-01", endDate: "2025-01-01" },
        {
          coinQuery: "Bitcoin",
          selectedCoin: bitcoin,
          today: "2025-03-01"
        }
      )
    ).toBe("La date de début doit précéder la date de fin.");
  });

  it("rejects a typed query that has not been selected", () => {
    expect(
      validateSimulationDraft(baseInput, {
        coinQuery: "Ethereum",
        selectedCoin: bitcoin,
        today: "2025-03-01"
      })
    ).toBe("Sélectionnez une crypto-monnaie dans la liste avant de valider.");
  });
});

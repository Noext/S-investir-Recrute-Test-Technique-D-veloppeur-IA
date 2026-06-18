"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Calendar, CheckCircle2, Coins, Loader2, Search } from "lucide-react";

import { ResultsSummary } from "@/components/crypto-simulator/ResultsSummary";
import { SimulationChart } from "@/components/crypto-simulator/SimulationChart";
import { oneYearHistoryStartDate } from "@/lib/historyDate";
import { runCryptoSimulation } from "@/lib/simulation";
import { validateSimulationDraft } from "@/lib/simulationValidation";
import type {
  CoinSearchResult,
  InvestmentFrequency,
  PricePoint,
  SimulationInput,
  SimulationResult
} from "@/lib/types";

type Props = {
  variant?: "default" | "embed";
};

const defaultCoin: CoinSearchResult = {
  id: "bitcoin",
  name: "Bitcoin",
  symbol: "BTC",
  thumb: "https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png"
};

const frequencies: Array<{
  value: InvestmentFrequency;
  label: string;
  description: string;
}> = [
  { value: "once", label: "One-shot", description: "Un achat au départ" },
  { value: "daily", label: "Quotidien", description: "Un achat par jour" },
  { value: "weekly", label: "Hebdo", description: "Un achat par semaine" },
  { value: "monthly", label: "Mensuel", description: "Un achat par mois" }
];

export function CryptoSimulator({ variant = "default" }: Props) {
  const [selectedCoin, setSelectedCoin] = useState(defaultCoin);
  const [coinQuery, setCoinQuery] = useState("Bitcoin");
  const [coinResults, setCoinResults] = useState<CoinSearchResult[]>([defaultCoin]);
  const [amount, setAmount] = useState(100);
  const [frequency, setFrequency] = useState<InvestmentFrequency>("monthly");
  const [startDate, setStartDate] = useState(defaultStartDate());
  const [endDate, setEndDate] = useState(todayDate());
  const [submittedCoin, setSubmittedCoin] = useState<CoinSearchResult | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftInput: SimulationInput = useMemo(
    () => ({
      coinId: selectedCoin.id,
      amount,
      frequency,
      startDate,
      endDate,
      currency: "eur"
    }),
    [amount, endDate, frequency, selectedCoin.id, startDate]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      if (coinQuery.trim().length < 2) {
        return;
      }

      try {
        const response = await fetch(
          `/api/coins/search?q=${encodeURIComponent(coinQuery)}`,
          { signal: controller.signal }
        );
        const data = (await response.json()) as {
          coins?: CoinSearchResult[];
        };

        if (data.coins?.length) {
          setCoinResults(data.coins);
        }
      } catch {
        if (!controller.signal.aborted) {
          setCoinResults([defaultCoin]);
        }
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [coinQuery]);

  async function handleValidateSimulation() {
    const validationError = validateSimulationDraft(draftInput, {
      coinQuery,
      selectedCoin,
      today: todayDate()
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        from: draftInput.startDate,
        to: draftInput.endDate,
        currency: draftInput.currency
      });
      const response = await fetch(
        `/api/coins/${encodeURIComponent(draftInput.coinId)}/history?${params.toString()}`
      );
      const data = (await response.json()) as {
        prices?: PricePoint[];
        error?: string;
      };

      if (!response.ok || !data.prices) {
        throw new Error(data.error ?? "Historique indisponible.");
      }

      const nextResult = runCryptoSimulation(draftInput, data.prices);

      setSubmittedCoin(selectedCoin);
      setResult(nextResult);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Impossible de charger l'historique."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function selectCoin(coin: CoinSearchResult) {
    setSelectedCoin(coin);
    setCoinQuery(coin.name);
    setCoinResults([coin]);
  }

  return (
    <section className={`simulator ${variant === "embed" ? "is-embed" : ""}`}>
      <div className="simulator-grid">
        <form className="control-panel" onSubmit={(event) => event.preventDefault()}>
          <div className="panel-heading">
            <span className="panel-icon">
              <Coins size={20} aria-hidden="true" />
            </span>
            <div>
              <h2>Paramètres</h2>
              <p>Configurez la crypto, le montant et le rythme d&apos;investissement.</p>
            </div>
          </div>

          <label className="field">
            <span>Crypto-monnaie</span>
            <div className="search-field">
              <Search size={17} aria-hidden="true" />
              <input
                value={coinQuery}
                onChange={(event) => setCoinQuery(event.target.value)}
                placeholder="Rechercher Bitcoin, Ethereum..."
              />
            </div>
          </label>

          <div className="coin-list" aria-label="Résultats de recherche crypto">
            {coinResults.map((coin) => (
              <button
                className={coin.id === selectedCoin.id ? "coin-option is-active" : "coin-option"}
                key={coin.id}
                type="button"
                onClick={() => selectCoin(coin)}
              >
                {coin.thumb ? (
                  <Image alt="" height={28} src={coin.thumb} width={28} />
                ) : (
                  <span className="coin-fallback" />
                )}
                <span>
                  <strong>{coin.name}</strong>
                  <small>{coin.symbol}</small>
                </span>
              </button>
            ))}
          </div>

          <label className="field">
            <span>Montant par achat</span>
            <div className="amount-field">
              <input
                min={1}
                step={10}
                type="number"
                value={amount}
                onChange={(event) => setAmount(Number(event.target.value))}
              />
              <span>EUR</span>
            </div>
          </label>

          <fieldset className="field">
            <legend>Fréquence</legend>
            <div className="frequency-grid">
              {frequencies.map((option) => (
                <button
                  className={
                    frequency === option.value
                      ? "frequency-option is-active"
                      : "frequency-option"
                  }
                  key={option.value}
                  type="button"
                  onClick={() => setFrequency(option.value)}
                >
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="date-grid">
            <label className="field">
              <span>Date de début</span>
              <div className="date-field">
                <Calendar size={17} aria-hidden="true" />
                <input
                  max={endDate}
                  min={oneYearHistoryStartDate()}
                  type="date"
                  value={startDate}
                  onChange={(event) =>
                    setStartDate(
                      clampDate(event.target.value, oneYearHistoryStartDate(), endDate)
                    )
                  }
                />
              </div>
            </label>
            <label className="field">
              <span>Date de fin</span>
              <div className="date-field">
                <Calendar size={17} aria-hidden="true" />
                <input
                  max={todayDate()}
                  min={startDate}
                  type="date"
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(clampDate(event.target.value, startDate, todayDate()))
                  }
                />
              </div>
            </label>
          </div>

          <button
            className="refresh-button"
            disabled={isLoading}
            type="button"
            onClick={handleValidateSimulation}
          >
            {isLoading ? (
              <Loader2 className="spin" size={18} aria-hidden="true" />
            ) : (
              <CheckCircle2 size={18} aria-hidden="true" />
            )}
            Valider la simulation
          </button>
        </form>

        <div className="results-panel">
          <div className="results-heading">
            <div>
              <span className="eyebrow compact">Résultat historique</span>
              <h2>
                {(submittedCoin ?? selectedCoin).name}{" "}
                <span>{(submittedCoin ?? selectedCoin).symbol}</span>
              </h2>
            </div>
            {isLoading ? <Loader2 className="spin muted" size={24} aria-hidden="true" /> : null}
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          <ResultsSummary result={result} />
          <SimulationChart result={result} />

          <p className="disclaimer">
            Simulation basée sur les prix historiques CoinGecko. Les performances
            passées ne préjugent pas des performances futures et ne constituent pas
            un conseil en investissement.
          </p>
        </div>
      </div>
    </section>
  );
}

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function defaultStartDate() {
  return oneYearHistoryStartDate();
}

function clampDate(value: string, min: string, max: string) {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}

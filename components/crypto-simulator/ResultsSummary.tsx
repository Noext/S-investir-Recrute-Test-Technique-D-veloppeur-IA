import { formatCurrency, formatPercent } from "@/lib/format";
import type { SimulationResult } from "@/lib/types";

type ResultsSummaryProps = {
  result: SimulationResult | null;
};

export function ResultsSummary({ result }: ResultsSummaryProps) {
  const cards = [
    {
      label: "Capital investi",
      value: result ? formatCurrency(result.totalInvested) : "..."
    },
    {
      label: "Valeur finale",
      value: result ? formatCurrency(result.finalValue) : "..."
    },
    {
      label: "Plus-value",
      value: result ? formatCurrency(result.gain) : "...",
      tone: result && result.gain < 0 ? "negative" : "positive"
    },
    {
      label: "Performance",
      value: result ? formatPercent(result.gainPercent) : "...",
      tone: result && result.gainPercent < 0 ? "negative" : "positive"
    },
    {
      label: "Prix moyen",
      value: result ? formatCurrency(result.averageBuyPrice) : "..."
    },
    {
      label: "Achats simulés",
      value: result ? String(result.transactionsCount) : "..."
    }
  ];

  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <article className={`summary-card ${card.tone ?? ""}`} key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
        </article>
      ))}
    </div>
  );
}

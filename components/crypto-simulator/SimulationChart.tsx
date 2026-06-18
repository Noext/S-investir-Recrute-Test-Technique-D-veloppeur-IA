"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatCurrency, formatDate } from "@/lib/format";
import type { SimulationResult } from "@/lib/types";

type SimulationChartProps = {
  result: SimulationResult | null;
};

export function SimulationChart({ result }: SimulationChartProps) {
  if (!result) {
    return <div className="chart-empty">Chargez une période valide pour afficher la courbe.</div>;
  }

  return (
    <div className="chart-card">
      <ResponsiveContainer height={360} width="100%">
        <AreaChart data={result.series} margin={{ top: 20, right: 16, bottom: 8, left: 0 }}>
          <defs>
            <linearGradient id="valueGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#1098f7" stopOpacity={0.42} />
              <stop offset="95%" stopColor="#1098f7" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="investedGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#34cdfe" stopOpacity={0.18} />
              <stop offset="95%" stopColor="#34cdfe" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#ffffff12" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="timestamp"
            minTickGap={42}
            stroke="#9ca3af"
            tickFormatter={(value) => formatDate(Number(value))}
            tickLine={false}
          />
          <YAxis
            axisLine={false}
            stroke="#9ca3af"
            tickFormatter={(value) => compactCurrency(Number(value))}
            tickLine={false}
            width={72}
          />
          <Tooltip
            contentStyle={{
              background: "#00173f",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              color: "#fff"
            }}
            formatter={(value, name) => {
              const numericValue = typeof value === "number" ? value : Number(value ?? 0);

              return [
                formatCurrency(numericValue),
                name === "value" ? "Valeur" : "Investi"
              ];
            }}
            labelFormatter={(value) => formatDate(Number(value))}
          />
          <Area
            dataKey="invested"
            fill="url(#investedGradient)"
            name="invested"
            stroke="#34cdfe"
            strokeDasharray="4 4"
            strokeWidth={2}
            type="monotone"
          />
          <Area
            dataKey="value"
            fill="url(#valueGradient)"
            name="value"
            stroke="#1098f7"
            strokeWidth={3}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function compactCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    notation: "compact",
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 1
  }).format(value);
}

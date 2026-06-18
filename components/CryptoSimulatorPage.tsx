import Link from "next/link";
import { ArrowUpRight, BarChart3, ShieldCheck } from "lucide-react";

import { CryptoSimulator } from "@/components/CryptoSimulator";

export function CryptoSimulatorPage() {
  return (
    <main className="page-shell">
      <header className="site-header">
        <Link className="brand" href="/">
          <span className="brand-mark">S</span>
          <span>S&apos;investir Simulateurs</span>
        </Link>
        <nav className="nav-links" aria-label="Navigation principale">
          <a href="/les-simulateurs/crypto">Simulateurs</a>
          <a href="/embed/crypto">Embed</a>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <BarChart3 size={16} aria-hidden="true" />
            Simulateur crypto
          </span>
          <h1>Mesurez l&apos;impact d&apos;un investissement crypto dans le temps</h1>
          <p>
            Testez un achat unique ou une stratégie DCA sur l&apos;historique réel des
            crypto-monnaies, avec une lecture claire du capital investi, de la
            valorisation et de la performance.
          </p>
          <div className="hero-badges">
            <span>
              <ShieldCheck size={16} aria-hidden="true" />
              Données CoinGecko
            </span>
            <span>
              <ArrowUpRight size={16} aria-hidden="true" />
              Prêt pour Vercel
            </span>
          </div>
        </div>
      </section>

      <CryptoSimulator />
    </main>
  );
}

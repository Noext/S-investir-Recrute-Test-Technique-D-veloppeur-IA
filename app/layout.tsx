import type { Metadata } from "next";
import { Lexend } from "next/font/google";

import "@/app/globals.css";

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lexend"
});

export const metadata: Metadata = {
  title: "Simulateur crypto | S'investir",
  description:
    "Simulez la performance historique d'un investissement crypto en one-shot ou en DCA."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={lexend.variable}>
      <body>{children}</body>
    </html>
  );
}

# Simulateur crypto S'investir

Démo technique d'un simulateur crypto au format de la suite `simulateurs.sinvestir.fr`.

## Lancer le projet

```bash
pnpm install
pnpm dev
```

Puis ouvrir `http://localhost:3000`.

Commandes utiles :

```bash
pnpm test
pnpm build
```

## Données

Le projet utilise l'API publique CoinGecko. La période sélectionnable est limitée à un an d'historique.

## Choix techniques

- Next.js App Router + TypeScript : aligné avec la stack S'investir et déployable directement sur Vercel.
- Route serveur `/api/coins/...` : évite d'exposer une éventuelle clé CoinGecko et centralise le cache.
- Logique de calcul isolée dans `lib/simulation.ts` : testable et réutilisable hors UI.
- Composant `CryptoSimulator` autonome : utilisé par la page complète et par `/embed/crypto`.
- Recharts : léger pour une courbe interactive claire sans construire un moteur de chart maison.

## Routes

- `/` : démo complète.
- `/les-simulateurs/crypto` : route proche de l'architecture cible.
- `/embed/crypto` : version compacte pour iframe.

Exemple d'intégration :

```html
<iframe
  src="https://votre-demo.vercel.app/embed/crypto"
  width="100%"
  height="860"
  style="border:0; border-radius:16px;"
  loading="lazy"
></iframe>
```

## Suggestions d'amélioration

- Ajouter un système de sauvegarde et partage des simulations, déjà cohérent avec la présence de Supabase et des routes `/share`.
- Mutualiser un design system de simulateurs : champs, cartes de résultats, tooltips, états d'erreur et graphiques.
- Ajouter une comparaison multi-actifs sur les simulateurs d'investissement : crypto vs ETF monde vs cash, avec le même capital investi.
- Prévoir un mode export image/PDF pour faciliter le partage depuis les articles `sinvestir.fr`.

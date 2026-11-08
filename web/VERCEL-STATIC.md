# Vercel Hobby : déploiement strictement statique

L'application Qwik `checklist` contient des pages publiques, un suivi local du navigateur et
aucune authentification côté serveur. Son rendu serveur à chaque requête n'est pas nécessaire.

## Build et publication

Le dossier racine **du projet Vercel** doit être `web`, pas la racine GitHub du dépôt.

- Preset : `Vite` (ou respecter le `framework` défini dans `web/vercel.json`).
- Build Command : `yarn build.ssg`.
- Output Directory : `dist`.
- Aucun Edge Function ni SSR ne doit être produit.
- Le déploiement doit provenir du code du dépôt, pas d'une copie CLI ancienne.

Commandes locales, depuis `web/` :

```sh
yarn install --frozen-lockfile
yarn build.ssg
yarn verify:static
```

La commande `verify:static` vérifie toutes les pages `/checklist/[title]` et
`/article/[slug]` attendues, ainsi que les fichiers statiques de base et
l'absence de répertoire de fonctions Vercel.

Pour une publication **explicitement autorisée**, vérifier d'abord le lien
vers le projet `checklist` dans Vercel, puis déployer depuis le répertoire `web`.
La suspension Hobby en cours interdit de considérer une PR ou un build local
comme une mise en production.

## Roadmap priorisée — 8 novembre 2026

| Priorité | Action | Condition de clôture |
| --- | --- | --- |
| **P0 — PR #2** | Générer le marqueur public statique, corriger le build Docker et valider SSG/CI. | [CI #42488838006](https://github.com/AlbanAndrieu/personal-security-checklist/actions/runs/42488838006) et [Docker #42488837999](https://github.com/AlbanAndrieu/personal-security-checklist/actions/runs/42488837999) **PASS** sur `4012542` ; PR encore Draft, non fusionnée. |
| **P0 — Remise en service** | Attendre l'autorisation Vercel, vérifier le lien GitHub et le Root Directory `web`, remplacer l'ancien déploiement CLI. | Le marqueur `/.well-known/checklist-build.json` renvoie le SHA attendu et le dashboard Vercel ne montre **aucune fonction** générée pour Checklist. |
| **P1 — Recette navigateur** | Vérifier toutes les routes, progression locale, stockage navigateur, accessibilité mobile/clavier et SEO. | Contrôle HTTP réel du SHA publié, sans perte de progression ni cache incorrect. |
| **P2 — Budget CPU** | Mesurer l'évolution `Fluid Active CPU` pendant une fenêtre de trafic représentative ; comparer avec la période SSR précédente. | Gain constaté par mesure ; ne pas promettre 0 CPU global (les autres projets restent dynamiques). |

L'ancien déploiement CLI de production est antérieur au changement statique
[#1](https://github.com/AlbanAndrieu/personal-security-checklist/pull/1) :
**la fusion de code ne constitue pas un nouveau déploiement**. La demande de
réactivation Vercel a été envoyée, mais elle ne vaut pas confirmation de service.

## Sécurité et coûts

Les données de checklist sont intégrées au build depuis
`personal-security-checklist.yml` et les préférences restent locales au navigateur.
Ne jamais exposer les secrets ni restaurer une route de chargement YAML sur
chaque requête. Le script `build.server` (ancien adaptateur Edge) reste
disponible pour analyse, mais **n'est plus le build par défaut**.

Après réactivation, contrôler dans Vercel :

1. Aucun nouveau fichier dans `Functions` pour ce projet.
2. Toutes les pages `/checklist/<slug>/` et `/article/<slug>/` accessibles.
3. Les cases cochées restent fonctionnelles avec stockage navigateur.
4. `Fluid Active CPU` de Checklist ne progresse plus sur les requêtes statiques.

Le SSR Qwik est toujours utilisé **au moment du build** pour pré-générer les HTML :
ce n'est pas du SSR exécuté sur Vercel à chaque visite.

## Vérification du déploiement réellement publié

Le précédent déploiement Vercel provenait de la CLI et peut rester actif malgré
la fusion de ce changement dans GitHub. Le build SSG publie maintenant un
fichier public non sensible :

```sh
curl --fail --silent --show-error \
  https://checklist.albandrieu.com/.well-known/checklist-build.json
```

Le document doit contenir `"rendering": "static"` ainsi que le SHA Git du
build lorsqu'il est disponible. Son absence signifie que le nouveau build
statique n'a pas encore été vérifié en production ; elle ne prouve pas que
le site ne fonctionne plus. Ce fichier est généré à la compilation, sans
appel serveur pendant la visite. Un marqueur valide doit être recoupé avec
l'absence de Vercel Functions dans le dashboard : il ne prouve pas, seul,
la configuration effective de la plateforme.

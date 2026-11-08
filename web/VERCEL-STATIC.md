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
build lorsqu'il est disponible. Son absence signifie que **le nouveau build
statique n'a pas encore été vérifié en production** ; elle ne prouve pas que
le site ne fonctionne plus. Ce fichier est généré à la compilation, sans
appel serveur pendant la visite. Un marqueur valide doit être recoupé avec
l'absence de Vercel Functions dans le dashboard : il ne prouve pas, seul,
la configuration effective de la plateforme.


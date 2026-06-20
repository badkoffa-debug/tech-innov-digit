# Guide rapide - espace admin

## Ce que fait cette version

- Les visiteurs voient uniquement les formations et articles publiés.
- Vous seul pouvez ouvrir `/admin` avec le mot de passe.
- Depuis `/admin`, vous pouvez ajouter, modifier, masquer, publier ou supprimer :
  - formations ;
  - prix en ligne ;
  - prix en présentiel ;
  - articles de blog.

## Mot de passe admin

Sur Vercel, ajoutez une variable d'environnement :

```env
ADMIN_PASSWORD=votre-mot-de-passe-secret
```

Ne gardez pas `TECH2026` comme mot de passe final.

## Base de données

Pour que les modifications restent visibles en ligne après publication, ajoutez aussi une base Upstash Redis ou Vercel KV, puis renseignez :

```env
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

Sans ces deux valeurs, l'admin peut marcher en aperçu local, mais les changements ne seront pas fiables en production Vercel.

## Adresse admin

Après publication, ouvrez :

```text
https://votre-site.vercel.app/admin
```

Le lien admin n'est pas affiché dans le menu public.

# Deploiement — Atelier de Mode

## Prerequis

- Compte [Vercel](https://vercel.com) (gratuit)
- Repo GitHub (public ou prive)

## Etapes

### 1. Pousser le code sur GitHub

```bash
cd /Users/cg/Documents/fashion-studio

# Si pas encore de remote:
gh repo create fashion-studio --public --source=. --push

# Sinon:
git push origin main
```

### 2. Connecter a Vercel

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Cliquer **Import Git Repository**
3. Selectionner le repo `fashion-studio`
4. Vercel detecte automatiquement Vite — les parametres par defaut sont corrects:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Cliquer **Deploy**

### 3. C'est tout

Vercel deploie automatiquement a chaque push sur `main`.

Le fichier `vercel.json` configure le SPA routing (toutes les URLs redirigent vers `index.html`).

## Domaine personnalise (optionnel)

1. Dans le dashboard Vercel du projet → **Settings** → **Domains**
2. Ajouter le domaine souhaite (ex: `atelier.example.com`)
3. Configurer le DNS chez le registrar (CNAME vers `cname.vercel-dns.com`)

## Variables d'environnement

Aucune variable d'environnement requise pour le moment.
Quand Supabase sera integre, ajouter:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Build local

```bash
npm run build     # Build de production dans dist/
npm run preview   # Previsualiser le build local
```

## Structure du build

```
dist/
├── index.html          # Point d'entree SPA
├── assets/
│   ├── index-*.css     # Tailwind CSS (~25 KB gzip)
│   └── index-*.js      # App bundle (~175 KB gzip)
└── favicon.svg
```

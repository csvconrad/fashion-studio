# Deploiement — Atelier de Mode

## Production

URL : **https://fashion-studio-peach.vercel.app**
Repo : **https://github.com/csvconrad/fashion-studio**

Chaque `git push origin master` declenche un deploiement automatique sur Vercel.

## Variables d'environnement (Vercel)

| Variable | Valeur | Requis |
|----------|--------|--------|
| `VITE_SUPABASE_URL` | `https://elemjzqybybmflnauaii.supabase.co` | Oui (pour auth + cloud) |
| `VITE_SUPABASE_ANON_KEY` | Cle legacy `eyJ...` depuis Supabase > Settings > API | Oui |
| `VITE_UNSPLASH_ACCESS_KEY` | Cle depuis unsplash.com/developers | Non (active la recherche photos) |

Sans les variables Supabase, l'app fonctionne en mode local (IndexedDB, pas de login).

## PWA

L'app est installable sur tablette/telephone :
- **iPad/iPhone** : ouvrir dans Safari → Partager → "Sur l'ecran d'accueil"
- **Android** : Chrome affiche automatiquement "Ajouter a l'ecran d'accueil"

## Stack

- React 19 + TypeScript + Vite + Tailwind CSS 4
- Fabric.js 7 (canvas) + perfect-freehand (pinceaux)
- Zustand 5 (state) + React Router 7
- Supabase (auth + PostgreSQL) + IndexedDB fallback
- Iconify API (200k+ stickers)

## Build local

```bash
npm install
npm run dev       # Dev server avec HMR
npm run build     # Build production dans dist/
npm run preview   # Previsualiser le build
```

## Base de donnees

Schema SQL dans `supabase/schema.sql`. A executer dans Supabase SQL Editor :
- Table `profiles` (profils enfants lies a un compte parent)
- Table `designs` (creations par profil)
- Row Level Security active

## Ajouter du contenu

- **Gabarits vetements** : `src/features/garments/templates.ts` — ajouter un objet avec zones SVG
- **Motifs decoratifs** : `src/features/tools/shapeData.ts` — ajouter un path SVG 100x100
- **Formes geometriques** : `src/features/tools/shapes/shapeGeometry.ts`
- **Pinceaux** : `src/features/tools/brushes/brushData.ts`
- **Palettes couleurs** : `src/features/tools/colors/palettes.ts`
- **Polices** : `src/features/tools/text/fontData.ts` — Google Fonts
- **Templates texte** : `src/features/tools/text/textTemplates.ts`
- **Templates demarrage** : `src/features/home/starterTemplates.ts`

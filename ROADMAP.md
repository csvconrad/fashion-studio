# Roadmap — Atelier de Mode

Application de design de vetements pour enfants, evolutive vers un outil pro.
Projet pour les filles de Conrad.

## Phase 1 — Fondations (FAIT)

- [x] Canvas Fabric.js (800x1000) avec calques, undo/redo (50 niveaux)
- [x] 4 gabarits de vetements (t-shirt, robe, pantalon, casquette) avec zones colorables
- [x] Palette de 20 couleurs
- [x] Dessin libre au pinceau (4 epaisseurs)
- [x] Texte sur le canvas (6 polices, 5 tailles)
- [x] 12 motifs decoratifs SVG (coeur, etoile, papillon, etc.)
- [x] Sauvegarde IndexedDB avec galerie
- [x] Export PNG (1x a 4x)
- [x] Auth Supabase + profils par enfant
- [x] Stockage cloud Supabase (designs par profil)
- [x] Mode enfant / mode avance
- [x] Deploy Vercel (fashion-studio-peach.vercel.app)
- [x] Support tablette (touch-action, boutons larges)

## Phase 2 — Ameliorations creatives (A FAIRE)

- [ ] Motifs/textures appliques aux zones (pois, rayures, carreaux — le PatternPicker existe deja comme placeholder)
- [ ] Plus de gabarits : jupe, veste, chapeau, chaussures, echarpe
- [ ] Import d'images (photos, stickers) comme objets sur le canvas
- [ ] Gomme / outil d'effacement pour le dessin libre
- [ ] Pipette (pick color from canvas)
- [ ] Rotation/flip du canvas ou des objets via boutons tactiles
- [ ] Formes geometriques de base (cercle, carre, triangle)
- [ ] Google Fonts (polices web chargees a la demande)

## Phase 3 — Experience utilisateur

- [ ] Tutoriel interactif pour les enfants (premiere utilisation)
- [ ] Animations/transitions (ajout d'objets, changement d'outil)
- [ ] Sons/feedback tactile optionnel
- [ ] Mode sombre
- [ ] Themes de couleurs (saisons, fetes)
- [ ] Partage de creations (lien public, QR code)
- [ ] Impression directe (CSS @media print ou integration service d'impression)

## Phase 4 — Multi-vues et gabarits avances

- [ ] Vue avant / arriere / cote pour chaque gabarit
- [ ] Gabarits realistes (proportions corps humain)
- [ ] Mannequin personnalisable (taille, morphologie)
- [ ] Import de gabarits depuis images IA (Gemini/ChatGPT) avec masques de zones
- [ ] Parseur SVG automatique (deposer un .svg → zones detectees)
- [ ] Mesures reelles (cm) sur les gabarits

## Phase 5 — Pro / Fabrication

- [ ] Patrons techniques avec marges de couture
- [ ] Export PDF haute resolution pour impression textile
- [ ] Fiches techniques fabricant (specs tissu, couleurs Pantone)
- [ ] Bibliotheque de tissus/textures realistes
- [ ] Collaboration temps reel (plusieurs utilisateurs)
- [ ] API pour integration avec outils de production

## Stack technique

- **Frontend** : React 19, TypeScript, Vite, Tailwind CSS 4
- **Canvas** : Fabric.js 7
- **State** : Zustand 5
- **Auth + DB** : Supabase (Auth + PostgreSQL + RLS)
- **Storage local** : IndexedDB via idb (fallback quand Supabase non configure)
- **Routing** : React Router 7
- **Deploy** : Vercel

## Architecture cle

- `lib/storage.ts` : interface abstraite DesignStorage (Supabase ou IndexedDB)
- `stores/canvasStore.ts` : source de verite pour le canvas, calques, outils, historique
- `stores/garmentStore.ts` : gabarits et zones colorables
- `stores/authStore.ts` : auth Supabase + profils enfants
- `stores/galleryStore.ts` : CRUD designs, sauvegarde, export
- `stores/settingsStore.ts` : mode kid/avance (localStorage)
- `features/garments/templates.ts` : definition des gabarits (zones SVG en coordonnees canvas)
- `features/tools/shapeData.ts` : motifs decoratifs (paths SVG 100x100)
- `supabase/schema.sql` : schema DB (profiles + designs + RLS)

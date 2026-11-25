# Office Table Studio — 3D Configurator

A real-time 3D office-table configurator in the browser: set the dimensions,
pick a leg style and top finish, add a drawer unit or cable tray, and watch
the model, the parts list and the price (MAD, demo pricing) update live.

**Live demo:** https://husseinbouik.github.io/v0-3-d-office-table/

## Features

- Dimensions: width 120–200 cm, depth 60–90 cm, height 70–76 cm — the table
  rebuilds live, with dimension lines and a W × D × H readout
- Leg styles: 4-post, panel, U-frame — each changes the model and the price
- Top finishes: natural oak, walnut, Nordic white, graphite
- Add-ons: drawer unit (left / right), under-desk cable tray
- Live parts list + price computed from top area × finish rate + options
- Room scene with rug, walls, framed print and a plant — no external assets

## Stack

- Next.js (App Router) + React + TypeScript, static export
- Three.js via @react-three/fiber and @react-three/drei
- Plain CSS UI (floating control panel, bottom-sheet on mobile)

## Run locally

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

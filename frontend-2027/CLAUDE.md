# frontend-2027

Prototyping space for the 2027 recruiting-season portfolio (successor to `../frontend`).

- Concepts and decisions: see `IDEAS.md`
- Hard constraints: one route, ≤3 sections (~300vh): About → Projects → Timeline
- Planned stack: Vite + React + TS + Tailwind; react-three-fiber for 3D concepts; concepts switched via `?v=` query param
- Content source: latest resume + `../frontend/src/data.ts` (keep DevSwarm even if omitted from a given resume)
- Shipped: concept A (`src/concepts/a-split-hero`) was ported into `../frontend` as a standalone single-page site and deployed to https://michael-dickinson.com. Changes to A here do not reach the live site until ported again

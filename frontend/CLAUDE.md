# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

The active codebase lives entirely in `frontend/`. The sibling directories are design references only:

- `main_long_design/` — static HTML mockup of the main page layout
- `projects_section_and_theme/` — Next.js prototype used to explore the projects section and color theme
- `skills_vectors_design/` — static HTML mockup for the skills/tech stack section
- `images/` — reference screenshots

## Commands

All commands run from the `frontend/` directory. The package manager is `pnpm`.

```
pnpm dev          # start dev server (Vite)
pnpm build        # tsc typecheck + Vite production build
pnpm lint         # ESLint
pnpm preview      # preview production build locally
```

There are no tests.

## Architecture

Single-page React 19 app built with Vite, TypeScript, Tailwind CSS v4, and `wouter` for routing.

**Routing:** `App.tsx` uses wouter's `<Switch>` / `<Route>`. Currently one route (`/`) renders `pages/Home.tsx`.

**Page composition:** `Home.tsx` assembles the full page as a vertical stack of section components: `Nav → Hero → TechStack → Experience → Roadmap → Projects → Footer`.

**Data:** All static content (nav links, tech categories, experience entries, projects) lives in `src/data.ts` and is imported directly by components. There is no state management or API layer.

**Styling:** Tailwind CSS v4 configured via the `@tailwindcss/vite` plugin (no `tailwind.config.*` file). Design tokens are CSS custom properties defined in `src/index.css` using `oklch` color values, exposed as Tailwind theme tokens via `@theme inline`. Dark mode uses the `.dark` class strategy. Key utility classes defined in `index.css`:

- `.dot-matrix-bg` — radial-gradient dot pattern used as the page background
- `.glass-panel` — frosted glass card effect
- `.git-node` — ring shadow used in the Roadmap timeline nodes

**Fonts:** Inter (body), Space Grotesk (headings), Space Mono (mono) — loaded externally, referenced via CSS variables.

**Icons:** `lucide-react` for UI icons; Material Symbols icon font for tech category icons in `TechStack` (referenced by string name via `data.ts`).

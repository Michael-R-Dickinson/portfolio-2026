# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

- `frontend/` — the live site (this directory). Deployed to https://michael-dickinson.com.
- `../frontend-2027/` — prototyping space with several design concepts behind a switcher. This site is concept A ("split hero") ported out on its own; the other concepts are not shipped.
- `../infra/` — OpenTofu for S3, CloudFront, Route 53, and the deploy step (see the root `README.md`).

## Commands

All commands run from the `frontend/` directory. The package manager is `pnpm`.

```
pnpm dev          # start dev server (Vite)
pnpm build        # tsc typecheck + Vite production build
pnpm lint         # ESLint
pnpm preview      # preview production build locally
pnpm run deploy   # tofu apply in ../infra: build, sync to S3, invalidate CloudFront
```

There are no tests.

## Architecture

Single-page React 19 app built with Vite, TypeScript, and Tailwind CSS v4. There is no router: `App.tsx` is the whole page, and CloudFront serves `index.html` for every path.

**Page composition:** `App.tsx` renders `Hero → Projects → Timeline → footer`, all inside a `.concept-a` root element. Section components live in `src/components/`.

**Data:** All copy (profile, links, projects, timeline) lives in `src/content.ts` and is imported directly by components. `Projects.tsx` shows only the four project ids listed in its `PICKS` array. There is no state management or API layer.

**Styling:** The design lives in `src/styles.css` as plain CSS with `a-` prefixed class names, scoped under `.concept-a`, with its own CSS variables (`--a-serif`, `--a-sans`, ...). `src/index.css` only imports Tailwind (used for its base reset; components do not use utility classes).

**Fonts:** Newsreader (serif headings) and Inter Tight (sans body), loaded from Google Fonts via `@import` at the top of `styles.css`.

**Static files:** `public/resume.pdf` (linked from `content.ts` as `/resume.pdf`) and `public/aeac-2027-team-photo.jpg` (the hero photo; its path, dimensions, crop position, alt text, and caption are set in `src/photo.ts`).

## Gotchas

- In this shell `cat` is aliased to `bat`. Never write files with `cat > file` or `cat >> file` heredocs; the output gets terminal formatting characters. Use `command cat`, `printf`, or the Write/Edit tools.
- `pnpm deploy` (without `run`) is a pnpm built-in, not the package script. Use `pnpm run deploy`.

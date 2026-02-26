# Technology Stack

**Analysis Date:** 2026-02-26

## Languages

**Primary:**
- TypeScript 5.9.3 - All source code, configuration files, and React components
- JSX/TSX - React component syntax for UI layer

**Secondary:**
- CSS 3 - Styling via Tailwind CSS v4

## Runtime

**Environment:**
- Node.js 22.17.0 - JavaScript runtime

**Package Manager:**
- pnpm 10.13.1 - Monorepo-capable package manager
- Lockfile: `pnpm-lock.yaml` (version 9.0) - Present and up-to-date

## Frameworks

**Core:**
- React 19.2.4 - UI library for building components
- Vite 7.3.1 - Build tool and dev server (used instead of webpack/CRA)
- TypeScript 5.9.3 - Static type checking and compilation

**Routing:**
- wouter 3.9.0 - Lightweight client-side router for SPA navigation

**Styling:**
- Tailwind CSS 4.2.1 - Utility-first CSS framework
- @tailwindcss/vite 4.2.1 - Vite plugin for Tailwind CSS integration (no separate `tailwind.config.*` file)

**UI Components:**
- lucide-react 0.575.0 - Icon library providing SVG icons
- react-markdown 10.1.0 - Markdown rendering support

## Key Dependencies

**Critical:**
- react-dom 19.2.4 - React DOM rendering layer required for React 19
- lucide-react 0.575.0 - Icon system used throughout UI (hero, nav, projects)
- wouter 3.9.0 - Provides routing without external server requirements
- react-markdown 10.1.0 - Renders markdown content (used in experience descriptions and project details)

**Infrastructure:**
- @vitejs/plugin-react 5.1.4 - Enables React Fast Refresh in Vite dev server for hot module replacement

## Development Dependencies

**Linting & Type Checking:**
- @eslint/js 9.39.3 - ESLint JavaScript rules
- typescript-eslint 8.48.0 - TypeScript-specific linting rules and parser
- eslint 9.39.3 - Code linter for consistency and error detection
- eslint-plugin-react-hooks 7.0.1 - Rules for React Hooks best practices
- eslint-plugin-react-refresh 0.4.24 - Rules for Vite React Fast Refresh compatibility
- globals 16.5.0 - Global variable definitions for browser and Node.js environments

**Type Definitions:**
- @types/react 19.2.14 - React type definitions
- @types/react-dom 19.2.3 - React DOM type definitions
- @types/node 24.10.13 - Node.js type definitions for development tooling

## Configuration

**Environment:**
- Static configuration only — no `.env` files needed
- No runtime environment variables required
- All content (nav links, experience, projects, tech stack) sourced from `src/data.ts`

**Build:**
- `vite.config.ts` - Vite configuration with React plugin and Tailwind CSS plugin
- `tsconfig.json` - TypeScript compiler configuration references `tsconfig.app.json` and `tsconfig.node.json`
- `tsconfig.app.json` - App-specific TypeScript settings: ES2022 target, `strict` mode enabled, JSX as `react-jsx`
- `eslint.config.js` - Flat ESLint config with React, TypeScript, and React Hooks rules
- `.prettierrc` - Code formatter config (trailing commas: es5, tabs: 2, semicolons: false, quotes: single)

**HTML Entry:**
- `index.html` - Single HTML file with root div and module script loader
- External font links: Google Fonts (Inter, Space Grotesk, Space Mono) and Material Symbols icon font

## Platform Requirements

**Development:**
- Node.js 22.17.0+ (verified present)
- pnpm 10.13.1+ (verified present)
- macOS/Linux/Windows with standard build tools
- Browser with ES2022+ support for development

**Production:**
- Static site deployment target (AWS S3 + CloudFront per `src/data.ts`)
- Vite output: `dist/` directory with bundled assets
- No server-side rendering required
- No backend API dependencies

## Scripts

```bash
pnpm dev      # Start Vite dev server with hot reload
pnpm build    # Run TypeScript type check then Vite production build
pnpm lint     # Run ESLint on all files
pnpm preview  # Preview production build locally
```

## External Resources

**Fonts (CDN):**
- Google Fonts: Inter, Space Grotesk, Space Mono (loaded in `index.html`)
- Material Symbols Outlined icon font via `googleapis.com`

**No External APIs or SDKs:**
- No database integrations
- No authentication providers
- No third-party APIs
- No real-time data synchronization

---

*Stack analysis: 2026-02-26*

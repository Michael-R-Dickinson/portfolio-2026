# Codebase Structure

**Analysis Date:** 2026-02-26

## Directory Layout

```
portfolio/
├── frontend/                          # Active codebase (React SPA)
│   ├── src/
│   │   ├── main.tsx                  # Entry point, mounts React to DOM
│   │   ├── App.tsx                   # Router, defines routes (/, /prototype)
│   │   ├── index.css                 # Design tokens, Tailwind config, animations
│   │   ├── data.ts                   # Centralized static content
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Portfolio home page layout
│   │   │   └── Prototype.tsx         # Interactive prototype gallery
│   │   ├── components/
│   │   │   ├── Nav.tsx               # Fixed navigation bar
│   │   │   ├── Hero.tsx              # Hero section with bio and CTA buttons
│   │   │   ├── Experience.tsx        # Work experience timeline
│   │   │   ├── Projects.tsx          # Grid of project cards with links
│   │   │   ├── TechStack.tsx         # Tech categories with skill tags
│   │   │   ├── Roadmap.tsx           # Career timeline with visual nodes
│   │   │   ├── Footer.tsx            # Page footer
│   │   │   └── prototypes/           # Canvas-based visualizations
│   │   │       ├── EmbeddingSpace.tsx
│   │   │       ├── QueryRetrieval.tsx
│   │   │       ├── LatentPortrait.tsx
│   │   │       ├── CosineMeter.tsx
│   │   │       ├── ForceIndex.tsx
│   │   │       ├── ReactionDiffusion.tsx
│   │   │       ├── SemanticSearch.tsx
│   │   │       └── utils.ts          # Shared animation/math utilities
│   │   └── assets/                   # Images and static media
│   ├── public/                       # Static files (favicon, resume PDF)
│   ├── dist/                         # Production build output (generated)
│   ├── package.json                  # Dependencies, scripts
│   ├── tsconfig.json                 # TypeScript root config (references)
│   ├── tsconfig.app.json             # TypeScript app config
│   ├── tsconfig.node.json            # TypeScript build tool config
│   ├── vite.config.ts                # Vite build configuration
│   └── eslint.config.js              # ESLint rules
│
├── .planning/codebase/               # GSD documentation (this output)
│   ├── ARCHITECTURE.md
│   ├── STRUCTURE.md
│   ├── CONVENTIONS.md
│   ├── TESTING.md
│   └── CONCERNS.md
│
└── other reference directories (not active)
    ├── main_long_design/             # Static HTML mockup
    ├── projects_section_and_theme/   # Next.js prototype
    ├── skills_vectors_design/        # Static HTML mockup
    └── images/                       # Reference screenshots
```

## Directory Purposes

**`frontend/src/`:**
- Purpose: Root of TypeScript/React source code
- Contains: Entry point, router, pages, components, styles, data
- Key files: `main.tsx`, `App.tsx`, `index.css`, `data.ts`

**`frontend/src/pages/`:**
- Purpose: Page-level components mapped to routes
- Contains: Functional components that compose full-page layouts
- Key files: `Home.tsx` (main portfolio), `Prototype.tsx` (gallery)

**`frontend/src/components/`:**
- Purpose: Reusable UI components
- Contains: Section components (Nav, Hero, Experience, etc.) and card/item components
- Key files: `Nav.tsx`, `Hero.tsx`, `Projects.tsx`, `TechStack.tsx`, `Roadmap.tsx`, `Experience.tsx`, `Footer.tsx`

**`frontend/src/components/prototypes/`:**
- Purpose: Canvas-based interactive visualizations
- Contains: Seven different prototype implementations, shared utilities
- Key files: `EmbeddingSpace.tsx`, `ForceIndex.tsx`, `LatentPortrait.tsx`, `CosineMeter.tsx`, `QueryRetrieval.tsx`, `ReactionDiffusion.tsx`, `SemanticSearch.tsx`, `utils.ts`

**`frontend/src/assets/`:**
- Purpose: Image and media files
- Contains: Currently minimal/empty
- Generated: No
- Committed: Yes

**`frontend/public/`:**
- Purpose: Static assets served as-is by Vite dev server and included in build
- Contains: Resume PDF, favicon, any other static media
- Generated: No
- Committed: Yes

**`frontend/dist/`:**
- Purpose: Production build output
- Contains: Compiled JavaScript, HTML, optimized CSS, bundled assets
- Generated: Yes (run `pnpm build`)
- Committed: No (in `.gitignore`)

## Key File Locations

**Entry Points:**
- `frontend/src/main.tsx`: Creates React root and mounts `<App />` to DOM
- `frontend/src/App.tsx`: Defines wouter routing, renders active page based on URL
- `frontend/public/index.html`: (implicit in Vite) HTML template where React mounts
- Browser loads `src/main.tsx` via Vite's module resolution

**Configuration:**
- `frontend/package.json`: npm/pnpm scripts (`dev`, `build`, `lint`, `preview`), dependencies
- `frontend/tsconfig.json`: TypeScript compiler root config with project references
- `frontend/tsconfig.app.json`: TypeScript settings for app code
- `frontend/tsconfig.node.json`: TypeScript settings for build scripts
- `frontend/vite.config.ts`: Vite dev server and build configuration
- `frontend/eslint.config.js`: ESLint rules for code quality

**Core Logic:**
- `frontend/src/data.ts`: All static content (nav links, projects, experiences, tech categories, roadmap nodes)
- `frontend/src/index.css`: Design tokens (CSS custom properties), Tailwind theme configuration, global styles
- `frontend/src/pages/Home.tsx`: Portfolio page composition
- `frontend/src/pages/Prototype.tsx`: Prototype gallery composition

**Styling:**
- `frontend/src/index.css`: Single point of style configuration; defines:
  - CSS custom properties for colors (oklch values), fonts, sizing
  - `.dark` class selector for dark mode theme overrides
  - Tailwind `@theme inline` block exposing tokens to Tailwind utilities
  - Global classes: `.dot-matrix-bg` (dot pattern background), `.glass-panel` (frosted glass effect), `.git-node` (ring shadow), animations

**Testing:**
- None — no test files in codebase (see TESTING.md)

## Naming Conventions

**Files:**
- **Page components:** PascalCase, single file: `Home.tsx`, `Prototype.tsx`
- **Section components:** PascalCase, single file: `Nav.tsx`, `Hero.tsx`, `Projects.tsx`, `TechStack.tsx`, `Roadmap.tsx`, `Experience.tsx`, `Footer.tsx`
- **Prototype components:** PascalCase, single file in `prototypes/`: `EmbeddingSpace.tsx`, `ForceIndex.tsx`, etc.
- **Utility files:** camelCase: `utils.ts`
- **Config files:** Either camelCase (`vite.config.ts`, `eslint.config.js`) or snake.case with dots (`tsconfig.json`, `tsconfig.app.json`)
- **CSS:** Single file `index.css` imported globally in `main.tsx`

**Directories:**
- **Functional grouping:** lowercase plural: `pages/`, `components/`, `assets/`, `prototypes/`
- **No feature-based nesting:** Components are not grouped by feature (e.g., no `features/projects/` folder)

**Components (TypeScript):**
- **Functional exports:** Named exports with PascalCase: `export function Nav() { ... }`, `export function Hero() { ... }`
- **Nested helper components:** Defined as `function ComponentName()` (not exported) directly in the same file
- **Props types:** Destructured from data types or inferred from usage

**Functions:**
- **React components:** PascalCase: `Home`, `Hero`, `ProjectCard`, `RoadmapNode`
- **Utilities:** camelCase: `clamp`, `easeOut3`, `easeInOut`, `lerp`

## Where to Add New Code

**New Section Component (e.g., "Awards" section):**
- Location: `frontend/src/components/Awards.tsx`
- Pattern: Create named export function component, import relevant data from `data.ts`, compose card components
- Register: Add to section array in `Home.tsx` (in desired order)
- Data: Add new `awards` array to `data.ts` with type definition

**New Prototype Visualization:**
- Location: `frontend/src/components/prototypes/MyVisualization.tsx`
- Pattern: Use `useRef` for canvas, `useEffect` for lifecycle, `requestAnimationFrame` for animation loop
- Utilities: Reuse `clamp`, `lerp`, `easeInOut` from `utils.ts`
- Registration: Add entry to `SECTIONS` array in `Prototype.tsx`

**New Page/Route:**
- Location: `frontend/src/pages/MyPage.tsx`
- Pattern: Create named export function, compose section components or custom content
- Registration: Add `<Route path="/mypage" component={MyPage} />` to `App.tsx`

**New Utility Function:**
- Location: `frontend/src/components/prototypes/utils.ts` (if animation-related) or create new `utils.ts` in relevant directory
- Pattern: Export named function with clear parameters and return type
- Naming: camelCase, descriptive

**Shared Style Tokens:**
- Location: `frontend/src/index.css` in `:root` or `.dark` custom property definitions
- Pattern: Define CSS custom property (e.g., `--my-color: oklch(...)`), expose to Tailwind via `@theme inline`
- Usage: Reference in Tailwind classes or inline `style={{ color: 'var(--my-color)' }}`

**New Data Content:**
- Location: `frontend/src/data.ts`
- Pattern: Define type, export typed constant array or object
- Usage: Import directly in component, iterate/destructure in JSX

## Special Directories

**`frontend/node_modules/`:**
- Purpose: Installed npm/pnpm dependencies
- Generated: Yes (run `pnpm install`)
- Committed: No (in `.gitignore`)

**`frontend/dist/`:**
- Purpose: Production-ready build artifacts
- Generated: Yes (run `pnpm build`)
- Committed: No (in `.gitignore`)
- Build process: `tsc -b` (type check) → `vite build` (bundle, minify, output to dist/)

**`.planning/codebase/`:**
- Purpose: GSD (Get Shit Done) planning and documentation
- Generated: Yes (populated by `/gsd:map-codebase` commands)
- Committed: Yes
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md

---

*Structure analysis: 2026-02-26*

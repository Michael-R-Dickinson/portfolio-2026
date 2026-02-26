# Architecture

**Analysis Date:** 2026-02-26

## Pattern Overview

**Overall:** Single-Page Application (SPA) with Client-Side Rendering

**Key Characteristics:**
- Vertical section composition: app renders a fixed linear page layout of reusable section components
- Static content model: all data (nav, projects, experience, tech stack) loaded from a single centralized data file
- Component-driven rendering: each major page section is an independent, self-contained component
- Canvas-based interactive elements: prototype components use Canvas APIs for rendering animated graphics
- No state management layer: no Redux, Context, or similar state abstraction — components receive data through props or direct imports

## Layers

**Presentation Layer:**
- Purpose: Render UI elements and handle user interaction
- Location: `src/components/`
- Contains: React functional components, Canvas-based visualizations, styled with Tailwind CSS utility classes
- Depends on: `src/data.ts` for content, `lucide-react` for icons, `react-markdown` for content rendering
- Used by: Page components in `src/pages/`

**Page Layer:**
- Purpose: Orchestrate full page layout and route-specific composition
- Location: `src/pages/` (`Home.tsx`, `Prototype.tsx`)
- Contains: Page components that assemble section components into final layouts
- Depends on: Presentation layer components
- Used by: Routing layer (`App.tsx`)

**Routing Layer:**
- Purpose: Map URL paths to page components
- Location: `src/App.tsx`
- Contains: wouter `<Switch>` and `<Route>` definitions for `/` and `/prototype` paths
- Depends on: Page layer components
- Used by: Entry point (`main.tsx`)

**Data Layer:**
- Purpose: Centralized static content and configuration
- Location: `src/data.ts`
- Contains: Typed constants for nav links, hero bio, tech categories, experiences, projects, roadmap nodes
- Depends on: None (zero external dependencies)
- Used by: All presentation layer components that need content

**Style Layer:**
- Purpose: Theme tokens, design system definitions, and utility classes
- Location: `src/index.css`
- Contains: CSS custom properties for colors/typography, Tailwind theme configuration via `@theme inline`, global animations
- Depends on: Tailwind CSS v4, `@tailwindcss/vite` plugin
- Used by: All components via Tailwind class syntax

## Data Flow

**Static Content → Component Props:**

1. `src/data.ts` defines content objects (e.g., `experiences`, `projects`, `techCategories`, `roadmapNodes`)
2. Components import these objects directly: `import { experiences } from '../data'`
3. Components iterate and render: `.map(item => <Component {...item} />`
4. No mutations or state updates occur

**Example - Projects section flow:**
```
src/data.ts → projects[]
  ↓
Projects.tsx imports projects
  ↓
Projects.tsx maps over projects array
  ↓
ProjectCard component destructures individual project
  ↓
JSX renders title, description, tags, link
```

**Canvas-Based Graphics Flow:**

1. Prototype page loads sections from static `SECTIONS` array in `Prototype.tsx`
2. Each section includes a Canvas component (e.g., `<EmbeddingSpace />`)
3. Canvas components use `useRef` to access `<canvas>` element
4. `useEffect` hook sets up animation loop: `requestAnimationFrame`
5. Mouse tracking via `onMouseMove` updates state for interactive elements
6. Canvas context (`ctx.drawImage`, `ctx.fillRect`, etc.) renders each frame

**State Management:**

- **None at page/app level**: no Context API, no Redux, no signals
- **Local component state only**: Canvas prototypes use `useRef` for animation frame ID, `useState` for mouse position
- **No side effects across components**: each section is isolated
- **Content flows unidirectionally**: data file → components → DOM

## Key Abstractions

**Section Component:**
- Purpose: Represents a major page section (Hero, TechStack, Experience, Projects, Roadmap, Footer, Nav)
- Examples: `Hero.tsx`, `TechStack.tsx`, `Experience.tsx`, `Projects.tsx`, `Roadmap.tsx`, `Footer.tsx`, `Nav.tsx`
- Pattern: Functional React component that accepts no props, imports its own data, composes child components or card components
- Responsibility: Handle section-level layout and theming (e.g., `py-20`, `bg-card/20`)

**Card Component (Nested):**
- Purpose: Render individual items within a section (ProjectCard, TechCard, ExperienceItem, RoadmapNode)
- Examples: `ProjectCard` in `Projects.tsx`, `TechCard` in `TechStack.tsx`, `ExperienceItem` in `Experience.tsx`, `RoadmapNode` in `Roadmap.tsx`
- Pattern: Destructures typed props from parent section data, renders styled JSX
- Responsibility: Translate data object into DOM, apply visual logic (hover effects, conditional styling)

**Prototype Component:**
- Purpose: Canvas-based interactive or animated visualization
- Examples: `EmbeddingSpace.tsx`, `ForceIndex.tsx`, `LatentPortrait.tsx`, `CosineMeter.tsx`, `QueryRetrieval.tsx`, `ReactionDiffusion.tsx`, `SemanticSearch.tsx`
- Pattern: `useRef(null)` for canvas DOM reference, `useEffect` for setup/cleanup, `requestAnimationFrame` for animation loop, optional `useState` for mouse tracking
- Responsibility: Manage Canvas lifecycle, render graphics each frame, handle user interaction via mouse events

**Utility Functions:**
- Purpose: Shared math/animation helpers used across prototype components
- Location: `src/components/prototypes/utils.ts`
- Exports: `Mouse` type, `clamp()`, `easeOut3()`, `easeInOut()`, `lerp()`
- Used by: All prototype components for animation timing and coordinate manipulation

## Entry Points

**Browser Entry Point:**
- Location: `src/main.tsx`
- Triggers: Script tag in `index.html` (built by Vite)
- Responsibilities: Mount React app to `#root` element, wrap in `<StrictMode>` for dev warnings

**App Router Entry Point:**
- Location: `src/App.tsx`
- Triggers: Mounted by `main.tsx`
- Responsibilities: Define routing rules via wouter, render active page component based on URL

**Home Page Entry Point:**
- Location: `src/pages/Home.tsx`
- Triggers: Route `/` matches
- Responsibilities: Assemble full portfolio page from section components (Nav → Hero → Experience → Projects → TechStack → Roadmap → Footer)

**Prototype Gallery Entry Point:**
- Location: `src/pages/Prototype.tsx`
- Triggers: Route `/prototype` matches
- Responsibilities: Display all Canvas-based prototype visualizations with descriptions, provide anchor-based navigation

## Error Handling

**Strategy:** Defensive rendering with no explicit error boundaries

**Patterns:**
- Components assume data is always present (no null checks on imports from `data.ts`)
- TypeScript types enforce shape of data objects (`Project`, `RoadmapNode`, etc.)
- Canvas components silently fail if `ref.current` is null — `useEffect` guards with conditional check
- No try/catch or explicit error logging — failures result in missing DOM elements or blank canvas

## Cross-Cutting Concerns

**Logging:**
- No centralized logging
- Console is not used in production code
- Debugging relies on browser DevTools

**Validation:**
- Data validation occurs at compile-time via TypeScript types only
- No runtime schema validation (e.g., zod, yup)
- Assumes `data.ts` content is always valid

**Authentication:**
- Not applicable — site is public, no auth required
- Resume PDF download is client-side (no backend)

**Styling & Theming:**
- Centralized token system via CSS custom properties in `:root` and `.dark` selectors in `index.css`
- Dark mode enabled via `.dark` class strategy
- Color and typography tokens injected into Tailwind via `@theme inline`
- All interactive hover/active states defined in component Tailwind classes

**Responsiveness:**
- Tailwind breakpoints drive layout shifts: `md:` and `lg:` prefixes
- Components use `flex-col md:flex-row` for mobile-first stacking
- Prototype page hides Roadmap on mobile (`hidden md:block`)
- Hero section canvas visualization hides on mobile (`hidden md:block`)

---

*Architecture analysis: 2026-02-26*

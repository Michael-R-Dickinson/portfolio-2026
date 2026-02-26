# Codebase Concerns

**Analysis Date:** 2026-02-26

## No Test Coverage

**Entire codebase lacks automated tests:**
- Issue: Application has zero test files. No unit, integration, or E2E tests despite heavy reliance on complex canvas animations and React component rendering.
- Files affected: All source files in `src/`
- Impact: Cannot safely refactor prototype components, risk regressions in animation logic, no verification of data transformations in Markdown parsing
- Fix approach: Add Jest/Vitest with React Testing Library for component tests, canvas animation smoke tests

## Missing Resume File Handling

**Download button references static file that may not exist:**
- Issue: `src/components/Hero.tsx` (line 48) downloads from `/Michael%20Dickinson%20Resume.pdf` with hardcoded filename. File existence is not validated.
- Files: `src/components/Hero.tsx` (line 48)
- Impact: 404 on download button click creates poor user experience
- Fix approach: Verify file exists at build time or host in public/ with proper path, add error handling for failed downloads

## Hardcoded Magic Numbers and Configuration

**Complex canvas animations contain scattered magic numbers:**
- Issue: Files like `src/components/prototypes/ForceIndex.tsx` have ~80 hardcoded configuration values (FORCE_CONFIG object, coordinates, physics parameters) making it difficult to tune animations or understand intent
- Files:
  - `src/components/prototypes/ForceIndex.tsx` (lines 48-81) - FORCE_CONFIG object
  - `src/components/prototypes/EmbeddingSpace.tsx` - inline scale/focal calculations
  - `src/components/prototypes/ReactionDiffusion.tsx` - hardcoded grid parameters (130x130 GW/GH)
  - `src/components/prototypes/LatentPortrait.tsx` - particle generation thresholds and hardcoded region detection
  - `src/components/prototypes/QueryRetrieval.tsx` - timeline constants (600ms, 900ms delays)
- Impact: Animation tweaks require deep code diving; impossible to create theme-agnostic values; makes prototypes fragile to specification changes
- Fix approach: Extract all magic numbers to top-level constants with semantic names; document animation timing sequences

## Fragile Canvas Animation Timing

**Looping animations use modulo for timing which can cause glitches:**
- Issue: `src/components/prototypes/QueryRetrieval.tsx` (line 49) uses `(Date.now() - t0Ref.current) % LOOP` for animation cycling. Resets can cause visual discontinuities if not perfectly synchronized.
- Files: `src/components/prototypes/QueryRetrieval.tsx` (line 49)
- Impact: Animation may stutter on loop completion, especially visible on lower-end devices or under CPU stress
- Fix approach: Use cubic-bezier easing with explicit phase tracking instead of modulo wrapping; add frame skipping detection

## Data Synchronization Issue in Roadmap

**Roadmap shows future goals hardcoded separately from experience data:**
- Issue: Experience timeline data in `src/data.ts` (experiences array) and roadmap timeline data (roadmapNodes array) are separate. Dates and descriptions can drift if one is updated without the other.
- Files: `src/data.ts` (lines 42-206)
- Impact: Portfolio content becomes out of sync if only one timeline is updated; increases maintenance burden
- Fix approach: Consider deriving roadmap nodes from experience data + additional milestones, or establish single source of truth

## Prototype Components Are Large and Complex

**Individual prototype files exceed 180-430 lines with minimal abstraction:**
- Issue: `src/components/prototypes/ForceIndex.tsx` is 432 lines of physics simulation, rendering, and animation logic all in one file. `QueryRetrieval.tsx` (193 lines), `LatentPortrait.tsx` (184 lines) follow similar pattern.
- Files:
  - `src/components/prototypes/ForceIndex.tsx` (432 lines)
  - `src/components/prototypes/QueryRetrieval.tsx` (193 lines)
  - `src/components/prototypes/LatentPortrait.tsx` (184 lines)
- Impact: Difficult to test individual aspects (physics, rendering, timing); high cognitive load for understanding animation flow; duplication of utility functions (clamp, lerp, easeOut3 repeated across files)
- Fix approach: Extract physics engine (force simulation) into separate module; extract canvas rendering helpers into utility functions; use composition for animation state management

## Canvas Rendering Performance Not Optimized

**No requestAnimationFrame throttling or frame rate limiting:**
- Issue: All prototype components run draw() at native screen refresh rate (60+ fps) without consideration for frame budget or lower-end devices. `ReactionDiffusion.tsx` simulates 130x130 grid with 6 steps per frame.
- Files: All prototype components in `src/components/prototypes/`
- Impact: High CPU/GPU usage, drains battery on mobile devices, potential janky rendering under concurrent load
- Fix approach: Implement frame rate capping (e.g., 30fps option), add requestIdleCallback for simulation steps, profile performance on actual devices

## Unsafe Canvas Context Access

**No null checking after getContext('2d') in some files:**
- Issue: Code like `const ctx = canvas.getContext('2d')!` (with non-null assertion) assumes context will always succeed. Browser can return null in rare cases (canvas size exceeds limits, memory pressure).
- Files: Multiple files use the `!` pattern:
  - `src/components/prototypes/ForceIndex.tsx` (line 103)
  - `src/components/prototypes/EmbeddingSpace.tsx` (line 57)
  - `src/components/prototypes/ReactionDiffusion.tsx` (line 12)
  - All other prototype files
- Impact: Silent failure or crash if context initialization fails, no user-facing error message
- Fix approach: Add proper null check and fallback rendering (e.g., return error component or static fallback)

## MouseRef Lifecycle Gaps

**Mouse event tracking can persist after component unmount:**
- Issue: `src/components/prototypes/ReactionDiffusion.tsx` and `LatentPortrait.tsx` store `mouseRef.current` state. If component unmounts while mouse is over canvas, cleanup may not fire correctly depending on browser event timing.
- Files:
  - `src/components/prototypes/ReactionDiffusion.tsx` (lines 113-122)
  - `src/components/prototypes/LatentPortrait.tsx` (lines 172-181)
- Impact: Potential memory leak if mouseRef holds references after unmount; edge case risk in React StrictMode double-mount scenarios
- Fix approach: Ensure cleanup function captures and clears all refs; use useCallback to bind event handlers

## Prototype Page Not Linked

**Prototype showcase page exists but is unreachable from main navigation:**
- Issue: `/prototype` route exists in `src/App.tsx` with 7 complex visualizations, but `src/data.ts` navigation links don't include a path to it. Discoverable only via direct URL.
- Files: `src/App.tsx` (lines 8-9), `src/data.ts` (navLinks array)
- Impact: Prototype page work is hidden from portfolio viewers; route can bit-rot if not actively used
- Fix approach: Add prototype link to navigation or clearly document it as internal/development-only page

## Missing Error Boundaries

**No error boundary wrapping canvas components:**
- Issue: If any prototype canvas component throws during initialization or rendering, entire page fails to load. No graceful degradation.
- Files: `src/pages/Prototype.tsx` (renders all 7 components directly)
- Impact: Single animation bug breaks prototype showcase; poor UX if canvas initialization fails
- Fix approach: Wrap each prototype component in error boundary with fallback UI

## Markdown Parsing Not Sanitized

**react-markdown used without explicit sanitization:**
- Issue: `src/components/Hero.tsx`, `Experience.tsx`, `Roadmap.tsx`, `Projects.tsx` all use `ReactMarkdown` with custom component overrides but no HTML sanitization rules.
- Files:
  - `src/components/Hero.tsx` (lines 20-33)
  - `src/components/Experience.tsx` (lines 35-46)
  - `src/components/Roadmap.tsx` (lines 35-43, 60-68, 86-94)
  - `src/components/Projects.tsx` (lines 39-51)
- Impact: If data.ts is ever populated from external source, XSS vulnerability exists. Currently mitigated by static data, but risk if data source changes.
- Fix approach: Add explicit markdown parsing rules, disable dangerous HTML tags, use rehype-sanitize plugin

## TypeScript Unused Variables Not Caught

**TypeScript strict mode enabled but some patterns slip through:**
- Issue: `src/tsconfig.app.json` sets `noUnusedLocals` and `noUnusedParameters` to true, but files like `src/pages/Prototype.tsx` destructure component props that may not be fully consumed.
- Files: Possible but not verified without full type analysis
- Impact: Low impact due to strict mode enforcement, but indicates potential unused code paths
- Fix approach: Run `tsc` in CI to catch these; already partially configured

## No Loading or Error States

**Prototype page has no loading skeleton or error fallback:**
- Issue: `src/pages/Prototype.tsx` renders 7 complex canvas components. If one fails, no indication to user. No loading state while canvas initializes.
- Files: `src/pages/Prototype.tsx`
- Impact: Perceived slow load if animations take time to compile; unclear if page is frozen or just loading
- Fix approach: Add Suspense boundaries or manual loading states; render canvas with loading spinner overlay

## Browser Compatibility Not Tested

**Advanced canvas APIs used without fallback detection:**
- Issue: `LatentPortrait.tsx` and `LatentPortrait.tsx` use `ctx.roundRect()` (line 152 in LatentPortrait, line 159 in QueryRetrieval) which is not supported in all browsers.
- Files:
  - `src/components/prototypes/LatentPortrait.tsx` (line 152)
  - `src/components/prototypes/QueryRetrieval.tsx` (line 159)
- Impact: Page breaks in older browsers (Safari <15.4, Firefox <97); rounded rect fallback not implemented
- Fix approach: Check browser support at runtime, provide fallback using regular `rect()` or draw circles

## Tailwind CSS Version Pinned to Experimental V4

**Using Tailwind v4 (@tailwindcss/vite) which is still evolving:**
- Issue: `src/index.css` uses `@theme inline` syntax and `@tailwindcss/vite` plugin which is relatively new. Potential breaking changes in minor releases.
- Files: `frontend/package.json` (line 13), `src/index.css` (lines 50-84)
- Impact: Future Tailwind updates may require config rewrites; custom property syntax is non-standard
- Fix approach: Monitor Tailwind v4 releases; consider pinning to specific version; add custom property fallbacks for older browsers

## Hard-coded Material Symbols Icons

**Icon names loaded as strings from data without type safety:**
- Issue: `src/data.ts` (techCategories, roadmapNodes) and `src/components/` reference Material Symbols icon names as strings like 'memory', 'terminal', 'dns'. No validation that icons actually exist.
- Files:
  - `src/data.ts` (lines 12, 17, 22, 27)
  - `src/components/TechStack.tsx` (line 15)
  - `src/components/Hero.tsx` (lines 43, 52)
- Impact: Broken icons if icon name is misspelled; runtime error if icon doesn't exist
- Fix approach: Create typed icon enum; validate against Material Symbols catalog at build time

## Accessibility Concerns

**Multiple accessibility issues present:**
- Issues:
  1. Canvas elements in prototypes have no alt text or ARIA labels
  2. Focus management not handled for interactive canvas (ReactionDiffusion, LatentPortrait)
  3. Keyboard navigation not supported for hover-only interactions
  4. Color-only indicators (e.g., green/red in QueryRetrieval) may not be distinguishable to colorblind users
- Files: All prototype components, `src/pages/Prototype.tsx`
- Impact: Not accessible to screen reader users or keyboard-only users; fails WCAG 2.1 AA compliance
- Fix approach: Add ARIA roles, implement keyboard focus handlers, add text labels alongside color indicators, test with accessibility tools

## Development vs Production Build Inconsistency

**No environment-based optimization or feature flags:**
- Issue: All animation parameters run the same in dev and production. No ability to disable expensive animations in production or reduce complexity for slower devices.
- Files: All prototype components
- Impact: Cannot ship different experience to mobile vs desktop users; cannot A/B test animation styles
- Fix approach: Add environment detection, create feature flag system, load animation configs from environment

---

*Concerns audit: 2026-02-26*

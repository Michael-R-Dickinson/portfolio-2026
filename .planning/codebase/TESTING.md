# Testing Patterns

**Analysis Date:** 2026-02-26

## Test Framework

**Status:** Not detected

No test framework is configured or used in this codebase.

**Notable:**
- No Jest configuration
- No Vitest configuration
- No test files in `src/` directory
- Package.json scripts contain no test command
- Development dependencies do not include testing libraries

## Test File Organization

**Not applicable**

This project has no automated tests.

## Testing Approach

**Current State:**
- Portfolio is a single-page React application with static data
- No API calls or backend integration
- No complex business logic requiring unit tests
- Manual testing only (browser-based)

**Why No Tests:**
- Static rendering of data from `src/data.ts`
- Component composition is straightforward (no conditional rendering logic)
- Interactive elements (canvas animation, navigation) are minimal
- Low-risk code surface (data transformations are trivial)

## Component Testing Gaps

If testing were to be introduced, the following would be candidates:

**Canvas Animation (`ForceIndex.tsx`):**
- Complex physics simulation with configuration constants
- Animation timing and rendering logic
- State management (node positions, velocities)
- Could benefit from snapshot tests for rendering or unit tests for force calculations

**Data Transformations (`data.ts`):**
- Static exports, no transformation logic
- Type safety provided by TypeScript compiler

**Navigation (`Nav.tsx`, `App.tsx`):**
- Simple route rendering via wouter
- Link generation from data
- Could benefit from integration tests if routing becomes complex

## Mocking

**Not applicable** - no tests present

If tests were added:
- Would likely mock `react-markdown` for component tests
- Would mock canvas context in `ForceIndex` tests
- Would import and use static test data from modified `data.ts`

## Fixtures and Factories

**Not applicable** - no tests present

All test data would come from `src/data.ts` exports directly.

## Coverage

**Requirements:** Not enforced

No code coverage requirements or tooling present.

## Manual Testing Strategy

**Browser Testing:**
- All functionality is verified through browser interaction
- Testing includes:
  - Page loads and renders correctly
  - Navigation links scroll to sections
  - Responsive design works at breakpoints
  - Canvas animation plays smoothly
  - Dark mode toggle (via `.dark` class)
  - External links open correctly

**Development Workflow:**
- `pnpm dev` starts Vite dev server with HMR
- Visual inspection in browser during development
- `pnpm build && pnpm preview` for production build testing

## When Tests Should Be Added

Consider adding tests if:
1. Physics simulation in `ForceIndex.tsx` becomes more complex
2. Data transformations are added to `data.ts`
3. Conditional rendering or state management is introduced
4. API integration is added (would require network mocking)
5. Form validation logic is implemented
6. Route handling becomes more sophisticated

## Recommended Test Stack

If testing is needed in the future:
- **Runner:** Vitest (modern, Vite-integrated)
- **Component testing:** Vitest + React Testing Library
- **Canvas testing:** Manual snapshots or pixel-comparison testing
- **E2E:** Playwright (already used in projects, minimal overhead)

---

*Testing analysis: 2026-02-26*

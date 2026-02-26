# Coding Conventions

**Analysis Date:** 2026-02-26

## Naming Patterns

**Files:**
- Components: PascalCase, exported as named exports (`export function ComponentName()`)
- Data/utilities: camelCase (`data.ts`, `utils.ts`)
- Types are defined inline with the code or exported from data files
- Prototype components live in subdirectories: `src/components/prototypes/`

**Functions:**
- camelCase for all function declarations
- React components use PascalCase
- Helper functions use camelCase (e.g., `clamp`, `easeOut3`, `lerp`)
- Event handlers inline: `handleClick`, `handleChange` (though minimal event handling in this codebase)

**Variables:**
- camelCase for all variables and constants
- UPPERCASE_SNAKE_CASE for configuration objects and animation constants (e.g., `FORCE_CONFIG`, `FORCE_NODES_DATA`, `FORCE_COLORS`)

**Types:**
- PascalCase for custom types (e.g., `type Project`, `type RoadmapNode`, `type FNode`)
- Type definitions use destructuring patterns in parameters: `{ icon, title, skills }: { icon: string; title: string; skills: string[] }`

## Code Style

**Formatting:**
- Prettier with specific settings:
  - No semicolons (`"semi": false`)
  - Single quotes (`"singleQuote": true`)
  - Tab width: 2 spaces (`"tabWidth": 2`)
  - Trailing commas: ES5 style (`"trailingComma": "es5"`)
- All files are auto-formatted by Prettier

**Linting:**
- ESLint with TypeScript support
- Config: `eslint.config.js` using flat config format
- Extends: JS recommended, TypeScript recommended, React Hooks recommended, React Refresh recommended
- No additional custom rules beyond defaults

## Import Organization

**Order:**
1. React and third-party imports (`react`, `react-dom`, `lucide-react`, `react-markdown`)
2. Routing/navigation imports (`wouter`)
3. Local component imports
4. Local utility/data imports

Example from `App.tsx`:
```typescript
import { Route, Switch } from 'wouter'
import { Home } from './pages/Home'
import { Prototype } from './pages/Prototype'
```

**Path Aliases:**
- Not used. Imports use relative paths exclusively
- Examples: `../data`, `../components/Nav`, `./utils`

## Error Handling

**Patterns:**
- Minimal error handling in this codebase
- No try-catch blocks observed
- Props are typed but not validated at runtime
- Component rendering assumes data validity
- Canvas operations use optional chaining: `const ctx = canvas.getContext('2d')!` (non-null assertion)

## Logging

**Framework:** Not applicable

- `console` is not used for logging in application code
- No logging infrastructure present

## Comments

**When to Comment:**
- Sparse use of comments
- Comments are explanatory for complex logic
- Example from `ForceIndex.tsx`: `// Handle high-DPI (Retina) displays`
- Configuration objects are self-documenting via constant names

**JSDoc/TSDoc:**
- Not used in this codebase
- Types are inline or exported

## Function Design

**Size:**
- Functions are generally concise and focused
- React components are single-responsibility
- Helper functions are short utilities (3-8 lines typical)
- Example: `clamp` is 1 line, `lerp` is 1 line

**Parameters:**
- Destructured parameters preferred for components: `{ icon, title, skills }: { icon: string; title: string; skills: string[] }`
- Single parameters for utilities: `clamp(v, lo, hi)`, `easeOut3(t)`

**Return Values:**
- Components return JSX (React.ReactElement)
- Utilities return primitives or simple types
- Consistent return types via TypeScript

## Module Design

**Exports:**
- Named exports preferred for components: `export function ComponentName()`
- Default exports used only for pages and `App.tsx`
- Example from `Nav.tsx`: `export function Nav()`

**Barrel Files:**
- No barrel files used (`index.ts` exports)
- Each component is imported directly by path

## React Patterns

**Component Composition:**
- Functional components exclusively
- Hooks used for side effects: `useEffect`, `useRef`
- Props passed directly to child components
- Example: `<ProjectCard key={project.title} {...project} />`

**State Management:**
- No state management library (Redux, Zustand, etc.)
- Static data imported from `src/data.ts`
- Component-level refs for canvas: `useRef<HTMLCanvasElement>(null)`

**Styling:**
- Tailwind CSS v4 exclusively
- Utility classes applied via `className` prop
- CSS custom properties for design tokens in `src/index.css`
- No inline styles or CSS Modules
- Dark mode via `.dark` class strategy

**Props Patterns:**
- Props destructured in function signature
- Spread operator for passing through data: `{...project}`
- Optional props use `?:` notation in types

## TypeScript Configuration

**Strict Mode:** Enabled
- `"strict": true`
- `"noUnusedLocals": true`
- `"noUnusedParameters": true`
- `"noFallthroughCasesInSwitch": true`

## Import Extensions

**Verbatim Module Syntax:**
- `"verbatimModuleSyntax": true` enforced
- Type-only imports use explicit `type` keyword: `import type { Mouse }`
- Regular imports omit the `type` keyword

Example from `utils.ts`:
```typescript
export type Mouse = { x: number; y: number } | null
```

---

*Convention analysis: 2026-02-26*

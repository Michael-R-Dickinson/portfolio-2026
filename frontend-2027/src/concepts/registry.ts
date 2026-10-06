import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

// One entry per concept. Each concept lives in src/concepts/<slug>/ and default-exports its page from Page.tsx.
// Pages are lazy-loaded so one concept's deps/CSS only load on its route.
export type Concept = {
  letter: string
  slug: string
  name: string
  blurb: string
  Page: LazyExoticComponent<ComponentType>
}

export const concepts: Concept[] = [
  {
    letter: 'a',
    slug: 'a-split-hero',
    name: 'Split hero',
    blurb: 'Bio column + full-bleed team photo, 2×2 projects, vertical timeline',
    Page: lazy(() => import('./a-split-hero/Page')),
  },
  {
    letter: 'b',
    slug: 'b-plain-document',
    name: 'Plain document',
    blurb: 'Serif, narrow column, blue underlined links, old-school homepage',
    Page: lazy(() => import('./b-plain-document/Page')),
  },
  {
    letter: 'c',
    slug: 'c-terminal',
    name: 'Terminal',
    blurb: 'Monospace, $ whoami headers, git log --graph timeline',
    Page: lazy(() => import('./c-terminal/Page')),
  },
  {
    letter: 'd',
    slug: 'd-drone-flythrough',
    name: 'Drone flythrough',
    blurb: '3D drone flies the page on scroll; timeline as a flight path',
    Page: lazy(() => import('./d-drone-flythrough/Page')),
  },
  {
    letter: 'g',
    slug: 'g-slam-reconstruction',
    name: 'SLAM reconstruction',
    blurb: 'Sparse point cloud reconstructs as you scroll; camera trajectory timeline',
    Page: lazy(() => import('./g-slam-reconstruction/Page')),
  },
  {
    letter: 'i',
    slug: 'i-exploded-drone',
    name: 'Exploded-view drone',
    blurb: 'Scroll explodes the drone into labeled parts that map to work',
    Page: lazy(() => import('./i-exploded-drone/Page')),
  },
]

import type { ReactNode } from 'react'

// Opens links (incl. the resume PDF) in a new tab; mailto stays as-is.
export function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  const external = !href.startsWith('mailto:')
  return (
    <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {children}
    </a>
  )
}

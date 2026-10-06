import { Link } from 'wouter'
import { concepts } from '../concepts/registry'

export function ConceptIndex() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 font-sans text-neutral-900">
      <h1 className="text-2xl font-semibold">Portfolio 2027 — concepts</h1>
      <p className="mt-2 text-neutral-500">Each concept is its own route. See IDEAS.md.</p>
      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {concepts.map((c) => (
          <li key={c.letter}>
            <Link href={`/${c.letter}`} className="flex gap-4 py-4 hover:bg-neutral-50">
              <span className="w-8 font-mono text-neutral-400 uppercase">{c.letter}</span>
              <span>
                <span className="font-medium">{c.name}</span>
                <span className="block text-sm text-neutral-500">{c.blurb}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}

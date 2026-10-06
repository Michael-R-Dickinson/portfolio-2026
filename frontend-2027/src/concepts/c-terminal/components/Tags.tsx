export function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null
  return (
    <ul className="ct-tags" aria-label="tags">
      {tags.map((t) => (
        <li key={t}>[{t.toLowerCase()}]</li>
      ))}
    </ul>
  )
}

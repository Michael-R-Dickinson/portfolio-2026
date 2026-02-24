import { useEffect, useState } from 'react'

const SS_QUERIES = [
  {
    text: 'infrastructure engineering at scale',
    results: [
      { title: 'SRE — Accenture', sub: 'Experience', score: 0.97 },
      { title: 'Kubernetes Platform', sub: 'Project', score: 0.93 },
      { title: 'Terraform Infra-as-Code', sub: 'Project', score: 0.9 },
      { title: 'CI/CD Automation', sub: 'Project', score: 0.85 },
    ],
  },
  {
    text: 'building ML models from scratch pytorch',
    results: [
      { title: 'ML Research — UNC', sub: 'Research', score: 0.97 },
      { title: 'Neural Net from Scratch', sub: 'Project', score: 0.93 },
      { title: 'NLP Sentiment Pipeline', sub: 'Project', score: 0.88 },
      { title: 'Data Science Intern', sub: 'Experience', score: 0.82 },
    ],
  },
  {
    text: 'applied ML with deployment pipeline',
    results: [
      { title: 'Job Application Automation', sub: 'Project', score: 0.97 },
      { title: 'Embedding Search Engine', sub: 'Project', score: 0.94 },
      { title: 'MLOps Engineering', sub: 'Experience', score: 0.9 },
      { title: 'Model Drift Monitor', sub: 'Project', score: 0.84 },
    ],
  },
]

function ssScoreColor(s: number): string {
  if (s >= 0.93) return '#34d399'
  if (s >= 0.87) return '#60a5fa'
  return '#94a3b8'
}

export function SemanticSearch() {
  const [qi, setQi] = useState(0)
  const [typed, setTyped] = useState(0)
  const [cards, setCards] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const query = SS_QUERIES[qi]
    let cleared = false
    setTyped(0)
    setCards(0)
    setFading(false)

    let chars = 0
    function type() {
      if (cleared) return
      chars++
      setTyped(chars)
      if (chars < query.text.length) setTimeout(type, 52)
      else setTimeout(showCards, 550)
    }

    let c = 0
    function showCards() {
      if (cleared) return
      c++
      setCards(c)
      if (c < query.results.length) {
        setTimeout(showCards, 330)
      } else {
        setTimeout(() => {
          if (cleared) return
          setFading(true)
          setTimeout(() => {
            if (!cleared) setQi((prev) => (prev + 1) % SS_QUERIES.length)
          }, 650)
        }, 2400)
      }
    }

    setTimeout(type, 400)
    return () => {
      cleared = true
    }
  }, [qi])

  const query = SS_QUERIES[qi]

  return (
    <div
      className="w-full h-full p-5 flex flex-col gap-3"
      style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.6s ease' }}
    >
      <p
        className="text-[10px] font-mono uppercase tracking-widest"
        style={{ color: 'var(--primary)' }}
      >
        semantic vector search
      </p>
      <div
        className="flex items-center gap-2.5 rounded-lg px-3.5 py-2.5"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          style={{ color: '#64748b', flexShrink: 0 }}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className="font-mono text-[11px] text-slate-200 flex-1 min-w-0">
          {query.text.slice(0, typed)}
          <span
            className="inline-block w-px h-[12px] align-middle ml-px"
            style={{
              backgroundColor: 'var(--primary)',
              animation: 'ss-blink 1s step-end infinite',
            }}
          />
        </span>
        <span className="text-[9px] font-mono text-slate-600 shrink-0">
          ada-002
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {query.results.slice(0, cards).map((r, i) => (
          <div
            key={`${qi}-${i}`}
            className="rounded-md px-3 py-2"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              animation: 'ss-slide-in 0.22s ease forwards',
            }}
          >
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <span className="font-mono text-[11px] text-slate-200 font-medium truncate">
                {r.title}
              </span>
              <span
                className="font-mono text-[11px] font-bold tabular-nums shrink-0"
                style={{ color: ssScoreColor(r.score) }}
              >
                {r.score.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-slate-500 shrink-0">
                {r.sub}
              </span>
              <div
                className="flex-1 h-[2px] rounded-full"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${r.score * 100}%`,
                    backgroundColor: ssScoreColor(r.score),
                    transition: 'width 0.7s ease',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

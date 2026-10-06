import type { CSSProperties } from 'react'
import { timeline, type TimelineEntry } from '../../../content'
import { Prompt } from './Prompt'
import { Tags } from './Tags'

// The timeline drawn as `git log --graph --all`, oldest at the top so it reads past -> future.
// Lanes: 0 = main (career trunk), 1 = UAS (long-running), 2 = MUX Lab (long-running),
// 3 = unmerged future branches (dashed).

const LANES = 4

type Seg = { lane: number; dashed?: boolean; dim?: boolean; fade?: boolean }
type Ref = { label: string; tone: 'head' | 'branch' | 'future' }

type Row = {
  key: string
  entry?: TimelineEntry
  lane: number
  kind: 'commit' | 'head' | 'future'
  /** Parent lane this row's branch forks off (drawn as a curve into the node). */
  fork?: number
  /** Node line continues from the row above. */
  top?: boolean
  /** Node line continues to the row below. */
  bottom?: boolean
  through: Seg[]
  refs?: Ref[]
}

const byId = (id: string) => timeline.find((t) => t.id === id)

const rows: Row[] = [
  { key: 'sheerid', entry: byId('sheerid'), lane: 0, kind: 'commit', bottom: true, through: [] },
  { key: 'twenty-ideas', entry: byId('twenty-ideas'), lane: 0, kind: 'commit', top: true, bottom: true, through: [] },
  {
    key: 'uas',
    entry: byId('uas'),
    lane: 1,
    kind: 'commit',
    fork: 0,
    bottom: true,
    through: [{ lane: 0 }],
    refs: [{ label: 'uas/team-lead', tone: 'branch' }],
  },
  { key: 'devswarm', entry: byId('devswarm'), lane: 0, kind: 'commit', top: true, bottom: true, through: [{ lane: 1 }] },
  {
    key: 'mux',
    entry: byId('mux'),
    lane: 2,
    kind: 'commit',
    fork: 0,
    bottom: true,
    through: [{ lane: 0 }, { lane: 1 }],
    refs: [{ label: 'mux-lab/livenexus', tone: 'branch' }],
  },
  {
    key: 'head',
    lane: 0,
    kind: 'head',
    top: true,
    bottom: true,
    through: [{ lane: 1 }, { lane: 2 }],
    refs: [{ label: 'HEAD -> main', tone: 'head' }],
  },
  {
    key: 'chi',
    entry: byId('chi'),
    lane: 3,
    kind: 'future',
    fork: 2,
    through: [{ lane: 0, dim: true }, { lane: 1, dim: true }, { lane: 2, dim: true }],
    refs: [{ label: 'feature/chi-2027', tone: 'future' }],
  },
  {
    key: 'grad',
    entry: byId('grad'),
    lane: 3,
    kind: 'future',
    fork: 0,
    bottom: true,
    through: [{ lane: 0, dim: true }, { lane: 1, dim: true }, { lane: 2, dim: true }],
    refs: [{ label: 'feature/graduate', tone: 'future' }],
  },
  {
    key: 'target',
    entry: byId('target'),
    lane: 3,
    kind: 'future',
    top: true,
    through: [
      { lane: 0, dim: true, fade: true },
      { lane: 1, dim: true, fade: true },
      { lane: 2, dim: true, fade: true },
    ],
    refs: [{ label: 'feature/autonomy-role', tone: 'future' }],
  },
]

// Deterministic 7-char pseudo hash per entry (decorative).
function sha(id: string) {
  let h = 0x811c9dc5
  for (const ch of id) {
    h ^= ch.charCodeAt(0)
    h = Math.imul(h, 0x01000193)
  }
  return ((h >>> 0).toString(16) + 'a3f9c1e').slice(0, 7)
}

const laneVar = (lane: number) => ({ '--x': lane, '--c': `var(--ct-lane${lane})` }) as CSSProperties

function Graph({ row }: { row: Row }) {
  const future = row.kind === 'future'
  return (
    <div className="ct-graph" aria-hidden>
      {row.through.map((s) => (
        <span
          key={s.lane}
          className={`ct-line ct-full${s.dashed ? ' is-dashed' : ''}${s.dim ? ' is-dim' : ''}${s.fade ? ' is-fade' : ''}`}
          style={laneVar(s.lane)}
        />
      ))}
      {row.top && row.fork === undefined && (
        <span className={`ct-line ct-up${future ? ' is-dashed' : ''}`} style={laneVar(row.lane)} />
      )}
      {row.bottom && (
        <span className={`ct-line ct-down${future ? ' is-dashed' : ''}`} style={laneVar(row.lane)} />
      )}
      {row.fork !== undefined && (
        <svg
          className={`ct-fork${future ? ' is-dashed' : ''}`}
          viewBox={`0 0 ${LANES} 1`}
          preserveAspectRatio="none"
          style={laneVar(row.lane)}
        >
          <path
            d={`M ${row.fork + 0.5} 0 C ${row.fork + 0.5} 0.6, ${row.lane + 0.5} 0.4, ${row.lane + 0.5} 1`}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
      <span className={`ct-node is-${row.kind}`} style={laneVar(row.lane)} />
    </div>
  )
}

function Commit({ row }: { row: Row }) {
  const e = row.entry
  const future = row.kind === 'future'
  return (
    <div className="ct-commit">
      <p className="ct-c-head">
        <span className="ct-sha" title={future ? 'not committed yet' : undefined}>
          {future ? '·······' : row.kind === 'head' ? sha('head') : sha(row.key)}
        </span>{' '}
        {row.refs?.map((r) => (
          <span key={r.label} className={`ct-ref is-${r.tone}`}>
            ({r.label})
          </span>
        ))}{' '}
        {e ? (
          <span className="ct-msg">
            {e.title} <span className="ct-at">@</span> {e.org}
          </span>
        ) : (
          <span className="ct-msg ct-msg-head">you are here</span>
        )}
      </p>
      {e && (
        <>
          <p className="ct-c-date">
            <span className="ct-dim">Date:</span> {e.date}
            {e.status === 'current' && <span className="ct-ongoing"> · ongoing</span>}
            {future && <span className="ct-unmerged"> · unmerged</span>}
          </p>
          <p className="ct-c-body">{e.description}</p>
          <Tags tags={e.tags} />
        </>
      )}
    </div>
  )
}

export function GitLog() {
  return (
    <section id="timeline" className="ct-section" aria-labelledby="timeline-h">
      <Prompt id="timeline-h" command="git log --graph --all" />
      <p className="ct-legend" aria-hidden>
        <span className="ct-dim"># oldest first</span>
        <span>
          <i className="ct-lg-node" /> commit
        </span>
        <span>
          <i className="ct-lg-line" /> long-running branch
        </span>
        <span>
          <i className="ct-lg-future" /> unmerged (future)
        </span>
      </p>
      <ol className="ct-log">
        {rows.map((row) => (
          <li
            key={row.key}
            className={`ct-row is-${row.kind}${row.fork !== undefined ? ' has-fork' : ''}`}
          >
            <Graph row={row} />
            <Commit row={row} />
          </li>
        ))}
      </ol>
    </section>
  )
}

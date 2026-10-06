import { links, profile, timeline, type TimelineEntry } from '../../../content'

const STATUS: Record<TimelineEntry['status'], string> = {
  past: 'Released',
  current: 'In work',
  future: 'Planned',
}

export function Revisions() {
  const currentRev = String.fromCharCode(65 + timeline.map((e) => e.status).lastIndexOf('current'))
  return (
    <section className="ci-revs" id="revisions" aria-labelledby="ci-revs-h">
      <div className="ci-revs-head">
        <h2 id="ci-revs-h">
          <span>Rev block</span> Revision history
        </h2>
        <p>Past → planned. Dashed rows have not been released yet.</p>
      </div>

      <ol className="ci-revtable">
        <li className="ci-revhead" aria-hidden="true">
          <span>Rev</span>
          <span>Date</span>
          <span>Description</span>
          <span>Tags</span>
          <span>Status</span>
        </li>
        {timeline.map((e, i) => (
          <li key={e.id} className="ci-rev" data-status={e.status}>
            <span className="ci-rev-letter">{String.fromCharCode(65 + i)}</span>
            <span className="ci-rev-date">{e.date}</span>
            <div className="ci-rev-desc">
              <h3>
                {e.title} <em>{e.org}</em>
              </h3>
              <p>{e.description}</p>
            </div>
            <ul className="ci-tags">
              {e.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <span className="ci-rev-status">{STATUS[e.status]}</span>
          </li>
        ))}
      </ol>

      <footer className="ci-titleblock">
        <div>
          <span>Drawn by</span>
          <b>{profile.name}</b>
        </div>
        <div>
          <span>Location</span>
          <b>{profile.location}</b>
        </div>
        <div>
          <span>Contact</span>
          <b>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </b>
        </div>
        <div>
          <span>References</span>
          <b className="ci-tb-links">
            {links
              .filter((l) => l.label !== 'Email')
              .map((l) => (
                <a key={l.label} href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  {l.label}
                </a>
              ))}
          </b>
        </div>
        <div>
          <span>Current rev</span>
          <b>{currentRev}</b>
        </div>
        <div>
          <span>Sheet</span>
          <b>
            <a href="#top">1 of 1 ↑</a>
          </b>
        </div>
      </footer>
    </section>
  )
}

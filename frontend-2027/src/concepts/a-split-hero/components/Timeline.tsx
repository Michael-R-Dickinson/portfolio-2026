import { timeline } from '../../../content'

export function Timeline() {
  return (
    <section className="a-section" aria-labelledby="a-timeline">
      <div className="a-section__head">
        <span className="a-section__num">02</span>
        <h2 id="a-timeline">Timeline</h2>
      </div>

      <ol className="a-tl">
        {timeline.map((e) => (
          <li key={e.id} className={`a-tl__item is-${e.status}`}>
            <div className="a-tl__year">{e.year}</div>
            <div className="a-tl__dot" aria-hidden="true" />
            <div className="a-tl__body">
              <p className="a-tl__date">
                {e.date}
                {e.status === 'current' && <span className="a-tl__badge">Now</span>}
                {e.status === 'future' && <span className="a-tl__badge">Upcoming</span>}
              </p>
              <h3 className="a-tl__title">
                {e.title}
                <span className="a-tl__org">, {e.org}</span>
              </h3>
              <p className="a-tl__desc">{e.description}</p>
              {e.tags.length > 0 && (
                <ul className="a-tags" aria-label="Stack">
                  {e.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

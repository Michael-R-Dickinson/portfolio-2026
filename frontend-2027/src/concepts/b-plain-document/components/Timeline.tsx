import { timeline } from '../../../content'

export function Timeline() {
  return (
    <section id="timeline">
      <h2>Timeline</h2>
      <table className="b-timeline">
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col">What</th>
          </tr>
        </thead>
        <tbody>
          {timeline.map((t) => (
            <tr key={t.id} className={t.status === 'future' ? 'b-future' : undefined}>
              <th scope="row">{t.year}</th>
              <td>
                <strong>{t.title}</strong>, {t.org}
                <span className="b-date">
                  {' '}
                  ({t.date}{t.status === 'future' && ', upcoming'})
                </span>
                . {t.description}
                {t.tags.length > 0 && <span className="b-tags"> &mdash; {t.tags.join(', ')}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

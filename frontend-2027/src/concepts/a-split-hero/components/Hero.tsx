import { links, profile } from '../../../content'
import { heroPhoto } from '../photo'

const heroLinks = links.filter((l) => ['GitHub', 'LinkedIn', 'Resume'].includes(l.label))

export function Hero() {
  return (
    <header className="a-hero">
      <div className="a-hero__bio">
        <p className="a-eyebrow">Portfolio · {profile.location}</p>

        <div className="a-hero__main">
          <h1 className="a-hero__name">{profile.name}</h1>
          <p className="a-hero__lede">{profile.shortBio}</p>

          <nav className="a-hero__links" aria-label="Profiles">
            {heroLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...(!l.href.startsWith('mailto:') ? { target: '_blank', rel: 'noreferrer' } : {})}
              >
                {l.label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </div>

        <dl className="a-hero__meta">
          <div className="is-now">
            <dt>Currently</dt>
            {profile.currently.map((c) => (
              <dd key={c}>{c}</dd>
            ))}
          </div>
          <div>
            <dt>Studying</dt>
            <dd>
              {profile.education.degree.replace(' (Double Major)', '')}, {profile.education.school}.
              Graduating {profile.education.grad}.
            </dd>
          </div>
        </dl>
      </div>

      <figure className="a-hero__photo">
        <img
          src={heroPhoto.src}
          width={heroPhoto.width}
          height={heroPhoto.height}
          alt={heroPhoto.alt}
          style={{ objectPosition: heroPhoto.objectPosition }}
          fetchPriority="high"
        />
        <figcaption>{heroPhoto.caption}</figcaption>
      </figure>
    </header>
  )
}

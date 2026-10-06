import { links, profile } from '../../../content'

export function Hero() {
  return (
    <header className="ci-hero" id="top">
      <div className="ci-hero-meta" aria-hidden="true">
        <span>DWG NO. MD-2027</span>
        <span>SHEET 1 OF 1</span>
        <span className="ci-hide-sm">GENERAL ASSEMBLY</span>
        <span className="ci-hide-sm">SCALE 1:8</span>
      </div>

      <div className="ci-hero-copy">
        <p className="ci-eyebrow">Fig. 0 · General assembly</p>
        <h1 className="ci-name">{profile.name}</h1>
        <p className="ci-bio">{profile.shortBio}</p>
        <dl className="ci-spec">
          <div>
            <dt>Now</dt>
            <dd>
              {profile.currently.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </dd>
          </div>
          <div>
            <dt>Edu</dt>
            <dd>
              <span>{profile.education.degree}</span>
              <span>
                {profile.education.school} · GPA {profile.education.gpa} · {profile.education.grad}
              </span>
            </dd>
          </div>
        </dl>
        <nav className="ci-links" aria-label="Links">
          {links.map((l) => (
            <a key={l.label} href={l.href} {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
              {l.label}
            </a>
          ))}
        </nav>
      </div>

      <a className="ci-scrollcue" href="#teardown">
        <span>Scroll to disassemble</span>
        <i aria-hidden="true" />
      </a>
    </header>
  )
}

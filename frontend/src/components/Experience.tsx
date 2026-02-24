import { Fragment } from 'react'
import { experiences } from '../data'

function ExperienceItem({
  period,
  location,
  isCurrent,
  role,
  company,
  bullets,
}: (typeof experiences)[number]) {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-12 group">
      <div className="md:w-1/4 flex-shrink-0">
        <h4
          className={`font-bold text-lg ${isCurrent ? 'text-primary' : 'text-slate-200'}`}
        >
          {period}
        </h4>
        <p className="text-slate-400 text-sm mt-1">{location}</p>
        {isCurrent && (
          <div className="mt-3 px-3 py-1 inline-block rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono">
            Current
          </div>
        )}
      </div>
      <div className="md:w-3/4 space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">
            {role}
          </h3>
          <p className="text-lg text-slate-300 font-medium">{company}</p>
        </div>
        <ul className="list-disc list-outside ml-4 text-slate-400 space-y-2 marker:text-primary">
          {bullets.map((bullet, i) => (
            <li key={i}>{bullet}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function Experience() {
  return (
    <section id="experience" className="w-full max-w-5xl py-20">
      <div className="flex items-center gap-4 mb-12">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          // EXPERIENCE
        </h2>
        <div className="h-px bg-white/10 flex-grow" />
      </div>
      <div className="space-y-12">
        {experiences.map((exp, i) => (
          <Fragment key={exp.role}>
            <ExperienceItem {...exp} />
            {i < experiences.length - 1 && (
              <div className="w-full h-px bg-white/5" />
            )}
          </Fragment>
        ))}
      </div>
    </section>
  )
}

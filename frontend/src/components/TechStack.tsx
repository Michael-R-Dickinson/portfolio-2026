import { techCategories } from '../data'

function TechCard({
  icon,
  title,
  skills,
}: {
  icon: string
  title: string
  skills: string[]
}) {
  return (
    <div className="p-6 rounded-2xl bg-surface-dark border border-white/5 hover:border-primary/30 transition-all group">
      <div className="flex items-center gap-3 mb-6 text-primary">
        <span className="material-symbols-outlined">{icon}</span>
        <h3 className="font-bold text-lg text-white">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span
            key={skill}
            className="px-3 py-1 rounded-full bg-surface-accent text-sm text-slate-300 border border-white/5"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}

export function TechStack() {
  return (
    <section id="stack" className="w-full max-w-6xl py-20">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-3xl font-bold text-white tracking-tight">
          // TECHNICAL_STACK
        </h2>
        <div className="h-px bg-white/10 flex-grow" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {techCategories.map((cat) => (
          <TechCard key={cat.title} {...cat} />
        ))}
      </div>
    </section>
  )
}

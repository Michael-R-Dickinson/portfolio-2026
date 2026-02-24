import { projects } from '../data'

function ProjectCard({
  title,
  description,
  tags,
  image,
  imageAlt,
  href,
}: (typeof projects)[number]) {
  return (
    <div className="group bg-surface-dark border border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 transition-all flex flex-col h-full">
      <div className="h-48 w-full bg-surface-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-surface-dark to-transparent opacity-80 z-10" />
        <img
          alt={imageAlt}
          src={image}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
            {title}
          </h3>
          <a href={href} className="text-slate-400 hover:text-white">
            <span className="material-symbols-outlined">open_in_new</span>
          </a>
        </div>
        <p className="text-slate-400 text-sm mb-6 flex-grow">{description}</p>
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-mono px-2 py-1 rounded bg-surface-accent text-primary border border-primary/20"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Projects() {
  return (
    <section id="projects" className="w-full max-w-7xl py-20">
      <div className="flex items-center justify-between gap-4 mb-10 px-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">// FEATURED_DEPLOYMENTS</h2>
        <a href="#" className="text-sm font-mono text-primary hover:underline">
          View all repos -&gt;
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.title} {...project} />
        ))}
      </div>
    </section>
  )
}

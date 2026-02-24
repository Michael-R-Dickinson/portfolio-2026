import { ExternalLink, TrendingUp } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { projects } from '../data'

function ProjectCard({
  title,
  description,
  tags,
  href,
  result,
  highlight,
}: (typeof projects)[number]) {
  return (
    <div
      className={`rounded-lg border bg-card/50 backdrop-blur text-card-foreground shadow-sm p-6 hover:bg-card transition-all duration-300 group hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 border-border hover:border-primary flex flex-col ${
        highlight
          ? 'md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2'
          : ''
      }`}
    >
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3
            className={`font-heading font-bold group-hover:text-primary transition-colors text-balance ${
              highlight ? 'text-2xl' : 'text-xl'
            }`}
          >
            {title}
          </h3>
          <a
            href={href}
            className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>

        <ReactMarkdown
          components={{
            p: ({ children }) => (
              <p
                className={`text-muted-foreground mb-4 ${highlight ? 'text-base' : 'text-sm'}`}
              >
                {children}
              </p>
            ),
          }}
        >
          {description}
        </ReactMarkdown>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-4">
          <TrendingUp className="w-4 h-4" />
          {result}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-foreground transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

export function Projects() {
  return (
    <section id="projects" className="py-20 px-4 bg-card/20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-10">
          // DEPLOYMENTS
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </div>
    </section>
  )
}

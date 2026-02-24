import ReactMarkdown from 'react-markdown'
import { roadmapNodes } from '../data'

export function Roadmap() {
  return (
    <section id="roadmap" className="w-full max-w-4xl py-20 relative">
      <div className="flex items-center gap-4 mb-16 justify-center">
        <div className="h-px bg-white/10 w-24" />
        <h2 className="text-3xl font-bold text-white tracking-tight">
          // CAREER_ROADMAP
        </h2>
        <div className="h-px bg-white/10 w-24" />
      </div>

      <div className="relative pl-8 md:pl-0">
        {/* Main vertical branch line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-16 w-1 bg-gradient-to-b from-primary via-primary to-transparent -translate-x-1/2 rounded-full opacity-30" />
        {/* Future branch off line */}
        <div className="absolute left-8 md:left-1/2 top-3/4 w-32 h-32 border-l-2 border-b-2 border-dashed border-primary/40 rounded-bl-3xl -translate-x-[2px]" />

        {roadmapNodes.map((node) => {
          if (node.isFuture) {
            return (
              <div
                key={node.title}
                className="relative flex flex-col md:flex-row items-center justify-between"
              >
                <div className="md:w-[45%] order-1" />
                <div className="absolute left-8 md:left-[calc(50%+120px)] top-4 size-4 bg-transparent border-2 border-primary border-dashed rounded-full -translate-x-1/2 z-10" />
                <div className="md:w-[45%] mb-4 md:mb-0 order-2 pl-[140px] text-left">
                  <h3 className="text-slate-300 text-lg font-bold">{node.title}</h3>
                  <p className="text-slate-500 text-sm font-mono mb-1">{node.label}</p>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="text-slate-500 text-sm">{children}</p>
                      ),
                    }}
                  >
                    {node.description}
                  </ReactMarkdown>
                </div>
              </div>
            )
          }

          const isLeft = node.side === 'left'

          return (
            <div
              key={node.title}
              className={`relative flex flex-col md:flex-row items-center justify-between ${node.isCurrent ? 'mb-24' : 'mb-20 md:mb-32'}`}
            >
              {isLeft ? (
                <div className="md:w-[45%] mb-8 md:mb-0 order-2 md:order-1 md:text-right pr-8">
                  <h3 className="text-white text-xl font-bold">{node.title}</h3>
                  <p className="text-primary text-sm font-mono mb-2">{node.label}</p>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="text-slate-400 text-sm">{children}</p>
                      ),
                    }}
                  >
                    {node.description}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="md:w-[45%] order-1" />
              )}

              {node.isCurrent ? (
                <div className="absolute left-0 md:left-1/2 size-6 bg-background-dark border-4 border-primary rounded-full -translate-x-[9px] md:-translate-x-1/2 order-1 z-10 shadow-[0_0_15px_#0db9f2]" />
              ) : (
                <div className="absolute left-0 md:left-1/2 size-4 bg-primary rounded-full git-node -translate-x-[5px] md:-translate-x-1/2 order-1 z-10" />
              )}

              {isLeft ? (
                <div className="md:w-[45%] order-3" />
              ) : (
                <div className="md:w-[45%] mb-4 md:mb-0 order-2 pl-8 text-left">
                  <h3 className="text-white text-xl font-bold">{node.title}</h3>
                  <p className="text-primary text-sm font-mono mb-2">{node.label}</p>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="text-slate-400 text-sm">{children}</p>
                      ),
                    }}
                  >
                    {node.description}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

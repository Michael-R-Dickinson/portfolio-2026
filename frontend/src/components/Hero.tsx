import ReactMarkdown from 'react-markdown'
import { heroBio } from '../data'
import { ForceIndex } from './prototypes/ForceIndex'

export function Hero() {
  return (
    <section
      id="about"
      className="w-full max-w-5xl py-20 md:py-32 flex flex-col md:flex-row gap-12 items-center"
    >
      <div className="flex-1 space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none text-white">
            Hello, World.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              I'm Michael
            </span>
          </h1>
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl">
                  {children}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="text-white font-medium">{children}</strong>
              ),
            }}
          >
            {heroBio}
          </ReactMarkdown>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <a
            href="#projects"
            className="group relative px-6 py-3 bg-primary text-background-dark font-bold rounded-full overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <span className="relative flex items-center gap-2">
              <span className="material-symbols-outlined">terminal</span>
              View Projects
            </span>
          </a>
          <a
            href="/Michael%20Dickinson%20Resume.pdf"
            download="Michael Dickinson Resume.pdf"
            className="px-6 py-3 border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">download</span>
            Download CV
          </a>
        </div>
      </div>

      <div className="w-full md:w-[500px] aspect-square relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-surface-dark flex items-center justify-center">
          <ForceIndex />
        </div>
      </div>
    </section>
  )
}

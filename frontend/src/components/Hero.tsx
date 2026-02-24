const CODE_SNIPPET = `def deploy_pipeline(config):
  cluster = connect_k8s()
  model = load_registry(v=2.0)
  if model.validate():
    scale_group.up(nodes=50)
    metrics.push(grafana)

class NeuralArchitect:
  def __init__(self):
    self.stack = ["Torch", "TF"]
    self.container = "Docker"`

export function Hero() {
  return (
    <section
      id="about"
      className="w-full max-w-5xl py-20 md:py-32 flex flex-col md:flex-row gap-12 items-center"
    >
      <div className="flex-1 space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-accent border border-white/5 text-xs font-mono text-primary animate-pulse">
          <span className="size-2 rounded-full bg-primary" />
          <span>System Status: Online</span>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none text-white">
            Hello, World.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              I'm Alex Chen.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 font-light max-w-2xl">
            Architecting scalable{' '}
            <span className="text-white font-medium">ML pipelines</span> &amp;
            automating intelligence. Currently building the future of AI
            infrastructure.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-4">
          <button className="group relative px-6 py-3 bg-primary text-background-dark font-bold rounded-full overflow-hidden">
            <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <span className="relative flex items-center gap-2">
              <span className="material-symbols-outlined">terminal</span>
              View Projects
            </span>
          </button>
          <button className="px-6 py-3 border border-white/20 text-white font-bold rounded-full hover:bg-white/5 transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined">download</span>
            Download CV
          </button>
        </div>
      </div>

      <div className="w-full md:w-[400px] aspect-square relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-700" />
        <div className="relative w-full h-full rounded-2xl overflow-hidden border border-white/10 bg-surface-dark">
          <div className="absolute inset-0 p-6 font-mono text-xs text-primary/30 leading-relaxed overflow-hidden opacity-50 select-none whitespace-pre">
            {CODE_SNIPPET}
          </div>
          <img
            alt="Abstract representation of code on a screen representing software development"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 hover:opacity-80 transition-opacity"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9_V8RAKGyizc5079mmTP1BCKFUQlTKbNkiWVJ6TmCBNDi7BcCvzjU_7gT-Iq7gqhpzH_haXj97NefuUAB8NIZUvhwNXNvkTvobapGiJ3VmPLKtW3dQUL4zCBE_QXhZzvkNxtaTm_CWPTiBKlTVrVvviFeRfk2QncOKbufawvFbs8ktfus5pP21OojAOWmDsUTP9JYpOMGRWrzFlwhexCY3rvS8M1AxvrZHhdmrWjB9cDG_jL8d4AIn07de1fGeJIhLWkmTVjWt4oQ"
          />
        </div>
      </div>
    </section>
  )
}

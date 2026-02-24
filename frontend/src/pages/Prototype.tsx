import { EmbeddingSpace } from '../components/prototypes/EmbeddingSpace'
import { QueryRetrieval } from '../components/prototypes/QueryRetrieval'
import { LatentPortrait } from '../components/prototypes/LatentPortrait'
import { CosineMeter } from '../components/prototypes/CosineMeter'
import { ForceIndex } from '../components/prototypes/ForceIndex'
import { ReactionDiffusion } from '../components/prototypes/ReactionDiffusion'
import { SemanticSearch } from '../components/prototypes/SemanticSearch'

// =========================================================
// Prototype page
// =========================================================
const SECTIONS = [
  {
    id: 'option-1',
    num: 1,
    title: 'The Embedding Space',
    description:
      'A 3D scatter plot rotating on a fixed axis. Skills are clustered by domain; similarity lines connect related nodes. Hover to reveal labels. You are the query vector.',
    component: <EmbeddingSpace />,
  },
  {
    id: 'option-2',
    num: 2,
    title: 'Query \u2192 Retrieval',
    description:
      'A looping vector DB query animation: a query vector drops in, nearest-neighbor lines radiate outward, and top results surface with match scores.',
    component: <QueryRetrieval />,
  },
  {
    id: 'option-3',
    num: 3,
    title: 'The Latent Space Portrait',
    description:
      'A field of particles forming a rough portrait silhouette. All particles drift slowly with spring physics. Hover over regions to reveal skill domain labels.',
    component: <LatentPortrait />,
  },
  {
    id: 'option-4',
    num: 4,
    title: 'Live Cosine Similarity',
    description:
      'Two vectors converging as the animation plays \u2014 one labeled \u201cideal MLE candidate\u201d, one \u201cMichael Dickinson\u201d. The cosine similarity ticks toward 1.0.',
    component: <CosineMeter />,
  },
  {
    id: 'option-5',
    num: 5,
    title: 'The Index Being Built',
    description:
      'Nodes drop in from random scatter positions and force-settle into domain clusters. Flicker lines appear as the graph algorithm thinks, then faint Voronoi regions fade in around the stable topology.',
    component: <ForceIndex />,
  },
  {
    id: 'option-6',
    num: 6,
    title: 'Reaction\u2013Diffusion Field',
    description:
      'A Gray\u2013Scott reaction\u2013diffusion simulation producing organic Turing patterns \u2014 the same mathematics behind animal fur and coral. Move your cursor across the field to inject a disturbance.',
    component: <ReactionDiffusion />,
  },
  {
    id: 'option-7',
    num: 7,
    title: 'Semantic Search Bar',
    description:
      'A fake-but-realistic embedding search UI: queries typewrite in, result cards surface with cosine similarity scores that decay down the ranked list, then the whole thing loops.',
    component: <SemanticSearch />,
  },
]

export function Prototype() {
  return (
    <div className="dot-matrix-bg min-h-screen w-full text-slate-100">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-24">
        <header className="space-y-4">
          <p className="text-xs text-primary font-mono uppercase tracking-widest">
            Hero Section / Prototypes
          </p>
          <h1
            className="text-4xl font-bold tracking-tight text-white"
            style={{ fontFamily: 'Space Grotesk, system-ui' }}
          >
            Graphic Options
          </h1>
          <p className="text-slate-400 text-sm max-w-lg font-mono">
            Seven interpretations of the vector embedding concept for the hero
            section. Each is animated; options 1, 3, and 6 are interactive on
            hover.
          </p>
          <nav className="flex gap-5 pt-1">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-xs font-mono text-slate-500 hover:text-primary transition-colors"
              >
                [{s.num}] {s.title}
              </a>
            ))}
          </nav>
        </header>

        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="space-y-6">
            <div className="space-y-1.5 border-l-2 border-primary pl-4">
              <p className="text-xs font-mono text-primary uppercase tracking-widest">
                Option {s.num}
              </p>
              <h2
                className="text-2xl font-bold text-white"
                style={{ fontFamily: 'Space Grotesk, system-ui' }}
              >
                {s.title}
              </h2>
              <p className="text-slate-400 text-sm font-mono max-w-md">
                {s.description}
              </p>
            </div>
            <div
              className="w-full max-w-[400px] aspect-square rounded-2xl overflow-hidden border border-white/10 relative"
              style={{ background: 'var(--card)' }}
            >
              {s.component}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

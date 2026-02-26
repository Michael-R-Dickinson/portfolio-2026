import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { TechStack } from '../components/TechStack'
import { Experience } from '../components/Experience'
import { Roadmap } from '../components/Roadmap'
import { Projects } from '../components/Projects'
import { Footer } from '../components/Footer'

export function Home() {
  return (
    <div className="dot-matrix-bg min-h-screen w-full flex flex-col text-slate-100">
      <Nav />
      <main className="flex-grow flex flex-col items-center w-full px-6">
        <Hero />
        <Experience />
        <Projects />
        <TechStack />
        <Roadmap />
      </main>
      <Footer />
    </div>
  )
}

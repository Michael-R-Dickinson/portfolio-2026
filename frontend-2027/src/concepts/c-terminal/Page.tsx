import './styles.css'
import { profile } from '../../content'
import { About } from './components/About'
import { GitLog } from './components/GitLog'
import { Projects } from './components/Projects'
import { StatusBar } from './components/StatusBar'

export default function Page() {
  return (
    <div className="concept-c">
      <StatusBar />
      <main className="ct-main">
        <About />
        <Projects />
        <GitLog />
        <footer className="ct-footer">
          <p>
            <span className="ct-dim">michael@ubc:~$</span> exit
          </p>
          <p className="ct-dim">
            © {profile.name} · <a href={`mailto:${profile.email}`}>{profile.email}</a>
          </p>
        </footer>
      </main>
    </div>
  )
}

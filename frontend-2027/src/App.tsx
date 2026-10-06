import { Suspense } from 'react'
import { Route, Switch } from 'wouter'
import { concepts } from './concepts/registry'
import { ConceptIndex } from './shared/ConceptIndex'
import { ConceptSwitcher } from './shared/ConceptSwitcher'

function App() {
  return (
    <>
      <Suspense fallback={null}>
        <Switch>
          <Route path="/" component={ConceptIndex} />
          {concepts.map(({ letter, Page }) => (
            <Route key={letter} path={`/${letter}`} component={Page} />
          ))}
          <Route>
            <ConceptIndex />
          </Route>
        </Switch>
      </Suspense>
      <ConceptSwitcher />
    </>
  )
}

export default App

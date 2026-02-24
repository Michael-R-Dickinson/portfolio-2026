import { Route, Switch } from 'wouter'
import { Home } from './pages/Home'
import { Prototype } from './pages/Prototype'

function App() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/prototype" component={Prototype} />
    </Switch>
  )
}

export default App

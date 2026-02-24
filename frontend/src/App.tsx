import { Route, Switch } from 'wouter'

function IndexPage() {
  return <div></div>
}

function App() {
  return (
    <Switch>
      <Route path="/" component={IndexPage} />
    </Switch>
  )
}

export default App

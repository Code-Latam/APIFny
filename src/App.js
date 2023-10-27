

import Explorer from "./pages/explorer/Explorer";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { user } = useContext(AuthContext);
  return (
    <Router>
      <Switch>
        <Route exact path="/">
        <Explorer />}
        </Route>
        <Route path="/explorer">
          <Explorer />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

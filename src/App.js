

import Explorer from "./pages/explorer/Explorer";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import React, { useState, useEffect } from 'react';

function App() {
  const { user } = useContext(AuthContext);
  const designerMode = process.env.REACT_APP_DESIGNERMODE === "true" ;
  return (
    <Router>
      <Switch>
        <Route exact path="/">
        <Explorer 
        designerMode = {designerMode}
        />
        </Route>
        <Route path="/explorer">
          <Explorer 
          designerMode = {designerMode}
          />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;

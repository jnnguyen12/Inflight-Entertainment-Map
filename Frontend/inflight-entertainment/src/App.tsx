const logo = require("./logo.svg") as string;
import React, { Component } from "react";
import './App.css';

import { LeafletMap } from "./components/LeafletMap"

function App() {
  return (
    <div id="container">
        <LeafletMap />
      </div>
  );
}

export default App;

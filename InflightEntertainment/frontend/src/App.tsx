import './App.css';
import React from "react";
import InteractiveMap from "./components/InteractiveMap"
import { render } from "react-dom";
import { Rnd } from "react-rnd";

function App() {

  // This represents the componet that they wanted
  return (
    // <>
    //   <InteractiveMap />
    // </>
    <Rnd>
      <InteractiveMap />
    </Rnd>
  );
}


export default App;



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
    <Rnd 
    className='rnd-container'
    default={{
      x: 0,
      y: 0,
      width: 320,
      height: 200
    }}>
      <InteractiveMap />
    </Rnd>
  );
}


export default App;



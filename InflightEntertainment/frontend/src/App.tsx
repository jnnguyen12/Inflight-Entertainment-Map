import './App.css';
import React from "react";
import InteractiveMap from "./components/InteractiveMap"
import { render } from "react-dom";
import { Rnd, RndDragEvent, DraggableData } from "react-rnd";

function App() {


  // DraggableCoreProps.disable 
  const disableTwoFingerDrag = (e: TouchEvent, d: DraggableData) => 
  {
    
    this.addEventListener('touchstart', function (e) {
      if(e.touches.length > 1) {
        this.disableDragging = true;
      }
    });
    // someElement.addEventListener('touchstart', function (e) {
//   if(e.touches.length > 1) {
//     // ... do what you like here
//   }
// });

  }

  // This represents the componet that they wanted
  return (
    <>
      <InteractiveMap />
    </>
    // <Rnd 
    // className='rnd-container'
    // default={{
    //   x: 0,
    //   y: 0,
    //   width: 320,
    //   height: 200,
    // }}

    //   onDrag={disableTwoFingerDrag} 
    // >
    //   <InteractiveMap />
    // </Rnd>
  );
}


export default App;



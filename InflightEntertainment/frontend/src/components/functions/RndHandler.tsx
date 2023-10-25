import React, { useState } from "react";
import { Rnd } from "react-rnd";
import { DraggableEventHandler, DraggableEvent, DraggableData } from "react-draggable";
import InteractiveMap from "../InteractiveMap";

const RndHandler = () => {
  const[rnd, setRnd] = useState(
    {
        width: 300,
        height: 200,
        // x: window.innerWidth - 10,
        // y: window.innerHeight - 10,
        x: 0,
        y: 0
    }
  )

//   const handleMapTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
//     if (e.touches.length === 1) {
//       if (this.map) this.map.dragging.disable();
//       console.log("1");
//     }
//     else {
//       console.log("2");
//       this.setState({ stopMove: true });
//       console.log(this.state.stopMove);
//       this.map.dragging.disable();
//       e.preventDefault();
//     }
//   }
//   const handleMapTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
//     if (this.map) this.map.dragging.enable();
//     this.setState({ stopMove: false });
//     console.log("Off");
//     console.log(this.state.stopMove);
//   }

    const changePostion = (e: DraggableEvent, d: DraggableData) => {
        setRnd({width: rnd.width, height: rnd.height, x: d.x, y: d.y});
    } 

  return (
    <Rnd 
        size={{ width: rnd.width, height: rnd.height}}
        position={{x: rnd.x, y: rnd.y}}
        onDragStop={changePostion}
        >
        <InteractiveMap/>
    </Rnd>
  )
};

export default RndHandler;

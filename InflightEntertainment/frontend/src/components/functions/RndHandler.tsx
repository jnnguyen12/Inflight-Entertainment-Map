import React, { useState } from "react";
import { Rnd } from "react-rnd";
import {
  DraggableEventHandler,
  DraggableEvent,
  DraggableData,
} from "react-draggable";
import InteractiveMap from "../InteractiveMap";
import LeafletMap from "../LeafletMap";

const { forwardRef, useRef, useImperativeHandle } = React;

const RndHandler = (ref: React.RefObject<LeafletMap>) => {
  const mapRef = ref;
  const [rnd, setRnd] = useState({
    // width: 400,
    // height: 300,
    // x: window.innerWidth - 10,
    // y: window.innerHeight - 10,
    x: 0,
    y: 0,
  });

  //   const leafletRef = React.createRef<LeafletMap>();
  //   console.log(leafletRef.current);

  const [leafletMapMoving, disableLeafletMove] = useState(true);

  const handleMapTouchStart = (e: TouchEvent) => {
    if (e.touches.length < 2) {
      //   if (this.map) this.map.dragging.disable();
      disableLeafletMove(false);
      console.log("1");
      mapRef.current.disableDragging();
    } else {
      console.log("2");
      e.preventDefault();
    }
  };
  //   const handleMapTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
  //     if (this.map) this.map.dragging.enable();
  //     this.setState({ stopMove: false });
  //     console.log("Off");
  //     console.log(this.state.stopMove);
  //   }

  /**
   * changes the position of the rnd container if and only if there are less than 2 fingers touching the map.
   * expected: position not changed if there are 2 fingies
   */
  const changePostion = (e: TouchEvent, d: DraggableData) => {
    setRnd({ x: d.x, y: d.y });
    handleMapTouchStart(e);
  };

//   const changeZoomLevel = (e: TouchEvent, d: DraggableData) => {
//     setRnd({ width: d.x + rnd.width, height: d.y + rnd.height, x: rnd.x, y: rnd.y });
//   }

  return (
    <Rnd
        default={{
            width: 400,
            height: 300,
            x: rnd.x,
            y: rnd.y
        }}
    //   position={{ x: rnd.x, y: rnd.y }}
      onDragStart={handleMapTouchStart}
      onResizeStop={() => {mapRef.current.forceUpdate()}}
    //   onDragStop={changePostion}
    //   onResizeStop={changeSize}
    >
      <InteractiveMap ref={mapRef}/>
    </Rnd>
  );
};

export default RndHandler;

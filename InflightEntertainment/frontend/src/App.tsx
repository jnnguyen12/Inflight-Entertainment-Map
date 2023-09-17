import './App.css';
import React, { Component } from "react";
import LeafletMap from "./components/LeafletMap";
import makeMarker from './components/functions/BuildMarker';
// import { marker } from 'leaflet';
import { useState, useEffect } from 'react';
import L, {LatLngExpression} from "leaflet";


// TESTING 
// trying to make markers move
// const [markers, setMarkers] = useState<LatLngExpression[]>([[51.505, -0.09], [51.51, -0.1], [51.52, -0.11]]);
// const [movingMarkerIndices, setMovingMarkerIndices] = useState<number[]>([0, 2]);
// useEffect(() => {
//   // Simulate marker movement
//   const interval = setInterval(() => {
//     setMarkers((prevMarkers) => {
//       const newMarkers = [...prevMarkers];
//       newMarkers[0] = [newMarkers[0][0] + 0.01, newMarkers[0][1] + 0.01];
//       newMarkers[2] = [newMarkers[2][0] - 0.01, newMarkers[2][1] - 0.01];
//       return newMarkers;
//     });
//   }, 1000);

//   return () => clearInterval(interval);
// }, []);

const init = {
  markers: [
    makeMarker("aircraft", [41.76345, -93.64245], <p>popup</p>),
    makeMarker("airport", [41.5341, -93.6634], <p>To</p>),
    makeMarker("airport", [41.9928, -93.6215], <p>From</p>),
  ],
  lat: 41.76345,        // Cameras initial lat
  lng: -93.64245,       // Cameras initial lng
  zoom: 14,             // Needs tuning
}


function App() {

  return (
    <>
      <LeafletMap markers={[]} movingMarkerIndex={[]} state={init} />
    </>
  );
}

export default App;

import React, { Component } from "react";
import './App.css';
import LeafletMap from "./components/LeafletMap";


function App() {
  console.log("Loaded")
  return (
    <>
    <h1>Demo 1</h1>
    <div id="container">
    </div>
    <LeafletMap/>
    </>
  );
}

export default App;
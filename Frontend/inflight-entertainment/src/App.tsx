import React, { Component } from "react";
import './App.css';
import LeafletMap from "./components/test";


function App() {
  console.log("Loaded")
  return (
    <>
    <p>hello</p>
    <div id="container">
    </div>
    <LeafletMap/>
    </>
  );
}

export default App;
import logo from './logo.svg';
import React, { Component } from "react";
import './App.css';
import LeafletMap from "./src/components/LeafletMap.tsx";

function App() {
  return (
    <div id="container">
        <LeafletMap />
      </div>
  );
}

export default App;

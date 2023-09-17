import React from 'react';
// import '../App.css';
import L from "leaflet";
import ReactDOM from 'react-dom';
import airport from '../assets/airport.png'
import aircraft from '../assets/plane.png';


function JSXToHTMLElement(element: JSX.Element): HTMLElement {
  const container = document.createElement('div');
  ReactDOM.render(element, container);
  return container.firstChild as HTMLElement;
}

function makeMarker(type: string, position: L.LatLngExpression, popupContent: JSX.Element){
  let image;
  switch(type){
    case "plane":
    case "aircraft":
      image = aircraft
      break;
    case "airport": 
      image = airport 
      break;
    default:
      image = null
  }
  const icon = new L.Icon({ 
    iconUrl: image, 
    iconSize: new L.Point(35, 46)
  })
  const popup = L.popup().setContent(JSXToHTMLElement(popupContent));
  return new L.Marker(position).setIcon(icon).bindPopup(popup)   
}

export default makeMarker;
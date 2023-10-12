import React from 'react';
// import '../App.css';
import L from "leaflet";
import airport from '../assets/airport.png'
import aircraft from '../assets/plane.png';
import ReactDOMServer from 'react-dom/server';

function JSXToHTMLElement(element: JSX.Element): HTMLElement {
  const htmlString = ReactDOMServer.renderToString(element);
  const container = document.createElement('div');
  container.innerHTML = htmlString;
  return container.firstChild as HTMLElement;
}



function BuildMarker(type: string, position: L.LatLngExpression, popupContent?: JSX.Element){
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
  if(popupContent){
    const popup = L.popup().setContent(JSXToHTMLElement(popupContent));
    return new L.Marker(position).setIcon(icon).bindPopup(popup)  
  }
  return new L.Marker(position).setIcon(icon) 
}

export default BuildMarker;
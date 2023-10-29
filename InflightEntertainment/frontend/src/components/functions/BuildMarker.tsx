// import React from 'react';
// import '../App.css';
import L from "leaflet";
import airport from '../assets/airport.png'
import aircraft from '../assets/plane.png';
import ReactDOMServer from 'react-dom/server';
import 'leaflet-rotatedmarker'; 
// import { stringify } from 'querystring';

function JSXToHTMLElement(element: JSX.Element): HTMLElement {
  const htmlString = ReactDOMServer.renderToString(element);
  const container = document.createElement('div');
  container.innerHTML = htmlString;
  return container.firstChild as HTMLElement;
}



function BuildMarker(type: string, position: L.LatLngExpression, rotationAngle?: number, popupContent?: JSX.Element){
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
    iconSize: new L.Point(35, 46),
    transition: "0.5s"
  })
  const marker = new L.Marker(position, { rotationAngle: rotationAngle } as any).setIcon(icon);
  if(popupContent){
      const popup = L.popup().setContent(JSXToHTMLElement(popupContent));
      return marker.bindPopup(popup);
  }
  return marker;

// </style>
  // THIS IS FOR EXTRA STUFF 
  // const I = L.divIcon({
  //   iconSize: [24, 24], // icon size must same with element size
  //   className: 'position-relative rotate--marker',
  //   html: ReactDOMServer.renderToString(
  //     <>
  //       <div>
  //         <img
  //           style={{ width: '24px' }}
  //           src="https://cdn-icons-png.flaticon.com/512/876/876828.png"
  //           // icon by flaticon.com
  //         />
  //       </div>
  //     </>
  //   ),
  // })
}

export default BuildMarker;
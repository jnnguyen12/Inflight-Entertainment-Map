import L from "leaflet";
// import airport from '../assets/circle-solid.svg'
// import aircraft from '../assets/plane-solid.svg';
import landmark from '../assets/location-dot-solid.svg';
import 'leaflet-rotatedmarker';
import ReactDOMServer from 'react-dom/server';

function JSXToHTMLElement(element: JSX.Element): HTMLElement {
  const htmlString = ReactDOMServer.renderToString(element);
  const container = document.createElement('div');
  container.innerHTML = htmlString;
  return container.firstChild as HTMLElement;
}

/**
 * Calculates the rotation angle between two geographical coordinates.
 * @param lat1 - Latitude of the first point.
 * @param lng1 - Longitude of the first point.
 * @param lat2 - Latitude of the second point.
 * @param lng2 - Longitude of the second point.
 * @returns Rotation angle in degrees.
 */
export function updateRotation(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRadians = (degree: number) => degree * (Math.PI / 180);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);
  const diffLng = toRadians(lng2 - lng1);
  return ((Math.atan2(
    Math.sin(diffLng) * Math.cos(radLat2),
    Math.cos(radLat1) * Math.sin(radLat2) - Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(diffLng)
  ) * (180 / Math.PI) + 360) % 360);
}

/**
 * Builds a Leaflet marker with an optional rotation angle.
 * @param param - Type of marker ("aircraft", "airport", "landmark").
 * @param position - Geographic coordinates of the marker.
 * @param rotationAngle - Optional rotation angle in degrees.
 * @returns Leaflet marker with the specified properties.
 */
export function BuildMarker(param: string, position: L.LatLngExpression, rotationAngle?: number, extra?: HTMLElement|JSX.Element) {
  const DEBUG = false
  let icon;
  // Determine the icon based on the marker type
  switch (param) {
    case "aircraft":
      icon = new L.DivIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" class="aircraft" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path d="M192 93.7C192 59.5 221 0 256 0c36 0 64 59.5 64 93.7l0 66.3L497.8 278.5c8.9 5.9 14.2 15.9 14.2 26.6v56.7c0 10.9-10.7 18.6-21.1 15.2L320 320v80l57.6 43.2c4 3 6.4 7.8 6.4 12.8v42c0 7.8-6.3 14-14 14c-1.3 0-2.6-.2-3.9-.5L256 480 145.9 511.5c-1.3 .4-2.6 .5-3.9 .5c-7.8 0-14-6.3-14-14V456c0-5 2.4-9.8 6.4-12.8L192 400V320L21.1 377C10.7 380.4 0 372.7 0 361.8V305.1c0-10.7 5.3-20.7 14.2-26.6L192 160V93.7z"/></svg>`,
        iconSize: new L.Point(35, 46),
        iconAnchor: new L.Point(17, 23),
      })
      break;
    case "airport":
      // icon = new L.Icon({
      //   iconUrl: airport,
      //   iconSize: new L.Point(35, 46),
      //   iconAnchor: new L.Point(17, 23),
      //   iconStyle: 'transition: transform 0.5s ease;',
      //   className: 'airport'
      // })
      icon = new L.DivIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" class="airport" viewBox="0 0 512 512"><!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2023 Fonticons, Inc.--><path opacity="1" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"/></svg>`,
        iconSize: new L.Point(35, 46),
        iconAnchor: new L.Point(17, 23)
      });
      break;
    case "landmark":
      icon = new L.Icon({
        iconUrl: landmark,
        iconSize: new L.Point(35, 46),
        iconAnchor: new L.Point(17, 23),
        iconStyle: 'transition: transform 0.5s ease; color: var(--bs-blue)',
      })
      break;
    default:
      return false;
  }
  // Set rotation angle or default to 0 if not provided
  if (typeof rotationAngle !== 'number') rotationAngle = 0; // catch if none 
  const marker = new L.Marker(position, { rotationAngle: rotationAngle } as any).setIcon(icon);
  // Popup content
  if(extra){
    let popup
    try {
      if(extra instanceof HTMLElement){
        popup = L.popup().setContent(extra);    
      } else {
        popup = L.popup().setContent(JSXToHTMLElement(extra));
      }
      return marker.bindPopup(popup)  
    } catch(error) {
      if(DEBUG) console.error(error)
    }
  }
  return marker
} 
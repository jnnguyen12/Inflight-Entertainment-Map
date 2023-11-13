import L from "leaflet";
import airport from '../assets/airport.png'
import aircraft from '../assets/plane.png';
import 'leaflet-rotatedmarker'; 

export function updateMarkerRotation(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRadians = (degree: number) => degree * (Math.PI / 180);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);
  const diffLng = toRadians(lng2 - lng1);
  return((Math.atan2(
    Math.sin(diffLng) * Math.cos(radLat2),
    Math.cos(radLat1) * Math.sin(radLat2) - Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(diffLng)
  ) * (180 / Math.PI) + 360) % 360);
}

export function BuildMarker(type: string, position: L.LatLngExpression, rotationAngle?: number){
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
    iconAnchor: new L.Point(17, 23),
    iconStyle: 'transition: transform 0.5s ease;',
  })
  
  if(typeof rotationAngle !== 'number') rotationAngle = 0; // catch if none 
  return new L.Marker(position, { rotationAngle: rotationAngle } as any).setIcon(icon);
}
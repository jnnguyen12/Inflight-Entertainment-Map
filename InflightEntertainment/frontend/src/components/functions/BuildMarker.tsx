import L from "leaflet";
import airport from '../assets/airport.png'
import aircraft from '../assets/plane.png';
import 'leaflet-rotatedmarker'; 

export function updateMarkerRotation(marker: any, lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRadians = (degree: number) => degree * (Math.PI / 180);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);
  const diffLng = toRadians(lng2 - lng1);
  marker.setRotationAngle((Math.atan2(
    Math.sin(diffLng) * Math.cos(radLat2),
    Math.cos(radLat1) * Math.sin(radLat2) - Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(diffLng)
  ) * (180 / Math.PI) + 360) % 360);
}

export function BuildMarker(type: string, position: L.LatLngExpression, rotationAngle?: number){
  let icon;
  switch(type){
    case "aircraft":
      icon = new L.Icon({ 
        iconUrl: aircraft, 
        iconSize: new L.Point(35, 46),
      })
      break;
    case "airport": 
      icon = new L.Icon({ 
        iconUrl: airport, 
        iconSize: new L.Point(35, 46),
      })
      break;
    default:
      icon = new L.Icon({ 
        iconSize: new L.Point(35, 46),
      })
  }  
  if(typeof rotationAngle !== 'number') rotationAngle = 0; // catch if none 
  return new L.Marker(position, { rotationAngle: rotationAngle } as any).setIcon(icon);
}
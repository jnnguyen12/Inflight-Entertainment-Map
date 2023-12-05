import L from "leaflet";
import airport from '../assets/airport.png'
import aircraft from '../assets/plane.png';
import 'leaflet-rotatedmarker';

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
export function BuildMarker(param: string, position: L.LatLngExpression, rotationAngle?: number) {
  let icon;
  // Determine the icon based on the marker type
  switch (param) {
    case "aircraft":
      icon = new L.Icon({
        iconUrl: aircraft,
        iconSize: new L.Point(35, 46),
        iconAnchor: new L.Point(17, 23),
        iconStyle: 'transition: transform 0.5s ease;',
      })
      break;
    case "airport":
      icon = new L.Icon({
        iconUrl: airport,
        iconSize: new L.Point(35, 46),
        iconAnchor: new L.Point(17, 23),
        iconStyle: 'transition: transform 0.5s ease;',
      })
      break;
    case "landmark":
      icon = new L.Icon({
        iconSize: new L.Point(35, 46),
        iconAnchor: new L.Point(17, 23),
        iconStyle: 'transition: transform 0.5s ease;',
      })
      break;
    default:
      return false;
  }
  // Set rotation angle or default to 0 if not provided
  if (typeof rotationAngle !== 'number') rotationAngle = 0; // catch if none 
  // Create and return a Leaflet marker with the specified properties
  return new L.Marker(position, { rotationAngle: rotationAngle } as any).setIcon(icon);
}
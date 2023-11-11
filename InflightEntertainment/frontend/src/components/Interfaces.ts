import L, { Marker } from "leaflet";

export interface LeafletMapState {
    airports: { [key: string]: Marker };            // airport markers on the map
    aircrafts: { [key: string]: Marker };           // aircrafts markers on the map
    landmarks: { [key: string]: Marker };           // The polylines on the flight
    polylines: { [key: string]: LeafletPolyline };  // the key for the polyline is the aircraft key
    lat: number;                                    // Latitude of the camera's position
    lng: number;                                    // Longitude of the camera's position
    zoom: number;                                   // Zoom level of the camera
}

export interface LeafletPolyline {
    airportIdTo: string             // Desitation Airport key
    airportIdFrom: string           // Origin Airport key
    polylineTo: L.Polyline;         // Polyline
    polylineFrom: L.Polyline | any  // Polyline | False
}

export interface Flight {
    id: string;                             // Id of the Flight
    flight: string;                         // Flight number
    lat: number;                            // Latitude 
    lng: number;                            // Longitude
    airportOrigin: string;                  // Airport from
    airportOriginAbbreviated: string;       // Airport from 
    airportOriginLat: number;               // Airport from 
    airportOriginLng: number;               // Airport from 
    airportDestination: string;             // Airport To 
    airportDestinationAbreviated: string;   // Airport To 
    airportDestinationLat: number;          // Airport To 
    airportDestinationLng: number;          // Airport To 
    registration?: string;                  // Registration
    aircraftType?: string;                  // Aircraft type
    timestamp?: string;                     // Timestamp of the record
    alt_baro?: number;                      // Barometric Altitude
    alt_geom?: number;                      // Geometric Altitude
    track?: number;                         // Track
    ground_speed?: number;                  // Ground Speed
}

export interface FlyCameraTo {
    lat: number     // new camera's Latitude
    lng: number     // new camera's Longitude
    zoom: number    // new camera's Zoom level
}

export interface PolyLineMaker {
    aircraftId: string;     // Aircraft key
    airportIdTo: string;    // Desitation Airport key
    airportIdFrom: string;  // Origin Airport key
}

export interface MarkerData {
    id: string;                 // marker id -- currently using flight id as marker id
    type: string;               // aircraft, airport -- currently only have aircraft
    lat: number;                // Latitude
    lng: number;                // Longitude
    rotation?: number;           // Rotation
}

export interface UpdateMarkerData {
    id: string;                 // Aircaft Marker key
    lat: number;                // New Latitude
    lng: number;                // New Longitude
}

export interface PolyLineData {
    aircraftId: string          // Aircaft Marker key
    airportIdTo: string         // Desitation Airport key
    airportIdFrom: string       // Origin Airport key
}  

export interface RemoveData {
    id: string;                 // Marker key
    type?: string;              // Marker type (Aircraft, Airport, ...)
}

export interface Wellness {
    type: string                // Data Type (aircraft, airport, landmark, camera)
}
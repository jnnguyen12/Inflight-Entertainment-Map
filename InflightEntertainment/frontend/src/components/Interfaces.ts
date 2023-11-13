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

export interface RndStates {
    RndXPosition: number;
    RndYPosition: number;
    RndWidth: number;
    RndHeight: number;
    fullScreen: boolean;
    Flight: Flight;
}

export interface LeafletPolyline {
    airportIdTo: string             // Desitation Airport key
    airportIdFrom: string           // Origin Airport key
    polylineTo: L.Polyline;         // Polyline
    polylineFrom: L.Polyline | any  // Polyline | False
}

export interface Airport{
    id: string                          // Id of Airport
    name: string;                       // Name of Airport
    nameAbbreviated: string;            // Abbreviated name of Airport
    lat: number;                        // Latitude
    lng: number;                        // Longitude
    time: string                        // Time at Airport
}

export interface Flight {
    id: string;                             // Id of the Flight
    flight: string;                         // Flight name or aircraft registration as 8 chars 
    lat: number;                            // Latitude 
    lng: number;                            // Longitude
    rotation?: number;                      // Rotation of marker 
    airportOrigin: Airport;                 // Airport from
    airportDestination: Airport;            // Airport To 
    aircraftType: string;                   // Aircraft type (aircraft type pulled from database)
    altitude?: string;                      // Barometric Altitude (altitude in feet as a number OR “ground”)
    ground_speed?: number;                  // Ground Speed
    progress: number;                       // Flight progress 
    travaledKm: number;                     // Distance Traveled in Km
    remainingKm: number;                    // Distance Remaining in Km
    prevTimestamp?: string;                 // date time of prevous record
    currentTimestamp?: string;              // date time of current record
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
    speed: number;
    prevTimestamp: string;
    currentTimestamp: string;
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

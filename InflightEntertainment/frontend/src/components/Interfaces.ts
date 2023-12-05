import L, { Marker } from "leaflet";

// Interface defining the state of the Leaflet map
export interface LeafletMapState {
    airports: { [key: string]: Marker };            // Airport markers on the map
    aircrafts: { [key: string]: Marker };           // Aircraft markers on the map
    landmarks: { [key: string]: Marker };           // Polylines on the flight
    polylines: { [key: string]: LeafletPolyline };  // Key for the polyline is the aircraft key
    lat: number;                                    // Latitude of the camera's position
    lng: number;                                    // Longitude of the camera's position
    zoom: number;                                   // Zoom level of the camera
    fullScreen: boolean;                            // Flag for full-screen mode
}

// Interface defining props for Leaflet component
export interface LeafletProps {
    airports: { [key: string]: Marker };            // Airport markers on the map
    aircrafts: { [key: string]: Marker };           // Aircraft markers on the map
    landmarks: { [key: string]: Marker };           // Polylines on the flight
    polylines: { [key: string]: LeafletPolyline };  // Key for the polyline is the aircraft key
    lat: number;                                    // Latitude
    lng: number;                                    // Longitude
    zoom: number;                                   // Zoom level
}

// Interface defining states for Rnd component
export interface InteractiveMapStates {
    RndXPosition: number;
    RndYPosition: number;
    RndWidth: number;
    RndHeight: number;                              
    fullScreen: boolean;                            // Flag for full-screen mode
    Flight: Flight;                                 // Current Flight
    matches: boolean;                               // Media queries
    airports: { [key: string]: Marker };            // Airport markers on the map
    aircrafts: { [key: string]: Marker };           // Aircraft markers on the map
    landmarks: { [key: string]: Marker };           // Polylines on the flight
    polylines: { [key: string]: LeafletPolyline };  // Key for the polyline is the aircraft key
    lat: number;                                    // Latitude
    lng: number;                                    // Longitude
    zoom: number;                                   // Zoom level
}

// Interface defining the structure of Leaflet polylines
export interface LeafletPolyline {
    airportIdTo: string;             // Destination Airport key
    airportIdFrom: string;           // Origin Airport key
    polylineTo: L.Polyline;          // Polyline for the destination
    polylineFrom: L.Polyline | any;  // Polyline for the origin or False
}

// Interface defining the structure of an Airport
export interface Airport {
    id: string;                          // Airport ID
    name?: string;                       // Airport name
    nameAbbreviated?: string;            // Abbreviated name of Airport
    lat: number;                         // Latitude
    lng: number;                         // Longitude
    time: string;                       // Time at Airport
}

// Interface defining the structure of a Flight
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
    estimatedTime?: string;                 // Estimated time remaining of flight
    progress?: number;                       // Flight progress 
    traveledKm?: number;                     // Distance Traveled in Km
    remainingKm?: number;                    // Distance Remaining in Km
    prevTimestamp?: string;                 // date time of prevous record
    currentTimestamp?: string;              // date time of current record
}

// Interface defining the camera position
export interface FlyCameraTo {
    lat: number;     // New camera's Latitude
    lng: number;     // New camera's Longitude
    zoom: number;    // New camera's Zoom level
}

// Interface defining the structure of a PolyLineMaker
export interface PolyLineMaker {
    aircraftId: string;     // Aircraft key
    airportIdTo: string;    // Destination Airport key
    airportIdFrom: string;  // Origin Airport key
}


// Interface defining the structure of Marker data
export interface MarkerData {
    id: string;                 // Marker ID (currently using flight ID as marker ID)
    param: string;               // Type of marker (aircraft, airport, ...)
    lat: number;                // Latitude
    lng: number;                // Longitude
    rotation?: number;           // Rotation
}

// Interface defining the structure of an update to Marker data
export interface UpdateMarkerData {
    id: string;                 // Aircaft Marker key
    lat: number;                // New Latitude
    lng: number;                // New Longitude
    speed: number;              // ground speed
    prevTimestamp: string;      // previous timestamp of marker
    currentTimestamp: string;   // current timestamp of marker
}

// Interface defining the structure of PolyLine data
export interface PolyLineData {
    aircraftId: string;          // Aircaft Marker key
    airportIdTo: string;         // Desitation Airport key
    airportIdFrom: string;       // Origin Airport key
}  

// Interface defining data structure for removing markers
export interface RemoveData {
    id: string;                  // Marker key
    param?: string;              // Marker param (Aircraft, Airport, Landmark)
}

// Interface defining data structure for wellness data
export interface Wellness {
    param: string                // Data param (aircraft, airport, landmark, polyline, camera)
}
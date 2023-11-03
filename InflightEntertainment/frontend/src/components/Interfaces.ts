import L, { Marker } from "leaflet";

export interface LeafletMapState {
    airports: { [key: string]: Marker };
    aircrafts: { [key: string]: Marker };
    landmarks: { [key: string]: Marker };
    polylines: { [key: string]: LeafletPolyline }; // the key for the polyline is the aircraft key
    lat: number;
    lng: number;
    zoom: number;
}

export interface Flight {
    id: string;
    flight: string;
    timestamp: string;
    lat: number;
    lng: number;
    alt_baro?: number;
    alt_geom?: number;
    track?: number;
    ground_speed: number;
}

export interface FlyCameraTo {
    lat: number
    lng: number
    zoom: number
}

export interface PolyLineMaker {
    aircraftId: string
    airportIdTo: string
    airportIdFrom: string
}

export interface MarkerData {
    id: string;                 // marker id -- currently using flight id as marker id
    type: string;               // aircraft, airport -- currently only have aircraft
    lat: number;
    lng: number;
    rotation: number;
    element?: JSX.Element;
}

export interface UpdateMarkerData {
    id: string;
    lat: number;
    lng: number;
}

export interface PolyLineData {
    aircraftId: string
    airportIdTo: string
    airportIdFrom: string
}

export interface RemoveData {
    id: string;
    type?: string;
}

export interface LeafletPolyline {
    airportIdTo: string
    airportIdFrom: string
    polylineTo: L.Polyline;
    polylineFrom: L.Polyline | any
}

export interface Wellness {
    type: string
}

import L from "leaflet";

export type FlyCameraTo = {
    lat: number
    lng: number
    zoom: number
}

export type PolyLineMaker = {
    aircraftId: string
    airportIdTo: string
    airportIdFrom: string
}

export type MarkerData = {
    id: string;                 // marker id -- currently using flight id as marker id
    type: string;               // aircraft, airport -- currently only have aircraft
    lat: number;
    lng: number;
    rotation: number;
    element: JSX.Element;
}

export type UpdateMarkerData = {
    id: string;
    lat: number;
    lng: number;
}

export type PolyLineData = {
    aircraftId: string
    airportIdTo: string
    airportIdFrom: string
}

export type RemoveData = {
    id: string;
    type?: string;
}

export type LeafletPolyline = {
    airportIdTo: string
    airportIdFrom: string
    polylineTo: L.Polyline;
    polylineFrom: L.Polyline | any
}

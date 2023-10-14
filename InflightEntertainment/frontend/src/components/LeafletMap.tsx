//Imports
//React
import React from 'react';
import '../App.css';

// Leaflet
import L, { LatLngExpression, marker } from "leaflet";
// import { MapContainer, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import BuildMarker from './functions/BuildMarker';

//Styling
import './MapStyling.css';



interface LeafletMapState {
  airports: { [key: string]: L.Marker };
  aircrafts: { [key: string]: L.Marker };
  landmarks: { [key: string]: L.Marker };
  polylines: { [key: string]: LeafletPolyline };
  lat: number;
  lng: number;
  zoom: number;
}

// the key for the polyline is the aircraft key
interface LeafletPolyline {
  airportIdTo: string
  airportIdFrom: string
  polylineTo: L.Polyline;
  polylineFrom: L.Polyline | any
}

interface MakeMaker {
  id: string;
  type: string;
  coords: LatLngExpression;
  element: JSX.Element;
}

interface RemoveMarker {
  id: string;
  type: string;
}


interface MoveMarker {
  movingMarkerId: string;
  newCoords: LatLngExpression;
}

interface flyToPosition {
  lat: number
  lng: number
  zoom: number
}

interface PolyLineMaker {
  aircraftId: string
  airportIdTo: string
  airportIdFrom: string
}



//The map class
class LeafletMap extends React.Component<{}, LeafletMapState> {
  private mapRef: React.RefObject<HTMLDivElement>;
  private map: L.Map | null
  constructor(props) {
    super(props)
    this.map = null;
    this.mapRef = React.createRef();
    this.state = {
      airports: {},
      aircrafts: {},
      landmarks: {},
      polylines: {},
      lat: 0,
      lng: 0,
      zoom: 0,
    };
  }

  makeMap() {
    this.map = L.map('map', {
      zoomControl: false,     // Removes defaults 
      zoomAnimation: true,    // Enable smooth zoom animation
      fadeAnimation: true,    // Makes it look better
      scrollWheelZoom: true, // This makes it look bad
    }).setView([this.state.lat, this.state.lng], this.state.zoom)

    // The maps propertys
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);


    // Add offine part here !
  }

  componentDidMount() {
    this.makeMap()
  }

  drawPolyLine(payload: PolyLineMaker) {
    if (!this.state.aircrafts.hasOwnProperty(payload.aircraftId)) return;
    if (!this.state.airports.hasOwnProperty(payload.airportIdTo)) return;
    if(payload.airportIdFrom){
      this.state.polylines[payload.aircraftId] = {
        airportIdTo: payload.airportIdTo,
        airportIdFrom: payload.airportIdFrom,
        polylineTo: L.polyline([this.state.aircrafts[payload.aircraftId].getLatLng(), this.state.airports[payload.airportIdTo].getLatLng()], {
          dashArray: [10],
          interactive: false,
          stroke: true,
          color: 'red',
          smoothFactor: 100,
          opacity: 2
        }),
        polylineFrom: false
      }
    }
    else{
      if (!this.state.airports.hasOwnProperty(payload.airportIdFrom)) return;
      this.state.polylines[payload.aircraftId] = {
        airportIdTo: payload.airportIdTo,
        airportIdFrom: payload.airportIdFrom,
        polylineTo: L.polyline([this.state.aircrafts[payload.aircraftId].getLatLng(), this.state.airports[payload.airportIdTo].getLatLng()], {
          dashArray: [10],
          interactive: false,
          stroke: true,
          color: 'red',
          smoothFactor: 100,
          opacity: 2
        }),
        polylineFrom: L.polyline([this.state.aircrafts[payload.aircraftId].getLatLng(), this.state.airports[payload.airportIdFrom].getLatLng()], {
          dashArray: [10],
          interactive: false,
          stroke: true,
          color: 'black',
          smoothFactor: 100,
          opacity: 2
        })
      }
      this.state.polylines[payload.aircraftId].polylineFrom.addTo(this.map)
    }
    this.state.polylines[payload.aircraftId].polylineTo.addTo(this.map)
  }

  removePolyLine(polyLineId) {
    if (!this.state.polylines.hasOwnProperty(polyLineId)) return;
    if (this.state.polylines[polyLineId].polylineFrom){
      this.map!.removeLayer(this.state.polylines[polyLineId].polylineFrom)
    }
    this.map!.removeLayer(this.state.polylines[polyLineId].polylineTo)
    delete this.state.polylines[polyLineId];
  }

  // Cleanup removes map
  componentWillUnmount() {
    if (this.map) {
      this.clearMap()
      this.map.remove();
    }
  }

  //Flys to the position on the map
  flyTo(payload: flyToPosition) {
    this.map.flyTo([payload.lat, payload.lng], payload.zoom, {
      animate: false,
    });
    this.setState({
      lat: payload.lat,
      lng: payload.lng,
      zoom: payload.zoom
    })
  }

  // We have the markers on initializatoion now we need to add them to the map
  addMarkers(newMarkerProps: MakeMaker | any) {
    let newMarker;
    // there are duplicate code but its faster this way
    switch (newMarkerProps.type.toLowerCase()) {
      case "aircraft":
        if (this.state.aircrafts.hasOwnProperty(newMarkerProps.id)) return;
        newMarker = BuildMarker(newMarkerProps.type, newMarkerProps.coords, newMarkerProps?.element)
        newMarker.addTo(this.map!);
        this.state.aircrafts[newMarkerProps.id] = newMarker;
        return;
      case "airport":
        if (this.state.airports.hasOwnProperty(newMarkerProps.id)) return;
        newMarker = BuildMarker(newMarkerProps.type, newMarkerProps.coords, newMarkerProps?.element)
        newMarker.addTo(this.map!);
        this.state.airports[newMarkerProps.id] = newMarker;
        return;
      case "landmark":
        if (this.state.landmarks.hasOwnProperty(newMarkerProps.id)) return;
        newMarker = BuildMarker(newMarkerProps.type, newMarkerProps.coords, newMarkerProps?.element)
        newMarker.addTo(this.map!);
        this.state.landmarks[newMarkerProps.id] = newMarker;
        return;
      default:
        return
    }
  }

  // Cleanup
  clearMap() {
    // Just makes a new map
    this.makeMap();
    // Clears markerlist
    this.setState({
      airports: {},
      aircrafts: {},
      landmarks: {},
      polylines: {}
    });
  }

  // Moveing a marker based on its index
  moveMarkers(payload: MoveMarker) {
    if (!this.state.aircrafts.hasOwnProperty(payload.movingMarkerId)) return;
    this.state.aircrafts[payload.movingMarkerId].setLatLng(payload.newCoords);
    if (!this.state.polylines.hasOwnProperty(payload.movingMarkerId)) return;
    const polyline = this.state.polylines[payload.movingMarkerId]
    if (!this.state.airports.hasOwnProperty(polyline.airportIdTo)) return;
    polyline.polylineTo.setLatLngs([this.state.aircrafts[payload.movingMarkerId].getLatLng(), this.state.airports[polyline.airportIdTo].getLatLng()]);
    if (!polyline.polylineFrom) return;
    polyline.polylineFrom.setLatLngs([this.state.aircrafts[payload.movingMarkerId].getLatLng(), this.state.airports[polyline.airportIdFrom].getLatLng()]);
  }

  // removing a marker based on its index
  removeMarker(payload: RemoveMarker) {
    switch (payload.type.toLowerCase()) {
      case "aircraft":
        if (this.state.aircrafts.hasOwnProperty(payload.id)) return;
        this.map!.removeLayer(this.state.aircrafts[payload.id]);
        delete this.state.aircrafts[payload.id];
        return;
      case "airport":
        if (this.state.airports.hasOwnProperty(payload.id)) return;
        this.map!.removeLayer(this.state.airports[payload.id]);
        delete this.state.airports[payload.id];
        return;
      case "landmark":
        if (this.state.landmarks.hasOwnProperty(payload.id)) return;
        this.map!.removeLayer(this.state.landmarks[payload.id]);
        delete this.state.landmarks[payload.id];
        return;
    }
  }

  //render the map
  render() {
    return (
      <>
        <div id="map" className="resizable-map-container" ref={this.mapRef}></div>
      </>
    );
  }
}

export default LeafletMap;
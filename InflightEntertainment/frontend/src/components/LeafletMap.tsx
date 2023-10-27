//Imports
//React
import React from 'react';
import '../App.css';

// Leaflet
import L, { LatLngExpression, Marker } from "leaflet";
import {BuildMarker} from './functions/BuildMarker';

//Styling
import './MapStyling.css';

interface LeafletMapState {
  airports: { [key: string]: Marker };
  aircrafts: { [key: string]: Marker };
  landmarks: { [key: string]: Marker };
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

  }

  componentDidMount() {
    this.makeMap()
  }

  // Cleanup removes map
  componentWillUnmount() {
    if (this.map) {
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

  sendData(dataType: string){
    switch (dataType) {
      case "aircraft":
        return this.state.aircrafts;
      case "airport":
        return this.state.airports;
      case "landmark":
        return this.state.landmarks;
      case "camera":
        return {
          lat: this.state.lat,
          lng: this.state.lng,
          zoom: this.state.zoom
        }
      default:
        console.warn("sendData: type not found")
        return {type: "Not found"};
    }
  }

  // We have the markers on initializatoion now we need to add them to the map
  addMarkers(newMarkerProps: MakeMaker) {
    let newMarker;
    switch (newMarkerProps.type) {
      case "aircraft":
        if (this.state.aircrafts.hasOwnProperty(newMarkerProps.id)){
          console.warn("addMarkers: aircraft id already exists")
          return;
        }
        newMarker = BuildMarker(newMarkerProps.type, newMarkerProps.coords, newMarkerProps?.element)
        newMarker.addTo(this.map!);
        this.state.aircrafts[newMarkerProps.id] = newMarker
        return;
      case "airport":
        if (this.state.airports.hasOwnProperty(newMarkerProps.id)){
          console.warn("addMarkers: airport id already exists")
          return;
        }
        newMarker = BuildMarker(newMarkerProps.type, newMarkerProps.coords, newMarkerProps?.element)
        newMarker.addTo(this.map!);
        this.state.airports[newMarkerProps.id] = newMarker
        return;
      case "landmark":
        if (this.state.landmarks.hasOwnProperty(newMarkerProps.id)){
          console.warn("addMarkers: landmark id already exists")
          return;
        }
        newMarker = BuildMarker(newMarkerProps.type, newMarkerProps.coords, newMarkerProps?.element)
        newMarker.addTo(this.map!);
        this.state.landmarks[newMarkerProps.id] = newMarker
        return;
      default:
        console.warn("addMarkers: type not found")
        return;
    }
  }

  // removing a marker based on its index
  removeMarker(payload: RemoveMarker) {
    switch (payload.type) {
      case "aircraft":
        if (this.state.aircrafts.hasOwnProperty(payload.id)){
          console.warn("removeMarker: Could not find aircraft id")
          return;
        }
        this.map!.removeLayer(this.state.aircrafts[payload.id]);
        delete this.state.aircrafts[payload.id];
        return;
      case "airport":
        if (this.state.airports.hasOwnProperty(payload.id)){
          console.warn("removeMarker: Could not find airport id")
          return;
        }
        this.map!.removeLayer(this.state.airports[payload.id]);
        delete this.state.airports[payload.id];
        return;
      case "landmark":
        if (this.state.landmarks.hasOwnProperty(payload.id)){
          console.warn("removeMarker: Could not find landmark id")
          return;
        }
        this.map!.removeLayer(this.state.landmarks[payload.id]);
        delete this.state.landmarks[payload.id];
        return;
      default:
        console.warn("removeMarker: type not found")
        return;
    }
  }

  // Moveing a marker based on its index
  moveMarkers(payload: MoveMarker) {
    if (!this.state.aircrafts.hasOwnProperty(payload.movingMarkerId)){
      console.warn("moveMarkers: Could not find aircraft Id");
      return;
    }
    this.state.aircrafts[payload.movingMarkerId].setLatLng(payload.newCoords)
    if (!this.state.polylines.hasOwnProperty(payload.movingMarkerId)) {
      console.warn("moveMarkers: Could not find polyline Id");
      return;
    }
    const polyline = this.state.polylines[payload.movingMarkerId]
    if (!this.state.airports.hasOwnProperty(polyline.airportIdTo)){
      console.warn("moveMarkers: Could not find airport To Id");
      return;
    }
    polyline.polylineTo.setLatLngs([this.state.aircrafts[payload.movingMarkerId].getLatLng(), this.state.airports[polyline.airportIdTo].getLatLng()]);
    if (!polyline.polylineFrom) return;
    if (!this.state.airports.hasOwnProperty(polyline.airportIdFrom)){
      console.warn("moveMarkers: Could not find airport from Id");
      return;
    }
    polyline.polylineFrom.setLatLngs([this.state.aircrafts[payload.movingMarkerId].getLatLng(), this.state.airports[polyline.airportIdFrom].getLatLng()]);
  }

  drawPolyLine(payload: PolyLineMaker) {
    if (!this.state.aircrafts.hasOwnProperty(payload.aircraftId)){
      console.warn("drawPolyLine: Could not find aircraft id");
      return;
    }
    if (!this.state.airports.hasOwnProperty(payload.airportIdTo)){
      console.warn("drawPolyLine: Could not find airportTo id");
      return;
    }
    if (payload.airportIdFrom) {
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
      this.state.polylines[payload.aircraftId].polylineFrom.addTo(this.map);
      console.log("Polylines: ", this.state.polylines);
    }
    else {
      if (!this.state.airports.hasOwnProperty(payload.airportIdFrom)){
        console.warn("drawPolyLine: Could not find airportFrom id");
        //return;
      } 
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
    this.state.polylines[payload.aircraftId].polylineTo.addTo(this.map)
    
    if(this.state.polylines.hasOwnProperty(payload.aircraftId)) {
      console.warn("in dict!");
      console.log(this.state.polylines)
    }
  }

  removePolyLine(polyLineId: string) {
    if (!this.state.polylines.hasOwnProperty(polyLineId)){ 
      console.warn("removePolyLine: Could not find polyline id");
      return;
    }
    if (this.state.polylines[polyLineId].polylineFrom) this.map!.removeLayer(this.state.polylines[polyLineId].polylineFrom);    
    this.map!.removeLayer(this.state.polylines[polyLineId].polylineTo)
    delete this.state.polylines[polyLineId];
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
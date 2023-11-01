//Imports
//React
import React from 'react';
import '../App.css';

// Leaflet
import L, { LatLngExpression, Marker } from "leaflet";
import { BuildMarker, updateMarkerRotation } from './functions/BuildMarker';
import { Rnd } from "react-rnd";

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

    // Offline implementation
    L.tileLayer('InflightEntertainment\frontend\src\components\functions\OSMPublicTransport/{z}/{x}/{y}.png',
      { maxZoom: 7 }).addTo(this.map);

  }

  componentDidMount() {
    this.makeMap()
  }

  // Cleanup removes map
  componentWillUnmount() {
    if (this.map) this.map.remove();
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

  sendData(dataType: string) {
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
        return { type: "Not found" };
    }
  }

  // We have the markers on initializatoion now we need to add them to the map
  addMarkers(newMarkerProps: MakeMaker) {
    let newMarker;
    let markerState;
    switch (newMarkerProps.type) {
      case "aircraft":
        markerState = this.state.aircrafts;
        break;
      case "airport":
        markerState = this.state.airports;
        break;
      case "landmark":
        markerState = this.state.landmarks;
        break;
      default:
        console.warn("addMarkers: type not found");
        return;
    }
    if (markerState.hasOwnProperty(newMarkerProps.id)) {
      console.warn(`addMarkers: ${newMarkerProps.type} id already exists`);
      return;
    }
    newMarker = BuildMarker(newMarkerProps.type, newMarkerProps.coords, 0, newMarkerProps?.element);
    newMarker.addTo(this.map!);
    markerState[newMarkerProps.id] = newMarker;
  }

  // removing a marker based on its index
  removeMarker(payload: RemoveMarker) {
    let markerState;
    switch (payload.type.toLowerCase()) {
      case "aircraft":
        markerState = this.state.aircrafts;
        break;
      case "airport":
        markerState = this.state.airports;
        break;
      case "landmark":
        markerState = this.state.landmarks;
        break;
      default:
        console.warn("removeMarker: type not found:", payload.type);
        return;
    }
    if (!markerState.hasOwnProperty(payload.id)) {
      console.warn(`removeMarker: Could not find ${payload.type} id`);
      return;
    }
    this.map!.removeLayer(markerState[payload.id]);
    delete markerState[payload.id];
  }

  // Moveing a marker based on its index
  moveMarkers(payload: MoveMarker) {
    if (!this.state.aircrafts.hasOwnProperty(payload.movingMarkerId)) {
      console.warn("moveMarkers: Could not find aircraft Id: ", payload.movingMarkerId);
      return;
    }
    this.state.aircrafts[payload.movingMarkerId] = updateMarkerRotation(this.state.aircrafts[payload.movingMarkerId], this.state.aircrafts[payload.movingMarkerId].getLatLng().lat, this.state.aircrafts[payload.movingMarkerId].getLatLng().lng, payload.newCoords[0], payload.newCoords[1]);
    this.state.aircrafts[payload.movingMarkerId].setLatLng(payload.newCoords)
    if (!this.state.polylines.hasOwnProperty(payload.movingMarkerId)) {
      console.warn("moveMarkers: Could not find polyline Id: ", payload.movingMarkerId);
      return;
    }
    const polyline = this.state.polylines[payload.movingMarkerId]
    if (!this.state.airports.hasOwnProperty(polyline.airportIdTo)) {
      console.warn("moveMarkers: Could not find airport To Id: ", polyline.airportIdTo);
      return;
    }
    polyline.polylineTo.setLatLngs([this.state.aircrafts[payload.movingMarkerId].getLatLng(), this.state.airports[polyline.airportIdTo].getLatLng()]);
    if (!polyline.polylineFrom) return;
    if (!this.state.airports.hasOwnProperty(polyline.airportIdFrom)) {
      console.warn("moveMarkers: Could not find airport from Id: ", polyline.airportIdFrom);
      return;
    }
    polyline.polylineFrom.setLatLngs([this.state.aircrafts[payload.movingMarkerId].getLatLng(), this.state.airports[polyline.airportIdFrom].getLatLng()]);
  }

  drawPolyLine(payload: PolyLineMaker) {
    if (this.state.polylines.hasOwnProperty(payload.aircraftId)) {
      console.warn("in dict!: ", this.state.polylines[payload.aircraftId]);
      return;
    }

    if (!this.state.aircrafts.hasOwnProperty(payload.aircraftId)) {
      console.warn("drawPolyLine: Could not find aircraft id: ", payload.aircraftId);
      return;
    }

    if (!this.state.airports.hasOwnProperty(payload.airportIdTo)) {
      console.warn("drawPolyLine: Could not find airportTo id: ", payload.airportIdTo);
      return;
    }

    if(payload.airportIdFrom){
      if (!this.state.airports.hasOwnProperty(payload.airportIdFrom)) {
        console.warn("drawPolyLine: Could not find airportFrom id: ", payload.airportIdFrom);
        return;
      }
    }

    const polylineOptions = {
      dashArray: [10],
      interactive: false,
      stroke: true,
      color: 'red',
      smoothFactor: 100,
      opacity: 2,
    };

    this.state.polylines[payload.aircraftId] = {
      airportIdTo: payload.airportIdTo,
      airportIdFrom: payload.airportIdFrom,
      polylineTo: L.polyline([this.state.aircrafts[payload.aircraftId].getLatLng(), this.state.airports[payload.airportIdTo].getLatLng()], polylineOptions),
      polylineFrom: payload.airportIdFrom
        ? L.polyline([this.state.aircrafts[payload.aircraftId].getLatLng(), this.state.airports[payload.airportIdFrom].getLatLng()], {
            ...polylineOptions,
            color: 'black',
          })
        : false,
    };

    if (this.state.polylines[payload.aircraftId].polylineFrom) this.state.polylines[payload.aircraftId].polylineFrom.addTo(this.map);
    this.state.polylines[payload.aircraftId].polylineTo.addTo(this.map);
  }

  removePolyLine(polyLineId: string) {
    if (!this.state.polylines.hasOwnProperty(polyLineId)) {
      console.warn("removePolyLine: Could not find polyline id: ", polyLineId);
      return;
    }
    if (this.state.polylines[polyLineId].polylineFrom) this.map!.removeLayer(this.state.polylines[polyLineId].polylineFrom);
    this.map!.removeLayer(this.state.polylines[polyLineId].polylineTo)
    delete this.state.polylines[polyLineId];
  }

  handleMapTouch(e: React.TouchEvent<HTMLDivElement>) {
    if (e.touches.length <= 1) {
      if (this.map) this.map.dragging.disable(); // Disable dragging of map when there's only one touch
    } else {
      if (this.map) this.map.dragging.enable(); // Enable dragging of map when there are multiple touches
    }
  }

  //render the map
  render() {
    return (
      <>
        <Rnd
          className='rnd-container'
          default={{
            x: 0,
            y: 0,
            width: 320,
            height: 200,
          }}
          onDrag={(e, d) => { if (this.map.dragging.enabled()) return false; /* Prevent dragging the Rnd component */ }}
        >
          <div
            id="map"
            className="leaflet-map"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%"
            }}
            onTouchMove={(e) => this.handleMapTouch(e)}
            ref={this.mapRef}
          ></div>
        </Rnd>
      </>
    );
  }
}

export default LeafletMap;
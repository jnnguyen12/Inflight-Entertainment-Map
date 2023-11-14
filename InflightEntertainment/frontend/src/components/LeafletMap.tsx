//Imports
//React
import React from 'react';
import '../App.css';

// Leaflet
import L, { LatLngExpression, Marker } from "leaflet";

// Functions
import { BuildMarker, updateMarkerRotation } from './functions/BuildMarker';

// types
import { LeafletMapState, FlyCameraTo, MarkerData, UpdateMarkerData, PolyLineData, RemoveData, Wellness } from './Interfaces'
import { stat } from 'fs';

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
      fullScreen: true  // default is fullscreen for now
    };
  }

  componentDidMount() {
    this.makeMap()
  }

  // Cleanup removes map
  componentWillUnmount() {
    if (this.map) this.map.remove();
  }

  makeMap() {
    this.map = L.map('map', {
      zoomControl: false,     // Removes defaults 
      zoomAnimation: true,    // Enable smooth zoom animation
      fadeAnimation: true,    // Makes it look better
      scrollWheelZoom: true,  
    }).setView([this.state.lat, this.state.lng], this.state.zoom)

    // The maps propertys
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
      noWrap: true
    }).addTo(this.map);

    // Offline implementation
    L.tileLayer('InflightEntertainment\frontend\src\components\functions\OSMPublicTransport/{z}/{x}/{y}.png',
      { maxZoom: 7 }).addTo(this.map);
  }

  //Flys to the position on the map
  flyTo(payload: FlyCameraTo) {
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

  sendData(dataType: Wellness) {
    switch (dataType.type.toLowerCase()) {
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
        console.warn("sendData: data type not found: ", dataType.type.toLowerCase())
        return { error: "Not found" };
    }
  }

  // We have the markers on initializatoion now we need to add them to the map
  addMarkers(newMarkerProps: MarkerData) {
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
    const coords: LatLngExpression = [newMarkerProps.lat, newMarkerProps.lng]
    newMarker = BuildMarker(newMarkerProps.type, coords, newMarkerProps.rotation);
    newMarker.addTo(this.map!);
    markerState[newMarkerProps.id] = newMarker;
  }

  // removing a marker based on its index
  removeMarker(payload: RemoveData) {
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
  moveMarkers(payload: UpdateMarkerData) {
    if (!this.state.aircrafts.hasOwnProperty(payload.id)) {
      console.warn("moveMarkers: Could not find aircraft Id: ", payload.id);
      return;
    }
    updateMarkerRotation(this.state.aircrafts[payload.id], this.state.aircrafts[payload.id].getLatLng().lat, this.state.aircrafts[payload.id].getLatLng().lng, payload.lat, payload.lng);
    this.state.aircrafts[payload.id].setLatLng([payload.lat, payload.lng])
    if (!this.state.polylines.hasOwnProperty(payload.id)) {
      console.warn("moveMarkers: Could not find polyline Id: ", payload.id);
      return;
    }
    const polyline = this.state.polylines[payload.id]
    if (!this.state.airports.hasOwnProperty(polyline.airportIdTo)) {
      console.warn("moveMarkers: Could not find airport To Id: ", polyline.airportIdTo);
      return;
    }
    polyline.polylineTo.setLatLngs([this.state.aircrafts[payload.id].getLatLng(), this.state.airports[polyline.airportIdTo].getLatLng()]);
    if (!polyline.polylineFrom) return;
    if (!this.state.airports.hasOwnProperty(polyline.airportIdFrom)) {
      console.warn("moveMarkers: Could not find airport from Id: ", polyline.airportIdFrom);
      return;
    }
    polyline.polylineFrom.setLatLngs([this.state.aircrafts[payload.id].getLatLng(), this.state.airports[polyline.airportIdFrom].getLatLng()]);
  }

  drawPolyLine(payload: PolyLineData) {
    if (this.state.polylines.hasOwnProperty(payload.aircraftId)) {
      console.warn("Aready made: ", this.state.polylines[payload.aircraftId]);
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
    if (payload.airportIdFrom) {
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

  removePolyLine(payload: RemoveData) {
    if (!this.state.polylines.hasOwnProperty(payload.id)) {
      console.warn("removePolyLine: Could not find polyline id");
      return;
    }
    if (this.state.polylines[payload.id].polylineFrom) this.map!.removeLayer(this.state.polylines[payload.id].polylineFrom);
    this.map!.removeLayer(this.state.polylines[payload.id].polylineTo)
    delete this.state.polylines[payload.id];
  }

  handleMapTouch(e: React.TouchEvent<HTMLDivElement>) {
    // console.log("fullscreen: " + this.state.fullScreen);
    // if there is only one touch on the screen and the map is fullscreen, enable dragging
    if (e.touches.length <= 1 && !this.state.fullScreen) {
      if (this.map) this.map.dragging.disable(); // Disable dragging of map when there's only one touch
    } else {
      if (this.map) this.map.dragging.enable(); // Enable dragging of map when there are multiple touches
    }
  }

  handleFullscreen(full: boolean){
    this.setState({fullScreen: full})
    
    console.log("handle: " + this.state.fullScreen);
  }

  reloadMap(){
    this.map.invalidateSize()
  }

  mapStatus(){
    return this.map.dragging.enabled()
  }

  //render the map
  render() {
    return (
      <>
        <div
          id="map"
          className="leaflet-map"
          onTouchMove={(e) => this.handleMapTouch(e)}
          ref={this.mapRef}
        ></div>
      </>
    );
  }
}

export default LeafletMap;
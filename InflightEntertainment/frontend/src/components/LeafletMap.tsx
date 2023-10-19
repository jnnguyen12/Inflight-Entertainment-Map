//Imports
//React
import React from 'react';
import '../App.css';

// Leaflet
import L, { LatLngExpression } from "leaflet";
// import { MapContainer, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import BuildMarker from './functions/BuildMarker';
import { GestureHandling } from "leaflet-gesture-handling"; // handles moving the warapper around and user need to use both fingers to move the actual map

import "leaflet/dist/leaflet.css";
import "leaflet-gesture-handling/dist/leaflet-gesture-handling.css";

interface LeafletMapState {
  markers: LeafletMarker[];
  lat: number;
  lng: number;
  zoom: number;
}

interface LeafletMarker {
  id: number;
  marker: L.Marker;
}

interface MakeMaker {
  id: number;
  type: string;
  coords: LatLngExpression;
  element: JSX.Element;
}

interface MoveMarker {
  movingMarkerId: number;
  newCoords: LatLngExpression;
}

interface flyToPosition {
  lat: number
  lng: number
  zoom: number
}

//The map class
class LeafletMap extends React.Component<{}, LeafletMapState> {
  private mapRef: React.RefObject<HTMLDivElement>;
  private map: L.Map | null;

  constructor(props) {
    super(props)
    // constructing a new map with zoom restraints
    this.map = null;
    this.mapRef = React.createRef();
    this.state = {
      markers: [],
      lat: 0,
      lng: 0,
      zoom: 0,
    };
    
  }
  
  componentDidMount() {
    
    L.Map.addInitHook("addHandler", "gestureHandling", GestureHandling);

    // Makes the map 
    this.map = L.map('map', {
      zoomControl: false,     // Removes zoom controls on the left 
      zoomAnimation: true,    // Enable smooth zoom animation
      fadeAnimation: true,    // Makes it look better
      scrollWheelZoom: true, // This makes it look bad
      minZoom: 3,             // minimum zoom is visible to country name
      maxZoom: 7,              // maximum zoom where they can't zoom past city names.
      zoom: 5,
      // eslint-disable-next-line
      // gestureHandling: true,
      dragging: false,
      tap: false
    }).setView([this.state.lat, this.state.lng], this.state.zoom);
    this.map.addHandler("gestureHandling", GestureHandling);

    // The maps propertys
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);


    // Add offine part here !

    // const h = (this.map as any)._handlers
    // for (const eventType in h){
    //   if(h.hasOwnProperty(eventType)){
    //     const events = h[eventType]
    //     for(const hand of events){
    //       console.log(hand)
    //     }
    //   }
    // }

  }

  // Cleanup removes map
  componentWillUnmount() {
    if (this.map) {
      this.clearMarkers()
      this.map.remove();
    }
  }

  //Flys to the position on the map
  flyTo(payload: flyToPosition) {
    this.map.flyTo([payload.lat, payload.lng], payload.zoom, {
      animate: false,
    });
  }

  // We have the markers on initializatoion now we need to add them to the map
  addMarkers(newMarkerProps: MakeMaker | any) {
    const newMarker: LeafletMarker = {
      id: newMarkerProps.id,
      marker: BuildMarker(newMarkerProps.type, newMarkerProps.coords, newMarkerProps?.element)
    }
    newMarker.marker.addTo(this.map!);
    this.state.markers.push(newMarker)
  }

  // Cleanup
  clearMarkers() {
    // Removes all markers on map
    this.state.markers.forEach((marker) => {
      this.map!.removeLayer(marker.marker);
    });
    // Clears markerlist
    this.setState({
      markers: [],
    });
  }

  // Moveing a marker based on its index
  moveMarkers(payload: MoveMarker) {
    const marker = this.state.markers.find(marker => marker.id === payload.movingMarkerId);
    if (marker) {
      marker.marker.setLatLng(payload.newCoords);
      console.log("moved");
    }
  }
  // removing a marker based on its index
  removeMarker(markerId){
    const markerIndex = this.state.markers.findIndex(marker => marker.id === markerId);
    if (markerIndex !== -1) {
      const marker = this.state.markers[markerIndex];
      this.state.markers.splice(markerIndex, 1);
      this.map!.removeLayer(marker.marker);
    }
  }

  //render the map
  render() {
    return (
      <div id="map" ref={this.mapRef}></div>
    );
  }
}

export default LeafletMap;
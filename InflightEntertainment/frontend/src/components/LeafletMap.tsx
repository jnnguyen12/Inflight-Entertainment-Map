//Imports
//React
import React from 'react';
import '../App.css';

// Leaflet
import L, { LatLngExpression } from "leaflet";
// import { MapContainer, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import BuildMarker from './functions/BuildMarker';

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
  private map: L.Map | null

  constructor(props) {
    super(props)
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
    // Makes the map 
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
  //  L.tileLayer('InflightEntertainment\frontend\src\components\functions\OSMPublicTransport/{z}/{x}/{y}.png',
  //{    maxZoom: 7  }).addTo(this.map);

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
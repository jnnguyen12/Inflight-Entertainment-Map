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
import { Rnd } from 'react-rnd';



interface LeafletMapState {
  markers: LeafletMarker[];
  polylines: LeafletPolyline[];
  lat: number;
  lng: number;
  zoom: number;
}

interface LeafletPolyline {
  id: string;
  aircraftId: string
  airportId: string
  polyline: L.Polyline;
}

interface LeafletMarker {
  id: string;
  marker: L.Marker;
}

interface MakeMaker {
  type: string;
  coords: LatLngExpression;
  element: JSX.Element;
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
  airportId: string
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
      polylines: [],
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
      maxZoom: 12,
      minZoom: 3,
    }).setView([this.state.lat, this.state.lng], this.state.zoom)

    // The maps properties
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);



    // Add offine part here !
  }

  drawPolyLine(payload: PolyLineMaker) {
    const aircraft = this.state.markers.find(marker => marker.id === payload.aircraftId);
    const airport = this.state.markers.find(marker => marker.id === payload.airportId)
    if (aircraft && airport) {
      const newPolyline: LeafletPolyline = {
        id: aircraft.id,
        aircraftId: aircraft.id,
        airportId: airport.id,
        polyline: L.polyline([aircraft.marker.getLatLng(), airport.marker.getLatLng()], {
          dashArray: [10],
          interactive: false,
          stroke: true,
          color: 'black',
          smoothFactor: 100,
          opacity: 2
        })
      }
      newPolyline.polyline.addTo(this.map)
      this.state.polylines.push(newPolyline);
    }
  }

  removePolyLine(polyLineId) {
    const lineIndex = this.state.polylines.findIndex(line => line.id === polyLineId);
    if (lineIndex !== -1) {
      const polyline = this.state.polylines[lineIndex];
      this.state.polylines.splice(lineIndex, 1);
      this.map!.removeLayer(polyline.polyline);
    }
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
    const existingMarker = this.state.markers.find(marker => marker.id === newMarkerProps.id);
    if (!existingMarker) {
      const newMarker: LeafletMarker = {
        id: newMarkerProps.id,
        marker: BuildMarker(newMarkerProps.type, newMarkerProps.coords, newMarkerProps?.element)
      }
      console.log("Adding marker " + newMarker.id);
      newMarker.marker.addTo(this.map!);
      this.state.markers.push(newMarker)
    }
  }

  // Cleanup
  clearMap() {
    // Removes all markers on map
    this.state.markers.forEach((marker) => {
      this.map!.removeLayer(marker.marker);
    });
    this.state.polylines.forEach((line) => {
      this.map!.removeLayer(line.polyline);
    })
    // Clears markerlist
    this.setState({
      markers: [],
      polylines: []
    });
  }

  // Moveing a marker based on its index
  moveMarkers(payload: MoveMarker) {
    const aircraft = this.state.markers.find(marker => marker.id === payload.movingMarkerId).marker;
    if (aircraft) {
      aircraft.setLatLng(payload.newCoords);
      console.log("moved");
      const polyline = this.state.polylines.find(line => line.aircraftId === payload.movingMarkerId);
      if (polyline) {
        const airport = this.state.markers.find(marker => marker.id === polyline.airportId).marker;
        if (airport) {
          console.log("Update Polyline");
          polyline.polyline.setLatLngs([aircraft.getLatLng(), airport.getLatLng()]);
        }
      }
    }
  }

  // removing a marker based on its index
  removeMarker(markerId) {
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
      <Rnd 
        default={{
          x: 0,
          y: 0,
          // this is for full screen, dont try
          // width: window.innerWidth,
          // height: window.innerHeight

          width: 300,
          height: 200
        }}>
        <div id="map" className="resizable-map-container" ref={this.mapRef}></div>
      </Rnd>
    );
  }
}

export default LeafletMap;
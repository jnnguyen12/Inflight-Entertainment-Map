//Imports
//React
import React from 'react';
import '../App.css';

// Leaflet
import L, {LatLngExpression, Map, ZoomPanOptions} from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet';
// import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

// Offine 
import MakeTileLayerOffline from './functions/TileLayerOfline'
import localforage from 'localforage';
import TileLayerOffline from 'leaflet-offline';

// Props
interface LeafletMapProps {
  markers: LatLngExpression[];
  movingMarkerIndex: number[];
  state: LeafletMapState;
}

// Intial setup
interface LeafletMapState{
  markers: L.Marker[];
  lat: number;
  lng: number;
  zoom: number;
}

//The map class
class LeafletMap extends React.Component<LeafletMapProps, LeafletMapState> {
  private mapRef: React.RefObject<HTMLDivElement>;
  private map: L.Map | null
  constructor(props: LeafletMapProps) {
    super(props)
    this.map = null;
    this.mapRef = React.createRef();
    this.state = {
      markers: props.state.markers,
      lat: props.state.lat,
      lng: props.state.lng,
      zoom: props.state.zoom,
    };
  }

  // This part makes the map
  componentDidMount() {
    // Makes the map 
    this.map = L.map(this.mapRef.current!, {
      zoomControl: false,     // Removes defaults 
      zoomAnimation: true,    // Enable smooth zoom animation
      fadeAnimation: true,    // Makes it look better
      scrollWheelZoom: true, // This makes it look bad
    }).setView([this.state.lat, this.state.lng], this.state.zoom)
    
    // The maps propertys
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Needs work
    MakeTileLayerOffline({ leaflet: L, map: this.map })

    //Adds markers to map
    this.addMarkers();

    this.map.flyTo([this.state.lat, this.state.lng], this.state.zoom, {
      animate: true,
    });
  }

  // Cleanup removes map
  componentWillUnmount() {
    if (this.map) {
      this.clearMarkers()
      this.map.remove();
    }
  }

  // We have the markers on initializatoion now we need to add them to the map
  addMarkers() {
    const newMarkers: L.Marker[] = [];
    this.state.markers.forEach((markerData) => {
      const marker = markerData.addTo(this.map!);
      newMarkers.push(marker);
    });
    this.setState({
      markers: newMarkers,
    });
  }

  // Cleanup
  clearMarkers() {
    // Removes all markers on map
    this.state.markers.forEach((marker) => {
      this.map!.removeLayer(marker);
    });

    // Clears markerlist
    this.setState({ 
      markers: [], 
    });
  }

  // Moveing a marker based on its index
  moveMarkers() {
    const { movingMarkerIndex, markers } = this.props;
    movingMarkerIndex.forEach((index) => {
      //Gets the marker on the map
      const marker = this.state.markers[index];
      //Gets the new coords
      const newCoords = markers[index];
      //Updates the coords
      marker.setLatLng(newCoords);
    });
  }
  
  //render the map
  render() {
    return (
      <div id="map" ref={this.mapRef}></div>
    );
  }
}


// Previous maps code just in case
// <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true}>
//        <TileLayer
//          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//        />
//        <Marker position={[51.505, -0.09]}>
//          <Popup>
//            A pretty CSS3 popup. <br /> Easily customizable.
//          </Popup>
//        </Marker>
//      </MapContainer>
//     </>


export default LeafletMap;
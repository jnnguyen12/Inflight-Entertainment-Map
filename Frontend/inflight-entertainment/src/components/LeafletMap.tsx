//Imports
//React
import React from 'react';
import '../App.css';

// Leaflet
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';

// Offine 
import MakeTileLayerOffline from './functions/TileLayerOfline'
import localforage from 'localforage';
import TileLayerOffline from 'leaflet-offline';

// Icons
import CreateAircraftIcons from './Aircraft'
import CreateAirportIcons from './Airport'


const aircraftMarkerList = [
  {
    id: 1,
    name: "plane",
    info: "plane status (Can be changed)",
    lat: 41.76345,
    lng: -93.64245
  }
]

const airportMarkerList = [
  {
    id: 1,
    name: "Des Moines International Airport",
    info: "Departed at: (Can be changed individually)",
    lat: 41.5341,
    lng: -93.6634
  },
  {
    id: 2,
    name: "Ames airport ",
    info: "Estimated arrival: (Can be changed individually)",
    lat: 41.9928,
    lng: -93.6215 
  },
]


interface LeafletMapState {
  aircraftMarkerList: any;
  airportMarkerList: any;
  lat: number;
  lng: number;
  zoom: number;
  maxZoom: number;
}

//Defining the geo search control needs work
const searchControl = GeoSearchControl({ //geosearch object
  provider: new OpenStreetMapProvider(),
  // style: 'none',
  showMarker: true,
  autoComplete: true,
  showPopup: false,
  autoClose: true,
  retainZoomLevel: false,
  animateZoom: true,
  keepResult: false,
  searchLabel: 'search'
});

//The map class
class LeafletMap extends React.Component<{}, LeafletMapState> {
  constructor(props: any) {
    super(props)
    this.state = {
      aircraftMarkerList,   // The Aircrafts
      airportMarkerList,    // The Airports
      lat: 41.76345,        // Cameras initial lat
      lng: -93.64245,       // Cameras initial lng
      zoom: 15,             // Needs tuning
      maxZoom: 30           // Needs tuning
    }
  }

  // Offline functionality needs work
  componentDidMount() {
    //Defining the offline layer for the map
    const map = L.map('map-id');
    MakeTileLayerOffline({ leaflet: L, map: map })
    map.zoomControl.remove();
    map.addControl(searchControl);
  }

  //render the map
  render() {
    return (
      <div id="map-id">
        <MapContainer center={[this.state.lat, this.state.lng]} zoom={this.state.zoom} maxZoom={this.state.maxZoom} id="map" >
          <ZoomControl position="topright" />
          <TileLayer
            // url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            //   attribution= 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            attribution="&copy; <a href=&quot;https://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
          />
          {aircraftMarkerList.map((marker) => {
            const mapIcon = new CreateAircraftIcons(marker)
            return (
              mapIcon.makeMapMarker()
            );
          })}
          {airportMarkerList.map((marker) => {
            const mapIcon = new CreateAirportIcons(marker)
            return (
              mapIcon.makeMapMarker()
            );
          })}
        </MapContainer >
      </div>
    );
  }
}

export default LeafletMap;
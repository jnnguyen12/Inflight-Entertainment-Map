import React from 'react';
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import '../App.css';
import {LatLng} from "leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";
import MarkerClusterGroupProps from "react-leaflet-markercluster"
// import { MarkerClusterGroupProps } from "react-leaflet-markercluster"; 
// import { MarkerClusterGroup, MarkerClusterGroupProps } from 'react-leaflet-markercluster';
import localforage from 'localforage';
import 'leaflet-offline';
import  TileLayerOffline  from 'leaflet-offline';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { LatLngExpression } from 'leaflet';
// import {TileLayerOfflineProps} from "./index.types";
import MakeTileLayerOffline from './functions/TileLayerOfline'
//Static data for list of markers

const markerList = [
    {
        lat: 17.441013,
        lng: 78.391796,
        name: "ABC Hospitals",
        info: 10
    },
    {
        lat: 17.442889,
        lng: 78.396873,
        name: "XYZ Hospitals",
        info: 20
    },
    {
        lat: 17.441681,
        lng: 78.394357,
        name: "NRI Hospitals",
        info: 10
    },
    {
        lat: 17.441597,
        lng: 78.356214,
        name: "sandya Hospitals"
    },
    {
        lat: 17.441264,
        lng: 78.360184,
        name: "childrens Hospitals"
    }
];

interface LeafletMapState {
    lat: number;
    lng: number;
    zoom: number;
    maxZoom: number;
}

interface LeafletMapProps  {
    id: number
    lat: number
    lng: number
    position: L.LatLngExpression
    icon: L.Icon
}

//Defining the custom marker with an hospital building icon
const customMarker = new L.Icon({
    iconUrl: require('../assets/plane.jpng'),
    iconSize: new L.Point(35, 46),
    // iconAnchor:   [22, 94],
});

//Defining the geo search control 
const searchControl = GeoSearchControl({ //geosearch object
    provider: new OpenStreetMapProvider(),
    // style: 'button',
    showMarker: true,
    autoComplete: true,   
    showPopup: false,
    autoClose: true,
    retainZoomLevel: false,
    animateZoom: true,
    // keepResult: false,
    searchLabel: 'search'
  });

//The Map definition
class LeafletMap extends React.Component<{}, LeafletMapState> {
    constructor(props: any) {
        super(props)
        this.state = {
            lat: 17.44212,
            lng: 78.391384,
            zoom: 15,
            maxZoom: 30
        }
    }

    componentDidMount() {
        //Defining the offline layer for the map
          const map = L.map('map-id');
          MakeTileLayerOffline({leaflet: L, map: map})
          map.zoomControl.remove();
          map.addControl(searchControl);
        }


    //Defining the custom icon for clusters
    customIconCreateFunction(cluster: any) {
        return L.divIcon({
            html: `<span>${cluster.getChildCount()}</span>`,
            className: "marker-cluster-custom",
            iconSize: L.point(40, 40, true)
        });
    }

    

    //Render pop up for markers
    renderPopup = (index: number) => {
        return (

            <Popup
            // tipSize={5}
            // anchor="bottom-right"
            // longitude={markerList[index].lng}
            // latitude={markerList[index].lat}
            >
                <p>
                    <strong>{markerList[index].name}</strong>
                    <br />
                    Available beds:{markerList[index].info}
                </p>
            </Popup>
        );
    }

//render the map
  render() {
    // const position = [this.state.lat, this.state.lng];
    // console.log(position);
    
    return (
      <div id="map-id">
       <MapContainer  center={[this.state.lat, this.state.lng]} zoom={this.state.zoom} maxZoom={this.state.maxZoom} id="map" >
       <ZoomControl  position="topright" />
        <TileLayer
        // url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        //   attribution= 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
          attribution="&copy; <a href=&quot;https://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
        />

         {/* <MarkerClusterGroup
          showCoverageOnHover={true}
          spiderfyDistanceMultiplier={2}
          iconCreateFunction={this.customIconCreateFunction}
        >
          {markerList.map((marker, index) => {
            let post = [marker.lat, marker.lng];
            return (
              <Marker key={index} position={post} icon={customMarker} >
                {this.renderPopup(index)}
              </Marker>
            );
          })}
        </MarkerClusterGroup> */}
      </MapContainer >
      </div>
    );
  }
}


export default LeafletMap;
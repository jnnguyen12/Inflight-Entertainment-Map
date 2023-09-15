
import React from 'react';
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import L from "leaflet";

interface LeafletMapProps {
    id: number
    lat: number
    lng: number
  }
  
  class CreateMapIcons implements LeafletMapProps{
    id: number;
    icon: L.Icon;
    lat: number;
    lng: number;
    imageSizeX: number
    imageSizeY: number
  
    constructor(props: LeafletMapProps) {
      this.id = props.id;
      this.lat = props.lat;
      this.lng = props.lng;
      this.imageSizeX = 35;
      this.imageSizeY = 46;
    }

    
  // //Defining the custom icon for clusters 
  // //Potintal additon
  // customIconCreateFunction(cluster: any) {
  //   return L.divIcon({
  //     html: `<span>${cluster.getChildCount()}</span>`,
  //     className: "marker-cluster-custom",
  //     iconSize: L.point(40, 40, true)
  //   });
  // }

    // this is the settings for the icon
    makeIcon(image: string){
      return new L.Icon({
        iconUrl: image,
        iconSize: new L.Point(this.imageSizeX, this.imageSizeY),
      })
    }

    // This will be inside the pop up on clicking the icon
    iconInfo(){    
      return (
        <Popup position={[this.lng, this.lat]}>
        </Popup>
      );
    }

    // This sets the icon on the map
    makeMapMarker(){
      return (
        <Marker key={this.id} position={[this.lat, this.lng]} icon={this.icon} >
          {this.iconInfo()}
        </Marker>
      );
    }
  }
  
  export default CreateMapIcons; 
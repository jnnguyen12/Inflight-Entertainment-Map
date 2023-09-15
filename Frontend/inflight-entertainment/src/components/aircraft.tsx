import React from 'react';
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import L from "leaflet";
import CreateMapIcons from './mapIcons'

import plane from './assets/plane.png';

interface AirCraft {
    id: number
    name: string
    info: string
    lat: number
    lng: number
  }

class CreateAircraftIcon extends CreateMapIcons implements AirCraft {
    name: string;
    info: string;
    constructor(props: AirCraft) {
        super(props)
        this.icon = super.makeIcon(plane);
        this.name = props.name;
        this.info = props.info;
    }
    
    // This will be inside the pop up on clicking the icon
    iconInfo(){    
        return (
          <Popup position={[this.lng, this.lat]}>
            <p>
              <strong>{this.name}</strong>
              <br />
              Aircraft Info:{this.info}
            </p>
          </Popup>
        );
      }
}

export default CreateAircraftIcon; 
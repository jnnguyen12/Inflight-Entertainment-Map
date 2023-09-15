
import React from 'react';
import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet';
import L from "leaflet";
import CreateMapIcons from './MapIcons'

import airport from './assets/airport.png'

interface Airport {
    id: number
    name: string
    info: string
    lat: number
    lng: number
  }

class CreateAirportIcon extends CreateMapIcons implements Airport {
    name: string;
    info: string;
    constructor(props: Airport) {
        super(props)
        this.icon = super.makeIcon(airport);
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
              Airport Info:{this.info}
            </p>
          </Popup>
        );
      }
}

export default CreateAirportIcon; 



import localforage from 'localforage';
import 'leaflet-offline';
// import MarkerClusterGroup from "leaflet-markercluster";
import L from "leaflet";
import { Component } from "react"

export class LeafletMap extends Component {

    componentDidMount() {
        const map = L.map('map-id');
        const offlineLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abc',
            minZoom: 13,
            maxZoom: 19,
            crossOrigin: true
        });
        offlineLayer.addTo(map);
    }
}
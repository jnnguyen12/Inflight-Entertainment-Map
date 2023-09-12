
import localforage from 'localforage';
import 'leaflet-offline';
import MarkerClusterGroup from "leaflet-markercluster";
import L from "leaflet";


componentDidMount() {
    const map = L.map('map-id');
    const offlineLayer = L.tileLayer.offline('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', localforage, {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abc',
        minZoom: 13,
        maxZoom: 19,
        crossOrigin: true
    });
    offlineLayer.addTo(map);
};

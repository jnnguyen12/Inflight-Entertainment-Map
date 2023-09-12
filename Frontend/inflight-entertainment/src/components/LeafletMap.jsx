"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeafletMap = void 0;
require("leaflet-offline");
// import MarkerClusterGroup from "leaflet-markercluster";
const leaflet_1 = __importDefault(require("leaflet"));
const react_1 = require("react");
class LeafletMap extends react_1.Component {
    componentDidMount() {
        const map = leaflet_1.default.map('map-id');
        const offlineLayer = leaflet_1.default.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            subdomains: 'abc',
            minZoom: 13,
            maxZoom: 19,
            crossOrigin: true
        });
        offlineLayer.addTo(map);
    }
}
exports.LeafletMap = LeafletMap;

import React from 'react';
import '../App.css';
import L from "leaflet";
import 'leaflet-offline';

interface LeafletMapState {
    lat: number;
    lng: number;
    zoom: number;
    maxZoom: number;
}



declare class LeafletMap extends React.Component<{}, LeafletMapState> {
    constructor(props: any);
    componentDidMount(): void;
    customIconCreateFunction(cluster: any): L.DivIcon;
    renderPopup: (index: number) => React.JSX.Element;
    render(): React.JSX.Element;
}
export default LeafletMap;

// import React from 'react';
// import { MapContainer, Marker, Popup, TileLayer, ZoomControl } from 'react-leaflet';
// import '../App.css';
// import { LatLng } from "leaflet";
// import L from "leaflet";
// import MarkerClusterGroup from 'react-leaflet-markercluster';
// import localforage from 'localforage';
// import TileLayerOffline from 'leaflet-offline';
// import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
// import { LatLngExpression } from 'leaflet';
// import MakeTileLayerOffline from './functions/TileLayerOfline'

// import CreateAircraftIcon from './aircraft'
// import CreateAirportIcons from './airport'

// // Images
// import plane from './assets/plane.png';
// import airport from './assets/airport.png'

// /**
//  *  
//  */ 

// const aircraftMarkerList = [
//   {
//     id: 3,
//     name: "plane",
//     info: "plane status",
//     lat: 17.441681,
//     lng: 78.394357
//   }
// ]

// const airportMarkerList = [
//   {
//     id: 1,
//     name: "ABC",
//     info: "A",
//     lat: 17.441013,
//     lng: 78.391796
//   },
//   {
//     id: 2,
//     name: "XYZ",
//     info: "Z",
//     lat: 17.442889,
//     lng: 78.396873
//   },
// ]

// const markerList = [
//   {

//     id: 1,
//     name: "ABC",
//     image: airport,
//     info: "A",
//     lat: 17.441013,
//     lng: 78.391796
//   },
//   {
//     id: 2,
//     name: "XYZ",
//     image: airport,
//     info: "Z",
//     lat: 17.442889,
//     lng: 78.396873
//   },
//   {
//     id: 3,
//     name: "plane",
//     image: plane,
//     info: "plane status",
//     lat: 17.441681,
//     lng: 78.394357
//   }
// ];

// interface LeafletMapState {
//   markerList: any;
//   lat: number;
//   lng: number;
//   zoom: number;
//   maxZoom: number;
// }


// //Defining the custom marker with an hospital building icon
// const customMarker = (image) =>{ return new L.Icon({
//   iconUrl: image,
//   iconSize: new L.Point(35, 46),
// })};

// //Defining the geo search control 
// const searchControl = GeoSearchControl({ //geosearch object
//   provider: new OpenStreetMapProvider(),
//   // style: 'button',
//   showMarker: true,
//   autoComplete: true,
//   showPopup: false,
//   autoClose: true,
//   retainZoomLevel: false,
//   animateZoom: true,
//   // keepResult: false,
//   searchLabel: 'search'
// });


// // interface LeafletMapProps {
// //   id: number
// //   name: string
// //   image: string
// //   info: string
// //   lat: number
// //   lng: number
// // }

// // class CreateMapIcons{
// //   id: number;
// //   name: string;
// //   image: string;
// //   icon: L.Icon;
// //   info: string;
// //   lat: number;
// //   lng: number;

// //   constructor(props: LeafletMapProps) {
// //     this.id;
// //     this.name = props.name;
// //     this.icon = this.makeIcon(props.image);
// //     this.info = props.info;
// //     this.lat = props.lat;
// //     this.lng = props.lng;
// //   }

// //   // this is the settings for the icon
// //   makeIcon(image: string){
// //     return new L.Icon({
// //       iconUrl: image,
// //       // iconSize: new L.Point(35, 46),
// //     })
// //   }
// //   // This will be inside the pop up on clicking the icon
// //   iconInfo(){    
// //     return (
// //       <Popup position={[this.lng, this.lat]}>
// //         <p>
// //           <strong>{this.name}</strong>
// //           <br />
// //           Info:{this.info}
// //         </p>
// //       </Popup>
// //     );
// //   }
// //   // This sets the icon on the map
// //   makeMapMarker(){
// //     return (
// //       <Marker key={this.id} position={[this.lat, this.lng]} icon={this.icon} >
// //         {this.iconInfo()}
// //       </Marker>
// //     );
// //   }
// // }







// //The Map definition
// class LeafletMap extends React.Component<{}, LeafletMapState> {
//   // class LeafletMap extends React.Component<{}> {
//   constructor(props: any) {
//     super(props)
//     this.state = {
//       markerList,
//       lat: 17.44212,
//       lng: 78.391384,
//       zoom: 15,
//       maxZoom: 30
//     }
//   }

//   componentDidMount() {
//     //Defining the offline layer for the map
//     const map = L.map('map-id');
//     MakeTileLayerOffline({ leaflet: L, map: map })
//     map.zoomControl.remove();
//     map.addControl(searchControl);
//   }


//   //Defining the custom icon for clusters
//   customIconCreateFunction(cluster: any) {
//     return L.divIcon({
//       html: `<span>${cluster.getChildCount()}</span>`,
//       className: "marker-cluster-custom",
//       iconSize: L.point(40, 40, true)
//     });
//   }



//   //Render pop up for markers
//   renderPopup = (index: number) => {

    
//     return (
//       <Popup position={[markerList[index].lng, markerList[index].lat]}>
//         <p>
//           <strong>{markerList[index].name}</strong>
//           <br />
//           Info:{markerList[index].info}
//         </p>
//       </Popup>
//     );
//   }


//   //render the map
//   render() {
//     return (
//       <div id="map-id">
//         <MapContainer center={[this.state.lat, this.state.lng]} zoom={this.state.zoom} maxZoom={this.state.maxZoom} id="map" >
//           <ZoomControl position="topright" />
//           <TileLayer
//             // url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
//             //   attribution= 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
//             attribution="&copy; <a href=&quot;https://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
//             url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
//           />
//           {/* {markerList.map((marker, index) => {
//             return (
//               <Marker key={index} position={[marker.lat, marker.lng]} icon={customMarker(marker.icon)} >
//                 {this.renderPopup(index)}
//               </Marker>
//             );
//           })} */}
//           {markerList.map((marker, index) => {
//             const mapIcon = new CreateMapIcons(marker)

//             return (
//               mapIcon.makeMapMarker()
//               // <Marker key={index} position={[marker.lat, marker.lng]} icon={customMarker(marker.icon)} >
//               //   {this.renderPopup(index)}
//               // </Marker>
//             );
//           })}

//         </MapContainer >
//       </div>
//     );
//   }
// }


// export default LeafletMap;
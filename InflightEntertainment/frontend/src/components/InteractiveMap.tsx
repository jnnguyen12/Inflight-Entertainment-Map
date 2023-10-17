// import React from 'react';
// import LeafletMap from './LeafletMap';


// class InteractiveMap extends React.Component {
//     private mapRef = React.createRef<LeafletMap>();

//     constructor(props: {}) {
//         super(props);
//     }

//     // On load function
//     componentDidMount() {
//         this.handleFlyToLocation();
//         this.handleAddMarker();
//         this.handleRemoveMarker();
//         this.handleUpdateMarker();
//         this.handleAddPolyline();
//         this.handleRemovePolyline();
//         this.handleClearMap();
//         // this.handleResponseWellnessCheck();
//     }

//     // componentWillUnmount() {
//     //     fetch('/api/PageReload/', {
//     //         method: 'POST',
//     //         headers: {
//     //             'Content-Type': 'application/json',
//     //         },
//     //         body: JSON.stringify({"Page": "Refreshed"}),
//     //     });
//     // }

//     // Move camera to given coords and zoom
//     handleFlyToLocation = async () => {
//         try {
//             const response = await fetch('/api/flyToLastMarker/');
//             const text = await response.text();
//             let data;
//             try {
//                 data = JSON.parse(text);
//             } catch (error) {
//                 console.error('Error parsing JSON:', error);
//                 return;
//             }
//             this.mapRef.current?.flyTo({
//                 lat: data.lat,
//                 lng: data.lng,
//                 zoom: data.zoom
//             });
//         } catch (error) {
//             console.error('Error:', error);
//         }
//         setTimeout(() => { this.handleFlyToLocation(); }, 1500);
//     };

//     handleAddMarker = async () => {
//         try {
//             const response = await fetch('/api/addMarker/');
//             const text = await response.text();
//             let data;
//             try {
//                 data = JSON.parse(text);
//             } catch (error) {
//                 console.error('Error parsing JSON:', error);
//                 return;
//             }
//             if (!Array.isArray(data)) {
//                 this.mapRef.current?.addMarkers({
//                     id: data.id,                         // marker id -- currently using flight id as marker id
//                     type: data.type,                     // aircraft or airport -- currently only have aircraft
//                     coords: [data.lat, data.lng],        // [lat, lng]
//                     element: data?.info                  // info or ""
//                 });
//                 return;
//             }
//             for (var index = 0; index < data.length; index++) {
//                 this.mapRef.current?.addMarkers({
//                     id: data[index].id,                         // marker id -- currently using flight id as marker id
//                     type: data[index].type,                     // aircraft or airport -- currently only have aircraft
//                     coords: [data[index].lat, data[index].lng], // [lat, lng]
//                     element: data[index]?.info                  // info or ""
//                 });
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }

//         setTimeout(() => { this.handleAddMarker(); }, 1500);
//     };

//     handleRemoveMarker = async () => {
//         try {
//             const response = await fetch('/api/removeMarkerPayload/');
//             const text = await response.text();
//             let data;
//             try {
//                 data = JSON.parse(text);
//             } catch (error) {
//                 console.error('Error parsing JSON:', error);
//                 return;
//             }
//             if (!Array.isArray(data)) {
//                 this.mapRef.current?.removeMarker({
//                     id: data.id,
//                     type: data.type
//                 });
//                 return;
//             }
//             for (var index = 0; index < data.length; index++) {
//                 this.mapRef.current?.removeMarker({
//                     id: data[index].id,
//                     type: data[index].type
//                 });
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//         setTimeout(() => { this.handleRemoveMarker(); }, 1500);
//     };

//     handleUpdateMarker = async () => {
//         try {
//             const response = await fetch('/api/updateMarker/');
//             const text = await response.text();
//             let data;
//             try {
//                 data = JSON.parse(text);
//             } catch (error) {
//                 console.error('Error parsing JSON:', error);
//                 return;
//             }
//             if (!Array.isArray(data)) {
//                 this.mapRef.current?.moveMarkers({
//                     movingMarkerId: data.id,                 // marker Id
//                     newCoords: [data.lat, data.lng]   // [lat, lng]
//                 });
//                 return;
//             }
//             for (var index = 0; index < data.length; index++) {
//                 this.mapRef.current?.moveMarkers({
//                     movingMarkerId: data[index].id,                 // marker Id
//                     newCoords: [data[index].lat, data[index].lng]   // [lat, lng]
//                 });
//             }
//             console.log('moved')
//         } catch (error) {
//             console.error('Error:', error);
//         }
//         setTimeout(() => { this.handleUpdateMarker(); }, 1500);
//     };

//     handleAddPolyline = async () => {
//         try {
//             const response = await fetch('/api/addPolylinePayload/');
//             const text = await response.text();
//             let data;
//             try {
//                 data = JSON.parse(text);
//             } catch (error) {
//                 console.error('Error parsing JSON:', error);
//                 return;
//             }
//             if (!Array.isArray(data)) {
//                 this.mapRef.current?.drawPolyLine({
//                     aircraftId: data.aircraftId,
//                     airportIdTo: data.airportIdTo,
//                     airportIdFrom: data?.airportIdFrom,
//                 });
//                 return;
//             }
//             for (var index = 0; index < data.length; index++) {
//                 this.mapRef.current?.drawPolyLine({
//                     aircraftId: data[index].aircraftId,
//                     airportIdTo: data[index].airportIdTo,
//                     airportIdFrom: data[index]?.airportIdFrom,
//                 });
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }

//         setTimeout(() => { this.handleAddPolyline(); }, 1000);
//     };

//     handleRemovePolyline = async () => {
//         try {
//             const response = await fetch('/api/removePolylinePayload/');
//             const text = await response.text();
//             let data;
//             try {
//                 data = JSON.parse(text);
//             } catch (error) {
//                 console.error('Error parsing JSON:', error);
//                 return;
//             }
//             if (!Array.isArray(data)) {
//                 this.mapRef.current?.removePolyLine(data.id);
//                 return;
//             }
//             for (var index = 0; index < data.length; index++) {
//                 this.mapRef.current?.removePolyLine(data[index].id);
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//         setTimeout(() => { this.handleRemovePolyline(); }, 1000);
//     };

//     handleClearMap = async () => {
//         try {
//             const response = await fetch('/api/ClearMapPayload/');
//             const text = await response.text();
//             let data;
//             try {
//                 data = JSON.parse(text);
//             } catch (error) {
//                 console.error('Error parsing JSON:', error);
//                 return;
//             }
//             if (data.ClearSwitch) {
//                 this.mapRef.current?.clearMap();
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//         setTimeout(() => { this.handleClearMap(); }, 2500);
//     };

//     // handleResponseWellnessCheck = async () => {
//     //     try {
//     //         const response = await fetch('/api/WellnessCheck/');
//     //         const responseData = await response.json();
//     //         const valid = new Set<string>(["aircrafts", "airports", "landmarks", "camera"])
//     //         if (responseData.message in valid){
//     //             const sendResponse = await fetch('/api/FrontEndData/', {
//     //                 method: 'POST',
//     //                 headers: {
//     //                     'Content-Type': 'application/json',
//     //                 },
//     //                 body: JSON.stringify(this.mapRef.current?.sendData(responseData.message)),
//     //             });
//     //         }
//     //     } catch (error) {
//     //         console.error(error);
//     //     }
//     //     setTimeout(() => { this.handleResponseWellnessCheck(); }, 1000);
//     // };

//     render() {
//         return (
//             <div>
//                 <LeafletMap ref={this.mapRef} />
//             </div>
//         );
//     }
// }

// export default InteractiveMap;


            

import React from 'react';
import LeafletMap from './LeafletMap';

class InteractiveMap extends React.Component {
    private mapRef = React.createRef<LeafletMap>();

    constructor(props: {}) {
        super(props);
    }

    // On load function
    componentDidMount() {
        setInterval(this.handleFlyToLocation, 2500); // This is a one time thing
        setInterval(this.handleAddMarker, 2500);
        setInterval(this.handleRemoveMarker, 2500);
        setInterval(this.handleUpdateMarker, 5000);
        setInterval(this.handleAddPolyline, 7000);
        setInterval(this.handleRemovePolyline, 2500);
        setInterval(this.handleClearMap, 10000);
    }

    // Move camera to given coords and zoom
    handleFlyToLocation = async () => {
        try {
            const response = await fetch('/api/flyToLastMarker');
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return;
            }           
            this.mapRef.current?.flyTo({
                lat: data.lat,
                lng: data.lng,
                zoom: data.zoom
            });
            console.log("Frontend received flyToLocation: (data) " + data);
            console.log("Frontend received flyToLocation: " + data.lat + " " + data.lng);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleAddMarker = async () => {
        try {
            const response = await fetch('/api/addMarker/');
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return;
            }
            if (!Array.isArray(data)) {
                this.mapRef.current?.addMarkers({
                    id: data.id,                         // marker id -- currently using flight id as marker id
                    type: data.type,                     // aircraft or airport -- currently only have aircraft
                    coords: [data.lat, data.lng],        // [lat, lng]
                    element: data?.info                  // info or ""
                });
                return;
            }
            for (var index = 0; index < data.length; index++) {
                this.mapRef.current?.addMarkers({
                    id: data[index].id,                         // marker id -- currently using flight id as marker id
                    type: data[index].type,                     // aircraft or airport -- currently only have aircraft
                    coords: [data[index].lat, data[index].lng], // [lat, lng]
                    element: data[index]?.info                  // info or ""
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleRemoveMarker = async () => {
        try {
            const response = await fetch('/api/removeMarker/');
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return;
            }
            if (!Array.isArray(data)) {
                this.mapRef.current?.removeMarker(data.id);
                return;
            }
            for (var index = 0; index < data.length; index++) {
                this.mapRef.current?.removeMarker(data[index].id);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleUpdateMarker = async () => {
        try {
            const response = await fetch('/api/updateMarker/');
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return;
            }
            if (!Array.isArray(data)) {
                this.mapRef.current?.moveMarkers({
                    movingMarkerId: data.id,                 // marker Id
                    newCoords: [data.lat, data.lng]   // [lat, lng]
                });
                return;
            }
            for (var index = 0; index < data.length; index++) {
                this.mapRef.current?.moveMarkers({
                    movingMarkerId: data[index].id,                 // marker Id
                    newCoords: [data[index].lat, data[index].lng]   // [lat, lng]
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleAddPolyline = async () => {
        try {
            const response = await fetch('/api/addPolylinePayload/');
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return;
            }
            console.log("aircraft: %d, airport: %d", data.aircraftID, data.airportID);
            if (!Array.isArray(data)) {
                this.mapRef.current?.drawPolyLine({
                    aircraftId: data.aircraftID,
                    airportIdTo: data.airportID,
                });
                return;
            }
            for (var index = 0; index < data.length; index++) {
                this.mapRef.current?.drawPolyLine({
                    aircraftId: data[index].aircraftID,
                    airportIdTo: data[index].airportID,
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleRemovePolyline = async () => {
        try {
            const response = await fetch('/api/removePolylinePayload/');
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return;
            }
            if (!Array.isArray(data)) {
                this.mapRef.current?.removePolyLine(data.mark_aircraft.id);
                return;
            }
            for (var index = 0; index < data.length; index++) {
                this.mapRef.current?.removePolyLine(data[index].mark_aircraft.id);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleClearMap = async () => {
        try {
            const response = await fetch('/api/ClearMapPayload');
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return;
            }
            if (data.ClearSwitch) {
                this.mapRef.current?.clearMap();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    render() {
        return (
            <div>
                <LeafletMap ref={this.mapRef} />
            </div>
        );
    }
}

export default InteractiveMap;
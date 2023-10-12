import React from 'react';
import LeafletMap from './LeafletMap';

class InteractiveMap extends React.Component {
    private mapRef = React.createRef<LeafletMap>();

    constructor(props: {}) {
        super(props);
    }

    // On load function
    componentDidMount() {

        // // This is just to reder stuff on the map like Demo one
        // const markers = [
        //     { id: "1", type: "aircraft", coords: { lat: 41.76345, lng: -93.64245, alt: 100 } },
        //     { id: "2", type: "airport", coords: { lat: 41.5341, lng: -93.6634 }, element: <p>To</p> },
        //     { id: "3", type: "airport", coords: { lat: 41.9928, lng: -93.6215 }, element: <p>From</p> }
        // ]
        // const payload = {
        //     lat: 41.76345,        // Cameras initial lat
        //     lng: -93.64245,       // Cameras initial lng
        //     zoom: 10,             // Cameras initial zoom
        // }
        // for (let i = 0; i < markers.length; i++) {
        //     const markerDataPayload =
        //         this.mapRef.current.addMarkers({
        //             id: markers[i].id,          // marker type
        //             type: markers[i].type,
        //             coords: markers[i].coords,     // [lat, lng]
        //             element: markers[i].element         // info or ""
        //         })
        // }
        // this.mapRef.current.flyTo(payload)

        // const x = {
        //     aircraftId: "1",
        //     airportId: "2",
        //     polyLineId: "1"
        // }

        // this.mapRef.current.drawPolyLine(x)
        // // this.mapRef.current.removePolyLine(1)






        // This is were we are calling function to load stuff from the back end
        //setInterval(this.handleFlyToLocation, 5000);
        //setInterval(this.handleAddMarker, 5000);
        
        // setInterval(this.handleRemoveMarker, 5000);
        // setInterval(this.handleClearMapMarkers, 5000);
        // this.handleAddMarker('ASA184');
        this.startDemo();
        setInterval(this.handleUpdateMarker, 2500);
        setInterval(this.handleFlyToLocation, 2500);
        // setInterval(this.handleUpdateMarker, 5000)
        // setInterval(this.handleAddMarker, 5000)
        
        
        //setInterval(this.handleUpdateMarker.bind(null, 'ASA184'), 5000);
        //setInterval( function() { this.handleUpdateMarker('ASA184'); }, 5000);

    }

    // updateDemo = async () => {
    //     const response = await fetch('/api/startDemo');
    //     const data = await response.json();
    // }

    // runDemo = async function() {
    //     return new Promise(function(resolve)) {
    //         var id = await this.startDemo()
    //         setTimeout(function() {
    //             resolve(["id"])
    //         }, 2000);
    //     });
    // }
    

    startDemo = async () => {
        try {
            //var flight = 'ASA184';
            const response = await fetch('/api/startDemo');
            const data = await response.json();

            for(var i = 0; i < 2; i++) {
                // Get airports
                let markerDataPayload = {
                    id: data[i].id,                 // marker id -- currently using flight id as marker id
                    type: 'airport',                    // aircraft or airport -- currently only have aircraft
                    coords: [data[i].lat, data[i].lng],     // [lat, lng]
                    element: data[i]?.info              // info or ""
                }
                this.mapRef.current?.addMarkers(markerDataPayload);
            }

            let markerDataPayload = {
                id: data[i].id,                 // marker id -- currently using flight id as marker id
                type: 'aircraft',                    // aircraft or airport -- currently only have aircraft
                coords: [data[i].lat, data[i].lng],     // [lat, lng]
                element: data[i]?.info              // info or ""
            }
            this.mapRef.current?.addMarkers(markerDataPayload);
            // return resolve(markerDataPayload.id);

            // Testing for sending an array of data from the back to the front
            // const data = await response.json();
            // for(let i = 0; i< data.length; i++){
            //     let markerDataPayload = {
            //         id: data[i].flight,          // marker id -- currently using flight id as marker id
            //         type: data[i].type,        // aircraft or airport -- currently only have aircraft
            //         coords: [data[i].lat, data[i].lng],     // [lat, lng]
            //         element: data[i]?.info          // info or ""
            //     }
            //     this.mapRef.current?.addMarkers(markerDataPayload);
            // }
            
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Move camera to given coords and zoom
    handleFlyToLocation = async () => {
        try {
            const response = await fetch('/api/flyToLastMarker');
            const data = await response.json();

            const x = {
                lat: data.lat,  
                lng: data.lng,
                zoom: data.zoom
            }
            console.log("Frontend received flyToLocation: (data) " + data);

            console.log("Frontend received flyToLocation: " + x.lat + " " + x.lng);
            this.mapRef.current?.flyTo(x);
            
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleAddMarker = async (flight: string) => {
        try {
            //var flight = 'ASA184';
            const response = await fetch('/api/' + flight + '/addMarker/');
            const data = await response.json();
            const markerDataPayload = {
                id: data.flight,          // marker id -- currently using flight id as marker id
                type: 'aircraft',        // aircraft or airport -- currently only have aircraft
                coords: [data.lat, data.lng],     // [lat, lng]
                element: data?.info          // info or ""
            }
            this.mapRef.current?.addMarkers(markerDataPayload);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleUpdateMarker = async (markerID) => {
        try {
            const response = await fetch('/api/' + markerID + '/updateDemo/');
            const data = await response.json();
            this.mapRef.current?.moveMarkers({
                movingMarkerId: data.id,  // marker Id
                newCoords: [data.lat, data.lng]      // [lat, lng]
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleRemoveMarker = async (markerID) => {
        try {
            const response = await fetch('/api/' + markerID + '/removeMarkerPayload');
            const data = await response.json();
            this.mapRef.current?.removeMarker(data.id);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleClearMapMarkers = async () => {
        try {
            const response = await fetch('/api/ClearMarkerPayload');
            const data = await response.json();
            if(data.ClearSwitch){
                this.mapRef.current?.clearMarkers();
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
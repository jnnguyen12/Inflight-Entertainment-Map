
import React from 'react';
import LeafletMap from './LeafletMap';

function parseText(text: any){
    if(text === "") return 0;
    try {
        return JSON.parse(text);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return 0;
    }
}

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
        //setInterval(this.handleClearMap, 10000);

    }

    componentWillUnmount() {
        fetch('/api/PageReload/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({"Page": "Refreshed"}),
        });
    }


    // Move camera to given coords and zoom
    handleFlyToLocation = async () => {
        try {
            const response = await fetch('/api/flyToLastMarker');
            const data = parseText(await response.text())
            if(data == 0) return;
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
            const parsedData = parseText(await response.text())
            if(parsedData == 0) return;
            const data = Array.isArray(parsedData) ? parsedData : [parsedData];
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
            const parsedData = parseText(await response.text())
            if(parsedData == 0) return;
            const data = Array.isArray(parsedData) ? parsedData : [parsedData];
            for (var index = 0; index < data.length; index++) {
                this.mapRef.current?.removeMarker({
                    id: data[index].id,
                    type: data[index].type
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleUpdateMarker = async () => {
        try {
            const response = await fetch('/api/updateMarker/');
            const parsedData = parseText(await response.text())
            if(parsedData == 0) return;
            const data = Array.isArray(parsedData) ? parsedData : [parsedData];
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
            const parsedData = parseText(await response.text())
            if(parsedData == 0) return;
            const data = Array.isArray(parsedData) ? parsedData : [parsedData];
            for (var index = 0; index < data.length; index++) {
                console.log("aircraft: %d, airportFrom: %d, airportTo: %d", data[index].aircraftID, data[index].airportIDFrom, data[index].airportIDTo);
                this.mapRef.current?.drawPolyLine({
                    aircraftId: data[index].aircraftID,
                    airportIdTo: data[index].airportIDTo,
                    airportIdFrom: data[index].airportIDFrom
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }; 

    handleRemovePolyline = async () => {
        try {
            const response = await fetch('/api/removePolylinePayload/');
            const parsedData = parseText(await response.text())
            if(parsedData == 0) return;
            const data = Array.isArray(parsedData) ? parsedData : [parsedData];
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
            const data = parseText(await response.text())
            if(data == 0) return;
            if (data.ClearSwitch) {
                this.mapRef.current?.clearMap();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleResponseWellnessCheck = async () => {
        try {
            const response = await fetch('/api/WellnessCheck/');
            const responseData = await response.json();
            const valid = new Set<string>(["aircrafts", "airports", "landmarks", "camera"])
            if (responseData.message in valid){
                const sendResponse = await fetch('/api/FrontEndData/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.mapRef.current?.sendData(responseData.message)),
                });
            }
        } catch (error) {
            console.error(error);
        }
        setTimeout(() => { this.handleResponseWellnessCheck(); }, 1000);
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
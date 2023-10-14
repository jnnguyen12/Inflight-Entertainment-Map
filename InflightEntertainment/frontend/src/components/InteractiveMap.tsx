import React from 'react';
import LeafletMap from './LeafletMap';

class InteractiveMap extends React.Component {
    private mapRef = React.createRef<LeafletMap>();

    constructor(props: {}) {
        super(props);
    }

    // On load function
    componentDidMount() {
        this.handleFlyToLocation();
        this.handleAddMarker();
        this.handleRemoveMarker();
        this.handleUpdateMarker();
        this.handleAddPolyline();
        this.handleRemovePolyline();
        this.handleClearMap();
        this.handleResponseWellnessCheck();
    }

    // Move camera to given coords and zoom
    handleFlyToLocation = async () => {
        try {
            const response = await fetch('/api/flyToLastMarker/');
            const data = await response.json();
            const fly = {
                lat: data.lat,
                lng: data.lng,
                zoom: data.zoom
            }
            this.mapRef.current?.flyTo(fly);
        } catch (error) {
            console.error('Error:', error);
        }
        setTimeout(() => { this.handleFlyToLocation(); }, 1500);
    };

    handleAddMarker = async () => {
        try {
            const response = await fetch('/api/addMarker/');
            const data = await response.json();
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

        setTimeout(() => { this.handleAddMarker(); }, 1500);
    };

    handleRemoveMarker = async () => {
        try {
            const response = await fetch('/api/removeMarkerPayload/');
            const data = await response.json();
            if (!Array.isArray(data)) {
                this.mapRef.current?.removeMarker({
                    id: data.id,
                    type: data.type
                });
                return;
            }
            for (var index = 0; index < data.length; index++) {
                this.mapRef.current?.removeMarker({
                    id: data[index].id,
                    type: data[index].type
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setTimeout(() => { this.handleRemoveMarker(); }, 1500);
    };

    handleUpdateMarker = async () => {
        try {
            const response = await fetch('/api/updateMarker/');
            const data = await response.json();
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
        setTimeout(() => { this.handleUpdateMarker(); }, 1500);
    };

    handleAddPolyline = async () => {
        try {
            const response = await fetch('/api/addPolylinePayload/');
            const data = await response.json();
            if (!Array.isArray(data)) {
                this.mapRef.current?.drawPolyLine({
                    aircraftId: data.aircraftId,
                    airportIdTo: data.airportIdTo,
                    airportIdFrom: data?.airportIdFrom,
                });
                return;
            }
            for (var index = 0; index < data.length; index++) {
                this.mapRef.current?.drawPolyLine({
                    aircraftId: data[index].aircraftId,
                    airportIdTo: data[index].airportIdTo,
                    airportIdFrom: data[index]?.airportIdFrom,
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }

        setTimeout(() => { this.handleAddPolyline(); }, 1000);
    };

    handleRemovePolyline = async () => {
        try {
            const response = await fetch('/api/removePolylinePayload/');
            const data = await response.json();
            if (!Array.isArray(data)) {
                this.mapRef.current?.removePolyLine(data.id);
                return;
            }
            for (var index = 0; index < data.length; index++) {
                this.mapRef.current?.removePolyLine(data[index].id);
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setTimeout(() => { this.handleRemovePolyline(); }, 1000);
    };

    handleClearMap = async () => {
        try {
            const response = await fetch('/api/ClearMapPayload/');
            const data = await response.json();
            if (data.ClearSwitch) {
                this.mapRef.current?.clearMap();
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setTimeout(() => { this.handleClearMap(); }, 2500);
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
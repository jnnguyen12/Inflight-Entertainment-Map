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
        setInterval(this.handleAddPolyline, 2500);
        setInterval(this.handleRemovePolyline, 2500);
        setInterval(this.handleClearMap, 10000);
    }

    // Move camera to given coords and zoom
    handleFlyToLocation = async () => {
        try {
            const response = await fetch('/api/flyToLastMarker');
            const data = await response.json();
            const fly = {
                lat: data.lat,
                lng: data.lng,
                zoom: data.zoom
            }
            console.log("Frontend received flyToLocation: (data) " + data);
            console.log("Frontend received flyToLocation: " + fly.lat + " " + fly.lng);
            this.mapRef.current?.flyTo(fly);
        } catch (error) {
            console.error('Error:', error);
        }
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
    };

    handleRemoveMarker = async () => {
        try {
            const response = await fetch('/api/removeMarker/');
            const data = await response.json();
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
    };

    handleAddPolyline = async () => {
        try {
            const response = await fetch('/api/addPolylinePayload/');
            const data = await response.json();
            console.log("aircraft: %d, airport: %d", data.mark_aircraft.id, data.mark_airport.id);
            if (!Array.isArray(data)) {
                this.mapRef.current?.drawPolyLine({
                    aircraftId: data.mark_aircraft.id,
                    airportId: data.mark_airport.id,
                });
                return;
            }
            for (var index = 0; index < data.length; index++) {
                this.mapRef.current?.drawPolyLine({
                    aircraftId: data[index].mark_aircraft.id,
                    airportId: data[index].mark_airport.id,
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleRemovePolyline = async () => {
        try {
            const response = await fetch('/api/removePolylinePayload/');
            const data = await response.json();
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
            const data = await response.json();
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
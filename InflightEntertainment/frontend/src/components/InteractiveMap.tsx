import React from 'react';
import LeafletMap from './LeafletMap';

type Flight = {
    id: number;
    hex: string;
    flight: string;
    r: string;
    t: string;
};

type FlightRecord = {
    flight: Flight;
    timestamp: string;
    lat: number;
    lng: number;
    alt_baro: number | null;
    alt_geom: number | null;
    track: number | null;
    gs: number;
};

interface InteractiveMapProps {
    flightRecords: FlightRecord[];
}

class InteractiveMap extends React.Component<InteractiveMapProps> {
    private mapRef = React.createRef<LeafletMap>();

    constructor(props: InteractiveMapProps) {
        super(props);
    }

    // On load function
    componentDidMount() {
        // setInterval(this.handleFlyToLocation, 2500); // This is a one time thing
        // setInterval(this.handleAddMarker, 2500);
        // setInterval(this.handleRemoveMarker, 2500);
        // setInterval(this.handleUpdateMarker, 5000);
        // setInterval(this.handleAddPolyline, 7000);
        // setInterval(this.handleRemovePolyline, 2500);
        // Need some logic for this bc the backend will delete all markers whenever its received
        // setInterval(this.handleClearMap, 10000);
        for (let record of this.props.flightRecords) {
            this.addFlightRecordAsMarker(record);
        }
    }
    
    componentDidUpdate(prevProps: InteractiveMapProps) {
        // If the flightRecords prop has changed add the new flight records as markers.
        if (this.props.flightRecords !== prevProps.flightRecords) {
            for (let record of this.props.flightRecords) {
                if (!prevProps.flightRecords.includes(record)) {
                    this.addFlightRecordAsMarker(record);
                }
            }
        }
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
            console.log("aircraft: %d, airport: %d", data.aircraftID, data.airportID);
            if (!Array.isArray(data)) {
                this.mapRef.current?.drawPolyLine({
                    aircraftId: data.aircraftID,
                    airportId: data.airportID,
                });
                return;
            }
            for (var index = 0; index < data.length; index++) {
                this.mapRef.current?.drawPolyLine({
                    aircraftId: data[index].aircraftID,
                    airportId: data[index].airportID,
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
            const response = await fetch('/api/clearMarkers/');
            const data = await response.json();
            if (data.ClearSwitch) {
                this.mapRef.current?.clearMap();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    addFlightRecordAsMarker = (record: FlightRecord) => {
        this.mapRef.current?.removeMarker(record.flight.id);
        let rotationAngle;
    
        // Check if the previous record for the flight exists
        const previousRecords = this.props.flightRecords.filter(
            r => r.flight.id === record.flight.id && r.timestamp < record.timestamp
        );
    
        if (previousRecords.length > 0) {
            const prevRecord = previousRecords[previousRecords.length - 1];
            rotationAngle = calculateRotation(prevRecord.lat, prevRecord.lng, record.lat, record.lng);
        }
    
        const markerDataPayload = {
            id: record.flight.id,
            type: "aircraft",
            coords: { lat: record.lat, lng: record.lng },
            rotationAngle: rotationAngle,
            element: <p>{record.flight.flight}</p>
        }
        this.mapRef.current?.addMarkers(markerDataPayload);
    };
    
    render() {
        return (
            <div>
                <LeafletMap ref={this.mapRef} />
            </div>
        );
    }
}
function calculateRotation(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const radLat1 = toRadians(lat1);
    const radLat2 = toRadians(lat2);
    const diffLngg = toRadians(lng2 - lng1);
  
    const x = Math.atan2(
        Math.sin(diffLngg) * Math.cos(radLat2),
        Math.cos(radLat1) * Math.sin(radLat2) -
        Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(diffLngg)
    );
  
    return (toDegrees(x) + 360) % 360;
}
  
function toRadians(degree: number): number {
    return degree * Math.PI / 180;
}
  
function toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
}

export default InteractiveMap;
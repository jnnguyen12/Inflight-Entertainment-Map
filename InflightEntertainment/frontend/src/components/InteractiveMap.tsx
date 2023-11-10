
import React from 'react';
import LeafletMap from './LeafletMap';

function parseText(text: any) {
    if (text === "") return 0;
    try {
        return JSON.parse(text);
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return 0;
    }
}

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
    ground_speed: number;
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

    componentWillUnmount() {
        fetch('/api/PageReload/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "Page": "Refreshed" }),
        });
    }

    addFlightRecordAsMarker = (record: FlightRecord) => {
        //this.mapRef.current?.removeMarker({ id: String(record.flight.id), type: "aircraft" });
        let rotationAngle;

        // Check if the previous record for the flight exists
        const previousRecords = this.props.flightRecords.filter(
            r => r.flight.id === record.flight.id && r.timestamp < record.timestamp
        );

        if (previousRecords.length > 0) {
            const prevRecord = previousRecords[previousRecords.length - 1];
            rotationAngle = calculateRotation(prevRecord.lat, prevRecord.lng, record.lat, record.lng);
        }
        else{
            rotationAngle = 0;
        }

        this.mapRef.current?.updateOrCreateMarker({
            id: String(record.flight.id),
            type: "aircraft",
            coords: { lat: record.lat, lng: record.lng },
            rotation: rotationAngle,
            element: <p>{record.flight.flight}</p>
        });
        //this.mapRef.current?.addMarkers(markerDataPayload);
    };

    render() {
        return (
            <div>
                <LeafletMap ref={this.mapRef} />
            </div>
        );
    }
}

// Improved 
function calculateRotation(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const toRadians = (degree: number) => degree * (Math.PI / 180);
    const toDegrees = (radians: number) => radians * (180 / Math.PI);
    const radLat1 = toRadians(lat1);
    const radLat2 = toRadians(lat2);
    const diffLng = toRadians(lng2 - lng1);
    return (toDegrees(Math.atan2(
        Math.sin(diffLng) * Math.cos(radLat2),
        Math.cos(radLat1) * Math.sin(radLat2) - Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(diffLng)
    )) + 360) % 360;
}

export default InteractiveMap;
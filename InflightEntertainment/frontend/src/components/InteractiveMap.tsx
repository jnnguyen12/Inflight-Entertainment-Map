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
    lon: number;
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
                        // This is just to reder stuff on the map like Demo one
        // const markers = [
        //     { id: 1, type: "aircraft", coords: { lat: 41.76345, lng: -93.64245, alt: 100 } },
        //     { id: 2, type: "airport", coords: { lat: 41.5341, lng: -93.6634 }, element: <p>To</p> },
        //     { id: 3, type: "airport", coords: { lat: 41.9928, lng: -93.6215 }, element: <p>From</p> }
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

        // This is were we are calling function to load stuff from the back end
        setInterval(this.handleFlyToLocation, 5000);
        setInterval(this.handleAddMarker, 5000);
        setInterval(this.handleUpdateMarker, 5000);
        setInterval(this.handleRemoveMarker, 5000);
        setInterval(this.handleClearMapMarkers, 5000);
        for (let record of this.props.flightRecords) {
            this.addFlightRecordAsMarker(record);
        }
    }
    
    componentDidUpdate(prevProps: InteractiveMapProps) {
        // If the flightRecords prop has changed...
        if (this.props.flightRecords !== prevProps.flightRecords) {
            // ... add the new flight records as markers.
            for (let record of this.props.flightRecords) {
                if (!prevProps.flightRecords.includes(record)) {
                    this.addFlightRecordAsMarker(record);
                }
            }
        }
    }

    handleFlyToLocation = async () => {
        try {
            const response = await fetch('/api/flyToMarkerPayload');
            const data = await response.json();
            this.mapRef.current?.flyTo({
                lat: data.lat,
                lng: data.lng,
                zoom: data.zoom
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleAddMarker = async () => {
        try {
            const response = await fetch('/api/markerDataPayload');
            const data = await response.json();
            const markerDataPayload = {
                id: data.id,          // marker type
                type: data.type,        // aircraft or airport
                coords: data.coords,     // [lat, lng]
                element: data?.info          // info or ""
            }
            this.mapRef.current?.addMarkers(markerDataPayload);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleUpdateMarker = async () => {
        try {
            const response = await fetch('/api/moveMarkerPayload');
            const data = await response.json();
            this.mapRef.current?.moveMarkers({
                movingMarkerId: data.id,  // marker Id
                newCoords: data.coords      // [lat, lng]
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };

    handleRemoveMarker = async () => {
        try {
            const response = await fetch('/api/removeMarkerPayload');
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
            if (data.ClearSwitch) {
                this.mapRef.current?.clearMarkers();
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    addFlightRecordAsMarker = (record: FlightRecord) => {
        // Check if a marker with the same ID already exists
        if (this.mapRef.current?.markerExists(record.flight.id)) {
            // Remove the existing marker
            this.mapRef.current?.removeMarker(record.flight.id);
        }

        const markerDataPayload = {
            id: record.flight.id,
            type: "aircraft",
            coords: { lat: record.lat, lng: record.lon },
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

export default InteractiveMap;
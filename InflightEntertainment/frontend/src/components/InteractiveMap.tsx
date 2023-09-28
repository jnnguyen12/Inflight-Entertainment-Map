import React from 'react';
import LeafletMap from './LeafletMap';

class InteractiveMap extends React.Component {
    private mapRef = React.createRef<LeafletMap>();

    constructor(props: {}) {
        super(props);
    }

    // On load function
    componentDidMount() {
        // This is just to reder stuff on the map  
        const markers = [
            { id: 1, type: "aircraft", coords: { lat: 41.76345, lng: -93.64245, alt: 100 } },
            { id: 2, type: "airport", coords: { lat: 41.5341, lng: -93.6634 }, element: <p>To</p> },
            { id: 3, type: "airport", coords: { lat: 41.9928, lng: -93.6215 }, element: <p>From</p> }
        ]

        const payload = {
            lat: 41.76345,        // Cameras initial lat
            lng: -93.64245,       // Cameras initial lng
            zoom: 14,
        }

        for (let i = 0; i < markers.length; i++) {
            const markerDataPayload =
                this.mapRef.current.addMarkers({
                    id: markers[i].id,          // marker type
                    type: markers[i].type,
                    coords: markers[i].coords,     // [lat, lng]
                    element: markers[i].element         // info or ""
                })
        }
        this.mapRef.current.flyTo(payload)

        // This is were we are calling function to load stuff from the back end
        setInterval(this.handleAddMarker, 5000);
        setInterval(this.handleUpdateMarker, 5000);
        setInterval(this.handleRemoveMarker, 5000);
    }

    handleAddMarker = async () => {
        try {
            const response = await fetch('/api/markerDataPayload');
            const data = await response.json();
            const markerDataPayload = {
                id: data.id,          // marker type
                type: data.type,
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

    render() {
        return (
            <LeafletMap ref={this.mapRef} />
        );
    }
}

export default InteractiveMap;
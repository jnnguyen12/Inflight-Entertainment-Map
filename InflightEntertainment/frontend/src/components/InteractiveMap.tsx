import React from 'react';
import LeafletMap from './LeafletMap';
import { Flight, FlyCameraTo, MarkerData, UpdateMarkerData, PolyLineData, RemoveData, Wellness } from './Interfaces'

// Rnd
import { Rnd } from "react-rnd";


class InteractiveMap extends React.Component {
    private mapRef = React.createRef<LeafletMap>();
    private socket: WebSocket | null = null; // WebSocket connection
    private Flight: Flight | null = null

    constructor(props: {}) {
        super(props);
    }

    // On load function
    componentDidMount() {
        const url = `ws://${window.location.host}/ws/socket-server/`; // Clients URL
        this.socket = new WebSocket(url);
        this.socket.addEventListener('open', this.handleSocketOpen);
        this.socket.addEventListener('close', this.handleSocketClose);
        this.socket.addEventListener('message', this.handleSocketMessage);
    }

    componentWillUnmount() {
        this.socket.send(JSON.stringify({
            action: 'FrontEndData',
            data: "Closing Map"
        }));
        if (this.socket) this.socket.close();
    }

    private handleSocketOpen() {
        console.log('WebSocket connection established.');
    }

    private handleSocketClose() {
        console.log('WebSocket connection closed.');
    }

    private handleSocketMessage(event: MessageEvent) {
        const text = event.data
        let dataJson;
        if (text === "") return;
        try {
            dataJson = JSON.parse(text);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return;
        }
        const data = Array.isArray(dataJson) ? dataJson : [dataJson];
        const response: any[] = [];
        let flightData;
        data.forEach((payload) => {
            try {
                switch (payload.command) {
                    case 'setFlight':
                        flightData = payload as Flight
                        this.Flight = flightData;
                        this.mapRef.current?.addMarkers({ id: flightData.id, type: "aircraft", lat: flightData.lat, lng: flightData.lng, rotation: 0 });
                        break;
                    case 'updateFlight':
                        flightData = payload as Flight
                        this.Flight = flightData;
                        this.mapRef.current?.moveMarkers({ id: flightData.id, lat: flightData.lat, lng: flightData.lng });
                        break;
                    case 'removeFlight':
                        flightData = payload as RemoveData
                        this.Flight = null
                        this.mapRef.current?.removeMarker({ id: flightData.id, type: "aircraft" });
                        break;
                    case 'flyToLocation':
                        // Move camera to given coords and zoom
                        this.mapRef.current?.flyTo(payload as FlyCameraTo);
                        break;
                    case 'addMarker':
                        flightData = payload as MarkerData
                        if (flightData.id === this.Flight.id) {
                            response.push("Error cant add marker because it is the current flight")
                            console.warn("Error cant add marker because it is the current flight")
                            break;
                        }
                        this.mapRef.current?.addMarkers(flightData);
                        break;
                    case 'removeMarker':
                        flightData = payload as RemoveData
                        if (flightData.id === this.Flight.id) {
                            response.push("Error cant remove marker because it is the current flight")
                            console.warn("Error cant remove marker because it is the current flight")
                            break;
                        }
                        this.mapRef.current?.removeMarker(flightData);
                        break;
                    case 'updateMarker':
                        flightData = payload as UpdateMarkerData
                        if (flightData.id === this.Flight.id) {
                            response.push("Error cant update marker because it is the current flight")
                            console.warn("Error cant update marker because it is the current flight")
                            break;
                        }
                        this.mapRef.current?.moveMarkers(flightData);
                        break;
                    case 'addPolyline':
                        this.mapRef.current?.drawPolyLine(payload as PolyLineData);
                        break;
                    case 'removePolyline':
                        this.mapRef.current?.removePolyLine(payload as RemoveData);
                        break;
                    case 'clearMap':
                        this.mapRef.current?.clearMap();
                        break;
                    case 'responseWellness':
                        response.push(this.mapRef.current?.sendData(payload as Wellness));
                        break;
                    default:
                        console.warn("Unknown command sent: ", payload.command);
                }
            }
            catch (error) {
                console.error('Error:', error);
            }
        });
        if (response.length > 0) {
            this.socket.send(JSON.stringify({ action: 'FrontResponse', data: response }));
        }
    }

    render() {
        return (
            <Rnd
                className='rnd-container'
                default={{
                    x: 0,
                    y: 0,
                    width: 320,
                    height: 200,
                }}
                onDrag={(e, d) => { if (this.mapRef.current?.mapStatus()) return false; /* Prevent dragging the Rnd component */ }}
            >
                <LeafletMap ref={this.mapRef} />
            </Rnd>
        );
    }
}

export default InteractiveMap;

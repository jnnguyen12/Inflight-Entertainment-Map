import React from 'react';
import LeafletMap from './LeafletMap';
import { FlyCameraTo, MarkerData, UpdateMarkerData, PolyLineData, RemoveData, Wellness } from './Interfaces'

class InteractiveMap extends React.Component {
    private mapRef = React.createRef<LeafletMap>();
    private socket: WebSocket | null = null; // WebSocket connection

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
        if (text === "") return 0;
        try {
            dataJson = JSON.parse(text);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return;
        }
        const data = Array.isArray(dataJson) ? dataJson : [dataJson];
        const response: any[] = [];
        data.forEach((payload) => {
            try {
                switch (payload.command) {
                    case 'flyToLocation':
                        // Move camera to given coords and zoom
                        this.mapRef.current?.flyTo(payload as FlyCameraTo);
                        break;
                    case 'addMarker':
                        this.mapRef.current?.addMarkers(payload as MarkerData);
                        break;
                    case 'removeMarker':
                        this.mapRef.current?.removeMarker(payload as RemoveData);
                        break;
                    case 'updateMarker':
                        this.mapRef.current?.moveMarkers(payload as UpdateMarkerData);
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
            this.socket.send(JSON.stringify({
                action: 'FrontEndData',
                data: response
            }));
        }
    }

    render() {
        return (
            <div>
                <LeafletMap ref={this.mapRef} />
            </div>
        );
    }
}

export default InteractiveMap;

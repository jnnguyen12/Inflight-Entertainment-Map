import React from 'react';
import LeafletMap from './LeafletMap';
import { Flight, FlyCameraTo, MarkerData, UpdateMarkerData, PolyLineData, RemoveData, Wellness } from './Interfaces'

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
    faCompress,
    faPlaneUp,
    faChevronRight,
} from "@fortawesome/free-solid-svg-icons";


// Rnd
import { Rnd } from "react-rnd";

interface RndStates {
    RndXPosition: number;
    RndYPosition: number;
    RndWidth: number;
    RndHeight: number;
    fullScreen: boolean;
}

function calculateDistanceInKm(originLat: number, originLng: number, destinationLat: number, destinationLng: number): number {
    const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(destinationLat - originLat);
    const dLon = toRadians(destinationLng - originLng);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(originLat)) *
        Math.cos(toRadians(destinationLat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

function calculateDistanceInMiles(originLat: number, originLng: number, destinationLat: number, destinationLng: number): number {
    const distance = calculateDistanceInKm(originLat, originLng, destinationLat, destinationLng)
    // Convert distance to miles
    return distance * 0.621371;
}



class InteractiveMap extends React.Component<{}, RndStates> {
    private mapRef = React.createRef<LeafletMap>();
    private socket: WebSocket | null = null; // WebSocket connection
    private Flight: Flight | null = null     // Current Flight

    constructor(props) {
        super(props);
        this.state = {
            RndXPosition: 0,
            RndYPosition: 0,
            RndWidth: 400,
            RndHeight: 300,
            fullScreen: true,
        };
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
        // Sending a message to the backend if the page closed
        this.socket.send(JSON.stringify({
            action: 'FrontEndResponse',
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
                        this.mapRef.current?.addMarkers({ id: flightData.id, type: "aircraft", lat: flightData.lat, lng: flightData.lng, rotation: payload?.rotation ?? 0 });
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
                    case 'wellness':
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
            this.socket.send(JSON.stringify({ action: 'FrontEndResponse', data: response }));
        }
    }

    goFullScreen() {
        this.setState({
            fullScreen: true,
        });
        console.warn("Full screen")
    }

    goWindowed() {
        this.setState({
            fullScreen: false,
        });
        console.warn("Windowed");
    }

    render() {
        const leafletMap = <LeafletMap ref={this.mapRef} />;

        const knotsToMph = (knots: number): number => knots * 1.15078;
        const knotsToKph = (knots: number): number => knots * 1.852;
        const feetToMeters = (feet: number): number => feet * 0.3048;
        const calculateDistanceInMiles = (distanceKm: number): number => distanceKm * 0.621371;

        // orig to plan
        let travaledKm = calculateDistanceInKm(
            this.Flight.airportOriginLat,
            this.Flight.airportOriginLng,
            this.Flight.lat,
            this.Flight.lng
        )
        
        // plan to dest
        let remainingKm = calculateDistanceInKm(
            this.Flight.lat,
            this.Flight.lng,
            this.Flight.airportDestinationLat,
            this.Flight.airportDestinationLng
        )

        let totalDistanceKm = calculateDistanceInKm(
            this.Flight.airportOriginLat,
            this.Flight.airportOriginLng,
            this.Flight.airportDestinationLat,
            this.Flight.airportDestinationLng
        )

        if (this.state.fullScreen) {
            return (
                <>
                    <div className="row container-fluid vh-100 ">
                        <div className="col-xl-4 d-flex align-items-center vh-100 position-relative">
                            {/* main panel that displays information */}
                            <a
                                className="btn me-2"
                                data-bs-toggle="collapse"
                                href="#collapseExample"
                                role="button"
                                aria-expanded="false"
                                aria-controls="collapseExample"
                            >
                                {/* TODO: turn this into chevron left on expansion */}
                                <FontAwesomeIcon icon={faChevronRight} />
                            </a>
                            <div className="collapse collapse-horizontal" id="collapseExample">
                                <div className="panel" style={{ width: "500px" }}>
                                    <div className="container-fluid d-flex flex-column h-100">
                                        {/* aircraft type  */}
                                        <div className="mx-auto">
                                            <div className="flight-num">{this.Flight.flight}</div>
                                            <div className="small text-center">{this.Flight.aircraftType}</div>
                                        </div>

                                        {/* time  */}
                                        <div className="time d-flex justify-content-between align-items-center">
                                            <div>
                                                <h4>16:15</h4>
                                                <small>Local time</small>
                                            </div>
                                            <div className="text-end">
                                                <h4>4:15AM</h4>
                                                <small>Destination time</small>
                                            </div>
                                        </div>
                                        <hr />
                                        {/* airports info  */}
                                        <div className="d-flex-flex-column">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <h1 className="display-4 fw-normal">SGN</h1>
                                                <small className="text-center">
                                                    2h30 <br /> remaining
                                                </small>
                                                <h1 className="display-4 fw-normal text-end">DSM</h1>
                                            </div>

                                            <div
                                                className="progress"
                                                role="progressbar"
                                                data-aria-label="Animated striped example"
                                                data-aria-valuenow="75"
                                                data-aria-valuemin="0"
                                                data-aria-valuemax="100"
                                            >
                                                <div
                                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                                    style={{ width: "75%" }}
                                                ></div>
                                            </div>

                                            <div className="cities mt-2 d-flex justify-content-between align-items-center">
                                                <p>{this.Flight.airportOrigin}</p>
                                                <p className="text-end">{this.Flight.airportDestination}</p>
                                            </div>
                                        </div>

                                        {/* extra info  */}
                                        <div className="extra-info d-flex flex-column justify-content-evenly">
                                            {/* distance  */}
                                            <div className="distance text-center d-flex flex-column">
                                                <h4>{travaledKm} km | {calculateDistanceInMiles(travaledKm)} miles</h4>
                                                <p>traveled</p>
                                                <div className="position-relative mb-3">
                                                    <div className="bar" />
                                                    <FontAwesomeIcon icon={faPlaneUp} />
                                                    <div className="bar"></div>
                                                </div>
                                                <h4>{remainingKm} km | {calculateDistanceInMiles(remainingKm)} miles</h4>
                                                <p>remaining</p>
                                            </div>

                                            <hr />
                                            {/* other extra info */}
                                            <p>Ground speed <span className="float-end">{knotsToKph(this.Flight.ground_speed)} kph | {knotsToMph(this.Flight.ground_speed)} mph</span></p>
                                            <p>Altitude <span className="float-end">{this.Flight.alt_geom} ft | {feetToMeters(this.Flight.alt_geom)} m</span></p>
                                            <p>Longtitude<span className="float-end">{this.Flight.lng}</span></p>
                                            <p>Latitude<span className="float-end">{this.Flight.lat}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <FontAwesomeIcon
                        className="expander"
                        icon={faCompress}
                        onClick={this.goWindowed.bind(this)}
                    />
                    {leafletMap}
                </>
            )
        }
        else {
            return (
                <Rnd
                    className="rnd-container"
                    default={{
                        x: 0,
                        y: 0,
                        width: this.state.RndWidth,
                        height: this.state.RndHeight,
                    }}
                    size={{ width: this.state.RndWidth, height: this.state.RndHeight }}
                    onDrag={(e, d) => {
                        if (this.mapRef.current?.mapStatus()) return false; /* Prevent dragging the Rnd component */
                        this.setState({ RndXPosition: d.x, RndYPosition: d.y });
                    }}
                    position={{ x: this.state.RndXPosition, y: this.state.RndYPosition }}
                    onResizeStop={(e, direction, ref, delta, position) => {
                        this.setState({
                            RndWidth: parseInt(ref.style.width),
                            RndHeight: parseInt(ref.style.height),
                            RndXPosition: position.x,
                            RndYPosition: position.y,
                        });
                        this.mapRef.current?.reloadMap();
                    }}
                >
                    {leafletMap}
                </Rnd >
            );
        }
    }
}

export default InteractiveMap;
import React from 'react';
import LeafletMap from './LeafletMap';
import { RndStates, Flight, FlyCameraTo, MarkerData, UpdateMarkerData, PolyLineData, RemoveData, Wellness } from './Interfaces'

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

function stringValid(myString: string | null): boolean {
    return myString !== null && myString !== "";
}

const numberValid = (myNumber: number | null): boolean => myNumber !== null && !isNaN(myNumber);

// const testFlight: Flight = {
//     id: 'F1',
//     flight: 'FLIGHT01',
//     lat: 35.6895,
//     lng: 139.6917,
//     rotation: 45,
//     airportOrigin: {
//         id: 'A1',
//         name: 'Airport 1',
//         nameAbbreviated: 'A1',
//         lat: 37.7749,
//         lng: -122.4194,
//         time: '12:00 PM',
//     },
//     airportDestination: {
//         id: 'A2',
//         name: 'Airport 2',
//         nameAbbreviated: 'A2',
//         lat: 40.7128,
//         lng: -74.0060,
//         time: '02:30 PM',
//     },
//     aircraftType: 'Boeing 747',
//     altitude: '35000', // Example barometric altitude in feet
//     ground_speed: '500', // Example ground speed in knots
//     estimatedTime: '2 hours',
//     progress: 50,
//     travaledKm: 1500,
//     remainingKm: 1500,
//     prevTimestamp: "5"
//     currentTimestamp: "5"
// };

const emptyAirport = {
    id: '',
    name: '',
    nameAbbreviated: '',
    lat: 0,
    lng: 0,
    time: '',
};
const emptyFlight: Flight = {
    id: '',
    flight: '',
    lat: 0,
    lng: 0,
    airportOrigin: emptyAirport,
    airportDestination: emptyAirport,
    aircraftType: '',
    progress: 0,
    travaledKm: 0,
    remainingKm: 0,
};

class InteractiveMap extends React.Component<{}, RndStates> {
    private mapRef = React.createRef<LeafletMap>();
    private socket: WebSocket | null = null; // WebSocket connection
    constructor(props) {
        super(props);
        this.state = {
            RndXPosition: 0,
            RndYPosition: 0,
            RndWidth: 400,
            RndHeight: 300,
            fullScreen: true,
            Flight: emptyFlight
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
        const defaultSpeed = 100;
        let flightData;
        data.forEach((payload) => {
            try {
                switch (payload.command) {
                    case 'setFlight':
                        // Adds Plane, Airports and polyline to map
                        flightData = payload as Flight
                        this.setState({ Flight: flightData })
                        this.mapRef.current?.addMarkers({ id: flightData.id, type: "aircraft", lat: flightData.lat, lng: flightData.lng, rotation: payload?.rotation ?? 0 });
                        this.mapRef.current?.addMarkers({ id: flightData.airportOrigin.id, type: "airport", lat: flightData.airportOrigin.lat, lng: flightData.airportOrigin.lng, rotation: 0 });
                        this.mapRef.current?.addMarkers({ id: flightData.airportDestination.id, type: "airport", lat: flightData.airportDestination.lat, lng: flightData.airportDestination.lng, rotation: 0 });
                        this.mapRef.current?.drawPolyLine({ aircraftId: flightData.id, airportIdTo: flightData.airportDestination.id, airportIdFrom: flightData.airportOrigin.id });
                        break;
                    case 'updateFlight':
                        flightData = payload as Flight
                        this.setState({ Flight: flightData })
                        if(flightData.ground_speed){ 
                            this.mapRef.current?.moveMarkers({ id: flightData.id, lat: flightData.lat, lng: flightData.lng, speed: flightData.ground_speed, prevTimestamp: flightData.prevTimestamp, currentTimestamp: flightData.currentTimestamp});
                        } else{
                            this.mapRef.current?.moveMarkers({ id: flightData.id, lat: flightData.lat, lng: flightData.lng, speed: defaultSpeed, prevTimestamp: flightData.prevTimestamp, currentTimestamp: flightData.currentTimestamp});
                        }
                        break;
                    case 'removeFlight':
                        flightData = payload as RemoveData
                        this.setState({ Flight: emptyFlight })
                        this.mapRef.current?.removePolyLine({ id: flightData.id, type: "aircraft" });
                        this.mapRef.current?.removeMarker({ id: flightData.id, type: "aircraft" });
                        break;
                    case 'flyToLocation':
                        // Move camera to given coords and zoom
                        this.mapRef.current?.flyTo(payload as FlyCameraTo);
                        break;
                    case 'addMarker':
                        flightData = payload as MarkerData
                        if (flightData.id === this.state.Flight.id) {
                            response.push("Error cant add marker because it is the current flight")
                            console.warn("Error cant add marker because it is the current flight")
                            break;
                        }
                        this.mapRef.current?.addMarkers(flightData);
                        break;
                    case 'removeMarker':
                        flightData = payload as RemoveData
                        if (flightData.id === this.state.Flight.id) {
                            response.push("Error cant remove marker because it is the current flight")
                            console.warn("Error cant remove marker because it is the current flight")
                            break;
                        }
                        this.mapRef.current?.removeMarker(flightData);
                        break;
                    case 'updateMarker':
                        flightData = payload as UpdateMarkerData
                        if (flightData.id === this.state.Flight.id) {
                            response.push("Error cant update marker because it is the current flight")
                            console.warn("Error cant update marker because it is the current flight")
                            break;
                        }
                        if(!flightData.speed) flightData.speed = defaultSpeed
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

    displayTime() {
        if (stringValid(this.state.Flight.airportOrigin.time) && stringValid(this.state.Flight.airportDestination.time)) {
            return (
                <div className="time d-flex justify-content-between align-items-center">
                    <div>
                        <h4>{this.state.Flight.airportOrigin.time}</h4>
                        <small>Local time</small>
                    </div>
                    <div className="text-end">
                        <h4>{this.state.Flight.airportDestination.time}</h4>
                        <small>Destination time</small>
                    </div>
                </div>
            )
        }
        return (<></>)
    }

    displayEstimatedTime() {
        if (numberValid(this.state.Flight.remainingKm) && numberValid(this.state.Flight.ground_speed)) {
            if (this.state.Flight.remainingKm < 0 || this.state.Flight.ground_speed <= 0) {
                console.error('Invalid input: remainingKm and groundSpeedKnots must be positive numbers.');
                return (<></>);
            }
            // Calculate estimated time in hours
            const estimatedHours = this.state.Flight.remainingKm / this.state.Flight.ground_speed;
            // Convert estimated time to days, hours, and minutes
            const days = Math.floor(estimatedHours / 24);
            const hours = Math.floor(estimatedHours % 24);
            const minutes = Math.round((estimatedHours % 1) * 60);
            let resultString = '';
            if (days !== 0) resultString += `${days} ${days === 1 ? 'day' : 'days'}, `;
            if (hours !== 0) resultString += `${hours} ${hours === 1 ? 'hour' : 'hours'}, `;
            if (minutes !== 0 || (days === 0 && hours === 0)) resultString += `${minutes} ${minutes === 1 ? 'min' : 'mins'}`;
            return (
                <div className="d-flex justify-content-between align-items-center">
                    <h1 className="display-4 fw-normal">{this.state.Flight.airportOrigin.nameAbbreviated}</h1>
                    <small className="text-center">
                        {resultString} <br /> remaining
                    </small>
                    <h1 className="display-4 fw-normal text-end">{this.state.Flight.airportDestination.nameAbbreviated}</h1>
                </div>
            )
        }
        return (<></>)
    }

    displayExtraInfo() {
        const knotsToMph = (knots: number): number => knots * 1.15078;
        const knotsToKph = (knots: number): number => knots * 1.852;
        const feetToMeters = (feet: number): number => feet * 0.3048;
        const tryParseNumber = (input: string): number | string => {
            const parsedNumber = parseFloat(input);
            return isNaN(parsedNumber) ? input : parsedNumber;
        };
        let x = <></>;
        let y = <></>;
        if (numberValid(this.state.Flight.ground_speed)) {
            x = <p>Ground speed <span className="float-end">{knotsToKph(this.state.Flight.ground_speed)} kph | {knotsToMph(this.state.Flight.ground_speed)} mph</span></p>;
        }
        if (stringValid(this.state.Flight.altitude)) {
            const altitude = tryParseNumber(this.state.Flight.altitude);
            if (typeof altitude === "string") {
                y = <p>Altitude <span className="float-end">{this.state.Flight.altitude}</span></p>;
            } else if (typeof altitude === "number" && numberValid(altitude)) {
                y = <p>Altitude <span className="float-end">{altitude} ft | {feetToMeters(altitude)} m</span></p>;
            }
        }

        return (
            <>
                {x}
                {y}
            </>
        );
    }

    render() {
        const leafletMap = <LeafletMap ref={this.mapRef} />;
        const calculateDistanceInMiles = (distanceKm: number): number => distanceKm * 0.621371;

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
                                            <div className="flight-num">{this.state.Flight.flight}</div>
                                            <div className="small text-center">{this.state.Flight.aircraftType}</div>
                                        </div>
                                        {/* time  */}
                                        {this.displayTime()}
                                        <hr />
                                        {/* airports info  */}
                                        <div className="d-flex-flex-column">
                                            {this.displayEstimatedTime()}
                                            <div
                                                className="progress"
                                                role="progressbar"
                                                data-aria-label="Animated striped example"
                                                data-aria-valuenow={this.state.Flight.progress}
                                                data-aria-valuemin="0"
                                                data-aria-valuemax="100"
                                            >
                                                <div
                                                    className="progress-bar progress-bar-striped progress-bar-animated"
                                                    style={{ width: "75%" }}
                                                ></div>
                                            </div>
                                            <div className="cities mt-2 d-flex justify-content-between align-items-center">
                                                <p>{this.state.Flight.airportOrigin.name}</p>
                                                <p className="text-end">{this.state.Flight.airportDestination.name}</p>
                                            </div>
                                        </div>

                                        {/* extra info  */}
                                        <div className="extra-info d-flex flex-column justify-content-evenly">
                                            {/* distance  */}
                                            <div className="distance text-center d-flex flex-column">
                                                <h4>{this.state.Flight.travaledKm} km | {calculateDistanceInMiles(this.state.Flight.travaledKm)} miles</h4>
                                                <p>traveled</p>
                                                <div className="position-relative mb-3">
                                                    <div className="bar" />
                                                    <FontAwesomeIcon icon={faPlaneUp} />
                                                    <div className="bar"></div>
                                                </div>
                                                <h4>{this.state.Flight.remainingKm} km | {calculateDistanceInMiles(this.state.Flight.remainingKm)} miles</h4>
                                                <p>remaining</p>
                                            </div>
                                            <hr />
                                            {/* other extra info */}
                                            {this.displayExtraInfo()}
                                            <p>Longtitude<span className="float-end">{this.state.Flight.lng}</span></p>
                                            <p>Latitude<span className="float-end">{this.state.Flight.lat}</span></p>
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
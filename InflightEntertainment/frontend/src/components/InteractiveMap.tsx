import React from "react";
import LeafletMap from "./LeafletMap";
import {
  RndStates,
  Flight,
  FlyCameraTo,
  MarkerData,
  UpdateMarkerData,
  PolyLineData,
  RemoveData,
  Wellness,
  Airport,
} from "./Interfaces";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faCompress,
  faPlaneUp,
  faChevronRight,
  faExpand,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

// Rnd
import { Rnd } from "react-rnd";

// function calculateDistanceInKm(
//   originLat: number,
//   originLng: number,
//   destinationLat: number,
//   destinationLng: number
// ): number {
//   const toRadians = (degrees: number): number => degrees * (Math.PI / 180);
//   const R = 6371; // Earth's radius in kilometers
//   const dLat = toRadians(destinationLat - originLat);
//   const dLon = toRadians(destinationLng - originLng);
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRadians(originLat)) *
//     Math.cos(toRadians(destinationLat)) *
//     Math.sin(dLon / 2) *
//     Math.sin(dLon / 2);
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c; // Distance in kilometers
// }

// function calculateProgress(
//   totalDistance: number,
//   remainingDistance: number
// ): number {
//   if (totalDistance <= 0 || remainingDistance < 0) {
//     console.error(
//       "Invalid input: totalDistance and remainingDistance must be positive numbers."
//     );
//     return 0;
//   }
//   const progress = ((totalDistance - remainingDistance) / totalDistance) * 100;
//   // Ensure progress is within the range [0, 100]
//   return Math.max(0, Math.min(100, progress));
// }

// function calculateEstimatedTime(
//   remainingKm: number,
//   groundSpeedKnots: number
// ): string {
//   if (remainingKm < 0 || groundSpeedKnots <= 0) {
//     console.error(
//       "Invalid input: remainingKm and groundSpeedKnots must be positive numbers."
//     );
//     return "Error";
//   }

//   // Calculate estimated time in hours
//   const estimatedHours = remainingKm / groundSpeedKnots;

//   // Convert estimated time to days, hours, and minutes
//   const days = Math.floor(estimatedHours / 24);
//   const hours = Math.floor(estimatedHours % 24);
//   const minutes = Math.round((estimatedHours % 1) * 60);

//   let resultString = "";

//   if (days !== 0) {
//     resultString += `${days} ${days === 1 ? "day" : "days"}, `;
//   }

//   if (hours !== 0) {
//     resultString += `${hours} ${hours === 1 ? "hour" : "hours"}, `;
//   }

//   if (minutes !== 0 || (days === 0 && hours === 0)) {
//     resultString += `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
//   }

//   return resultString;
// }

function stringValid(myString: string | null): boolean {
  return myString !== null && myString !== "";
}

const numberValid = (myNumber: number | null): boolean => myNumber !== null && !isNaN(myNumber);

// const testFlight: Flight = {
//   id: "F1",
//   flight: "FLIGHT01",
//   lat: 35.6895,
//   lng: 139.6917,
//   rotation: 45,
//   airportOrigin: {
//     id: "A1",
//     name: "Airport 1",
//     nameAbbreviated: "A1",
//     lat: 37.7749,
//     lng: -122.4194,
//     time: "12:00 PM",
//   },
//   airportDestination: {
//     id: "A2",
//     name: "Airport 2",
//     nameAbbreviated: "A2",
//     lat: 40.7128,
//     lng: -74.006,
//     time: "02:30 PM",
//   },
//   aircraftType: "Boeing 747",
//   altitude: "35000", // Example barometric altitude in feet
//   ground_speed: 500, // Example ground speed in knots
//   estimatedTime: "2 hours",
//   progress: 50,
//   traveledKm: 1500,
//   remainingKm: 1500,
// };

const emptyAirport = {
  id: "",
  name: "",
  nameAbbreviated: "",
  lat: 0,
  lng: 0,
  time: "",
};

const emptyFlight: Flight = {
  id: "",
  flight: "",
  lat: 0,
  lng: 0,
  airportOrigin: emptyAirport,
  airportDestination: emptyAirport,
  aircraftType: "",
  progress: 0,
  traveledKm: 0,
  remainingKm: 0,
};

class InteractiveMap extends React.Component<{}, RndStates> {
  private mapRef = React.createRef<LeafletMap>();
  private socket: WebSocket | null = null; // WebSocket connection
  private defaultSpeed = 100;
  constructor(props) {
    super(props);
    this.state = {
      RndXPosition: 0,
      RndYPosition: 0,
      RndWidth: 400,
      RndHeight: 300,
      fullScreen: true,
      Flight: emptyFlight,
      matches: window.matchMedia("(max-width: 991px)").matches,
      airports: {},
      aircrafts: {},
      landmarks: {},
      polylines: {},
      lat: 0,
      lng: 0,
      zoom: 0,
    };
  }

  // On load function
  componentDidMount() {
    const url = `ws://${window.location.host}/ws/socket-server/`; // Clients URL
    this.socket = new WebSocket(url);
    this.socket.addEventListener("open", this.handleSocketOpen);
    this.socket.addEventListener("close", this.handleSocketClose);
    this.socket.addEventListener("message", this.handleSocketMessage);
    this.setState({ Flight: emptyFlight });
    const handler = e => this.setState({ matches: e.matches });
    window.matchMedia("(max-width: 991px)").addEventListener('change', handler);
  }

  componentWillUnmount() {
    // Sending a message to the backend if the page closed
    this.socket.send(
      JSON.stringify({
        action: "FrontEndResponse",
        data: "Closing Map",
      })
    );
    if (this.socket) this.socket.close();
  }

  private handleSocketOpen() {
    console.log("WebSocket connection established.");
  }

  private handleSocketClose() {
    console.log("WebSocket connection closed.");
  }

  private handleSocketMessage = async (event: MessageEvent) => {
    console.log("Received WebSocket Message");
    // Parsing the message from the websockets in a JSON object
    const text = event.data;
    if (text === "") return;
    let dataJson;
    try {
      dataJson = JSON.parse(text);
    } catch (error) {
      console.error('Error parsing JSON:', error);
      return;
    }
    console.log(dataJson);
    // Making the JSON into a an array so that we can handle bulk messages
    const data = Array.isArray(dataJson) ? dataJson : [dataJson];
    const response: any[] = [];
    for (const payload of data) {
      try {
        // Processing the JSON
        const resp = await this.processPayload(payload.command);
        if (resp) response.push(resp);
      } catch (error) {
        console.error('Error processing payload:', error);
      }
    }
    if (response.length > 0) this.socket.send(JSON.stringify({ action: 'FrontEndResponse', data: response }));
  }

  private async processPayload(payload: any) {
    // Handle different command types from the JSON data
    switch (payload.type) {
      case 'setFlight':
        return await this.handleSetFlight(payload as Flight);
      case 'updateFlight':
        return await this.handleUpdateFlight(payload as Flight);
      case 'removeFlight':
        return await this.handleRemoveFlight(payload as RemoveData);
      case 'addMarker':
        return this.handleAddMarker(payload as MarkerData);
      case 'removeMarker':
        return this.handleRemoveMarker(payload as RemoveData);
      case 'updateMarker':
        return this.handleUpdateMarker(payload as UpdateMarkerData);
      case 'addPolyline':
        return this.mapRef.current?.drawPolyLine(payload as PolyLineData);
      case 'removePolyline':
        return this.handleRemovePolyline(payload as RemoveData);
      case 'flyToLocation':
        // Sets the camera of the map
        const fly = payload as FlyCameraTo
        this.setState({ lat: fly.lat, lng: fly.lng, zoom: fly.zoom })
        this.mapRef.current?.flyTo(fly);
        return;
      case 'clearMap':
        // Deletes everything and removes flight
        this.mapRef.current?.clearMap();
        this.setState({ airports: {}, aircrafts: {}, landmarks: {}, polylines: {}, Flight: emptyFlight })
        return;
      case 'wellness':
        // returns the (aircraft, airport, landmark, camera) data
        return this.mapRef.current?.sendData(payload as Wellness);
      default:
        console.warn("Unknown type sent: ", payload.type);
        return "unknown type sent for: " + payload.type
    }
  }

  /**
   * Handles setting flight data and updating the map with markers and polylines.
   * @param flightData - The flight data to be set.
   */
  private async handleSetFlight(flightData: Flight) {
    console.log("----> ", flightData)
    // Update the state with the new flight data for the UI to process
    this.setState({ Flight: flightData })
    // Add aircraft marker to the map
    var aircraft = await this.mapRef.current?.addMarkers({ id: flightData.id, param: "aircraft", lat: flightData.lat, lng: flightData.lng, rotation: flightData.rotation ?? 0 });
    // Update the state with the added aircraft marker
    if (aircraft) this.state.aircrafts[flightData.id] = aircraft;
    // Add origin airport marker to the map
    var airportOrigin = await this.mapRef.current?.addMarkers({ id: flightData.airportOrigin.id, param: "airport", lat: flightData.airportOrigin.lat, lng: flightData.airportOrigin.lng, rotation: 0 });
    // Update the state with the added origin airport marker if created
    if (airportOrigin) this.state.airports[flightData.airportOrigin.id] = airportOrigin;
    // Add destination airport marker to the map
    var airportDestination = await this.mapRef.current?.addMarkers({ id: flightData.airportDestination.id, param: "airport", lat: flightData.airportDestination.lat, lng: flightData.airportDestination.lng, rotation: 0 });
    // Update the state with the added destination airport marker if created
    if (airportDestination) this.state.airports[flightData.airportDestination.id] = airportDestination;
    // Draw a polyline on the map connecting the aircraft and airports
    var polyline = await this.mapRef.current?.drawPolyLine({ aircraftId: flightData.id, airportIdTo: flightData.airportDestination.id, airportIdFrom: flightData.airportOrigin.id });
    // Update the state with the new polyline if created
    if (polyline) this.state.polylines[flightData.id] = polyline;
  }

  // Updates the flight and UI
  private async handleUpdateFlight(flightData: Flight) {
    console.log("#---> ", flightData)
    this.setState({ Flight: flightData })
    console.log("traveledKm: ", flightData.traveledKm);
    console.log("remainingKm: ", flightData.remainingKm);
    console.log("updateMarker Flight State: ", this.state.Flight);
    let update;
    if (flightData.ground_speed) {
      update = await this.mapRef.current?.moveMarkers({ id: flightData.id, lat: flightData.lat, lng: flightData.lng, speed: flightData.ground_speed, prevTimestamp: flightData.prevTimestamp, currentTimestamp: flightData.currentTimestamp });
    } else {
      update = await this.mapRef.current?.moveMarkers({ id: flightData.id, lat: flightData.lat, lng: flightData.lng, speed: this.defaultSpeed, prevTimestamp: flightData.prevTimestamp, currentTimestamp: flightData.currentTimestamp });
    }
    if (update.marker) this.state.aircrafts[flightData.id] = update.marker
    if (update.polyline) this.state.polylines[flightData.id] = update.polyline
  }

  // Removes flight and UI
  private async handleRemoveFlight(payload: RemoveData) {
    this.setState({ Flight: emptyFlight })
    const bool = await this.mapRef.current?.removePolyLine({ id: payload.id })
    if (bool) delete this.state.polylines[payload.id];
    if (this.mapRef.current?.removeMarker({ id: payload.id, param: "aircraft" })) delete this.state.aircrafts[payload.id];
  }

  private async handleAddMarker(payload: MarkerData) {
    if (payload.id === this.state.Flight.id) {
      console.warn("Error cant add marker because it is the current flight")
      return "Error cant add marker because it is the current flight";
    }
    const marker = await this.mapRef.current?.addMarkers(payload);
    if (marker) {
      switch (payload.param) {
        case "aircraft":
          this.state.aircrafts[payload.id] = marker;
          return;
        case "airport":
          this.state.airports[payload.id] = marker;
          return;
        case "landmark":
          this.state.landmarks[payload.id] = marker;
          return;
        default:
          console.warn("addMarkers: param not found");
          return "addMarkers: param not found";
      }
    }
  }

  private async handleRemoveMarker(payload: RemoveData) {
    // Implement 'removeMarker' logic
    if (payload.id === this.state.Flight.id) {
      console.warn("Error cant remove marker because it is the current flight")
      return "Error cant remove marker because it is the current flight";
    }
    const bool = await this.mapRef.current?.removeMarker({ id: payload.id, param: "aircraft" })
    if (bool) {
      switch (payload.param) {
        case "aircraft":
          delete this.state.aircrafts[payload.id];
          return;
        case "airport":
          delete this.state.airports[payload.id];
          return;
        case "landmark":
          delete this.state.landmarks[payload.id];
          return;
        default:
          console.warn("addMarkers: param not found");
          return "addMarkers: param not found";
      }
    }
  }

  private async handleUpdateMarker(payload: UpdateMarkerData) {
    if (payload.id === this.state.Flight.id) {
      console.warn("Error cant update marker because it is the current flight")
      return "Error cant update marker because it is the current flight";
    }
    if (!payload.speed) payload.speed = this.defaultSpeed;
    const update = await this.mapRef.current?.moveMarkers(payload);
    if (update.marker) this.state.aircrafts[payload.id] = update.marker
    if (update.polyline) this.state.polylines[payload.id] = update.polyline
  }

  private async handleRemovePolyline(payload: RemoveData) {
    const bool = await this.mapRef.current?.removePolyLine({ id: payload.id });
    if (bool) delete this.state.polylines[payload.id];
  }

  toggleFullscreen() {
    this.setState({ fullScreen: !this.state.fullScreen }, () => {
      this.mapRef.current?.setState({ fullScreen: this.state.fullScreen });
    });
  }

  displayTime() {
    if (
      stringValid(this.state.Flight.airportOrigin.time) &&
      stringValid(this.state.Flight.airportDestination.time)
    ) {
      // Convert timestamps to readable format
      const originDate = new Date(this.state.Flight.airportOrigin.time);
      const destinationDate = new Date(this.state.Flight.airportOrigin.time);
      var originFormatted = "Invalid time";
      var destFormatted = "Invalid time";

      if (!isNaN(originDate.getTime()) && !isNaN(destinationDate.getTime())) {
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        };

        originFormatted = new Intl.DateTimeFormat('en-US', options).format(originDate);
        destFormatted = new Intl.DateTimeFormat('en-US', options).format(destinationDate);
      }

      return (
        <div className="time d-flex justify-content-between align-items-center">
          <div>
            <h4>{originFormatted}</h4>
            <small>Local time</small>
          </div>
          <div className="text-end">
            <h4>{destFormatted}</h4>
            <small>Destination time</small>
          </div>
        </div>
      );
    }
    return <></>;
  }

  displayEstimatedTime() {
    if (this.state.Flight.ground_speed && stringValid(this.state.Flight.estimatedTime)) {
      return (
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="display-4 fw-normal">
            {this.state.Flight.airportOrigin.nameAbbreviated}
          </h1>
          <small className="text-center">
            {this.state.Flight.estimatedTime} <br /> remaining
          </small>
          <h1 className="display-4 fw-normal text-end">
            {this.state.Flight.airportDestination.nameAbbreviated}
          </h1>
        </div>
      );
    }
    return <></>;
  }

  displayExtraInfo() {
    const knotsToMph = (knots: number): number => Math.floor(knots * 1.15078);
    const knotsToKph = (knots: number): number => Math.floor(knots * 1.852);
    const feetToMeters = (feet: number): number => Math.floor(feet * 0.3048);
    const tryParseNumber = (input: string): number | string => {
      const parsedNumber = parseFloat(input);
      return isNaN(parsedNumber) ? input : parsedNumber;
    };
    const numberValid = (myNumber: number | null): boolean =>
      myNumber !== null && !isNaN(myNumber);

    let x = <></>;
    let y = <></>;

    if (this.state.Flight.ground_speed && stringValid(this.state.Flight.ground_speed.toString())) {
      const speed = tryParseNumber(this.state.Flight.ground_speed.toString());
      if (typeof speed === "number" && numberValid(speed)) {
        x = (
          <p>
            Ground speed{" "}
            <span className="float-end">
              {knotsToKph(speed)} kph | {knotsToMph(speed)} mph
            </span>
          </p>
        );
      }
    }

    if (this.state.Flight && stringValid(this.state.Flight.altitude)) {
      const altitude = tryParseNumber(this.state.Flight.altitude);
      if (typeof altitude === "string") {
        y = (
          <p>
            Altitude{" "}
            <span className="float-end">{this.state.Flight.altitude}</span>
          </p>
        );
      } else if (typeof altitude === "number" && numberValid(altitude)) {
        y = (
          <p>
            Altitude{" "}
            <span className="float-end">
              {altitude} ft | {feetToMeters(altitude)} m
            </span>
          </p>
        );
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
    const leafletMap = <LeafletMap ref={this.mapRef} airports={this.state.airports} aircrafts={this.state.aircrafts} landmarks={this.state.landmarks} polylines={this.state.polylines} lat={this.state.lat} lng={this.state.lng} zoom={this.state.zoom} />;
    const calculateDistanceInMiles = (distanceKm: number): number => Math.floor(distanceKm * 0.621371);
    const collapseOrientation = !this.state.matches && "collapse-horizontal";
    const flexOrientation = this.state.matches && "flex-column";
    if (this.state.fullScreen) {
      return (
        <>
          {leafletMap}
          <div className="UI-container">
            <div className="row container-fluid vh-100 mx-auto">
              <div className={`col-xl-4 d-flex ${flexOrientation} align-items-center vh-100 position-relative`}>
                {/* main panel that displays information */}
                <a
                  className="btn me-2 yes-click"
                  data-bs-toggle="collapse"
                  href="#collapsePanel"
                  role="button"
                  aria-expanded="false"
                  aria-controls="collapsePanel"
                >
                  {/* TODO: turn this into chevron left on expansion */}
                  {!this.state.matches ? <FontAwesomeIcon icon={faChevronRight} /> : <FontAwesomeIcon icon={faChevronDown} />}
                </a>
                <div
                  className={`collapse ${collapseOrientation} yes-click`}
                  id="collapsePanel"
                >
                  <div className="panel">
                    <div className="container-fluid d-flex flex-column h-100">
                      {/* aircraft type  */}
                      <div className="mx-auto">
                        <div className="flight-num">
                          {this.state.Flight.flight}
                        </div>
                        <div className="small text-center">
                          {this.state.Flight.aircraftType}
                        </div>
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
                            style={{ width: this.state.Flight.progress + "%" }}
                          ></div>
                        </div>
                        <div className="cities mt-2 d-flex justify-content-between align-items-center">
                          <p>{this.state.Flight.airportOrigin.name}</p>
                          <p className="text-end">
                            {this.state.Flight.airportDestination.name}
                          </p>
                        </div>
                      </div>

                      {/* extra info  */}
                      <div className="extra-info d-flex flex-column justify-content-evenly">
                        {/* distance  */}
                        <div className="distance text-center d-flex flex-column">
                          <h4>
                            {Math.floor(this.state.Flight.traveledKm)} km |{" "}
                            {calculateDistanceInMiles(
                              this.state.Flight.traveledKm
                            )}{" "}
                            miles
                          </h4>
                          <p>traveled</p>
                          <div className="position-relative mb-3">
                            <div className="bar" />
                            <FontAwesomeIcon icon={faPlaneUp} />
                            <div className="bar"></div>
                          </div>
                          <h4>
                            {Math.floor(this.state.Flight.remainingKm)} km |{" "}
                            {calculateDistanceInMiles(
                              this.state.Flight.remainingKm
                            )}{" "}
                            miles
                          </h4>
                          <p>remaining</p>
                        </div>
                        <hr />
                        {/* other extra info */}
                        {this.displayExtraInfo()}
                        <p>
                          Longtitude
                          <span className="float-end">
                            {this.state.Flight.lng}
                          </span>
                        </p>
                        <p>
                          Latitude
                          <span className="float-end">
                            {this.state.Flight.lat}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <FontAwesomeIcon
              className="expander"
              icon={faCompress}
              onClick={this.toggleFullscreen.bind(this)}
            />
          </div>
        </>
      );
    } else {
      return (
        <div>
          <Rnd
            className="rnd-container"
            default={{
              x: 0,
              y: 0,
              width: this.state.RndWidth,
              height: this.state.RndHeight,
            }}
            size={{ width: this.state.RndWidth, height: this.state.RndHeight }}
            position={{
              x: this.state.RndXPosition,
              y: this.state.RndYPosition,
            }}
            bounds="window"
            onDrag={(e, d) => {
              if (this.mapRef.current?.mapStatus())
                return false; /* Prevent dragging the Rnd component */
              this.setState({ RndXPosition: d.x, RndYPosition: d.y });
            }}
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
          </Rnd>
          <div
            className="UI-container"
            style={{
              position: "absolute",
              left: this.state.RndXPosition + this.state.RndWidth - 16,
              top: this.state.RndYPosition,
              width: "16px",
              height: "16px",
            }}
          >
            <FontAwesomeIcon
              className="expander"
              icon={faExpand}
              onClick={this.toggleFullscreen.bind(this)}
            />
          </div>
        </div>
      );
    }
  }
}

export default InteractiveMap;

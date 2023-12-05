import React from "react";
import LeafletMap from "./LeafletMap";
import {
  InteractiveMapStates,
  Flight,
  FlyCameraTo,
  MarkerData,
  UpdateMarkerData,
  PolyLineData,
  RemoveData,
  Wellness,
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

// Helper function
function stringValid(myString: string | null): boolean {
  return myString !== null && myString !== "";
}

// Default for UI
const emptyFlight: Flight = {
  id: "",
  flight: "",
  lat: 0,
  lng: 0,
  airportOrigin: {
    id: "",
    name: "",
    nameAbbreviated: "",
    lat: 0,
    lng: 0,
    time: "",
  },
  airportDestination: {
    id: "",
    name: "",
    nameAbbreviated: "",
    lat: 0,
    lng: 0,
    time: "",
  },
  aircraftType: "",
  progress: 0,
  traveledKm: 0,
  remainingKm: 0,
};

// For testing the frontend
const DEBUG = false;

class InteractiveMap extends React.Component<{}, InteractiveMapStates> {
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
    this.socket.addEventListener("open", this.handleSocketOpen.bind(this));
    this.socket.addEventListener("close", this.handleSocketClose);
    this.socket.addEventListener("message", this.handleSocketMessage);
    this.setState({ Flight: emptyFlight });
    const handler = e => this.setState({ matches: e.matches });
    window.matchMedia("(max-width: 991px)").addEventListener('change', handler);
    if(DEBUG) console.log("componentDidMount: ", this.socket);
  }
  // On unload
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

  // On load
  handleSocketOpen() {
    if(DEBUG) console.log("handleSocketOpen: ", this.socket);
    this.socket.send(
      JSON.stringify({
        type: "loadFront",
        data: "",
      })
    );
    console.log("WebSocket connection established.");
  }
  // On close 
  private handleSocketClose() {
    if(DEBUG) console.log("WebSocket connection closed.");
  }

  /**
   * Handles incoming WebSocket messages from the backend.
   * @param {MessageEvent} event - The WebSocket message event.
   */
  private handleSocketMessage = async (event: MessageEvent) => {
    if(DEBUG) console.log("Received WebSocket Message");
    // Parsing the message from the websockets in a JSON object
    const text = event.data;
    if (text === "") return;
    let dataJson;
    try {
      // Attempt to parse the received JSON data.
      dataJson = JSON.parse(text);
    } catch (error) {
      if(DEBUG) console.error('Error parsing JSON:', error);
      return;
    }
    if(DEBUG) console.log(dataJson);
    // Convert the JSON into an array to handle bulk messages.
    const data = Array.isArray(dataJson) ? dataJson : [dataJson];
    const response: any[] = [];   // An array to store responses generated during payload processing.
    for (const payload of data) {
      try {
        // Process the JSON payload and get a response.
        const resp = await this.processPayload(payload.command);
        // If a response is received, add it to the response array.
        if (resp) response.push(resp);
      } catch (error) {
        if(DEBUG) console.error('Error processing payload:', error);
      }
    }
    // If there are responses, send them back to the backend.
    if (response.length > 0) this.socket.send(JSON.stringify({ action: 'FrontEndResponse', data: response }));
  }
  
  /**
   * Processes a payload containing commands for map manipulation.
   * @param {any} payload - The payload containing commands.
   * @returns {Promise<void | string>} - A promise that resolves with success or an error message.
   */
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
        return this.handleAddPolyline(payload as PolyLineData);
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
        return this.handleWellness(payload as Wellness);
      default:
        if(DEBUG) console.warn("Unknown type sent: ", payload.type);
        return "unknown type sent for: " + payload.type
    }
  }

  /**
   * Handles setting flight data and updating the map with markers and polylines. 
   * Also triggers UI to update.
   * @param flightData - The flight data to be set.
   */
  private async handleSetFlight(flightData: Flight) {
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

  /**
   * Updates the flight information and triggers UI changes 
   * @param flightData - The flight data to be set.
   */
  private async handleUpdateFlight(flightData: Flight) {
    this.setState({ Flight: flightData }) // Update the state with the new flight data
    let update;
    // Check if the flight has ground speed information
    if (flightData.ground_speed) {
      // If ground speed is available, move markers with the provided speed
      update = await this.mapRef.current?.moveMarkers({ id: flightData.id, lat: flightData.lat, lng: flightData.lng, speed: flightData.ground_speed, prevTimestamp: flightData.prevTimestamp, currentTimestamp: flightData.currentTimestamp });
    } else {
      // If ground speed is not available, move markers with the default speed
      update = await this.mapRef.current?.moveMarkers({ id: flightData.id, lat: flightData.lat, lng: flightData.lng, speed: this.defaultSpeed, prevTimestamp: flightData.prevTimestamp, currentTimestamp: flightData.currentTimestamp });
    }
    // Update the state with the new marker and polyline if available
    if (update.marker) this.state.aircrafts[flightData.id] = update.marker
    if (update.polyline) this.state.polylines[flightData.id] = update.polyline
  }

  /**
   * Removes the flight information and triggers UI changes 
   * @param flightData - The data to be removed
   */
  private async handleRemoveFlight(flightData: RemoveData) {
    // Reset the flight information to an empty state
    this.setState({ Flight: emptyFlight })
    // Remove the polyline associated with the specified flight ID
    const isPolylineRemoved = await this.mapRef.current?.removePolyLine({ id: flightData.id })
    // If the polyline was successfully removed, delete it from the state
    if (isPolylineRemoved) delete this.state.polylines[flightData.id];
    // Remove the aircraft marker associated with the specified flight ID
    const isMarkerRemoved = await this.mapRef.current?.removeMarker({ id: flightData.id, param: "aircraft" }) 
    // If the aircraft marker was successfully removed, delete it from the state
    if (isMarkerRemoved) delete this.state.aircrafts[flightData.id];
  }
  
  /**
   * Adds a marker to the map. 
   * Note: The marker data id should not be the same as the flight id.
   * @param markerData - The marker data 
   */
  private async handleAddMarker(markerData: MarkerData) {
    // Check if the marker belongs to the current flight
    if (markerData.id === this.state.Flight.id) {
      if(DEBUG) console.warn("Error cant add marker because it is the current flight")
      return "Error cant add marker because it is the current flight";
    }
    // Add the marker to the map using the map reference
    const marker = await this.mapRef.current?.addMarkers(markerData);
    // If the marker is successfully added, update the corresponding state to be stored
    if (marker) {
      switch (markerData.param) {
        case "aircraft":
          this.state.aircrafts[markerData.id] = marker;
          return "addMarkers: added aircraft : "+markerData.id;
        case "airport":
          this.state.airports[markerData.id] = marker;
          return "addMarkers: added airport : "+markerData.id;
        case "landmark":
          this.state.landmarks[markerData.id] = marker;
          return "addMarkers: added landmark : "+markerData.id;
        default:
          console.warn("addMarkers: param not found");
          return "addMarkers: param not found: "+markerData.id;
      }
    }
  }

  /**
   * Removes a marker on the map. 
   * Note: The marker data id should not be the same as the flight id.
   * @param markerData - The marker data 
   */
  private async handleRemoveMarker(markerData: RemoveData) {
    // Check if the marker belongs to the current flight
    if (markerData.id === this.state.Flight.id) {
      console.warn("Error cant remove marker because it is the current flight")
      return "Error cant remove marker because it is the current flight";
    }
    // Attempt to remove the marker from the map using the map reference
    const isMarkerRemoved = await this.mapRef.current?.removeMarker({ id: markerData.id, param: "aircraft" })
    // If the marker is successfully removed, update the corresponding state
    if (isMarkerRemoved) {
      switch (markerData.param) {
        case "aircraft":
          delete this.state.aircrafts[markerData.id];
          return "removeMarker: removed aircraft : "+markerData.id;
        case "airport":
          delete this.state.airports[markerData.id];
          return "removeMarker: removed airport : "+markerData.id;
        case "landmark":
          delete this.state.landmarks[markerData.id];
          return "removeMarker: removed landmark : "+markerData.id;
        default:
          console.warn("removeMarker: param not found");
          return "removeMarker: param not found : "+markerData.id;
      }
    }
  }

  /**
   * Updates a marker on the map. 
   * Note: The marker data id should not be the same as the flight id.
   * @param markerData - The marker data to be updated on the map 
   */
  private async handleUpdateMarker(markerData: UpdateMarkerData) {
    // Check if the marker belongs to the current flight
    if (markerData.id === this.state.Flight.id) {
      console.warn("Error cant update marker because it is the current flight")
      return "Error cant update marker because it is the current flight";
    }
    // Set default speed if not provided in markerData
    if (!markerData.speed) markerData.speed = this.defaultSpeed;
    // Update markers and polylines on the map using the ref
    const update = await this.mapRef.current?.moveMarkers(markerData);
    // Update the state with the new marker and polyline data
    if (update.marker) this.state.aircrafts[markerData.id] = update.marker
    if (update.polyline) this.state.polylines[markerData.id] = update.polyline
  }

  /**
   * Handles the addition of a polyline to the map for a specific aircraft.
   * @param {PolyLineData} polyLineData - Data for drawing the polyline, including aircraft ID.
   * @returns {string | undefined} - A message indicating success or failure.
   */
  private async handleAddPolyline(polyLineData: PolyLineData){
    // Draw the polyline on the map using the provided data.
    const polyline = await this.mapRef.current?.drawPolyLine(polyLineData);
    // Check if the polyline was successfully drawn on the map else return failure
    if(polyline) this.state.polylines[polyLineData.aircraftId] = polyline
    else return "AddPolyline: polyline failed to make"
  }

  /**
   * Removes a polyline from the map based on the provided polyLineData.
   * @param polyLineData - The data containing the ID of the polyline to be removed.
   */
  private async handleRemovePolyline(polyLineData: RemoveData) {
    // Attempt to remove the polyline from the map using the ref
    const removalSuccess = await this.mapRef.current?.removePolyLine({ id: polyLineData.id });
    // If the removal was successful, update the state by deleting the corresponding polyline entry
    if (removalSuccess) delete this.state.polylines[polyLineData.id];
  }

  private async handleWellness(payload: Wellness){
    // gets the (aircraft, airport, landmark, polyline camera) data
    let markerState;
    let isPolyline = false
    switch(payload.param){
      case "aircraft":
        markerState = this.state.aircrafts;
        break;
      case "airport":
        markerState = this.state.airports;
        break;
      case "landmark":
        markerState = this.state.landmarks;
        break;
      case "polyline":
        isPolyline = true
        break;
      case "camera":
        return "lat:"+this.state.lat.toString()+", lng:"+this.state.lng.toString()+", zoom:"+this.state.zoom.toString()
      default: 
        return "Wellness: Unknown param";
    }
    const jsonObjects = {}
    if(isPolyline){
      for (const poly in this.state.polylines) {
        if (this.state.polylines.hasOwnProperty(poly)) {          
          jsonObjects[poly] = {
            aircraftId: this.state.polylines[poly].airportIdTo,
            airportIdFrom: this.state.polylines[poly].airportIdFrom
          }
        }
      }
    } else {
      for (const marker in markerState) {
        if (markerState.hasOwnProperty(marker)) {          
          jsonObjects[marker] = {
            lat: markerState[marker].lat,
            lng: markerState[marker].lng
          }
        }
      }
    }
    return JSON.stringify(jsonObjects);
  }

  /**
   * Toggles the fullscreen mode for the map.
   * Updates the component state and the map's state accordingly.
   */
  toggleFullscreen() {
    this.setState({ fullScreen: !this.state.fullScreen }, () => {
      // Update the map's state with the new fullscreen mode
      this.mapRef.current?.setState({ fullScreen: this.state.fullScreen });
    });
  }

  /**
   * Displays the origin and destination times for the current flight.
   * Converts and formats timestamps to a readable format.
   * @returns JSX element containing the formatted times or an empty fragment if times are invalid.
   */
  displayTime() {
    // Check if origin and destination times are valid before proceeding
    if (
      stringValid(this.state.Flight.airportOrigin.time) &&
      stringValid(this.state.Flight.airportDestination.time)
    ) {
      // Convert timestamps to readable format
      const originDate = new Date(this.state.Flight.airportOrigin.time);
      const destinationDate = new Date(this.state.Flight.airportOrigin.time);
      // Initialize variables for formatted time strings
      var originFormatted = "Invalid time";
      var destFormatted = "Invalid time";
      // Check if timestamps are valid before formatting
      if (!isNaN(originDate.getTime()) && !isNaN(destinationDate.getTime())) {
        // Define formatting options for the Intl.DateTimeFormat
        const options: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        };
        // Format the origin and destination times using the defined options
        originFormatted = new Intl.DateTimeFormat('en-US', options).format(originDate);
        destFormatted = new Intl.DateTimeFormat('en-US', options).format(destinationDate);
      }
      // Return JSX element with formatted times
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

  /**
   * Displays information related to the estimated time for the current flight.
   * Shows the abbreviated names of the origin and destination airports, as well as the remaining estimated time.
   * @returns JSX element containing flight information or an empty fragment if data is insufficient.
   */
  displayEstimatedTime() {
    // Check if ground speed and estimated time are valid before proceeding
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
  
  /**
   * Displays additional information related to the current flight, such as ground speed and altitude.
   * Converts units and formats data for better readability.
   * @returns JSX elements containing the formatted extra information or empty fragments if data is insufficient.
   */
  displayExtraInfo() {
    // Helper functions for unit conversion
    const knotsToMph = (knots: number): number => Math.floor(knots * 1.15078);
    const knotsToKph = (knots: number): number => Math.floor(knots * 1.852);
    const feetToMeters = (feet: number): number => Math.floor(feet * 0.3048);
    // Helper function for parsing and validating numbers
    const tryParseNumber = (input: string): number | string => {
      const parsedNumber = parseFloat(input);
      return isNaN(parsedNumber) ? input : parsedNumber;
    };
    // Helper function to check if a number is valid
    const numberValid = (myNumber: number | null): boolean =>
      myNumber !== null && !isNaN(myNumber);

      // Initialize JSX elements for ground speed and altitude
    let groundSpeedElement = <></>;
    let altitudeElement = <></>;

    // Check if ground speed is valid before displaying
    if (this.state.Flight.ground_speed && stringValid(this.state.Flight.ground_speed.toString())) {
      const speed = tryParseNumber(this.state.Flight.ground_speed.toString());
      if (typeof speed === "number" && numberValid(speed)) {
        groundSpeedElement = (
          <p>
            Ground speed{" "}
            <span className="float-end">
              {knotsToKph(speed)} kph | {knotsToMph(speed)} mph
            </span>
          </p>
        );
      }
    }

    // Check if altitude is valid before displaying
    if (this.state.Flight && stringValid(this.state.Flight.altitude)) {
      const altitude = tryParseNumber(this.state.Flight.altitude);
      if (typeof altitude === "string") {
        altitudeElement = (
          <p>
            Altitude{" "}
            <span className="float-end">{this.state.Flight.altitude}</span>
          </p>
        );
      } else if (typeof altitude === "number" && numberValid(altitude)) {
        altitudeElement = (
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
        {groundSpeedElement}
        {altitudeElement}
      </>
    );
  }

  /**
   * Renders the main component, including the Leaflet map and UI elements for flight information.
   * The rendering logic adapts based on the fullscreen state and responsiveness.
   * @returns JSX elements containing the map, flight information, and UI controls.
   */
  render() {
    // JSX element for the Leaflet map
    const leafletMap = <LeafletMap ref={this.mapRef} airports={this.state.airports} aircrafts={this.state.aircrafts} landmarks={this.state.landmarks} polylines={this.state.polylines} lat={this.state.lat} lng={this.state.lng} zoom={this.state.zoom} />;
    // Helper function for calculating distance in miles
    const calculateDistanceInMiles = (distanceKm: number): number => Math.floor(distanceKm * 0.621371);
    // Helper variables for controlling UI responsiveness
    const collapseOrientation = !this.state.matches && "collapse-horizontal";
    const flexOrientation = this.state.matches && "flex-column";
    
    if (this.state.fullScreen) {
      // Render full-screen view
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
      // Render non-full-screen view using the React Resizable and Draggable (Rnd) component
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

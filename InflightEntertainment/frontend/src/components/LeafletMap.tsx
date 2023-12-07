//Imports
//React
import React from 'react';
import '../App.css';

// Leaflet
import L, { LatLngExpression } from "leaflet";

// Functions
import { BuildMarker, updateRotation} from './functions/BuildMarker';

// types
import { LeafletProps, LeafletMapState, FlyCameraTo, MarkerData, UpdateMarkerData, PolyLineData, RemoveData, Wellness } from './Interfaces'

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

interface PolyLineMaker {
  aircraftId: string
  airportIdTo: string
  airportIdFrom: string
}

interface ExtendedMakeMaker extends MakeMaker {
  speed: number;
  prevTimestamp: string;
  currentTimestamp: string;
}

//The map class
class LeafletMap extends React.Component<LeafletProps, LeafletMapState> {
  private mapRef: React.RefObject<HTMLDivElement>;
  private map: L.Map | null
  constructor(props:LeafletProps) {
    super(props)
    this.map = null;
    this.mapRef = React.createRef();
    this.state = {
      airports: props.airports,
      aircrafts: props.aircrafts,
      landmarks: props.landmarks,
      polylines: props.polylines,
      lat: props.lat,
      lng: props.lng,
      zoom: props.zoom,
      fullScreen: true  // default is fullscreen for now
    };
  }

  componentDidMount() {
    //Makes the map
    this.makeMap()
    // Load aircraft markers onto the map
    Object.values(this.state.aircrafts).forEach( async (marker) => { marker.addTo(this.map!); });
    // Load airport markers onto the map
    Object.values(this.state.airports).forEach( async (marker) => { marker.addTo(this.map!); });
    // Load landmark markers onto the map
    Object.values(this.state.landmarks).forEach(async (marker) => { marker.addTo(this.map!); });
    // Load polylines onto the map
    Object.values(this.state.polylines).forEach(async (line) => { 
      line.polylineTo!.addTo(this.map!).bringToFront(); 
      if(line.polylineFrom) line.polylineFrom.addTo(this.map!).bringToFront(); 
    });
  }

  // Cleanup removes map
  componentWillUnmount() {
    if (this.map) this.map.remove();
  }

  /**
   * Initializes and configures the Leaflet map with specified properties and layers.
   * Also sets the initial view based on the component's state.
   */
  makeMap() {
    // Create a Leaflet map with specified options and set the initial view
    this.map = L.map('map', {
      zoomControl: false,     // Disable default zoom control
      zoomAnimation: true,    // Enable smooth zoom animation
      fadeAnimation: true,    // Enable fade animation for a smoother appearance
      scrollWheelZoom: true,  // Enable zooming with the scroll wheel
      minZoom: 3,             // Set the minimum zoom level
      maxZoom: 15,            // Set the maximum zoom level
      worldCopyJump: true,    // Enable world copy jump for seamless scrolling
    }).setView([this.state.lat, this.state.lng], this.state.zoom)

    // Add the default OpenStreetMap tile layer with attribution to the map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    // Add an offline tile layer with a custom path for offline map support
    L.tileLayer('OFFLINE/{z}/{x}/{y}.png', {
       maxZoom: 7  // Set the maximum zoom level for the offline tile layer
    }).addTo(this.map);
  }

  /**
   * Moves the map's view to a specified position with optional zoom level.
   * @param camera - Object containing the target latitude, longitude, and zoom level.
   */
  flyTo(camera: FlyCameraTo) {
    // Fly to the specified position on the map without animation
    this.map.flyTo([camera.lat, camera.lng], camera.zoom, {
      animate: false,
    });
    // Update the component's state with the new latitude, longitude, and zoom level
    this.setState({
      lat: camera.lat,
      lng: camera.lng,
      zoom: camera.zoom
    })
  }

  /**
   * Clears the Leaflet map and resets the state to remove markers and polylines.
   * Useful for cleanup or resetting the map to its initial state.
   */
  clearMap() {
    // Just makes a new map
    this.map.remove();
    this.makeMap();
    // Clear lists in the component's state
    this.setState({
      airports: {},
      aircrafts: {},
      landmarks: {},
      polylines: {}
    });
  }

  /**
   * Adds a new marker to the map and updates the component's state with the new marker.
   * @param newMarkerProps - Object containing properties for the new marker (id, param, lat, lng, rotation).
   * @returns The newly created marker or false if unsuccessful.
   */
  addMarkers(newMarkerProps: MarkerData) {
    let markerState;
    // Determine the type of marker and get the corresponding state
    switch (newMarkerProps.param) {
      case "aircraft":
        markerState = this.state.aircrafts;
        break;
      case "airport":
        markerState = this.state.airports;
        break;
      case "landmark":
        markerState = this.state.landmarks;
        break;
      default:
        console.warn("addMarkers: param not found");
        return false;
    }
    // Check if the marker with the given id already exists
    if (markerState.hasOwnProperty(newMarkerProps.id)) {
      console.warn(`addMarkers: ${newMarkerProps.param} id already exists`);
      return false;
    }
    // Create a new marker with specified properties
    const coords: LatLngExpression = [newMarkerProps.lat, newMarkerProps.lng]
    const newMarker = BuildMarker(newMarkerProps.param, coords, newMarkerProps.rotation, newMarkerProps.extra);
    // If the new marker is successfully created, add it to the map and update the state
    if(newMarker){
      newMarker.addTo(this.map!);
      markerState[newMarkerProps.id] = newMarker;
      return newMarker
    }
    // Return false if the marker creation was unsuccessful
    return false;
  }

  /**
   * Removes a marker from the map and updates the component's state accordingly.
   * @param payload - Object containing information about the marker to be removed (param, id).
   * @returns True if the marker is successfully removed, otherwise false.
   */
  removeMarker(markerData: RemoveData) {
    let markerState;
    // Determine the type of marker and get the corresponding state
    switch (markerData.param.toLowerCase()) {
      case "aircraft":
        markerState = this.state.aircrafts;
        break;
      case "airport":
        markerState = this.state.airports;
        break;
      case "landmark":
        markerState = this.state.landmarks;
        break;
      default:
        console.warn("removeMarker: param not found:", markerData.param);
        return false;
    }
    // Check if the marker with the given id exists in the state
    if (!markerState.hasOwnProperty(markerData.id)) {
      console.warn(`removeMarker: Could not find ${markerData.param} id`);
      return false;
    }
    // Remove the marker from the map and delete it from the state
    this.map!.removeLayer(markerState[markerData.id]);
    delete markerState[markerData.id];
    // Return true to indicate successful removal
    return true;
  }

  /**
   * Moves an aircraft marker on the map based on the provided payload data.
   * Updates the marker's position, rotation, and associated polylines.
   * @param updateData - Object containing information for updating the marker (id, lat, lng, speed, prevTimestamp, currentTimestamp).
   * @returns An object with the updated marker and polyline, if applicable.
   */
  moveMarkers(updateData: UpdateMarkerData) {
    // Check if the aircraft with the given id exists
    if (!this.state.aircrafts.hasOwnProperty(updateData.id)) {
      console.warn("moveMarkers: Could not find aircraft Id: ", updateData.id);
      return;
    }
    
    // Check if latitude and longitude values are valid numbers
    if(isNaN(updateData.lat) || isNaN(updateData.lng)){
      console.warn("moveMarkers: Could not find aircraft lat: ", updateData.lat, " and lng: ", updateData.lng);
      return;
    }
    
    // Calculate the rotation angle based on the new and previous coordinates
    const rotation = updateRotation(this.state.aircrafts[updateData.id].getLatLng().lat, this.state.aircrafts[updateData.id].getLatLng().lng, updateData.lat, updateData.lng);
    
    // Animate the marker movement, update the marker's position, and store the update
    this.animateMarkerMovement(this.state.aircrafts[updateData.id], L.latLng(updateData.lat, updateData.lng), rotation, updateData.speed, updateData.prevTimestamp, updateData.currentTimestamp, updateData.simulationSpeedup);
    
    // Set the new position for the aircraft marker
    this.state.aircrafts[updateData.id].setLatLng([updateData.lat, updateData.lng])

    // Prepare the update object with the marker and null polyline
    const update = {marker: this.state.aircrafts[updateData.id], polyline: null}
    
    // Check if the corresponding polyline exists
    if (!this.state.polylines.hasOwnProperty(updateData.id)) {
      console.warn("moveMarkers: Could not find polyline Id: ", updateData.id);
      return update;
    }
    // Get the polyline associated with the aircraft's movement
    const polyline = this.state.polylines[updateData.id]
    
    // Check if the destination airport exists
    if (!this.state.airports.hasOwnProperty(polyline.airportIdTo)) {
      console.warn("moveMarkers: Could not find airport To Id: ", polyline.airportIdTo);
      return update;
    }
    
    // Update the destination polyline's position
    polyline.polylineTo.setLatLngs([this.state.aircrafts[updateData.id].getLatLng(), this.state.airports[polyline.airportIdTo].getLatLng()]);
    // Include the updated polyline in the return object
    update['polyline'] = polyline
    // Check if there is no corresponding departure polyline
    if (!polyline.polylineFrom) return update;
    // Check if the departure airport exists
    if (!this.state.airports.hasOwnProperty(polyline.airportIdFrom)) {
      console.warn("moveMarkers: Could not find airport from Id: ", polyline.airportIdFrom);
      return update;
    }
    // Update the departure polyline's position
    polyline.polylineFrom.setLatLngs([this.state.aircrafts[updateData.id].getLatLng(), this.state.airports[polyline.airportIdFrom].getLatLng()]);
    // Include the updated polyline in the return object
    update['polyline'] = polyline
    // Return the object containing the updated marker and polyline
    return update
  }

  /**
   * Draws a polyline on the map connecting an aircraft to its destination airport(s).
   * @param payload - Object containing information for drawing the polyline (aircraftId, airportIdTo, airportIdFrom).
   * @returns The created polyline object or logs a warning if unsuccessful.
   */
  drawPolyLine(polyLineData: PolyLineData) {
    // Check if a polyline for the given aircraftId already exists
    if (this.state.polylines.hasOwnProperty(polyLineData.aircraftId)) {
      console.warn("Aready made: ", this.state.polylines[polyLineData.aircraftId]);
      return;
    }
    // Check if the aircraft with the given aircraftId exists
    if (!this.state.aircrafts.hasOwnProperty(polyLineData.aircraftId)) {
      console.warn("drawPolyLine: Could not find aircraft id: ", polyLineData.aircraftId);
      return;
    }
    // Check if the destination airport with airportIdTo exists
    if (!this.state.airports.hasOwnProperty(polyLineData.airportIdTo)) {
      console.warn("drawPolyLine: Could not find airportTo id: ", polyLineData.airportIdTo);
      return;
    }
    // Check if the source airport with airportIdFrom exists
    if (polyLineData.airportIdFrom) {
      if (!this.state.airports.hasOwnProperty(polyLineData.airportIdFrom)) {
        console.warn("drawPolyLine: Could not find airportFrom id: ", polyLineData.airportIdFrom);
        return;
      }
    }
    // Create polyline objects for the destination and, if applicable, source airports
    this.state.polylines[polyLineData.aircraftId] = {
      airportIdTo: polyLineData.airportIdTo,
      airportIdFrom: polyLineData.airportIdFrom,
      polylineTo: L.polyline([this.state.aircrafts[polyLineData.aircraftId].getLatLng(), this.state.airports[polyLineData.airportIdTo].getLatLng()], {
        interactive: false,
        stroke: true,
        lineCap: 'butt',
        color: getComputedStyle(document.documentElement)
        .getPropertyValue('--bs-primary-border-subtle'),
        smoothFactor: 100,
        opacity: 1.0,
      }),
      polylineFrom: polyLineData.airportIdFrom 
        ? L.polyline([this.state.aircrafts[polyLineData.aircraftId].getLatLng(), this.state.airports[polyLineData.airportIdFrom].getLatLng()], {
            interactive: false,
            stroke: true,
            lineCap: 'butt',
            color: getComputedStyle(document.documentElement)
            .getPropertyValue('--bs-link-color'),
            smoothFactor: 100,
            opacity: 1.0,
        })
        : false,
    };
    // Add the polyline objects to the map and bring to the front
    if (this.state.polylines[polyLineData.aircraftId].polylineFrom) this.state.polylines[polyLineData.aircraftId].polylineFrom.addTo(this.map).bringToFront();
    this.state.polylines[polyLineData.aircraftId].polylineTo.addTo(this.map).bringToFront();
    // Return the created polyline object
    return this.state.polylines[polyLineData.aircraftId];
  }

  /**
   * Removes a polyline from the map based on the provided payload.
   * @param {RemoveData} payload - Object containing information for removing the polyline (id).
   * @returns {boolean} - True if the polyline was successfully removed, false otherwise.
   */
  removePolyLine(payload: RemoveData) {
    // Check if the polyline with the given id exists
    if (!this.state.polylines.hasOwnProperty(payload.id)) {
      console.warn("removePolyLine: Could not find polyline id");
      return false;
    }
    // Remove the polylineFrom layer if it exists
    if (this.state.polylines[payload.id].polylineFrom) this.map!.removeLayer(this.state.polylines[payload.id].polylineFrom);
    // Remove the polylineTo layer
    this.map!.removeLayer(this.state.polylines[payload.id].polylineTo)
    // Delete the polyline entry from the state
    delete this.state.polylines[payload.id];
    // Return true to indicate successful removal
    return true
  }

  animateMarkerMovement = (marker, newCoords, rotation, speed, prevTimestamp, currentTimestamp, simulationSpeedup) => {
    // console.log("animateMarker: ", marker, newCoords, rotation, speed, prevTimestamp, currentTimestamp);
    const startPosition = marker.getLatLng();
    const endPosition = newCoords;
    // Calculate distance in meters
    const distance = calculateDistance(startPosition.lat, startPosition.lng, endPosition.lat, endPosition.lng);
    
    // Convert speed from knots to meters per second
    const speedInMetersPerSecond = speed * 0.514444;

    // Calculate time to travel the distance at the given speed (time = distance / speed)
    const timeToTravel = distance / speedInMetersPerSecond;
    
    // Calculate animation duration using timestamps (in milliseconds)
    // simulationSpeedup is defined in record_demo. It adjusts for backend sending faster than realtime
    const duration = Math.min(timeToTravel * 1000, new Date(currentTimestamp).getTime() - new Date(prevTimestamp).getTime()) / simulationSpeedup;
    const startTime = performance.now();
    // console.log("animateMarker\nduration: ", duration, "\ntimeToTravel: ", timeToTravel, "\nspeed: ", speedInMetersPerSecond, "\ndistance: ", distance);
    
    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = elapsedTime / duration;
      if (progress < 1) {
        const currentPosition = {
          lat: startPosition.lat + (endPosition.lat - startPosition.lat) * progress,
          lng: startPosition.lng + (endPosition.lng - startPosition.lng) * progress,
        };
        marker.setLatLng(currentPosition);

        // Recalculate rotation based on the current position
        const currentRotation = calculateRotation(currentPosition.lat, currentPosition.lng, endPosition.lat, endPosition.lng);
        marker.setRotationAngle(currentRotation);

        requestAnimationFrame(animate);
      } else {
        marker.setLatLng(endPosition);
        marker.setRotationAngle(rotation);
      }
    };
    requestAnimationFrame(animate);
  };

  /**
   * Handles touch events on the map to enable/disable dragging based on the number of touches.
   * @param {React.TouchEvent<HTMLDivElement>} e - The touch event on the map container.
   */
  handleMapTouch(e: React.TouchEvent<HTMLDivElement>) {
    // Check if there is only one touch on the screen and the map is not in fullscreen mode
    if (e.touches.length <= 1 && !this.state.fullScreen) {
      if (this.map) this.map.dragging.disable(); // If true, disable dragging of the map
    } else {
      if (this.map) this.map.dragging.enable();  // If there are multiple touches or the map is in fullscreen mode, enable dragging
    }
  }

  /**
   * Reloads the map size to ensure proper rendering after changes.
   */
  reloadMap() {
    this.map.invalidateSize()
  }

  /**
   * Retrieves the current dragging status of the map.
   * @returns {boolean} - True if dragging is enabled, false otherwise.
   */
  mapStatus() {
    return this.map.dragging.enabled()
  }

  /**
   * Renders the Leaflet map within a designated container.
   * Attaches a onTouchMove event handler for touch interactions.
   * @returns {JSX.Element} - The JSX representation of the map component.
   */
  render() {
    return (
      <>
        <div
          id="map"
          className="leaflet-map"
          onTouchMove={(e) => this.handleMapTouch(e)}
          ref={this.mapRef}
        ></div>
      </>
    );
  }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

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

export default LeafletMap;
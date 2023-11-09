/**
 * Handles map logic, API calls, etc.
 */
import React from "react";
import LeafletMap from "./LeafletMap";
import { Rnd } from "react-rnd";
import MapUI from "./MapUI";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.js';

import {
  faExpand,
  faCompress,
  faCircleChevronRight,
} from "@fortawesome/free-solid-svg-icons";

function parseText(text: any) {
  if (text === "") return 0;
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Error parsing JSON:", error);
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

interface RndProps {
  w: number;
  h: number;
  x: number;
  y: number;
  fullScreen: boolean;
}

class InteractiveMap extends React.Component<InteractiveMapProps, RndProps> {
  private mapRef = React.createRef<LeafletMap>();
  private d_width = window.innerWidth;
  private d_height = window.innerHeight;

  constructor(props: InteractiveMapProps) {
    super(props);
    this.state = {
      w: this.d_width,
      h: this.d_height,
      x: 10,
      y: 10,
      fullScreen: false
    };
  }

  // On load function
  componentDidMount() {
    // setInterval(this.handleFlyToLocation, 2500); // This is a one time thing
    // setInterval(this.handleAddMarker, 2500);
    // setInterval(this.handleRemoveMarker, 2500);
    // setInterval(this.handleUpdateMarker, 5000);
    // setInterval(this.handleAddPolyline, 7000);
    // setInterval(this.handleRemovePolyline, 2500);

    this.setState({ w: this.d_width, h: this.d_height, x: 10, y: 10 });
    //setInterval(this.handleClearMap, 10000);

    // for (let record of this.props.flightRecords) {
    //     this.addFlightRecordAsMarker(record);
    // }
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
    fetch("/api/PageReload/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ Page: "Refreshed" }),
    });
  }
  // Move camera to given coords and zoom
  handleFlyToLocation = async () => {
    try {
      const response = await fetch("/api/flyToLastMarker");
      const data = parseText(await response.text());
      if (data == 0) return;
      this.mapRef.current?.flyTo({
        lat: data.lat,
        lng: data.lng,
        zoom: data.zoom,
      });
      console.log("Frontend received flyToLocation: (data) " + data);
      console.log(
        "Frontend received flyToLocation: " + data.lat + " " + data.lng
      );
    } catch (error) {
      console.error("Error:", error);
    }
  };

  handleAddMarker = async () => {
    try {
      const response = await fetch("/api/addMarker/");
      const data = parseText(await response.text());
      if (data == 0) return;
      if (!Array.isArray(data)) {
        this.mapRef.current?.addMarkers({
          id: data.id, // marker id -- currently using flight id as marker id
          type: data.type, // aircraft or airport -- currently only have aircraft
          coords: [data.lat, data.lng], // [lat, lng]
          rotation: data?.rotate,
          element: data?.info, // info or ""
        });
        return;
      }
      for (var index = 0; index < data.length; index++) {
        this.mapRef.current?.addMarkers({
          id: data[index].id, // marker id -- currently using flight id as marker id
          type: data[index].type, // aircraft or airport -- currently only have aircraft
          coords: [data[index].lat, data[index].lng], // [lat, lng]
          rotation: data[index]?.rotate,
          element: data[index]?.info, // info or ""
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  handleRemoveMarker = async () => {
    try {
      const response = await fetch("/api/removeMarker/");
      const data = parseText(await response.text());
      if (data == 0) return;
      if (!Array.isArray(data)) {
        this.mapRef.current?.removeMarker({
          id: data.id,
          type: data.type,
        });
        return;
      }
      for (var index = 0; index < data.length; index++) {
        this.mapRef.current?.removeMarker({
          id: data[index].id,
          type: data[index].type,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  handleUpdateMarker = async () => {
    try {
      const response = await fetch("/api/updateMarker/");
      const data = parseText(await response.text());
      if (data == 0) return;
      if (!Array.isArray(data)) {
        this.mapRef.current?.moveMarkers({
          movingMarkerId: data.id, // marker Id
          newCoords: [data.lat, data.lng], // [lat, lng]
        });
        return;
      }
      for (var index = 0; index < data.length; index++) {
        this.mapRef.current?.moveMarkers({
          movingMarkerId: data[index].id, // marker Id
          newCoords: [data[index].lat, data[index].lng], // [lat, lng]
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  handleAddPolyline = async () => {
    try {
      const response = await fetch("/api/addPolylinePayload/");
      const data = parseText(await response.text());
      if (data == 0) return;
      console.log(
        "aircraft: %d, airportFrom: %d, airportTo: %d",
        data.aircraftID,
        data.airportIDFrom,
        data.airportIDTo
      );
      if (!Array.isArray(data)) {
        this.mapRef.current?.drawPolyLine({
          aircraftId: data.aircraftID,
          airportIdTo: data.airportIDTo,
          airportIdFrom: data.airportIDFrom,
        });
        return;
      }
      for (var index = 0; index < data.length; index++) {
        console.log(
          "aircraft: %d, airportFrom: %d, airportTo: %d",
          data[index].aircraftID,
          data[index].airportIDFrom,
          data[index].airportIDTo
        );
        this.mapRef.current?.drawPolyLine({
          aircraftId: data[index].aircraftID,
          airportIdTo: data[index].airportIDTo,
          airportIdFrom: data[index].airportIDFrom,
        });
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  handleRemovePolyline = async () => {
    try {
      const response = await fetch("/api/removePolylinePayload/");
      const data = parseText(await response.text());
      if (data == 0) return;
      if (!Array.isArray(data)) {
        this.mapRef.current?.removePolyLine(data.mark_aircraft.id);
        return;
      }
      for (var index = 0; index < data.length; index++) {
        this.mapRef.current?.removePolyLine(data[index].mark_aircraft.id);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  handleClearMap = async () => {
    try {
      const response = await fetch("/api/ClearMapPayload");
      const data = parseText(await response.text());
      if (data == 0) return;
      if (data.ClearSwitch) {
        this.mapRef.current?.clearMap();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  handleResponseWellnessCheck = async () => {
    try {
      const response = await fetch("/api/WellnessCheck/");
      const responseData = await response.json();
      const valid = new Set<string>([
        "aircrafts",
        "airports",
        "landmarks",
        "camera",
      ]);
      if (responseData.message in valid) {
        const sendResponse = await fetch("/api/FrontEndData/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            this.mapRef.current?.sendData(responseData.message)
          ),
        });
      }
    } catch (error) {
      console.error(error);
    }
    setTimeout(() => {
      this.handleResponseWellnessCheck();
    }, 1000);
  };

  addFlightRecordAsMarker = (record: FlightRecord) => {
    this.mapRef.current?.removeMarker({
      id: String(record.flight.id),
      type: "aircraft",
    });
    let rotationAngle;

    // Check if the previous record for the flight exists
    const previousRecords = this.props.flightRecords.filter(
      (r) => r.flight.id === record.flight.id && r.timestamp < record.timestamp
    );

    if (previousRecords.length > 0) {
      const prevRecord = previousRecords[previousRecords.length - 1];
      rotationAngle = calculateRotation(
        prevRecord.lat,
        prevRecord.lng,
        record.lat,
        record.lng
      );
    }

    const markerDataPayload = {
      id: String(record.flight.id),
      type: "aircraft",
      coords: { lat: record.lat, lng: record.lng },
      rotation: rotationAngle,
      element: <p>{record.flight.flight}</p>,
    };
    this.mapRef.current?.addMarkers(markerDataPayload);
  };

  goFullScreen() {
    this.setState({
      w: window.innerWidth,
      h: window.innerHeight,
      x: 0,
      y: 0,
      fullScreen: true
    });
  }

  render() {
    return (
      <div>
        {/* <LeafletMap ref={this.mapRef} /> */}
        <Rnd
          className="rnd-container"
          default={{
            x: 10,
            y: 10,
            width: this.d_width,
            height: this.d_height,
          }}
          size={{ width: this.state.w, height: this.state.h }}
          onDrag={(e, d) => {
            if (this.mapRef.current?.isMapDragging())
              return false; /* Prevent dragging the Rnd component */
          }}
          position={{ x: this.state.x, y: this.state.y }}
          onDragStop={(e, d) => {
            this.setState({ x: d.x, y: d.y });

            console.log(this.state);
          }}
          onResizeStop={(e, direction, ref, delta, position) => {
            this.setState({
              w: parseInt(ref.style.width),
              h: parseInt(ref.style.height),
              x: position.x,
              y: position.y,
            });
            this.mapRef.current?.reloadMap();
          }}
        >
          <div className="UI-container">
            {/* if if is full screen, render the panel and everything, if it is not, render only the expand button */}
            {/* TODO  implment shrink button*/}
            {this.state.w === window.innerWidth || this.state.fullScreen ? (
              // this sits on top of the map
              <>
                <div className="row container-fluid vh-100 ">
                  <div className="col-xl-4 d-flex align-items-center vh-100 position-relative">
                    {/* main panel that displays information */}
                    <a
                        className="btn btn-primary"
                        data-bs-toggle="collapse"
                        href="#collapseExample"
                        role="button"
                        aria-expanded="false"
                        aria-controls="collapseExample"
                      >
                        <FontAwesomeIcon icon={faCircleChevronRight} className="expand" />
                      </a>
                    <div className="collapse collapse-horizontal" id="collapseExample">
                        <div className="panel" style={{width: '500px'}}>
                            <div className="container-fluid d-flex flex-column">
                                {/* aircraft type  */}
                                <div className="aircraft-type mx-auto">
                                    <div className="flight-num">
                                        UA1669
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
                <FontAwesomeIcon icon={faCompress} />
              </>
            ) : (
              <FontAwesomeIcon
                icon={faExpand}
                onClick={this.goFullScreen.bind(this)}
              />
            )}
            <LeafletMap ref={this.mapRef} />
            {/* svg of the expand button */}
          </div>
        </Rnd>
      </div>
    );
  }
}

// Improved
function calculateRotation(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRadians = (degree: number) => degree * (Math.PI / 180);
  const toDegrees = (radians: number) => radians * (180 / Math.PI);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);
  const diffLng = toRadians(lng2 - lng1);
  return (
    (toDegrees(
      Math.atan2(
        Math.sin(diffLng) * Math.cos(radLat2),
        Math.cos(radLat1) * Math.sin(radLat2) -
          Math.sin(radLat1) * Math.cos(radLat2) * Math.cos(diffLng)
      )
    ) +
      360) %
    360
  );
}

export default InteractiveMap;

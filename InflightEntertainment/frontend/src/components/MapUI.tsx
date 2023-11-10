/**
 * The purpose of this container is to provide UI controls for the map.
 * If RND container is not at full device screen width and height, then the small screen UI is returned.
 * If RND container is at full screen, then the full screen UI is returned.
 */

import React from "react";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faCompress,
  faPlaneUp,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";

const MapUI = () => {
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
                  <div className="flight-num">UA1669</div>
                  <div className="small text-center">Boeing 747</div>
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
                    <p>Ho Chi Minh</p>
                    <p className="text-end">Des Moines</p>
                  </div>
                </div>

                {/* extra info  */}
                <div className="extra-info d-flex flex-column justify-content-evenly">
                  {/* distance  */}
                  <div className="distance text-center d-flex flex-column">
                    <h4>1200 km | 746 miles</h4>
                    <p>traveled</p>
                    <div className="position-relative mb-3">
                        <div className="bar" />
                        <FontAwesomeIcon icon={faPlaneUp} />
                        <div className="bar"></div>
                    </div>
                    <h4>156 km | 96 miles</h4>
                    <p>remaining</p>
                  </div>

                  <hr />

                  {/* other extra info */}

                  <p>Ground speed <span className="float-end">865 kph | 571 mph</span></p>
                  <p>Altitude <span className="float-end">35006 ft | 10670 m</span></p>
                  <p>Outside temperature <span className="float-end">-60° F | -51° C</span></p>
                  <p>Longtitude<span className="float-end">-121</span></p>
                  <p>Latitude<span className="float-end">86</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapUI;

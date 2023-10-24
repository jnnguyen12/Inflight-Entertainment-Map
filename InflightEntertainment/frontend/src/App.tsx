import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import InteractiveMap from "./components/InteractiveMap"

function App() {

  // This represents the componet that they wanted
  return (
    // To test the backend uncomment the following lines and comment out the InteractiveMap.
    <div className="App">
      {/* <TestBackend /> */}
      <TestWebsocket />
    </div>
    // <>
    //   <InteractiveMap />
    // </>
  );
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
  lon: number;
  alt_baro: number | null;
  alt_geom: number | null;
  track: number | null;
  gs: number;
};

const TestBackend = () => {
  const [flightRecords, setFlightRecords] = React.useState<FlightRecord[]>([]);

  const getFlightRecords = async () => {
    let response = await fetch('/api/flights/ASA184/simulate/');
    let data = await response.json();
    setFlightRecords(data);
  }

  React.useEffect(() => {
    getFlightRecords();
  }, []);

  return (
    <div className="flightRecords">
      {flightRecords.map((record) => (
        <div key={record.timestamp} className="flightRecord">
          <p>Timestamp: {record.timestamp}</p>
          <p>Latitude: {record.lat}</p>
          <p>Longitude: {record.lon}</p>
        </div>
      ))}
    </div>
  );
};

const TestWebsocket: React.FC = () => {
  const [flightRecords, setFlightRecords] = useState<FlightRecord[]>([]);
  const chatSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = `ws://${window.location.host}/ws/socket-server/`;
    chatSocketRef.current = new WebSocket(url);

    chatSocketRef.current.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log('Data:', data);

      if (data.type === 'new_flight_record' || data.type === 'add_flight_record') {
        const recordWithFlight = {
          ...data.record,
          flight: data.flight
        };
        setFlightRecords((prevRecords) => [...prevRecords, recordWithFlight]);
      }
    };

    return () => {
      if (chatSocketRef.current) {
        chatSocketRef.current.close();
      }
    };
  }, []);

  return (
    <div>
      <h1>Test Websocket</h1>
      <div>
        {flightRecords.map((record, index) => (
          <div key={index}>
            <p>Flight: {record.flight.flight}</p>
            <p>Timestamp: {record.timestamp}</p>
            <p>Latitude: {record.lat}</p>
            <p>Longitude: {record.lon}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
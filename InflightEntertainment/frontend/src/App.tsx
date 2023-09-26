import React from "react";
import './App.css';
import InteractiveMap from "./components/InteractiveMap"

function App() {

  // This represents the componet that they wanted
  return (
    // To test the backend uncomment the following lines and comment out the InteractiveMap.
    // <div className="App">
    //   <TestBackend />
    // </div>
    <>
      <InteractiveMap />
    </>
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
export default App;



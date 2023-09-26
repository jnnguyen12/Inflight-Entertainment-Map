import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import './App.css';
function App() {
  return (
    <div className="App">
      <TestBackend />
    </div>
    // <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true}>
    //   <TileLayer
    //     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    //     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    //   />
    //   <Marker position={[51.505, -0.09]}>
    //     <Popup>
    //       A pretty CSS3 popup. <br /> Easily customizable.
    //     </Popup>
    //   </Marker>
    // </MapContainer>
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

  const getFlightRecords = async (flightId: number) => {
    let response = await fetch('/api/flights/ASA184/simulate/');
    let data = await response.json();
    setFlightRecords(data);
  }

  React.useEffect(() => {
    const flightId = 1;  // Replace with actual flight id you want to simulate
    getFlightRecords(flightId);
  }, []);

  return (
    <div className="flightRecords">
      {flightRecords.map((record) => (
        <div key={record.timestamp} className="flightRecord">
          <p>Timestamp: {record.timestamp}</p>
          <p>Latitude: {record.lat}</p>
          <p>Longitude: {record.lon}</p>
          {/* Render other flight record data as needed */}
        </div>
      ))}
    </div>
  );
};
export default App;

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

  let [flights, setFlights] = React.useState<Flight[]>([]);

  React.useEffect(() => {
    getFlights();
  }, []);

  let getFlights = async () => {
    let response = await fetch("/api/flights/");
    let data = await response.json();
    setFlights(data);
  }

  return (
    <div className="flights">
      {flights.map((flight) => (
        <div key={flight.hex} className="flight">
          <p>Flight: {flight.flight}</p>
          <p>Hex: {flight.hex}</p>
          <p>Registration: {flight.r}</p>
          <p>Type: {flight.t}</p>
        </div>
      ))}
    </div>
  );
};
export default App;

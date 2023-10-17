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
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const chatSocketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = `ws://${window.location.host}/ws/socket-server/`;
    chatSocketRef.current = new WebSocket(url);

    chatSocketRef.current.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data);
      console.log('Data:', data);
      if (data.type === 'chat') {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    return () => {
      if (chatSocketRef.current) {
        chatSocketRef.current.close();
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (chatSocketRef.current) {
      chatSocketRef.current.send(JSON.stringify({
        message: inputMessage,
      }));
    }
    setInputMessage('');
  };

  return (
    <div>
      <h1>Test</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="message"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>

      <div>
        {messages.map((message, index) => (
          <div key={index}>
            <p>{message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


export default App;



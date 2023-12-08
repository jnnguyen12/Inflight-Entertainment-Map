import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import InteractiveMap from "./components/InteractiveMap"

function App() {

  // This represents the componet that they wanted
  return (
    // To test the backend uncomment the following lines and comment out the InteractiveMap.
    // <div className="App">
    //   {/* <TestBackend /> */}
    //   {/* <TestWebsocket /> */}
    //   <InteractiveMapWithWebsocket />
    // </div>
    <>
      <InteractiveMap />
    </>
  );
}

// const TestWebsocket: React.FC = () => {
//   const [flightRecords, setFlightRecords] = useState<FlightRecord[]>([]);
//   const chatSocketRef = useRef<WebSocket | null>(null);

//   useEffect(() => {
//     const url = `ws://${window.location.host}/ws/socket-server/`;
//     chatSocketRef.current = new WebSocket(url);

//     chatSocketRef.current.onmessage = (e: MessageEvent) => {
//       const data = JSON.parse(e.data);
//       console.log('Data:', data);

//       if (data.type === 'new_flight_record' || data.type === 'add_flight_record') {
//         const recordWithFlight = {
//           ...data.record,
//           flight: data.flight
//         };
//         setFlightRecords((prevRecords) => [...prevRecords, recordWithFlight]);
//       }
//     };

//     return () => {
//       if (chatSocketRef.current) {
//         chatSocketRef.current.close();
//       }
//     };
//   }, []);

//   return (
//     <div>
//       <h1>Test Websocket</h1>
//       <div>
//         {flightRecords.map((record, index) => (
//           <div key={index}>
//             <p>Flight: {record.flight.flight}</p>
//             <p>Timestamp: {record.timestamp}</p>
//             <p>Latitude: {record.lat}</p>
//             <p>lnggitude: {record.lng}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// const InteractiveMapWithWebsocket: React.FC = () => {
//   const [flightRecords, setFlightRecords] = useState<FlightRecord[]>([]);
//   const chatSocketRef = useRef<WebSocket | null>(null);

//   useEffect(() => {
//     const url = `ws://${window.location.host}/ws/socket-server/`;
//     chatSocketRef.current = new WebSocket(url);

//     chatSocketRef.current.onmessage = (e: MessageEvent) => {
//       const data = JSON.parse(e.data);
//       console.log('Data:', data);

//       if (data.type === 'new_flight_record' || data.type === 'add_flight_record') {
//         const recordWithFlight = {
//           ...data.record,
//           flight: data.flight
//         };
//         setFlightRecords((prevRecords) => [...prevRecords, recordWithFlight]);
//       }
//     };

//     return () => {
//       if (chatSocketRef.current) {
//         chatSocketRef.current.close();
//       }
//     };
//   }, []);

//   return (
//     <div>
//       <InteractiveMap flightRecords={flightRecords} />
//     </div>
//   );
// }

export default App;
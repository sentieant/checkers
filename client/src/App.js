import { Routes, Route } from 'react-router-dom';
import homePage from "./components/main/Home";
const socket = io.connect("http://localhost:1212");
import loginPage from "./components/main/Login";
import tablePage from "./components/main/Table";
import { useNavigate } from 'react-router-dom'
import io from 'socket.io-client'
import { useState } from 'react';



function App() {
  const navigate = useNavigate();
  const [participantName, setParticipantName] = useState(null);

  socket.on("recieve_new_connection", () => {
    navigate("/");
  })

  return (
    <>
      <Routes>
        <Route path="/" element={
          <loginPage 
            socket={socket} 
            setParticipantName={setParticipantName} 
          />} 
        />
        <Route path="/home" element={
          <homePage
            participantName={participantName}
            setParticipantName={setParticipantName}
            socket={socket} 
          />} 
        />
        <Route path="/table/:id" element={
          <tablePage 
            participantName={participantName} 
            socket={socket} 
          />} 
        />
      </Routes>
    </>
  )
}

export default App;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'

function loginPage({ socket }) {
  const [participantName, setParticipantName] = useState(``);
  const navigate = useNavigate();

  socket.emit("request_leave_table");
  
  function handleLogin(e) {
    e.preventDefault();
    if (participantName === "") {
      socket.emit("user_login", `anon#${Math.floor(Math.random() * 100000)}`);
    } else {
      socket.emit("user_login", participantName);
    }
    navigate('/home')
  }

  return (
    <>
      <h1 className="login-title">Checkers</h1>
      <div className="login-body">
        <h2>Choose Username:</h2>
        <form onSubmit={handleLogin}>
          <input
            maxLength="15"
            type="text"
            minLength={5}
            name="username"
            id="username"
            className="username-input"
            onChange={(e) => setParticipantName(e.target.value)}
          />
          <button onClick={handleLogin} type="submit">Play</button>
        </form>
      </div>
    </>
  );
}
export default loginPage;
import { useState, useEffect } from 'react';
import redPiece from '../../assets/redking.png'
import whitePiece from '../../assets/whiteking.png'
import { useNavigate } from 'react-router-dom'

function Hud({ participantName, socket, playerSide, tableSide }) {
  const navigate = useNavigate();
  const [opponentName, setOpponentName] = useState([]);
  const [tableFull, setTableFull] = useState(false);
  let displayTableSide;
  if (tableSide === "white") {
    displayTableSide = "Blue"
  } else {
    displayTableSide = "Red"
  }

  function resetTable() {
    socket.emit("request_reset_table");
    console.log("NEWGAME")
  }

  function navigateToLobby() {
    navigate(`/home`)
  }

  useEffect(() => {
    socket.on("recieve_foe_user", (data) => {
      console.log(data)

      if (data.length > 1) {
        setTableFull(true);
      } else {
        setTableFull(false);
      }
      let opponent = data.filter((user) => user !== participantName);
      setOpponentName(opponent);
    })
  }, [socket, participantName])

  return (
    <div>
      <div className="hud">
        <div className="hud-title">PLAYERS</div>
        <div className="hud-players">
          <div className="hud-player-name">
            {playerSide === "white" && <img alt='white' className={`hud-piece`} src={redPiece} />}
            {playerSide === "red" && <img alt='red' className="hud-piece" src={whitePiece} />}
            {(tableFull && <span >{opponentName}</span>) || <span className="hud-waiting" >Waiting for other players...</span>}
          </div>
          <div >
            <div alt='red' className={`hud-player-name`}>{playerSide === "red" && <img alt='red' className="hud-piece" src={redPiece} />}
              {playerSide === "white" && <img alt='white' className="hud-piece" src={whitePiece} />}{participantName}
            </div>
          </div>
        </div>
        <div className="hud-title">Turn: {displayTableSide}</div>
      </div>
      <div onClick={resetTable} className="hud-button">
        Reset Table
      </div>
      <div onClick={navigateToLobby} className="hud-button">
        Back To Lobby
      </div>
    </div>
  );
}
export default Hud;
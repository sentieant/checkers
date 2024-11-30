import GameBoard from '../game/Game'
import { useParams } from 'react-router-dom'
import { useState } from 'react';
import ChatBox from '../chat/Chat'
import CompHud from '../hud/Hud.js'

function tablePage({ socket, participantName }) {
  const { id } = useParams();
  const [tableSide, setTableSide] = useState(null);
  const [playerSide, setPlayerSide] = useState(null);
  
  const tableMap = {
    1: "table_1",
    2: "table_2",
    3: "table_3",
    4: "table_4",
  }
  socket.emit("join_table", tableMap[id], id);

  return (
    <>
      <h1 className="table-title">Table {id} | {participantName} </h1>
      <div className="table">
        <ChatBox
          participantName={participantName}
          socket={socket} />
        <GameBoard
          participantName={participantName}
          playerSide={playerSide}
          setPlayerSide={setPlayerSide}
          tableSide={tableSide}
          setTableSide={setTableSide}
          socket={socket} />
        <CompHud
          participantName={participantName}
          socket={socket}
          playerSide={playerSide}
          tableSide={tableSide}
        />
      </div>
    </>
  )
}
export default tablePage;
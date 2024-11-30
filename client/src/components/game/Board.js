import { useState } from 'react'
import whitePiece from '../../assets/white.png'
import redPiece from '../../assets/red.png'
import kingPieceR from '../../assets/redking.png'
import kingPieceW from '../../assets/whiteking.png'

function GameBoard({ boardState, socket, participantName, handleCellClick, setGamePosition }) {
  const [flip, setFlip] = useState("");

  socket.on("recieve_fen", (data) => {
    data && setGamePosition(data);
  })
  
  socket.emit("request_flip");
  socket.on("recieve_flip", () => {
    setFlip("-flip");
  })

  return (
    <div className={`board ${flip}`} >
      {boardState.map((row) => row.map((cell) => {
        return (
          <div key={cell.id} onClick={() => { handleCellClick(cell.position); }}
            className={`${cell.cssStyle} square ${cell.highlight}`} >
            {cell.checkerType === "white" && <img className={`piece ${flip}`} src={whitePiece} alt="white" />}
            {cell.checkerType === "whiteking" && <img className={`piece ${flip}`} src={kingPieceW} alt="white-king" />}
            {cell.checkerType === "red" && <img className={`piece ${flip}`} src={redPiece} alt="red" />}
            {cell.checkerType === "redking" && <img className={`piece ${flip}`} src={kingPieceR} alt="red-king" />}
          </div>
        )
      }))}
    </div >
  );
}
export default GameBoard;
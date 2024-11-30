import { useState, useRef } from 'react';
import GameBoard from "./Board";
import setupBoard from './helpers/initBoard.js'
import {
  removeChecker,
  writeGamePosition,
  readGamePosition,
  resetHighlightPossible,
  kingPiece,
  jumpUpLeftCondition,
  jumpUpRightCondition,
  jumpDownLeftCondition,
  jumpDownRightCondition,
  outOfBounds,
  highlight,
  resetJumpMoves,
  scanForJumpMoves,
  resetBasicMoves
} from './helpers/helpers.js'

function Game({ socket, participantName, tableSide, setTableSide, playerSide, setPlayerSide }) {
  const [gamePosition, setGamePosition] = useState("");
  const [activePlayer, setActivePlayer] = useState("white");
  const [cellSelected, setCellSelected] = useState(false);
  const [startCell, setStartCell] = useState(null);
  const [inTransit, setInTransit] = useState(null);
  const tempBoardRef = useRef(setupBoard());
  const boardState = tempBoardRef.current;
  let jumpPath = [];

  readGamePosition(boardState, gamePosition);

  socket.on("recieve_player_color", (color) => {
    setPlayerSide(color);
  })
  socket.on("recieve_table_color", (color) => {
    setTableSide(color);
  })

  function checkAvailableJumps(boardState) {
    if (playerSide !== tableSide) return;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (boardState[i][j].checkerType === null) continue;
        if (boardState[i][j].checkerColor !== playerSide) continue;

        if (playerSide === "white") {
          if (jumpUpLeftCondition(i, j, boardState) || jumpUpRightCondition(i, j, boardState)) {
            return true;
          }
        }
        if (playerSide === "red") {
          if (jumpDownRightCondition(i, j, boardState) || jumpDownLeftCondition(i, j, boardState)) {
            return true;
          }
        }
        if (boardState[i][j].checkerType === "whiteking" || boardState[i][j].checkerType === "redking") {
          if (jumpUpLeftCondition(i, j, boardState) || jumpUpRightCondition(i, j, boardState) || 
              jumpDownRightCondition(i, j, boardState) || jumpDownLeftCondition(i, j, boardState)) {
            return true;
          }
        }
      }
    }
  }

  function disableNonJumpMoves(boardState) {
    if (checkAvailableJumps(boardState)) {
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          boardState[i][j].clickable = true;
          if (boardState[i][j].basic) {
            boardState[i][j].clickable = false;
            boardState[i][j].highlight = "green";
          }
        }
      }
    }
  }

  function captureChecker(boardState, startCell, endCell) {
    let capturePosition = [];
    let startY = startCell.position[0];
    let startX = startCell.position[1];
    let endY = endCell.position[0];
    let endX = endCell.position[1];
    if (outOfBounds(startY, endY) || outOfBounds(startX, endX)) return;

    if (startY > endY) {
      capturePosition[0] = startY - 1;
    } else {
      capturePosition[0] = startY + 1;
    }
    if (startX > endX) {
      capturePosition[1] = startX - 1;
    } else {
      capturePosition[1] = startX + 1;
    }
    removeChecker(boardState[capturePosition[0]][capturePosition[1]]);
  }

  function changeActivePlayer(socket, boardState) {
    kingPiece(boardState);
    socket.emit("request_fen", writeGamePosition(boardState));
    socket.emit("request_change_turn");
  }

  function handleCellClick(position) {
    let y = position[0];
    let x = position[1];
    let currentCell = boardState[y][x];

    if (!currentCell.clickable) return;
    if (inTransit && !currentCell.jump) return
    if (currentCell.checkerColor !== playerSide && currentCell.checkerType !== null) 
      return resetHighlightPossible(boardState);

    if (cellSelected && currentCell.possible) {
      currentCell.checkerType = startCell.checkerType;
      removeChecker(startCell);
      socket.emit("request_fen", writeGamePosition(boardState));
      resetHighlightPossible(boardState);
      
      if (currentCell.jump) {
        highlight(currentCell, 1);
        captureChecker(boardState, startCell, currentCell)
        socket.emit("request_fen", writeGamePosition(boardState));
        setInTransit(true);
        resetJumpMoves(boardState)
        
        if (currentCell.checkerType === "whiteking" || currentCell.checkerType === "redking") {
          findRecursiveJumps(currentCell, true, true);
        } else {
          findRecursiveJumps(currentCell, true);
        }
        
        if (!scanForJumpMoves(boardState)) {
          setInTransit(false);
          jumpPath = [];
          resetHighlightPossible(boardState);
          changeActivePlayer(socket, boardState);
        }
        setStartCell(currentCell);
      } else {
        setStartCell(null);
        resetHighlightPossible(boardState);
        setCellSelected(false);
        changeActivePlayer(socket, boardState);
        jumpPath = []
      }
      return;
    }

    if (currentCell.checkerColor !== playerSide) return;
    if (tableSide !== playerSide) return;
    resetBasicMoves(boardState);
    resetHighlightPossible(boardState);
    setCellSelected(true)
    highlight(currentCell, 1);
    findPossibleMoves(y, x, currentCell);
    setStartCell(currentCell);
    disableNonJumpMoves(boardState);
  }

  function findPossibleMoves(y, x, currentCell) {
    if (currentCell.checkerType === "whiteking" || currentCell.checkerType === "redking") {
      if (!outOfBounds(y - 1, x - 1))
        evaluateAdjacentCells(boardState[y - 1][x - 1], currentCell, true);
      if (!outOfBounds(y - 1, x + 1))
        evaluateAdjacentCells(boardState[y - 1][x + 1], currentCell, true);
      if (!outOfBounds(y + 1, x - 1))
        evaluateAdjacentCells(boardState[y + 1][x - 1], currentCell, true);
      if (!outOfBounds(y + 1, x + 1))
        evaluateAdjacentCells(boardState[y + 1][x + 1], currentCell, true);
      return;
    }
    if (playerSide === "white") {
      if (!outOfBounds(y - 1, x - 1))
        evaluateAdjacentCells(boardState[y - 1][x - 1], currentCell);
      if (!outOfBounds(y - 1, x + 1))
        evaluateAdjacentCells(boardState[y - 1][x + 1], currentCell);
    }
    if (playerSide === "red") {
      if (!outOfBounds(y + 1, x - 1))
        evaluateAdjacentCells(boardState[y + 1][x - 1], currentCell);
      if (!outOfBounds(y + 1, x + 1))
        evaluateAdjacentCells(boardState[y + 1][x + 1], currentCell);
    }
  }

  function evaluateAdjacentCells(adjacentCell, currentCell, isKing) {
    if (!adjacentCell) return;
    if (adjacentCell.checkerType === null) {
      adjacentCell.possible = true;
      highlight(adjacentCell, 1);
      adjacentCell.basic = true;
      return;
    }
    if (adjacentCell.checkerColor === playerSide) return;
    if (adjacentCell.checkerColor !== playerSide) {
      findRecursiveJumps(currentCell, true, isKing);
    }
  }

  function findRecursiveJumps(currentCell, firstTry, isKing) {
    let y = currentCell.position[0];
    let x = currentCell.position[1];
    jumpPath.push(currentCell.id);

    if (firstTry && isKing) {
      if (jumpUpLeftCondition(y, x, boardState, playerSide)) {
        boardState[y - 2][x - 2].possible = true;
        boardState[y - 2][x - 2].jump = true;
        highlight(boardState[y - 2][x - 2], 2)
      }
      if (jumpUpRightCondition(y, x, boardState, playerSide)) {
        boardState[y - 2][x + 2].possible = true;
        boardState[y - 2][x + 2].jump = true;
        highlight(boardState[y - 2][x + 2], 2);
      }
      if (jumpDownLeftCondition(y, x, boardState, playerSide)) {
        boardState[y + 2][x - 2].possible = true;
        boardState[y + 2][x - 2].jump = true;
        highlight(boardState[y + 2][x - 2], 2);
      }
      if (jumpDownRightCondition(y, x, boardState, playerSide)) {
        if (firstTry) {
          boardState[y + 2][x + 2].possible = true;
          boardState[y + 2][x + 2].jump = true;
          highlight(boardState[y + 2][x + 2], 2);
        }
      }
    }

    if (playerSide === "white" || isKing) {
      if (jumpUpLeftCondition(y, x, boardState, playerSide) && !jumpPath.includes(boardState[y - 2][x - 2].id)) {
        if (firstTry) {
          boardState[y - 2][x - 2].possible = true;
          boardState[y - 2][x - 2].jump = true;
          highlight(boardState[y - 2][x - 2], 2)
        } else {
          highlight(boardState[y - 2][x - 2], 1)
        }
        findRecursiveJumps(boardState[y - 2][x - 2], false, isKing);
      }
      if (jumpUpRightCondition(y, x, boardState, playerSide) && !jumpPath.includes(boardState[y - 2][x + 2].id)) {
        if (firstTry) {
          boardState[y - 2][x + 2].possible = true;
          boardState[y - 2][x + 2].jump = true;
          highlight(boardState[y - 2][x + 2], 2);
        } else {
          highlight(boardState[y - 2][x + 2], 1);
        }
        findRecursiveJumps(boardState[y - 2][x + 2], false, isKing);
      }
    }
    if (playerSide === "red" || isKing) {
      if (jumpDownLeftCondition(y, x, boardState, playerSide) && !jumpPath.includes(boardState[y + 2][x - 2].id)) {
        if (firstTry) {
          boardState[y + 2][x - 2].possible = true;
          boardState[y + 2][x - 2].jump = true;
          highlight(boardState[y + 2][x - 2], 2);
        } else {
          highlight(boardState[y + 2][x - 2], 1);
        }
        findRecursiveJumps(boardState[y + 2][x - 2], false, isKing);
      }
      if (jumpDownRightCondition(y, x, boardState, playerSide) && !jumpPath.includes(boardState[y + 2][x + 2].id)) {
        if (firstTry) {
          boardState[y + 2][x + 2].possible = true;
          boardState[y + 2][x + 2].jump = true;
          highlight(boardState[y + 2][x + 2], 2);
        } else {
          highlight(boardState[y + 2][x + 2], 1);
        }
        findRecursiveJumps(boardState[y + 2][x + 2], false, isKing);
      }
    }
  }

  return (
    <>
      <GameBoard 
        boardState={boardState}
        activePlayer={activePlayer}
        setActivePlayer={setActivePlayer}
        socket={socket}
        handleCellClick={handleCellClick}
        gamePosition={gamePosition}
        setGamePosition={setGamePosition}
        readGamePosition={readGamePosition}
        writeGamePosition={writeGamePosition}
        participantName={participantName}
      />
    </>
  );
}

export default Game;
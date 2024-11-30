function scanForJumpMoves(boardState) {
  let hasJumpLeft = false;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (boardState[i][j].jump) {
        hasJumpLeft = true;
      }
    }
  }
  return hasJumpLeft
}

function resetBasicMoves(boardState) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      boardState[i][j].basic = false;
      boardState[i][j].clickable = true;
    }
  }
}

function resetJumpMoves(boardState) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (boardState[i][j].jump) {
        boardState[i][j].jump = false;
      }
    }
  }
}

function resetHighlightPossible(boardState) {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      boardState[i][j].highlight = "";
      boardState[i][j].possible = false;
    }
  }
}

function kingPiece(boardState) {
  for (let i = 0; i < 8; i++) {
    if (boardState[0][i].checkerType === "white") {
      boardState[0][i].checkerType = "whiteking"
    }
    if (boardState[7][i].checkerType === "red") {
      boardState[7][i].checkerType = "redking"
    }
  }
}

function highlight(cell, type) {
  if (type === 1) {
    cell.highlight = "-highlight";
  }
  if (type === 2) {
    cell.highlight = "-highlight-possible";
  }
}

function outOfBounds(y, x) {
  if (y > 7 || y < 0 || x > 7 || x < 0) return true;
  return false;
}

function removeChecker(cell) {
  cell.checkerType = null;
  cell.checkerColor = null;
}

function readGamePosition(boardState, gamePosition) {
  let count = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (gamePosition[count] === "1") {
        boardState[i][j].checkerType = "red";
        boardState[i][j].checkerColor = "red";
      }
      if (gamePosition[count] === "2") {
        boardState[i][j].checkerType = "redking";
        boardState[i][j].checkerColor = "red";
      }
      if (gamePosition[count] === "3") {
        boardState[i][j].checkerType = "white";
        boardState[i][j].checkerColor = "white";
      }
      if (gamePosition[count] === "4") {
        boardState[i][j].checkerType = "whiteking";
        boardState[i][j].checkerColor = "white";
      }
      if (gamePosition[count] === "0") {
        boardState[i][j].checkerType = null;
        boardState[i][j].checkerColor = null;
      }
      count++;
    }
  }
}

function writeGamePosition(boardState) {
  let tempBoard = "";
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (boardState[i][j].checkerType === "red") {
        tempBoard += "1";
      }
      if (boardState[i][j].checkerType === "redking") {
        tempBoard += "2";
      }
      if (boardState[i][j].checkerType === "white") {
        tempBoard += "3";
      }
      if (boardState[i][j].checkerType === "whiteking") {
        tempBoard += "4";
      }
      if (boardState[i][j].checkerType === null) {
        tempBoard += "0";
      }
    }
  }
  return tempBoard;
}

function jumpUpLeftCondition(y, x, boardState, playerSide) {
  if (
    x - 2 >= 0 && y - 2 >= 0
    && boardState[y - 1][x - 1].checkerColor !== playerSide
    && boardState[y - 1][x - 1].checkerColor !== boardState[y][x].checkerColor
    && boardState[y - 1][x - 1].checkerColor !== null
    && boardState[y - 2][x - 2].checkerColor === null
  ) {
    return true;
  }
  return false;
}

function jumpUpRightCondition(y, x, boardState, playerSide) {
  if (
    x + 2 <= 7 && y - 2 >= 0
    && boardState[y - 1][x + 1].checkerColor !== playerSide
    && boardState[y - 1][x + 1].checkerColor !== boardState[y][x].checkerColor
    && boardState[y - 1][x + 1].checkerColor !== null
    && boardState[y - 2][x + 2].checkerColor === null
  ) {
    return true;
  }
  return false;
}

function jumpDownLeftCondition(y, x, boardState, playerSide) {
  if (
    x - 2 >= 0 && y + 2 <= 7
    && boardState[y + 1][x - 1].checkerColor !== playerSide
    && boardState[y + 1][x - 1].checkerColor !== boardState[y][x].checkerColor
    && boardState[y + 1][x - 1].checkerColor !== null
    && boardState[y + 2][x - 2].checkerColor === null
  ) {
    return true;
  }
  return false;
}

function jumpDownRightCondition(y, x, boardState, playerSide) {
  if (
    x + 2 <= 7 && y + 2 <= 7
    && boardState[y + 1][x + 1].checkerColor !== playerSide
    && boardState[y + 1][x + 1].checkerColor !== boardState[y][x].checkerColor
    && boardState[y + 1][x + 1].checkerColor !== null
    && boardState[y + 2][x + 2].checkerColor === null
  ) {
    return true;
  }
  return false;
}

export {
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
}
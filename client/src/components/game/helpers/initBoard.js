export function setupBoard() {
  let tempBoard = [];
  for (let i = 0; i < 8; i++) {
    tempBoard[i] = [];
    for (let j = 0; j < 8; j++) {
      tempBoard[i][j] = {
        checkerType: null,
        checkerColor: null,
        id: `${i}${j}`,
        checkerImage: null,
        position: [i, j],
        possible: false,
        squareColor: null,
        cssStyle: null,
        highlight: "",
        jump: false,
        recursiveJump: false,
        basic: false,
        clickable: true,
      };
      setBoardColors(i, j);
    }
  };

  function setBoardColors(i, j) {
    if (j % 2 === 0) {
      tempBoard[i][j].cssStyle = "square-black";
      tempBoard[i][j].squareColor = "black";
    } else {
      tempBoard[i][j].cssStyle = "square-white";
      tempBoard[i][j].squareColor = "white";
    }
    if (j % 2 === 0 && i % 2 === 0) {
      tempBoard[i][j].cssStyle = "square-white";
      tempBoard[i][j].squareColor = "white";
    }
    if (j % 2 !== 0 && i % 2 === 0) {
      tempBoard[i][j].cssStyle = "square-black";
      tempBoard[i][j].squareColor = "black";
    }
  }

  return tempBoard;
}

export default setupBoard;
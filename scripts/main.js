// Create an instance of the game board
const GameBoard = (function () {
    // Define limits of the game board
    const rows = 3;
    const columns = 3;
    const board = [];
    let isGameInPlay = true;

    // Create the board's 2D grid, occupied by object instances of 'Cell' to set and get cell info
    for (let i = 0; i < rows; i++) {
        board.push([])
        for (let j = 0; j < columns; j++) {
            board[i].push(Cell());
        };
    };

    // Replace the board array with new object instances of 'Cell'
    function resetBoard() {
        for (let row of board) {
            for (let i = 0; i < board.length; i++) {
                row[i] = Cell();
            };
        };
    };

    function checkMoveIsValid(row, column) {
        // Index must not be negative
        if (row < 0 || column < 0) return false;
        // Must be within index length
        const rowsHighestIndex = board.length - 1;
        const columnsHighestIndex = board[0].length - 1;
        if (row > rowsHighestIndex || column > columnsHighestIndex) return false;        
        // Cell must be unoccupied by a player marker (cell value must be 0)
        if (!!board[row][column].getMarker()) return false;
        // If valid move, return true
        return true;
    };

    const updatePlayerMove = (row, column, playerDetails) => {
        if (!isGameInPlay) return;
        // If move is valid, update the board
        const {playerName, marker} = playerDetails;
        if (checkMoveIsValid(row, column)) {
            board[row][column].updateCell(playerName, marker);
            return true;
        } 
        // Return false if move not valid
        return false;
    };

    // GameBoard methods
    return {
        getBoard: () => board, 
        getIsGameInPlay: () => isGameInPlay,
        toggleIsGameInPlay: () => isGameInPlay = !isGameInPlay,
        updatePlayerMove,
        resetBoard
    }
})();

// Using separate 'Cell' function for encapsulation and abstraction 
// possible future expansion and to maintain modular design 
function Cell() {
    let cellValue = 0;
    let playerName = null;

    // Methods to get and update cell details
    return {
        getMarker: () => cellValue,
        getPlayerName: () => playerName,
        updateCell: (name, marker) => {
            playerName = name
            cellValue = marker
        }
    };
};

// Encapsulate player data and provide methods to interact with it
const PlayerController = ((
    // Default names provides
    playerOneName = 'Player 1', 
    playerTwoName = 'Player 2'
) => {
    // Store players details in an array
    const players = [
        {
            playerName: playerOneName,
            marker: 'O'
        },
        {
            playerName: playerTwoName,
            marker: 'X'
        }
    ];

    // Variable to store player's turn
    let activePlayer = players[0];

    // Function to switch current player's turn
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
    };

    // Function to set player names
    const setPlayerNames = (p1Name, p2Name) => {
        players[0].playerName = p1Name;
        players[1].playerName = p2Name;
    };

    // Methods to get and set player details
    return {
        getPlayers: () => players, 
        getActivePlayer: () => activePlayer,
        switchPlayerTurn,
        setPlayerNames
    }
})();

// A module to control rendering of the game
const DisplayController = (function () {
    // HTML references
    const gameContainer = document.querySelector('.container');
    const visualBoard = gameContainer.querySelector('.game_board');
    const turnInfoContainer = gameContainer.querySelector('span');

    // Reference to the array of objects that form the game board
    objectsBoard = GameBoard.getBoard();

    // Recreates the array of objects with an array of cell markers
    const displayMarkersBoard = () => {
        // Create an array of markers to represent what is on the board
        markersBoard = objectsBoard.map(row => row.map(cell => cell.getMarker()));

        // Clear board
        visualBoard.textContent = '';
        // Populate the webpage with the board cells
        markersBoard.forEach((row, rowIndex) => {
            row.forEach((columnElement, columnIndex) => {
                // Create DOM element and assign class/attributes
                const cell = document.createElement('button');
                cell.classList.add('cell')
                cell.dataset.row = rowIndex;
                cell.dataset.column = columnIndex;
                
                // Add marker to cell if occupied (0 is unoccupied)
                if (columnElement) {
                    const markerText = document.createTextNode(columnElement);
                    cell.appendChild(markerText);
                }

                // Add element the page
                visualBoard.appendChild(cell);
            });
        });
    };

    // Puts (renders) turn info onto the webpage
    const displayTurnInfo = () => {
        if (!GameBoard.getIsGameInPlay()) return;
        const activePlayer = PlayerController.getActivePlayer();
        const turnInfoText = `${activePlayer.playerName}'s turn. Your marker is: ${activePlayer.marker}`
        turnInfoContainer.textContent = turnInfoText;
    };

    // Notifies of invalid move inputs
    const notifyInvalidMove = () => {
        turnInfoContainer.textContent = 'Invalid move. Try another square';
        // Displays turn info again after delay
        setTimeout(displayTurnInfo, 1800)
    };

    const displayWinner = (name, marker) => {
        turnInfoContainer.textContent = 
        `${name} wins! The winner's marker is ${marker}`;
    };

    const displayDraw = () => {
        turnInfoContainer.textContent = 'Game is a draw!';
    };

    // Call the functions once on page load
    displayMarkersBoard();
    displayTurnInfo();

    return {
        displayMarkersBoard,
        displayTurnInfo,
        notifyInvalidMove,
        displayWinner,
        displayDraw
    }
})();

// GameController to handle flow of the game
const GameController = (function () {
    let winner = null;


    const playMove = (row, column) => {
        const moveOutcome = GameBoard.updatePlayerMove(row, column, PlayerController.getActivePlayer());
        if (moveOutcome) {
            DisplayController.displayMarkersBoard();
            winner = checkForWinner();
            if (winner) {
                GameBoard.toggleIsGameInPlay();
                DisplayController.displayWinner(winner.getPlayerName(), winner.getMarker())
            } else if (winner === false) {
                GameBoard.toggleIsGameInPlay();
                DisplayController.displayDraw();
            } else {
                PlayerController.switchPlayerTurn();
                DisplayController.displayTurnInfo();
            };
        } else if (moveOutcome === false) {
            DisplayController.notifyInvalidMove();
        };
    };

    return {
        playMove
    }
})();

// Returns a cell that is part of the winning streak, or false if game is a draw
function checkForWinner() {
    const gameBoardArray = GameBoard.getBoard();

    // Checks for three in a row
    function checkForThreeConsecutive(arrayOfLines) {
        for (const line of arrayOfLines) {
            const firstMarker = line[0].getMarker();
            // No win if there is an empty cell (number 0 is empty)
            if (!firstMarker) continue
            const consecutiveLineFiltered = line.filter((cellValue) => cellValue.getMarker() === firstMarker);
            // If three consecutive in the line, return a cell that is part of winning line
            if (consecutiveLineFiltered.length === 3) {
                return line[0];
            }
        }
    };

    // Array to store all possible winning combinations
    const possibleWinsArray = [];

    // Add rows to array to be checked
    for (const row of gameBoardArray) { 
        // Check line (row) for win
        possibleWinsArray.push(row);
    }

    // Add columns to array to be checked
    for (let i = 0; i < gameBoardArray[0].length; i++) {
        // Create a column (line) with values from the board
        const column = gameBoardArray.map((row) => row[i]);
        possibleWinsArray.push(column);
    }

    // Function to get a diagonal lines from the board
    function getDiagonal(board, isDescending) {
        const size = board.length;
        return board.map((row, index) => isDescending ? row[index] : row[size -1 -index]);
    };

    // Add diagonal lines to array to be checked
    const diagonals = [true, false]; // true for descending, false for ascending
    diagonals.forEach(isDescending => {
        const diagonal = getDiagonal(gameBoardArray, isDescending);
        possibleWinsArray.push(diagonal);
    });

    // Checks array for any winning rows, columns or diagonal lines
    const winningCell = checkForThreeConsecutive(possibleWinsArray);
    if (winningCell) return winningCell;

    // Check for empty spaces, if found, exit
    for (const row of gameBoardArray) { 
        for (const cell of row) {
            if (cell.getMarker() === 0) return;
        }
    }

    // If no wins and no empty cells found, return false for draw
    return false;
};

// Create a function to handle user inputs to the board
const InputController = (function() {
    const gameBoardContainer = document.querySelector('.game_board');
    gameBoardContainer.addEventListener('click', inputTurnHandler);

    // Handles clicks on the game board
    function inputTurnHandler(clickEvent) {
        const target = clickEvent.target;

        // This makes clicks on gaps and borders ignored
        if (!target.classList.contains('cell')) return;
        // Get row and column from cell data attribute
        const rowIndex = target.dataset.row;
        const columnIndex = target.dataset.column;

        //Send player's move to GameController
        GameController.playMove(rowIndex, columnIndex);
    }
})();

/*
Do
- Add restart button 
- Add name change button
- Write full pseudocode on the game below in comments to show what pre-code design could look like
    - Update handling of win/draw events (display win/draw, stop further inputs)
    - Update notice of invalid move 
    - Add/update interactionController/inputController to take player's move
    - Update DisplayController to show player's name and marker on page  
    - Update DisplayController to show board on page
    - Add html and CSS for game rendering
    - Add renderer/displayController
    - Refactor GameController
    - Consider array of cells (benefits: to return player name or player marker from the cell when requested)
    - Stop player overwrite (allow placing only on 0s)
    - Auto change turn after placing marker
    - Console log placers turn
    - Ask for player names at start of game
    - Game board: creates new board and stores board state
    - Players: stores player names and which mark they are using
    - Move handler: updates board with valid moves
                placeMarker on array[][]
    - Controller that changes player turns: changes next move to represent next player
    - Win check: ends game when win condition is met, stores winner
*/
const GameBoard = (function () {
    // Define limits of the game board
    const rows = 3;
    const columns = 3;
    const board = []

    // Create the board's 2D grid, occupied by object instances of 'Cell'
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
        // If move is valid, update the board
        const {playerName, marker} = playerDetails;
        if (checkMoveIsValid(row, column)) {
            board[row][column].updateCell(playerName, marker);
            return true;
        } else 
        // Return false if move not valid
            return false;
    };

    return {
        // Method to get the board array
        getBoard: () => board, 
        // Make other methods available
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
const Players = ((
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

    // Function expression allowing setting of player names
    const setPlayerNames = (p1Name, p2Name) => {
        players[0].playerName = p1Name;
        players[1].playerName = p2Name;
    };

    // Methods to get and set player details
    return {
        getPlayers: () => players, 
        setPlayerNames
    };
})();

// GameController to handle flow of the game
const GameController = (function () {
    const gameBoard = GameBoard;
    const players = Players.getPlayers();
    let winner = null;

    const getWinner = () => winner;

    let activePlayer = players[0]
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
        console.log(`${activePlayer.playerName}'s turn. Your marker is ${activePlayer.marker}`);
    };

    const playMove = (row, column) => {
        if (gameBoard.updatePlayerMove(row, column, activePlayer)) {
            displayBoardMarkers();
            winner = checkForWinner();
            if (winner) {
                console.log(`Winner is ${winner}`)
            } else if (winner === false) {
                console.log('Game is a draw!');
            } else {
                switchPlayerTurn();
            };
        } else {
            console.log("Invalid move. Try again");
            return; 
        };
    };
    
    // Returns winner marker, true if draw, false if game not over
    function checkForWinner() {
        const gameBoardArray = gameBoard.getBoard();

        function checkForThreeConsecutive(line) {
            const firstMarker = line[0].getMarker();
            // No win if there is an empty cell (number 0 is empty)
            if (!firstMarker) return; 
            const consecutiveLineFiltered = line.filter((cellValue) => cellValue.getMarker() === firstMarker);
            // If three consecutive in the line, return the winner's marker
            if (consecutiveLineFiltered.length === 3) {
                console.log(`${line[0].getPlayerName()}, marker wins!`);
                return firstMarker;
            };
        };

        // Check horizontal wins
        for (const row of gameBoardArray) { 
            // Check line (row) for win
            const rowWinner = checkForThreeConsecutive(row);
            if (rowWinner) return rowWinner;
        };

        // Check vertical wins
        for (let i = 0; i < gameBoardArray[0].length; i++) {
            // Create a column (line) with values from the board
            const column = gameBoardArray.map((row) => row[i]);

            // Check line (column) for win
            const columnWinner = checkForThreeConsecutive(column);
            if (columnWinner) return columnWinner;
        };

        // Check descending (left to right) diagonal win
        function getDescendingDiagonal(board) {
            return board.map((row, column) => row[column])
        };
        const descendingDiagonal = getDescendingDiagonal(gameBoardArray);
        const descendingWinner = checkForThreeConsecutive(descendingDiagonal);
        if (descendingWinner) return descendingWinner;

        // Check ascending (left to right) diagonal win
        function getAscendingDiagonal(board) {
            const size = board.length;
            return board.map((row, index) => row[size -1 -index]);
        };
        const ascendingDiagonal = getAscendingDiagonal(gameBoardArray);
        const ascendingWinner = checkForThreeConsecutive(ascendingDiagonal);
        if (ascendingWinner) return ascendingWinner;

        // Check for empty spaces. If found, no draw, exit
        for (const row of gameBoardArray) { 
            for (const cell of row) {
                if (cell.getMarker() === 0) return;
            };
        };

        // If no wins and no empty cells found, return false for draw
        return false;
    };

    const displayBoardMarkers = () => {
        objectsBoard = gameBoard.getBoard();
        markersBoard = objectsBoard.map(row => row.map(cell => cell.getMarker()));
        console.log(markersBoard);
    }

    displayBoardMarkers();

    return {
        playMove,
        getWinner,
        displayBoardMarkers,
    };
})();

/*
Do
 - Refactor GameController
 - Add renderer
 - Add interactionController
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
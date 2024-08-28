const GameBoard = (function () {
    // Define limits of the game board
    const rows = 3;
    const columns = 3;
    const board = []

    // Create the board's 2D grid
    for (let i = 0; i < rows; i++) {
        board.push([])
        for (let j = 0; j < columns; j++) {
            board[i].push(0);
        };
    };

    function resetBoard() {
        for (let row of board) {
            for (let i = 0; i < board.length; i++) {
                row[i] = 0;
            };
        };
    };

    // Method to get the board
    const getBoard = () => board;

    function checkMoveIsValid(row, column) {
        // Index must not be negative
        if (row < 0 || column < 0) return false;
        // Must be within index length
        const rowsHighestIndex = board.length - 1;
        const columnsHighestIndex = board[0].length - 1;
        if (row > rowsHighestIndex || column > columnsHighestIndex) return false;        
        // Must be placed on number 0
        if (!!board[row][column]) return false;
        // If valid, return true
        return true;
    };

    const updatePlayerMove = (row, column, marker) => {
        // If move is valid, update the board
        if (checkMoveIsValid(row, column)) {
            board[row][column] = marker;
            return true;
        } else 
        // Return false if move not valid
            return false;
    };

    return {
        getBoard, 
        updatePlayerMove,
        resetBoard
    }
})();

const Players = ((
    playerOneName = 'player 1', 
    playerTwoName = 'player 2'
) => {
    const players = [
        {
            name: playerOneName,
            marker: 'O'
        },
        {
            name: playerTwoName,
            marker: 'X'
        }
    ];

    const getPlayers = () => players;

    const setPlayerNames = () => {
        players[0].name = prompt("Enter player one's name:");
        players[1].name = prompt("Enter player two's name:");
    };

    return {getPlayers, setPlayerNames};
})();

const GameController = (function () {
    const gameBoard = GameBoard;
    const players = Players.getPlayers();
    let winner = null;

    const getWinner = () => winner;

    let activePlayer = players[0]
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
        console.log(`${activePlayer.name}'s turn. Your marker is ${activePlayer.marker}`);
    };

    const playMove = (row, column) => {
        if (gameBoard.updatePlayerMove(row, column, activePlayer.marker)) {
            showUpdatedBoard();
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
            const firstMarker = line[0];
            // No win if there is an empty cell (number 0 is empty)
            if (!firstMarker) return; 
            const lineConsecutiveFiltered = line.filter((cellValue) => cellValue === firstMarker);
            // If three consecutive in the line, return the winner's marker
            if (lineConsecutiveFiltered.length === 3) {
                console.log(`The ${firstMarker}, marker wins!`);
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
            for (const value of row) {
                if (value === 0) return;
            };
        };

        // If no wins and no empty cells found, return false for draw
        return false;
    };

    const showUpdatedBoard = () => {
        console.log(gameBoard.getBoard());
    }

    showUpdatedBoard();

    return {
        playMove,
        getWinner
    };

})();

/*
Do
 - Refactor
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
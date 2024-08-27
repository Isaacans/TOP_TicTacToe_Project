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

    const updateBoardMarkings = (row, column, marker) => {
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
        updateBoardMarkings
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

    let activePlayer = players[0]
    
    const switchPlayerTurn = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0];
        console.log(`${activePlayer.name}'s turn. Your marker is ${activePlayer.marker}`);
    };

    const playMove = (row, column) => {
        if (gameBoard.updateBoardMarkings(row, column, activePlayer.marker)) {
            checkGameEnd()
            switchPlayerTurn();
            showUpdatedBoard();
        } else {
            console.log("Invalid move. Try again");
            return; 
        };
    };
    
    function checkGameEnd() {
        // Check horizontal wins - 
        // Check every row
        for (const row of gameBoard.getBoard()) { 
            // No win if there is an empty cell (number 0 is empty)
            if (row[0] === 0) continue;
            // Check if there is three in a row
            const marker = row[0];
            const consecutiveMarkers = row.filter((cellValue) => cellValue === marker);
            // If there are 3 in a row, call a win
            if (consecutiveMarkers.length === 3) {
                // Get cell player/marker/value from board
                console.log(`The ${row[0]}, marker wins!`);
                return true;
            };
        };

        // Check vertical wins -
        // Set loop to number of columns
        for (let i = 0; i < gameBoard.getBoard()[0].length; i++) {
            // Create a column with values from the board array
            const column = gameBoard.getBoard().map((row) => row[i]);

            // Check if there is a winner in the column
            if (column[0] === 0)
                // Can't have winner if one cell is empty, continue to next column
                continue;
            else {
                // Check if there is three in a row
                const marker = column[0];
                const consecutiveMarkers = column.filter((cellValue) => cellValue === marker);
                // If there are 3 in a row, call a win
                if (consecutiveMarkers.length === 3) {
                    // Get cell player/marker/value from board
                    console.log(`The ${column[0]}, marker wins!`);
                    // Winner detected, return true
                    return true;
                };
            };
        }

        // Check diagonal wins

        // Check draws

        // No wins or draws return false
        return false;
    };

    const showUpdatedBoard = () => {
        console.log(gameBoard.getBoard());
    }

    showUpdatedBoard();

    return {
        playMove,
        checkGameEnd
    };

})();

/* 
    - Stop player overwrite (allow placing only on 0s)
    - Auto change turn after placing marker
    - Console log placers turn
    - Ask for player names at start of game
 - 
 /*

Core game parts - console version
    - Game board: creates new board and stores board state
    - Players: stores player names and which mark they are using
    - Move handler: updates board with valid moves
                placeMarker on array[][]
    - Controller that changes player turns: changes next move to represent next player
 - Win check: ends game when win condition is met, stores winner

*/
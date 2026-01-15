// Game state management
class GameState {
    constructor(settings = {}) {
        this.settings = {
            numPlayers: settings.numPlayers || 4,
            initialTiles: settings.initialTiles || 14,
            minInitialMeld: settings.minInitialMeld || 30,
            enableTimer: settings.enableTimer !== undefined ? settings.enableTimer : true,
            jokerSubstitution: settings.jokerSubstitution !== undefined ? settings.jokerSubstitution : true
        };
        
        this.pool = [];
        this.players = [];
        this.table = []; // Array of melds on the table
        this.currentPlayerIndex = 0;
        this.hasDrawnThisTurn = false;
        this.initialMeldMade = []; // Track which players have made their initial meld
        this.turnStartState = null; // Store state at turn start for validation
        this.gameStarted = false;
    }

    initializeGame() {
        // Create and shuffle tiles
        const allTiles = createTileSet();
        this.pool = shuffleTiles(allTiles);
        
        // Initialize players
        this.players = [];
        for (let i = 0; i < this.settings.numPlayers; i++) {
            this.players.push({
                id: i,
                name: `Player ${i + 1}`,
                rack: [],
                isHuman: i === 0 // First player is human, others AI (for future)
            });
            this.initialMeldMade[i] = false;
        }
        
        // Deal initial tiles to each player
        for (const player of this.players) {
            for (let i = 0; i < this.settings.initialTiles; i++) {
                if (this.pool.length > 0) {
                    player.rack.push(this.pool.pop());
                }
            }
        }
        
        this.currentPlayerIndex = 0;
        this.hasDrawnThisTurn = false;
        this.table = [];
        this.gameStarted = true;
        this.saveTurnStartState();
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    drawTile(playerIndex = this.currentPlayerIndex) {
        if (this.pool.length === 0) {
            return null;
        }
        
        const tile = this.pool.pop();
        this.players[playerIndex].rack.push(tile);
        this.hasDrawnThisTurn = true;
        return tile;
    }

    canEndTurn() {
        // Player must either have made a valid move or drawn a tile
        return this.hasDrawnThisTurn || this.hasValidMovesOnTable();
    }

    hasValidMovesOnTable() {
        // Check if any tiles were moved to the table this turn
        // This is a simplified check - full validation happens in gameLogic.js
        return this.table.length > 0;
    }

    endTurn() {
        if (!this.canEndTurn()) {
            return false;
        }
        
        this.hasDrawnThisTurn = false;
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.saveTurnStartState();
        return true;
    }

    saveTurnStartState() {
        // Save current state for potential rollback
        this.turnStartState = {
            table: JSON.parse(JSON.stringify(this.table.map(meld => meld.map(t => t.toJSON())))),
            rack: JSON.parse(JSON.stringify(this.getCurrentPlayer().rack.map(t => t.toJSON())))
        };
    }

    revertToTurnStart() {
        // Revert changes if invalid move
        if (this.turnStartState) {
            this.table = this.turnStartState.table.map(meld => 
                meld.map(t => Tile.fromJSON(t))
            );
            this.getCurrentPlayer().rack = this.turnStartState.rack.map(t => Tile.fromJSON(t));
        }
    }

    checkWinCondition() {
        // Player wins if they have no tiles left
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].rack.length === 0) {
                return { won: true, playerIndex: i };
            }
        }
        
        // Game ends if pool is empty and no player can play
        if (this.pool.length === 0) {
            // Find player with lowest total value
            let lowestValue = Infinity;
            let winnerIndex = -1;
            
            for (let i = 0; i < this.players.length; i++) {
                const value = this.players[i].rack.reduce((sum, tile) => sum + tile.getValue(), 0);
                if (value < lowestValue) {
                    lowestValue = value;
                    winnerIndex = i;
                }
            }
            
            if (winnerIndex !== -1) {
                return { won: true, playerIndex: winnerIndex, byLowScore: true };
            }
        }
        
        return { won: false };
    }

    // Serialization for future online play
    serialize() {
        return {
            settings: this.settings,
            pool: this.pool.map(t => t.toJSON()),
            players: this.players.map(p => ({
                ...p,
                rack: p.rack.map(t => t.toJSON())
            })),
            table: this.table.map(meld => meld.map(t => t.toJSON())),
            currentPlayerIndex: this.currentPlayerIndex,
            hasDrawnThisTurn: this.hasDrawnThisTurn,
            initialMeldMade: this.initialMeldMade,
            gameStarted: this.gameStarted
        };
    }

    static deserialize(data) {
        const game = new GameState(data.settings);
        game.pool = data.pool.map(t => Tile.fromJSON(t));
        game.players = data.players.map(p => ({
            ...p,
            rack: p.rack.map(t => Tile.fromJSON(t))
        }));
        game.table = data.table.map(meld => meld.map(t => Tile.fromJSON(t)));
        game.currentPlayerIndex = data.currentPlayerIndex;
        game.hasDrawnThisTurn = data.hasDrawnThisTurn;
        game.initialMeldMade = data.initialMeldMade;
        game.gameStarted = data.gameStarted;
        return game;
    }
}

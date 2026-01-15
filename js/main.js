// Main game controller
class Game {
    constructor() {
        this.settings = new Settings();
        this.gameState = null;
        this.gameLogic = null;
        this.ui = null;
        
        this.initializeEventListeners();
        this.startNewGame();
    }

    initializeEventListeners() {
        // New game button
        document.getElementById('new-game-btn').addEventListener('click', () => {
            if (confirm('Start a new game? Current progress will be lost.')) {
                this.startNewGame();
            }
        });

        // Draw tile button
        document.getElementById('draw-tile-btn').addEventListener('click', () => {
            this.handleDrawTile();
        });

        // End turn button
        document.getElementById('end-turn-btn').addEventListener('click', () => {
            this.handleEndTurn();
        });

        // Sort tiles button
        document.getElementById('sort-tiles-btn').addEventListener('click', () => {
            this.handleSortTiles();
        });
    }

    startNewGame() {
        const settings = this.settings.getSettings();
        this.gameState = new GameState(settings);
        this.gameState.initializeGame();
        
        this.gameLogic = new GameLogic(this.gameState);
        this.ui = new UI(this.gameState, this.gameLogic);
        
        this.ui.render();
        
        // Save game state for potential restoration
        this.saveGameState();
    }

    handleDrawTile() {
        if (this.gameState.hasDrawnThisTurn) {
            this.ui.showMessage('You have already drawn a tile this turn');
            return;
        }

        if (this.gameState.pool.length === 0) {
            this.ui.showMessage('No tiles left in the pool');
            return;
        }

        const tile = this.gameState.drawTile();
        if (tile) {
            this.ui.render();
            this.saveGameState();
        }
    }

    handleEndTurn() {
        // Validate the current table state
        const validation = this.gameLogic.validateMove();
        
        if (!validation.valid) {
            this.ui.showMessage(validation.message);
            // Revert to turn start
            this.gameState.revertToTurnStart();
            this.ui.render();
            return;
        }

        // Check win condition before ending turn
        const winResult = this.gameState.checkWinCondition();
        if (winResult.won) {
            this.ui.handleWin(winResult);
            return;
        }

        // End turn and move to next player
        if (this.gameState.endTurn()) {
            this.ui.render();
            this.saveGameState();
            
            // Handle AI turns (if not human player)
            setTimeout(() => {
                this.handleAITurns();
            }, 500);
        } else {
            this.ui.showMessage('Cannot end turn. You must either draw a tile or make a valid move.');
        }
    }

    handleAITurns() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        
        // For now, all non-first players are AI in single-device mode
        if (!currentPlayer.isHuman) {
            this.ui.showMessage(`${currentPlayer.name} is thinking...`);
            
            setTimeout(() => {
                // AI makes a move
                const madeMeld = this.gameLogic.makeAIMove(this.gameState.currentPlayerIndex);
                
                // Check win condition
                const winResult = this.gameState.checkWinCondition();
                if (winResult.won) {
                    this.ui.render();
                    this.ui.handleWin(winResult);
                    return;
                }
                
                // End AI turn
                this.gameState.endTurn();
                this.ui.render();
                this.saveGameState();
                
                // Continue with next AI player or return to human
                setTimeout(() => {
                    this.handleAITurns();
                }, 500);
            }, 1000);
        }
    }

    handleSortTiles() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        currentPlayer.rack = this.gameLogic.sortTiles(currentPlayer.rack);
        this.ui.render();
    }

    saveGameState() {
        // Save to localStorage for persistence
        try {
            const serialized = this.gameState.serialize();
            localStorage.setItem('rummikubGameState', JSON.stringify(serialized));
        } catch (e) {
            console.error('Error saving game state:', e);
        }
    }

    loadGameState() {
        try {
            const saved = localStorage.getItem('rummikubGameState');
            if (saved) {
                const data = JSON.parse(saved);
                this.gameState = GameState.deserialize(data);
                this.gameLogic = new GameLogic(this.gameState);
                this.ui = new UI(this.gameState, this.gameLogic);
                return true;
            }
        } catch (e) {
            console.error('Error loading game state:', e);
        }
        return false;
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new Game();
});

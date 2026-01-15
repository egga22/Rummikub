// UI handling and rendering
class UI {
    constructor(gameState, gameLogic) {
        this.gameState = gameState;
        this.gameLogic = gameLogic;
        this.draggedTile = null;
        this.draggedFrom = null; // 'rack' or meld index
    }

    render() {
        this.renderGameInfo();
        this.renderPlayerRack();
        this.renderTable();
        this.updateButtons();
    }

    renderGameInfo() {
        const currentPlayer = this.gameState.getCurrentPlayer();
        const playerElement = document.getElementById('current-player');
        const tilesElement = document.getElementById('tiles-remaining');
        
        playerElement.textContent = `${currentPlayer.name}'s Turn`;
        tilesElement.textContent = `Tiles in Pool: ${this.gameState.pool.length}`;
    }

    renderPlayerRack() {
        const rack = document.getElementById('player-rack');
        rack.innerHTML = '';
        
        const currentPlayer = this.gameState.getCurrentPlayer();
        const sortedTiles = this.gameLogic.sortTiles(currentPlayer.rack);
        
        for (const tile of sortedTiles) {
            const tileElement = this.createTileElement(tile);
            rack.appendChild(tileElement);
        }
        
        this.setupDragAndDrop();
    }

    renderTable() {
        const tableArea = document.getElementById('table-area');
        const emptyMessage = tableArea.querySelector('.empty-message');
        
        if (this.gameState.table.length === 0) {
            if (emptyMessage) {
                emptyMessage.style.display = 'block';
            }
            // Remove all melds
            tableArea.querySelectorAll('.meld').forEach(m => m.remove());
        } else {
            if (emptyMessage) {
                emptyMessage.style.display = 'none';
            }
            
            // Clear and re-render all melds
            tableArea.querySelectorAll('.meld').forEach(m => m.remove());
            
            for (let i = 0; i < this.gameState.table.length; i++) {
                const meld = this.gameState.table[i];
                const meldElement = this.createMeldElement(meld, i);
                tableArea.appendChild(meldElement);
            }
        }
        
        this.setupDragAndDrop();
    }

    createTileElement(tile) {
        const element = document.createElement('div');
        element.className = `tile ${tile.getColorClass()}`;
        element.textContent = tile.toString();
        element.draggable = true;
        element.dataset.tileId = tile.id;
        return element;
    }

    createMeldElement(tiles, meldIndex) {
        const meldElement = document.createElement('div');
        meldElement.className = 'meld';
        meldElement.dataset.meldIndex = meldIndex;
        
        for (const tile of tiles) {
            const tileElement = this.createTileElement(tile);
            meldElement.appendChild(tileElement);
        }
        
        return meldElement;
    }

    setupDragAndDrop() {
        // Setup drag events for tiles
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => {
            tile.addEventListener('dragstart', (e) => this.handleDragStart(e));
            tile.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });
        
        // Setup drop zones
        const playerRack = document.getElementById('player-rack');
        this.setupDropZone(playerRack, 'rack');
        
        const tableArea = document.getElementById('table-area');
        this.setupDropZone(tableArea, 'table');
        
        const melds = document.querySelectorAll('.meld');
        melds.forEach(meld => {
            this.setupDropZone(meld, 'meld');
        });
    }

    setupDropZone(element, type) {
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (type === 'meld') {
                element.classList.add('drop-target');
            } else {
                element.classList.add('drop-zone');
            }
        });
        
        element.addEventListener('dragleave', (e) => {
            if (type === 'meld') {
                element.classList.remove('drop-target');
            } else {
                element.classList.remove('drop-zone');
            }
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            if (type === 'meld') {
                element.classList.remove('drop-target');
            } else {
                element.classList.remove('drop-zone');
            }
            this.handleDrop(e, type, element);
        });
    }

    handleDragStart(e) {
        const tileElement = e.target;
        tileElement.classList.add('dragging');
        
        this.draggedTile = this.findTileById(tileElement.dataset.tileId);
        
        // Determine where tile is being dragged from
        const meldParent = tileElement.closest('.meld');
        if (meldParent) {
            this.draggedFrom = parseInt(meldParent.dataset.meldIndex);
        } else {
            this.draggedFrom = 'rack';
        }
        
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.drop-zone').forEach(el => el.classList.remove('drop-zone'));
        document.querySelectorAll('.drop-target').forEach(el => el.classList.remove('drop-target'));
    }

    handleDrop(e, type, element) {
        if (!this.draggedTile) return;
        
        const currentPlayer = this.gameState.getCurrentPlayer();
        
        if (type === 'rack') {
            // Move tile back to rack
            if (this.draggedFrom !== 'rack') {
                // Remove from table
                const meld = this.gameState.table[this.draggedFrom];
                const tileIndex = meld.findIndex(t => t.id === this.draggedTile.id);
                if (tileIndex !== -1) {
                    meld.splice(tileIndex, 1);
                    if (meld.length === 0) {
                        this.gameState.table.splice(this.draggedFrom, 1);
                    }
                }
                currentPlayer.rack.push(this.draggedTile);
            }
        } else if (type === 'table') {
            // Create new meld on table
            if (this.draggedFrom === 'rack') {
                const tileIndex = currentPlayer.rack.findIndex(t => t.id === this.draggedTile.id);
                if (tileIndex !== -1) {
                    currentPlayer.rack.splice(tileIndex, 1);
                    this.gameState.table.push([this.draggedTile]);
                }
            }
        } else if (type === 'meld') {
            // Add to existing meld
            const meldIndex = parseInt(element.dataset.meldIndex);
            
            if (this.draggedFrom === 'rack') {
                const tileIndex = currentPlayer.rack.findIndex(t => t.id === this.draggedTile.id);
                if (tileIndex !== -1) {
                    currentPlayer.rack.splice(tileIndex, 1);
                    this.gameState.table[meldIndex].push(this.draggedTile);
                }
            } else if (this.draggedFrom !== meldIndex) {
                // Move from one meld to another
                const fromMeld = this.gameState.table[this.draggedFrom];
                const tileIndex = fromMeld.findIndex(t => t.id === this.draggedTile.id);
                if (tileIndex !== -1) {
                    fromMeld.splice(tileIndex, 1);
                    if (fromMeld.length === 0) {
                        this.gameState.table.splice(this.draggedFrom, 1);
                    }
                    this.gameState.table[meldIndex].push(this.draggedTile);
                }
            }
        }
        
        this.draggedTile = null;
        this.draggedFrom = null;
        this.render();
    }

    findTileById(tileId) {
        const currentPlayer = this.gameState.getCurrentPlayer();
        
        // Search in rack
        let tile = currentPlayer.rack.find(t => t.id === tileId);
        if (tile) return tile;
        
        // Search in table melds
        for (const meld of this.gameState.table) {
            tile = meld.find(t => t.id === tileId);
            if (tile) return tile;
        }
        
        return null;
    }

    updateButtons() {
        const drawBtn = document.getElementById('draw-tile-btn');
        const endTurnBtn = document.getElementById('end-turn-btn');
        
        // Can only draw if haven't drawn yet and pool has tiles
        drawBtn.disabled = this.gameState.hasDrawnThisTurn || this.gameState.pool.length === 0;
        
        // Can end turn if drawn or made valid moves
        endTurnBtn.disabled = !this.gameState.canEndTurn();
    }

    showMessage(message, type = 'info') {
        // Simple alert for now - could be replaced with better UI
        alert(message);
    }

    handleWin(result) {
        const winner = this.gameState.players[result.playerIndex];
        const message = result.byLowScore 
            ? `${winner.name} wins with the lowest score!`
            : `${winner.name} wins!`;
        
        setTimeout(() => {
            alert(message);
        }, 100);
    }
}

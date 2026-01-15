// Game logic and validation
class GameLogic {
    constructor(gameState) {
        this.gameState = gameState;
    }

    // Validate if tiles form a valid run (consecutive numbers, same color)
    isValidRun(tiles) {
        if (tiles.length < 3) return false;
        
        // Filter out jokers for initial check
        const nonJokers = tiles.filter(t => !t.isJoker);
        if (nonJokers.length === 0) return false;
        
        // All non-jokers must be same color
        const color = nonJokers[0].color;
        if (!nonJokers.every(t => t.color === color)) return false;
        
        // Sort by number
        const sorted = [...tiles].sort((a, b) => {
            if (a.isJoker) return -1;
            if (b.isJoker) return 1;
            return a.number - b.number;
        });
        
        // Check for consecutive numbers (jokers can fill gaps)
        let expectedNumber = sorted.find(t => !t.isJoker).number;
        let jokerCount = 0;
        
        for (const tile of sorted) {
            if (tile.isJoker) {
                jokerCount++;
                expectedNumber++;
            } else {
                while (tile.number > expectedNumber && jokerCount > 0) {
                    expectedNumber++;
                    jokerCount--;
                }
                
                if (tile.number !== expectedNumber) {
                    return false;
                }
                expectedNumber++;
            }
        }
        
        // Check if run doesn't exceed 13
        const firstNumber = sorted.find(t => !t.isJoker).number;
        return firstNumber + tiles.length - 1 <= 13;
    }

    // Validate if tiles form a valid group (same number, different colors)
    isValidGroup(tiles) {
        if (tiles.length < 3 || tiles.length > 4) return false;
        
        // Filter out jokers
        const nonJokers = tiles.filter(t => !t.isJoker);
        if (nonJokers.length === 0) return false;
        
        // All non-jokers must have same number
        const number = nonJokers[0].number;
        if (!nonJokers.every(t => t.number === number)) return false;
        
        // All non-jokers must have different colors
        const colors = nonJokers.map(t => t.color);
        const uniqueColors = new Set(colors);
        if (colors.length !== uniqueColors.size) return false;
        
        // Total tiles (including jokers) must not exceed 4
        return tiles.length <= 4;
    }

    // Validate if a meld is valid (either run or group)
    isValidMeld(tiles) {
        if (!tiles || tiles.length < 3) return false;
        return this.isValidRun(tiles) || this.isValidGroup(tiles);
    }

    // Calculate the value of a meld
    calculateMeldValue(tiles) {
        let total = 0;
        for (const tile of tiles) {
            if (tile.isJoker) {
                // Joker takes the value it represents in the meld
                if (this.isValidRun(tiles)) {
                    // In a run, determine joker value by position
                    const nonJokers = tiles.filter(t => !t.isJoker);
                    if (nonJokers.length > 0) {
                        total += nonJokers[0].number; // Simplified
                    }
                } else {
                    // In a group, joker takes the group number
                    const nonJokers = tiles.filter(t => !t.isJoker);
                    if (nonJokers.length > 0) {
                        total += nonJokers[0].number;
                    }
                }
            } else {
                total += tile.number;
            }
        }
        return total;
    }

    // Validate all melds on the table
    validateTable() {
        for (const meld of this.gameState.table) {
            if (!this.isValidMeld(meld)) {
                return false;
            }
        }
        return true;
    }

    // Check if player has made initial meld
    canMakeInitialMeld(tiles) {
        let totalValue = 0;
        for (const meld of tiles) {
            if (this.isValidMeld(meld)) {
                totalValue += this.calculateMeldValue(meld);
            }
        }
        return totalValue >= this.gameState.settings.minInitialMeld;
    }

    // Validate a move
    validateMove() {
        const playerIndex = this.gameState.currentPlayerIndex;
        
        // Check if all table melds are valid
        if (!this.validateTable()) {
            return { valid: false, message: 'Invalid meld on table' };
        }
        
        // If player hasn't made initial meld, check if they meet the requirement
        if (!this.gameState.initialMeldMade[playerIndex]) {
            // Calculate new melds added this turn
            const newMelds = this.getNewMelds();
            
            if (newMelds.length > 0 && !this.canMakeInitialMeld(newMelds)) {
                return { 
                    valid: false, 
                    message: `Initial meld must be at least ${this.gameState.settings.minInitialMeld} points` 
                };
            }
            
            if (newMelds.length > 0) {
                this.gameState.initialMeldMade[playerIndex] = true;
            }
        }
        
        return { valid: true, message: 'Valid move' };
    }

    // Get melds that were added this turn
    getNewMelds() {
        // Compare current table with turn start state
        // This is simplified - in a real implementation, track individual tiles
        if (!this.gameState.turnStartState) {
            return this.gameState.table;
        }
        
        const startMeldCount = this.gameState.turnStartState.table.length;
        return this.gameState.table.slice(startMeldCount);
    }

    // Sort tiles by color and number
    sortTiles(tiles) {
        const colorOrder = { 'red': 0, 'blue': 1, 'black': 2, 'orange': 3, 'joker': 4 };
        
        return [...tiles].sort((a, b) => {
            if (a.isJoker && !b.isJoker) return 1;
            if (!a.isJoker && b.isJoker) return -1;
            if (a.isJoker && b.isJoker) return 0;
            
            if (colorOrder[a.color] !== colorOrder[b.color]) {
                return colorOrder[a.color] - colorOrder[b.color];
            }
            return a.number - b.number;
        });
    }

    // AI player logic (simple version)
    makeAIMove(playerIndex) {
        // Try to form simple melds from rack
        const player = this.gameState.players[playerIndex];
        const rack = player.rack;
        
        // Try to find runs
        for (const color of ['red', 'blue', 'black', 'orange']) {
            const colorTiles = rack.filter(t => t.color === color).sort((a, b) => a.number - b.number);
            
            for (let i = 0; i <= colorTiles.length - 3; i++) {
                const potentialRun = colorTiles.slice(i, i + 3);
                if (this.isValidRun(potentialRun)) {
                    // Remove tiles from rack and add to table
                    for (const tile of potentialRun) {
                        const index = player.rack.findIndex(t => t.id === tile.id);
                        if (index !== -1) {
                            player.rack.splice(index, 1);
                        }
                    }
                    this.gameState.table.push(potentialRun);
                    return true;
                }
            }
        }
        
        // If no moves found, draw a tile
        this.gameState.drawTile(playerIndex);
        return false;
    }
}

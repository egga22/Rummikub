// Tile class representing a Rummikub tile
class Tile {
    constructor(color, number, isJoker = false) {
        this.color = color; // 'red', 'blue', 'black', 'orange', or 'joker'
        this.number = number; // 1-13, or null for joker
        this.isJoker = isJoker;
        this.id = this.generateId();
    }

    generateId() {
        return `tile-${this.color}-${this.number}-${Math.random().toString(36).substring(2, 11)}`;
    }

    getValue() {
        if (this.isJoker) {
            return 0; // Joker value is determined by context
        }
        return this.number;
    }

    toString() {
        if (this.isJoker) {
            return '🃏';
        }
        return `${this.number}`;
    }

    getColorClass() {
        return this.color;
    }

    clone() {
        return new Tile(this.color, this.number, this.isJoker);
    }

    equals(other) {
        if (!other) return false;
        return this.color === other.color && 
               this.number === other.number && 
               this.isJoker === other.isJoker;
    }

    // Serialize for storage/network
    toJSON() {
        return {
            color: this.color,
            number: this.number,
            isJoker: this.isJoker,
            id: this.id
        };
    }

    static fromJSON(data) {
        const tile = new Tile(data.color, data.number, data.isJoker);
        tile.id = data.id;
        return tile;
    }
}

// Create a complete set of Rummikub tiles
function createTileSet() {
    const tiles = [];
    const colors = ['red', 'blue', 'black', 'orange'];
    
    // Create two sets of numbered tiles (1-13 in each color)
    for (let set = 0; set < 2; set++) {
        for (const color of colors) {
            for (let number = 1; number <= 13; number++) {
                tiles.push(new Tile(color, number));
            }
        }
    }
    
    // Add 2 jokers
    tiles.push(new Tile('joker', null, true));
    tiles.push(new Tile('joker', null, true));
    
    return tiles;
}

// Shuffle array using Fisher-Yates algorithm
function shuffleTiles(tiles) {
    const shuffled = [...tiles];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

import type { Tile, TileColor, TileSet, Player, GameState, GameSettings } from '../types/game';
import { DEFAULT_SETTINGS } from '../types/game';

const COLORS: TileColor[] = ['red', 'blue', 'orange', 'black'];
const COLOR_ORDER: Record<TileColor, number> = { red: 0, blue: 1, orange: 2, black: 3 };

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

// Create a full pool of tiles based on settings
export function createTilePool(settings: GameSettings): Tile[] {
  const tiles: Tile[] = [];
  
  // Create numbered tiles
  for (const color of COLORS) {
    for (let copy = 0; copy < settings.tilesPerColor; copy++) {
      for (let number = 1; number <= 13; number++) {
        tiles.push({
          id: generateId(),
          color,
          number,
          isJoker: false,
        });
      }
    }
  }
  
  // Create jokers
  for (let i = 0; i < settings.numberOfJokers; i++) {
    tiles.push({
      id: generateId(),
      color: i % 2 === 0 ? 'red' : 'black', // Jokers are typically red and black
      number: 0,
      isJoker: true,
    });
  }
  
  return tiles;
}

// Shuffle an array (Fisher-Yates)
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Draw tiles from the pool
export function drawTiles(pool: Tile[], count: number): { drawn: Tile[]; remaining: Tile[] } {
  const drawn = pool.slice(0, count);
  const remaining = pool.slice(count);
  return { drawn, remaining };
}

// Check if a set is a valid run (same color, consecutive numbers)
export function isValidRun(tiles: Tile[]): boolean {
  if (tiles.length < 3) return false;
  
  // Filter out jokers and check remaining tiles
  const nonJokers = tiles.filter(t => !t.isJoker);
  if (nonJokers.length === 0) return tiles.length >= 3; // All jokers
  
  // All non-jokers must be the same color
  const color = nonJokers[0].color;
  if (!nonJokers.every(t => t.color === color)) return false;
  
  // Sort non-jokers by number
  const sorted = [...nonJokers].sort((a, b) => a.number - b.number);
  
  // Check if jokers can fill the gaps
  const jokerCount = tiles.length - nonJokers.length;
  
  // Validate the sequence
  const numbers = sorted.map(t => t.number);
  const minNum = Math.min(...numbers);
  const maxNum = Math.max(...numbers);
  
  // The range should equal the tile count (including jokers)
  const rangeNeeded = maxNum - minNum + 1;
  if (rangeNeeded > tiles.length) return false;
  if (maxNum > 13 || minNum < 1) return false;
  
  // Check for duplicates (no duplicate numbers allowed in a run)
  const uniqueNumbers = new Set(numbers);
  if (uniqueNumbers.size !== numbers.length) return false;
  
  // Verify jokers can fill the gaps
  const gaps = rangeNeeded - nonJokers.length;
  if (gaps > jokerCount) return false;
  
  return true;
}

// Check if a set is a valid group (same number, different colors)
export function isValidGroup(tiles: Tile[]): boolean {
  if (tiles.length < 3 || tiles.length > 4) return false;
  
  const nonJokers = tiles.filter(t => !t.isJoker);
  if (nonJokers.length === 0) return tiles.length >= 3 && tiles.length <= 4;
  
  // All non-jokers must have the same number
  const number = nonJokers[0].number;
  if (!nonJokers.every(t => t.number === number)) return false;
  
  // All non-jokers must have different colors
  const colors = nonJokers.map(t => t.color);
  const uniqueColors = new Set(colors);
  if (uniqueColors.size !== colors.length) return false;
  
  return true;
}

// Check if a set is valid (either run or group)
export function isValidSet(tiles: Tile[]): boolean {
  return isValidRun(tiles) || isValidGroup(tiles);
}

// Calculate the value of a set (for initial meld requirement)
export function calculateSetValue(tiles: Tile[]): number {
  // For runs, calculate actual values
  if (isValidRun(tiles)) {
    const nonJokers = tiles.filter(t => !t.isJoker);
    if (nonJokers.length === 0) return 0; // Can't determine value with all jokers
    
    const sorted = [...nonJokers].sort((a, b) => a.number - b.number);
    const minNum = sorted[0].number;
    
    // Calculate sum of consecutive numbers
    let sum = 0;
    for (let i = 0; i < tiles.length; i++) {
      sum += minNum + i;
    }
    return sum;
  }
  
  // For groups, all tiles have the same number
  if (isValidGroup(tiles)) {
    const nonJokers = tiles.filter(t => !t.isJoker);
    if (nonJokers.length === 0) return 0;
    return nonJokers[0].number * tiles.length;
  }
  
  return 0;
}

// Create a new player
export function createPlayer(id: string, name: string): Player {
  return {
    id,
    name,
    hand: [],
    hasPlayedInitialMeld: false,
    isActive: true,
  };
}

// Initialize a new game
export function initializeGame(playerNames: string[], settings: GameSettings = DEFAULT_SETTINGS): GameState {
  let pool = shuffle(createTilePool(settings));
  
  const players: Player[] = playerNames.map((name) => {
    const player = createPlayer(generateId(), name);
    const { drawn, remaining } = drawTiles(pool, settings.initialTilesPerPlayer);
    player.hand = drawn;
    pool = remaining;
    return player;
  });
  
  return {
    id: generateId(),
    players,
    currentPlayerIndex: 0,
    board: [],
    pool,
    settings,
    status: 'playing',
    winner: null,
    turnStartBoard: [],
    turnStartHand: [...players[0].hand],
  };
}

// Check if all sets on board are valid
export function isBoardValid(board: TileSet[]): boolean {
  return board.every(set => isValidSet(set.tiles));
}

// Check if a player has won (empty hand)
export function checkWinner(player: Player): boolean {
  return player.hand.length === 0;
}

// Calculate the total value of new tiles placed on board this turn
export function calculateNewTilesValue(
  currentBoard: TileSet[],
  _turnStartBoard: TileSet[],
  turnStartHand: Tile[],
  currentHand: Tile[]
): number {
  // Find tiles that were in hand at start but not now
  const startHandIds = new Set(turnStartHand.map(t => t.id));
  const currentHandIds = new Set(currentHand.map(t => t.id));
  
  // Tiles played this turn
  const playedTileIds = [...startHandIds].filter(id => !currentHandIds.has(id));
  
  // Calculate value of played tiles
  let totalValue = 0;
  for (const set of currentBoard) {
    for (const tile of set.tiles) {
      if (playedTileIds.includes(tile.id)) {
        totalValue += tile.isJoker ? 0 : tile.number;
      }
    }
  }
  
  return totalValue;
}

// Check if initial meld requirement is met
export function meetsInitialMeldRequirement(
  currentBoard: TileSet[],
  turnStartBoard: TileSet[],
  turnStartHand: Tile[],
  currentHand: Tile[],
  minimumValue: number
): boolean {
  const value = calculateNewTilesValue(currentBoard, turnStartBoard, turnStartHand, currentHand);
  return value >= minimumValue;
}

// Deep clone game state (useful for undo/reset)
export function cloneGameState(state: GameState): GameState {
  return JSON.parse(JSON.stringify(state));
}

// Sort tiles for display in hand (color first, then number)
export function sortTiles(tiles: Tile[]): Tile[] {
  return [...tiles].sort((a, b) => {
    // Jokers at the end
    if (a.isJoker && !b.isJoker) return 1;
    if (!a.isJoker && b.isJoker) return -1;
    if (a.isJoker && b.isJoker) return 0;
    
    // Sort by color, then by number
    const colorDiff = COLOR_ORDER[a.color] - COLOR_ORDER[b.color];
    if (colorDiff !== 0) return colorDiff;
    
    return a.number - b.number;
  });
}

// Sort tiles by number first, then by color
export function sortTilesByNumber(tiles: Tile[]): Tile[] {
  return [...tiles].sort((a, b) => {
    // Jokers at the end
    if (a.isJoker && !b.isJoker) return 1;
    if (!a.isJoker && b.isJoker) return -1;
    if (a.isJoker && b.isJoker) return 0;
    
    // Sort by number, then by color
    const numberDiff = a.number - b.number;
    if (numberDiff !== 0) return numberDiff;
    
    return COLOR_ORDER[a.color] - COLOR_ORDER[b.color];
  });
}

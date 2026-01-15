// Tile colors in Rummikub
export type TileColor = 'red' | 'blue' | 'orange' | 'black';

// Tile represents a single Rummikub tile
export interface Tile {
  id: string;
  color: TileColor;
  number: number; // 1-13
  isJoker: boolean;
}

// A set on the board (either a run or a group)
export interface TileSet {
  id: string;
  tiles: Tile[];
}

// Player information
export interface Player {
  id: string;
  name: string;
  hand: Tile[];
  hasPlayedInitialMeld: boolean;
  isActive: boolean;
}

// Game settings that can be customized
export interface GameSettings {
  numberOfPlayers: number;
  initialTilesPerPlayer: number;
  minimumInitialMeldValue: number;
  tilesPerColor: number; // How many copies of each number per color (default 2)
  numberOfJokers: number;
  timePerTurn: number | null; // In seconds, null for no limit
}

// Current game state
export interface GameState {
  id: string;
  players: Player[];
  currentPlayerIndex: number;
  board: TileSet[];
  pool: Tile[];
  settings: GameSettings;
  status: 'waiting' | 'playing' | 'finished';
  winner: string | null;
  turnStartBoard: TileSet[]; // Snapshot of board at turn start for validation
  turnStartHand: Tile[]; // Snapshot of current player's hand at turn start
}

// Game action types for state management (useful for future online play)
export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'DRAW_TILE' }
  | { type: 'PLACE_TILE'; tileId: string; setId: string; position: number }
  | { type: 'CREATE_SET'; tiles: Tile[] }
  | { type: 'MOVE_TILE'; fromSetId: string; toSetId: string; tileId: string; position: number }
  | { type: 'SPLIT_SET'; setId: string; position: number }
  | { type: 'MERGE_SETS'; setId1: string; setId2: string }
  | { type: 'END_TURN' }
  | { type: 'RESET_TURN' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<GameSettings> };

// Default game settings
export const DEFAULT_SETTINGS: GameSettings = {
  numberOfPlayers: 2,
  initialTilesPerPlayer: 14,
  minimumInitialMeldValue: 30,
  tilesPerColor: 2,
  numberOfJokers: 2,
  timePerTurn: null,
};

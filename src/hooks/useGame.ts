import { useState, useCallback } from 'react';
import type { GameState, GameSettings, Tile } from '../types/game';
import { DEFAULT_SETTINGS } from '../types/game';
import {
  initializeGame,
  cloneGameState,
  isBoardValid,
  checkWinner,
  meetsInitialMeldRequirement,
  drawTiles,
  generateId,
  sortTiles,
} from '../game/gameLogic';

export interface UseGameReturn {
  gameState: GameState | null;
  startGame: (playerNames: string[], settings?: GameSettings) => void;
  resetGame: () => void;
  
  // Turn actions
  drawTile: () => void;
  endTurn: () => boolean;
  resetTurn: () => void;
  
  // Tile manipulation
  placeTileFromHand: (tileId: string, setId?: string, position?: number) => void;
  moveTileOnBoard: (tileId: string, fromSetId: string, toSetId: string, position?: number) => void;
  returnTileToHand: (tileId: string, setId: string) => void;
  createNewSet: (tileIds: string[]) => void;
  splitSet: (setId: string, position: number) => void;
  mergeIntoSet: (tileId: string, targetSetId: string, position?: number) => void;
  
  // Settings
  updateSettings: (settings: Partial<GameSettings>) => void;
  settings: GameSettings;
  
  // Helpers
  currentPlayer: () => Tile[] | null;
  isCurrentPlayerTurn: (playerId: string) => boolean;
  canEndTurn: () => boolean;
  message: string;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [message, setMessage] = useState<string>('Start a new game!');

  const startGame = useCallback((playerNames: string[], customSettings?: GameSettings) => {
    const gameSettings = customSettings || settings;
    const newGame = initializeGame(playerNames, gameSettings);
    setGameState(newGame);
    setMessage(`${playerNames[0]}'s turn`);
  }, [settings]);

  const resetGame = useCallback(() => {
    setGameState(null);
    setMessage('Start a new game!');
  }, []);

  const drawTile = useCallback(() => {
    if (!gameState || gameState.pool.length === 0) {
      setMessage('No more tiles in the pool!');
      return;
    }

    setGameState(prev => {
      if (!prev) return prev;
      const newState = cloneGameState(prev);
      
      // Reset board and hand to turn start before drawing
      newState.board = newState.turnStartBoard.map(set => ({
        ...set,
        tiles: [...set.tiles],
      }));
      newState.players[newState.currentPlayerIndex].hand = [...newState.turnStartHand];
      
      const { drawn, remaining } = drawTiles(newState.pool, 1);
      
      const currentPlayer = newState.players[newState.currentPlayerIndex];
      currentPlayer.hand = sortTiles([...currentPlayer.hand, ...drawn]);
      newState.pool = remaining;
      
      // After drawing, move to next player
      newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
      newState.turnStartBoard = [...newState.board];
      newState.turnStartHand = [...newState.players[newState.currentPlayerIndex].hand];
      
      return newState;
    });
    
    setMessage(`Drew a tile. Next player's turn.`);
  }, [gameState]);

  const endTurn = useCallback((): boolean => {
    if (!gameState) return false;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Check if board is valid
    if (!isBoardValid(gameState.board)) {
      setMessage('Invalid board! All sets must be valid runs or groups.');
      return false;
    }

    // Check initial meld requirement
    if (!currentPlayer.hasPlayedInitialMeld) {
      const meetsRequirement = meetsInitialMeldRequirement(
        gameState.board,
        gameState.turnStartBoard,
        gameState.turnStartHand,
        currentPlayer.hand,
        gameState.settings.minimumInitialMeldValue
      );
      
      if (!meetsRequirement) {
        // Check if any tiles were played
        const tilesPlayed = gameState.turnStartHand.length - currentPlayer.hand.length;
        if (tilesPlayed > 0) {
          setMessage(`Initial meld must be at least ${gameState.settings.minimumInitialMeldValue} points!`);
          return false;
        }
      }
    }

    // Check for winner
    if (checkWinner(currentPlayer)) {
      setGameState(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          status: 'finished',
          winner: currentPlayer.id,
        };
      });
      setMessage(`${currentPlayer.name} wins!`);
      return true;
    }

    // Move to next player
    setGameState(prev => {
      if (!prev) return prev;
      const newState = cloneGameState(prev);
      
      // Mark initial meld as played if tiles were placed
      if (!currentPlayer.hasPlayedInitialMeld) {
        const tilesPlayed = newState.turnStartHand.length - currentPlayer.hand.length;
        if (tilesPlayed > 0) {
          newState.players[newState.currentPlayerIndex].hasPlayedInitialMeld = true;
        }
      }
      
      newState.currentPlayerIndex = (newState.currentPlayerIndex + 1) % newState.players.length;
      newState.turnStartBoard = newState.board.map(set => ({
        ...set,
        tiles: [...set.tiles],
      }));
      newState.turnStartHand = [...newState.players[newState.currentPlayerIndex].hand];
      
      return newState;
    });

    setMessage(`${gameState.players[(gameState.currentPlayerIndex + 1) % gameState.players.length].name}'s turn`);
    return true;
  }, [gameState]);

  const resetTurn = useCallback(() => {
    if (!gameState) return;

    setGameState(prev => {
      if (!prev) return prev;
      const newState = cloneGameState(prev);
      
      // Restore board to turn start
      newState.board = newState.turnStartBoard.map(set => ({
        ...set,
        tiles: [...set.tiles],
      }));
      
      // Restore hand to turn start
      newState.players[newState.currentPlayerIndex].hand = [...newState.turnStartHand];
      
      return newState;
    });
    
    setMessage('Turn reset. Try again!');
  }, [gameState]);

  const placeTileFromHand = useCallback((tileId: string, setId?: string, position?: number) => {
    if (!gameState) return;

    setGameState(prev => {
      if (!prev) return prev;
      const newState = cloneGameState(prev);
      const currentPlayer = newState.players[newState.currentPlayerIndex];
      
      // Find tile in hand
      const tileIndex = currentPlayer.hand.findIndex(t => t.id === tileId);
      if (tileIndex === -1) return prev;
      
      const tile = currentPlayer.hand[tileIndex];
      currentPlayer.hand.splice(tileIndex, 1);
      
      if (setId) {
        // Add to existing set
        const set = newState.board.find(s => s.id === setId);
        if (set) {
          if (position !== undefined) {
            set.tiles.splice(position, 0, tile);
          } else {
            set.tiles.push(tile);
          }
        }
      } else {
        // Create new set
        newState.board.push({
          id: generateId(),
          tiles: [tile],
        });
      }
      
      return newState;
    });
  }, [gameState]);

  const moveTileOnBoard = useCallback((tileId: string, fromSetId: string, toSetId: string, position?: number) => {
    if (!gameState) return;

    setGameState(prev => {
      if (!prev) return prev;
      const newState = cloneGameState(prev);
      
      // Find and remove tile from source set
      const fromSet = newState.board.find(s => s.id === fromSetId);
      if (!fromSet) return prev;
      
      const tileIndex = fromSet.tiles.findIndex(t => t.id === tileId);
      if (tileIndex === -1) return prev;
      
      const tile = fromSet.tiles[tileIndex];
      fromSet.tiles.splice(tileIndex, 1);
      
      // Remove empty sets
      if (fromSet.tiles.length === 0) {
        newState.board = newState.board.filter(s => s.id !== fromSetId);
      }
      
      // Add to target set
      const toSet = newState.board.find(s => s.id === toSetId);
      if (toSet) {
        if (position !== undefined) {
          toSet.tiles.splice(position, 0, tile);
        } else {
          toSet.tiles.push(tile);
        }
      }
      
      return newState;
    });
  }, [gameState]);

  const returnTileToHand = useCallback((tileId: string, setId: string) => {
    if (!gameState) return;

    // Check if the tile was originally from hand this turn
    const turnStartHandIds = new Set(gameState.turnStartHand.map(t => t.id));
    if (!turnStartHandIds.has(tileId)) {
      setMessage("Can't return tiles that weren't yours this turn!");
      return;
    }

    setGameState(prev => {
      if (!prev) return prev;
      const newState = cloneGameState(prev);
      const currentPlayer = newState.players[newState.currentPlayerIndex];
      
      // Find and remove tile from set
      const set = newState.board.find(s => s.id === setId);
      if (!set) return prev;
      
      const tileIndex = set.tiles.findIndex(t => t.id === tileId);
      if (tileIndex === -1) return prev;
      
      const tile = set.tiles[tileIndex];
      set.tiles.splice(tileIndex, 1);
      
      // Remove empty sets
      if (set.tiles.length === 0) {
        newState.board = newState.board.filter(s => s.id !== setId);
      }
      
      // Add back to hand
      currentPlayer.hand = sortTiles([...currentPlayer.hand, tile]);
      
      return newState;
    });
  }, [gameState]);

  const createNewSet = useCallback((tileIds: string[]) => {
    if (!gameState) return;

    setGameState(prev => {
      if (!prev) return prev;
      const newState = cloneGameState(prev);
      const currentPlayer = newState.players[newState.currentPlayerIndex];
      
      const tiles: Tile[] = [];
      for (const tileId of tileIds) {
        const tileIndex = currentPlayer.hand.findIndex(t => t.id === tileId);
        if (tileIndex !== -1) {
          tiles.push(currentPlayer.hand[tileIndex]);
          currentPlayer.hand.splice(tileIndex, 1);
        }
      }
      
      if (tiles.length > 0) {
        newState.board.push({
          id: generateId(),
          tiles,
        });
      }
      
      return newState;
    });
  }, [gameState]);

  const splitSet = useCallback((setId: string, position: number) => {
    if (!gameState) return;

    setGameState(prev => {
      if (!prev) return prev;
      const newState = cloneGameState(prev);
      
      const setIndex = newState.board.findIndex(s => s.id === setId);
      if (setIndex === -1) return prev;
      
      const set = newState.board[setIndex];
      if (position <= 0 || position >= set.tiles.length) return prev;
      
      const firstPart = set.tiles.slice(0, position);
      const secondPart = set.tiles.slice(position);
      
      set.tiles = firstPart;
      newState.board.splice(setIndex + 1, 0, {
        id: generateId(),
        tiles: secondPart,
      });
      
      return newState;
    });
  }, [gameState]);

  const mergeIntoSet = useCallback((tileId: string, targetSetId: string, position?: number) => {
    placeTileFromHand(tileId, targetSetId, position);
  }, [placeTileFromHand]);

  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const currentPlayer = useCallback(() => {
    if (!gameState) return null;
    return gameState.players[gameState.currentPlayerIndex].hand;
  }, [gameState]);

  const isCurrentPlayerTurn = useCallback((playerId: string) => {
    if (!gameState) return false;
    return gameState.players[gameState.currentPlayerIndex].id === playerId;
  }, [gameState]);

  const canEndTurn = useCallback(() => {
    if (!gameState) return false;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const tilesPlayed = gameState.turnStartHand.length - currentPlayer.hand.length;
    
    // If tiles were played from hand, require board to be valid
    if (tilesPlayed > 0) {
      return isBoardValid(gameState.board);
    }
    
    // If no tiles were played but board was rearranged, still allow ending turn if valid
    // Check if any manipulation occurred by comparing board structure
    const boardChanged = JSON.stringify(gameState.board) !== JSON.stringify(gameState.turnStartBoard);
    if (boardChanged) {
      return isBoardValid(gameState.board);
    }
    
    // No changes made - can't end turn (must draw or play)
    return false;
  }, [gameState]);

  return {
    gameState,
    startGame,
    resetGame,
    drawTile,
    endTurn,
    resetTurn,
    placeTileFromHand,
    moveTileOnBoard,
    returnTileToHand,
    createNewSet,
    splitSet,
    mergeIntoSet,
    updateSettings,
    settings,
    currentPlayer,
    isCurrentPlayerTurn,
    canEndTurn,
    message,
  };
}

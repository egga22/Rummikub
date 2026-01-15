import React, { useState, useCallback } from 'react';
import { useGame } from '../hooks/useGame';
import { GameBoard } from './GameBoard';
import { PlayerHand } from './PlayerHand';
import { Settings } from './Settings';
import './Game.css';

export const Game: React.FC = () => {
  const {
    gameState,
    startGame,
    resetGame,
    drawTile,
    endTurn,
    resetTurn,
    placeTileFromHand,
    moveTileOnBoard,
    returnTileToHand,
    updateSettings,
    settings,
    canEndTurn,
    message,
  } = useGame();

  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);
  const [showSettings, setShowSettings] = useState(false);

  const handleStartGame = () => {
    const names = playerNames.slice(0, settings.numberOfPlayers);
    // Ensure we have enough player names
    while (names.length < settings.numberOfPlayers) {
      names.push(`Player ${names.length + 1}`);
    }
    startGame(names, settings);
    setSelectedTiles([]);
  };

  const handleTileClick = (tileId: string) => {
    setSelectedTiles(prev => 
      prev.includes(tileId) 
        ? prev.filter(id => id !== tileId)
        : [...prev, tileId]
    );
  };

  const handleBoardTileDrop = useCallback((tileId: string, setId: string | null, position: number) => {
    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    
    // Check if tile is from hand
    const isFromHand = currentPlayer.hand.some(t => t.id === tileId);
    
    if (isFromHand) {
      if (setId) {
        // Add to existing set
        placeTileFromHand(tileId, setId, position);
      } else {
        // Create new set
        placeTileFromHand(tileId);
      }
    } else {
      // Tile is from board - find source set
      for (const set of gameState.board) {
        if (set.tiles.some(t => t.id === tileId)) {
          if (setId && setId !== set.id) {
            moveTileOnBoard(tileId, set.id, setId, position);
          }
          break;
        }
      }
    }
    
    setSelectedTiles([]);
  }, [gameState, placeTileFromHand, moveTileOnBoard]);

  const handleBoardTileClick = (tileId: string, setId: string) => {
    // Check if this tile was from current player's hand this turn
    if (!gameState) return;
    
    const turnStartHandIds = new Set(gameState.turnStartHand.map(t => t.id));
    if (turnStartHandIds.has(tileId)) {
      returnTileToHand(tileId, setId);
    }
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    setPlayerNames(prev => {
      const newNames = [...prev];
      newNames[index] = name;
      return newNames;
    });
  };

  const handleSettingsChange = (newSettings: Parameters<typeof updateSettings>[0]) => {
    updateSettings(newSettings);
    // Adjust player names array if needed
    if (newSettings.numberOfPlayers !== undefined) {
      const numPlayers = newSettings.numberOfPlayers;
      setPlayerNames(prev => {
        const newNames = [...prev];
        while (newNames.length < numPlayers) {
          newNames.push(`Player ${newNames.length + 1}`);
        }
        return newNames;
      });
    }
  };

  if (!gameState) {
    return (
      <div className="game-container">
        <div className="game-header">
          <h1>🎮 Rummikub</h1>
          <p>The classic tile game</p>
        </div>

        <div className="setup-panel">
          <button 
            className="toggle-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
          >
            {showSettings ? 'Hide Settings' : 'Show Settings'} ⚙️
          </button>

          {showSettings && (
            <Settings
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          )}

          <div className="player-names-setup">
            <h3>Player Names</h3>
            {Array(settings.numberOfPlayers).fill(0).map((_, i) => (
              <div key={i} className="player-name-input">
                <label htmlFor={`player-${i}`}>Player {i + 1}</label>
                <input
                  id={`player-${i}`}
                  type="text"
                  value={playerNames[i] || `Player ${i + 1}`}
                  onChange={(e) => handlePlayerNameChange(i, e.target.value)}
                  placeholder={`Player ${i + 1}`}
                />
              </div>
            ))}
          </div>

          <button className="start-btn" onClick={handleStartGame}>
            Start Game 🎲
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h1>🎮 Rummikub</h1>
        <div className="game-info">
          <span className="pool-count">Pool: {gameState.pool.length} tiles</span>
          <span className="message">{message}</span>
        </div>
      </div>

      {gameState.status === 'finished' ? (
        <div className="game-over">
          <h2>🎉 Game Over! 🎉</h2>
          <p className="winner-message">
            {gameState.players.find(p => p.id === gameState.winner)?.name} wins!
          </p>
          <button className="new-game-btn" onClick={resetGame}>
            New Game
          </button>
        </div>
      ) : (
        <>
          <GameBoard
            board={gameState.board}
            onTileDrop={handleBoardTileDrop}
            onTileClick={handleBoardTileClick}
          />

          <div className="turn-controls">
            <button 
              className="draw-btn"
              onClick={drawTile}
              disabled={gameState.pool.length === 0}
            >
              Draw Tile 📥
            </button>
            <button 
              className="reset-btn"
              onClick={resetTurn}
            >
              Reset Turn ↩️
            </button>
            <button 
              className="end-turn-btn"
              onClick={endTurn}
              disabled={!canEndTurn()}
            >
              End Turn ✓
            </button>
          </div>

          <div className="players-area">
            {gameState.players.map((player, index) => (
              <PlayerHand
                key={player.id}
                tiles={player.hand}
                playerName={player.name}
                isCurrentPlayer={index === gameState.currentPlayerIndex}
                selectedTiles={index === gameState.currentPlayerIndex ? selectedTiles : []}
                onTileClick={handleTileClick}
              />
            ))}
          </div>

          <button className="quit-btn" onClick={resetGame}>
            Quit Game
          </button>
        </>
      )}
    </div>
  );
};

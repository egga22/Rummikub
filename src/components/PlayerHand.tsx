import React, { useState } from 'react';
import type { Tile as TileType } from '../types/game';
import { Tile } from './Tile';
import { sortTiles, sortTilesByNumber } from '../game/gameLogic';
import './PlayerHand.css';

interface PlayerHandProps {
  tiles: TileType[];
  playerName: string;
  isCurrentPlayer: boolean;
  selectedTiles: string[];
  onTileClick: (tileId: string) => void;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  tiles,
  playerName,
  isCurrentPlayer,
  selectedTiles,
  onTileClick,
}) => {
  const [sortMode, setSortMode] = useState<'color' | 'number'>('color');

  const handleDragStart = (e: React.DragEvent, tileId: string) => {
    e.dataTransfer.setData('tileId', tileId);
    e.dataTransfer.setData('source', 'hand');
  };

  const sortedTiles = sortMode === 'color' ? sortTiles(tiles) : sortTilesByNumber(tiles);

  return (
    <div className={`player-hand ${isCurrentPlayer ? 'active' : 'inactive'}`}>
      <div className="player-info">
        <h3>{playerName}</h3>
        {isCurrentPlayer && <span className="turn-indicator">Your Turn</span>}
        <span className="tile-count">{tiles.length} tiles</span>
        {isCurrentPlayer && (
          <div className="sort-buttons">
            <button 
              className={`sort-btn ${sortMode === 'color' ? 'active' : ''}`}
              onClick={() => setSortMode('color')}
              title="Sort by color first, then number"
            >
              🎨 Color
            </button>
            <button 
              className={`sort-btn ${sortMode === 'number' ? 'active' : ''}`}
              onClick={() => setSortMode('number')}
              title="Sort by number first, then color"
            >
              🔢 Number
            </button>
          </div>
        )}
      </div>
      <div className="hand-tiles">
        {isCurrentPlayer ? (
          sortedTiles.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
              selected={selectedTiles.includes(tile.id)}
              onClick={() => onTileClick(tile.id)}
              onDragStart={(e) => handleDragStart(e, tile.id)}
            />
          ))
        ) : (
          <div className="hidden-tiles">
            {Array(tiles.length).fill(0).map((_, i) => (
              <div key={i} className="hidden-tile" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

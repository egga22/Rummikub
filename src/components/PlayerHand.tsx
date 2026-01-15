import React from 'react';
import type { Tile as TileType } from '../types/game';
import { Tile } from './Tile';
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
  const handleDragStart = (e: React.DragEvent, tileId: string) => {
    e.dataTransfer.setData('tileId', tileId);
    e.dataTransfer.setData('source', 'hand');
  };

  return (
    <div className={`player-hand ${isCurrentPlayer ? 'active' : 'inactive'}`}>
      <div className="player-info">
        <h3>{playerName}</h3>
        {isCurrentPlayer && <span className="turn-indicator">Your Turn</span>}
        <span className="tile-count">{tiles.length} tiles</span>
      </div>
      <div className="hand-tiles">
        {isCurrentPlayer ? (
          tiles.map((tile) => (
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

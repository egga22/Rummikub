import React, { useState } from 'react';
import type { TileSet as TileSetType } from '../types/game';
import { Tile } from './Tile';
import { isValidSet } from '../game/gameLogic';
import './TileSet.css';

interface TileSetProps {
  set: TileSetType;
  onTileDrop: (tileId: string, setId: string, position: number) => void;
  onTileClick?: (tileId: string, setId: string) => void;
}

export const TileSetComponent: React.FC<TileSetProps> = ({
  set,
  onTileDrop,
  onTileClick,
}) => {
  const [dropIndex, setDropIndex] = useState<number | null>(null);
  const isValid = isValidSet(set.tiles);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropIndex(index);
  };

  const handleDragLeave = () => {
    setDropIndex(null);
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData('tileId');
    
    if (tileId) {
      onTileDrop(tileId, set.id, position);
    }
    setDropIndex(null);
  };

  const handleDragStart = (e: React.DragEvent, tileId: string) => {
    e.dataTransfer.setData('tileId', tileId);
    e.dataTransfer.setData('setId', set.id);
  };

  return (
    <div className={`tile-set ${isValid ? 'valid' : 'invalid'}`}>
      {set.tiles.map((tile, index) => (
        <React.Fragment key={tile.id}>
          <div
            className={`drop-zone ${dropIndex === index ? 'active' : ''}`}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          />
          <Tile
            tile={tile}
            onClick={() => onTileClick?.(tile.id, set.id)}
            onDragStart={(e) => handleDragStart(e, tile.id)}
          />
        </React.Fragment>
      ))}
      <div
        className={`drop-zone end ${dropIndex === set.tiles.length ? 'active' : ''}`}
        onDragOver={(e) => handleDragOver(e, set.tiles.length)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, set.tiles.length)}
      />
    </div>
  );
};

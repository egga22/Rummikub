import React from 'react';
import type { Tile as TileType } from '../types/game';
import './Tile.css';

interface TileProps {
  tile: TileType;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  selected?: boolean;
  draggable?: boolean;
}

export const Tile: React.FC<TileProps> = ({
  tile,
  onClick,
  onDragStart,
  onDragEnd,
  selected = false,
  draggable = true,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('tileId', tile.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(e);
  };

  return (
    <div
      className={`tile ${tile.color} ${selected ? 'selected' : ''} ${tile.isJoker ? 'joker' : ''}`}
      onClick={onClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      data-tile-id={tile.id}
    >
      {tile.isJoker ? (
        <span className="joker-symbol">☺</span>
      ) : (
        <span className="tile-number">{tile.number}</span>
      )}
    </div>
  );
};

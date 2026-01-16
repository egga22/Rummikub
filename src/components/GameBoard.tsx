import React, { useState } from 'react';
import type { TileSet } from '../types/game';
import { TileSetComponent } from './TileSet';
import './GameBoard.css';

interface GameBoardProps {
  board: TileSet[];
  onTileDrop: (tileId: string, setId: string | null, position: number) => void;
  onTileClick?: (tileId: string, setId: string) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  onTileDrop,
  onTileClick,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData('tileId');
    
    // Only handle drop on empty board area (not on existing sets)
    // Check if the drop target is the board or its placeholder children
    const target = e.target as HTMLElement;
    const isValidDropTarget = target.classList.contains('game-board') || 
                              target.classList.contains('board-placeholder') ||
                              target.closest('.board-placeholder') !== null;
    
    if (isValidDropTarget && tileId) {
      onTileDrop(tileId, null, 0);
    }
    setIsDragOver(false);
  };

  const handleSetTileDrop = (tileId: string, setId: string, position: number) => {
    onTileDrop(tileId, setId, position);
  };

  return (
    <div
      className={`game-board ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {board.length === 0 ? (
        <div className="board-placeholder">
          <p>Drop tiles here to create sets</p>
          <p className="hint">Valid sets: 3+ tiles of same number (different colors) or 3+ consecutive numbers (same color)</p>
        </div>
      ) : (
        <div className="board-sets">
          {board.map((set) => (
            <TileSetComponent
              key={set.id}
              set={set}
              onTileDrop={handleSetTileDrop}
              onTileClick={onTileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

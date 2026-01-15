import React from 'react';
import type { GameSettings } from '../types/game';
import './Settings.css';

interface SettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: Partial<GameSettings>) => void;
  disabled?: boolean;
}

export const Settings: React.FC<SettingsProps> = ({
  settings,
  onSettingsChange,
  disabled = false,
}) => {
  return (
    <div className="settings-panel">
      <h3>Game Settings</h3>
      
      <div className="setting-row">
        <label htmlFor="numberOfPlayers">Number of Players</label>
        <select
          id="numberOfPlayers"
          value={settings.numberOfPlayers}
          onChange={(e) => onSettingsChange({ numberOfPlayers: parseInt(e.target.value) })}
          disabled={disabled}
        >
          <option value="2">2 Players</option>
          <option value="3">3 Players</option>
          <option value="4">4 Players</option>
        </select>
      </div>

      <div className="setting-row">
        <label htmlFor="initialTiles">Initial Tiles per Player</label>
        <input
          id="initialTiles"
          type="number"
          min="7"
          max="21"
          value={settings.initialTilesPerPlayer}
          onChange={(e) => onSettingsChange({ initialTilesPerPlayer: parseInt(e.target.value) })}
          disabled={disabled}
        />
      </div>

      <div className="setting-row">
        <label htmlFor="minimumMeld">Minimum Initial Meld Value</label>
        <select
          id="minimumMeld"
          value={settings.minimumInitialMeldValue}
          onChange={(e) => onSettingsChange({ minimumInitialMeldValue: parseInt(e.target.value) })}
          disabled={disabled}
        >
          <option value="0">No minimum</option>
          <option value="30">30 points</option>
          <option value="40">40 points</option>
          <option value="50">50 points</option>
        </select>
      </div>

      <div className="setting-row">
        <label htmlFor="numberOfJokers">Number of Jokers</label>
        <select
          id="numberOfJokers"
          value={settings.numberOfJokers}
          onChange={(e) => onSettingsChange({ numberOfJokers: parseInt(e.target.value) })}
          disabled={disabled}
        >
          <option value="0">No Jokers</option>
          <option value="2">2 Jokers</option>
          <option value="4">4 Jokers</option>
        </select>
      </div>

      <div className="setting-row">
        <label htmlFor="timePerTurn">Time per Turn</label>
        <select
          id="timePerTurn"
          value={settings.timePerTurn ?? 'none'}
          onChange={(e) => onSettingsChange({ 
            timePerTurn: e.target.value === 'none' ? null : parseInt(e.target.value) 
          })}
          disabled={disabled}
        >
          <option value="none">No limit</option>
          <option value="30">30 seconds</option>
          <option value="60">1 minute</option>
          <option value="120">2 minutes</option>
          <option value="300">5 minutes</option>
        </select>
      </div>
    </div>
  );
};

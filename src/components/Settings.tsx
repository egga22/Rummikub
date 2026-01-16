import React, { useState } from 'react';
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
  const [showCustomMinimumMeld, setShowCustomMinimumMeld] = useState(false);
  const [showCustomNumberOfJokers, setShowCustomNumberOfJokers] = useState(false);
  const [showCustomTimePerTurn, setShowCustomTimePerTurn] = useState(false);

  const handleMinimumMeldChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomMinimumMeld(true);
      return;
    }
    setShowCustomMinimumMeld(false);
    onSettingsChange({ minimumInitialMeldValue: parseInt(value) });
  };

  const handleCustomMinimumMeldChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onSettingsChange({ minimumInitialMeldValue: numValue });
    }
  };

  const handleNumberOfJokersChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomNumberOfJokers(true);
      return;
    }
    setShowCustomNumberOfJokers(false);
    onSettingsChange({ numberOfJokers: parseInt(value) });
  };

  const handleCustomNumberOfJokersChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onSettingsChange({ numberOfJokers: numValue });
    }
  };

  const handleTimePerTurnChange = (value: string) => {
    if (value === 'custom') {
      setShowCustomTimePerTurn(true);
      return;
    }
    setShowCustomTimePerTurn(false);
    onSettingsChange({ 
      timePerTurn: value === 'none' ? null : parseInt(value) 
    });
  };

  const handleCustomTimePerTurnChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0) {
      onSettingsChange({ timePerTurn: numValue });
    }
  };

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
          value={showCustomMinimumMeld ? 'custom' : settings.minimumInitialMeldValue}
          onChange={(e) => handleMinimumMeldChange(e.target.value)}
          disabled={disabled}
        >
          <option value="0">No minimum</option>
          <option value="30">30 points</option>
          <option value="40">40 points</option>
          <option value="50">50 points</option>
          <option value="custom">Custom</option>
        </select>
        {showCustomMinimumMeld && (
          <input
            type="number"
            min="0"
            value={settings.minimumInitialMeldValue}
            onChange={(e) => handleCustomMinimumMeldChange(e.target.value)}
            placeholder="Custom value"
            disabled={disabled}
            className="custom-input"
          />
        )}
      </div>

      <div className="setting-row">
        <label htmlFor="numberOfJokers">Number of Jokers</label>
        <select
          id="numberOfJokers"
          value={showCustomNumberOfJokers ? 'custom' : settings.numberOfJokers}
          onChange={(e) => handleNumberOfJokersChange(e.target.value)}
          disabled={disabled}
        >
          <option value="0">No Jokers</option>
          <option value="2">2 Jokers</option>
          <option value="4">4 Jokers</option>
          <option value="custom">Custom</option>
        </select>
        {showCustomNumberOfJokers && (
          <input
            type="number"
            min="0"
            value={settings.numberOfJokers}
            onChange={(e) => handleCustomNumberOfJokersChange(e.target.value)}
            placeholder="Custom value"
            disabled={disabled}
            className="custom-input"
          />
        )}
      </div>

      <div className="setting-row">
        <label htmlFor="timePerTurn">Time per Turn</label>
        <select
          id="timePerTurn"
          value={showCustomTimePerTurn ? 'custom' : (settings.timePerTurn ?? 'none')}
          onChange={(e) => handleTimePerTurnChange(e.target.value)}
          disabled={disabled}
        >
          <option value="none">No limit</option>
          <option value="30">30 seconds</option>
          <option value="60">1 minute</option>
          <option value="120">2 minutes</option>
          <option value="300">5 minutes</option>
          <option value="custom">Custom</option>
        </select>
        {showCustomTimePerTurn && (
          <input
            type="number"
            min="1"
            value={settings.timePerTurn || ''}
            onChange={(e) => handleCustomTimePerTurnChange(e.target.value)}
            placeholder="Custom seconds"
            disabled={disabled}
            className="custom-input"
          />
        )}
      </div>
    </div>
  );
};

# Rummikub

A customizable way to play the classic game of Rummikub online.

## Features

- **Single-Player Mode**: Play against AI opponents on the same device
- **Customizable Settings**: Adjust game rules to your preference
  - Number of players (2-4)
  - Initial tiles per player (7-21)
  - Minimum initial meld value (0-50)
  - Turn timer option
  - Joker substitution rules
- **Intuitive Drag-and-Drop Interface**: Easy tile manipulation
- **Automatic Validation**: Game enforces Rummikub rules
- **Persistent State**: Game progress saved in browser

## How to Play

### Game Rules

Rummikub is played with tiles numbered 1-13 in four colors (red, blue, black, orange), with two sets of each tile, plus 2 jokers.

**Objective**: Be the first player to play all your tiles.

**Valid Melds**:
- **Run**: 3 or more consecutive numbers in the same color (e.g., red 3-4-5)
- **Group**: 3 or 4 tiles of the same number in different colors (e.g., red 7, blue 7, black 7)

**Initial Meld**: The first time you play tiles, they must total at least 30 points (default, customizable).

**Turn Options**:
- Play tiles from your rack to form or extend melds on the table
- Draw a tile from the pool if you cannot or choose not to play

### Controls

- **Drag and Drop**: Click and drag tiles to move them
- **Draw Tile**: Take a tile from the pool
- **End Turn**: Complete your turn (must draw or play valid melds)
- **Sort Tiles**: Automatically organize your rack by color and number
- **Settings**: Configure game rules before starting a new game
- **New Game**: Start a fresh game

## Running the Game

### Option 1: Open Directly in Browser

Simply open `index.html` in your web browser. The game runs entirely in the browser with no server required.

### Option 2: Using a Local Server

For better compatibility, you can run a local server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

Then navigate to `http://localhost:8000` in your browser.

## Architecture

The application is designed with future online multiplayer in mind:

### Core Components

- **tile.js**: Tile class and tile set generation
- **gameState.js**: Game state management with serialization support
- **gameLogic.js**: Rule validation and AI logic
- **ui.js**: User interface and rendering
- **settings.js**: Customizable game settings with localStorage
- **main.js**: Main game controller

### Extensibility

The codebase is structured to support future enhancements:

1. **Player Management**: Modular player system ready for authentication
2. **State Serialization**: Game state can be serialized for network transmission
3. **AI Framework**: Basic AI system that can be enhanced
4. **Settings Persistence**: User preferences saved locally

### Future Enhancements

Potential additions for online multiplayer:

- User authentication system
- WebSocket-based real-time multiplayer
- Player matchmaking
- Game history and statistics
- Chat functionality
- Mobile-responsive design improvements

## Technologies Used

- **HTML5**: Structure and semantics
- **CSS3**: Styling with modern features (flexbox, gradients, animations)
- **Vanilla JavaScript**: No frameworks, pure ES6+ JavaScript
- **LocalStorage API**: Game state and settings persistence
- **Drag and Drop API**: Intuitive tile manipulation

## Browser Compatibility

Works in all modern browsers supporting:
- ES6+ JavaScript
- Drag and Drop API
- LocalStorage
- CSS Flexbox

## License

MIT License - See LICENSE file for details

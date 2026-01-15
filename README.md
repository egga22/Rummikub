# Rummikub

A customizable online web app to play the classic game of Rummikub.

## Features

- 🎮 **Classic Rummikub gameplay** - Place tiles in runs (consecutive numbers, same color) or groups (same number, different colors)
- ⚙️ **Customizable settings** - Adjust number of players, initial tiles, meld requirements, jokers, and turn time limits
- 🎲 **Local multiplayer** - Play with 2-4 players on the same device
- 🖱️ **Drag and drop interface** - Intuitive tile placement with visual feedback
- ✨ **Beautiful UI** - Modern, responsive design with smooth animations

## Game Rules

### Setup
- Each player starts with 14 tiles (customizable)
- Remaining tiles form the pool

### Objective
Be the first to play all your tiles to the board

### Valid Sets
- **Run**: 3 or more consecutive numbers of the same color (e.g., Blue 4-5-6)
- **Group**: 3 or 4 tiles of the same number in different colors (e.g., Red 7, Blue 7, Black 7)

### Gameplay
1. On your turn, you can:
   - Play tiles from your hand to the board
   - Manipulate existing sets on the board (split, merge, rearrange)
   - Draw a tile if you can't or don't want to play
2. Initial meld must be worth at least 30 points (customizable)
3. All sets on the board must be valid when you end your turn
4. Jokers can substitute for any tile

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
\`\`\`

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS** - Custom styling

## Project Structure

\`\`\`
src/
├── components/          # React components
│   ├── Game.tsx        # Main game container
│   ├── GameBoard.tsx   # Board for tile sets
│   ├── PlayerHand.tsx  # Player's hand display
│   ├── Tile.tsx        # Individual tile component
│   ├── TileSet.tsx     # Group of tiles on board
│   └── Settings.tsx    # Game settings panel
├── game/
│   └── gameLogic.ts    # Core game rules and validation
├── hooks/
│   └── useGame.ts      # Game state management hook
├── types/
│   └── game.ts         # TypeScript interfaces
├── App.tsx             # Root component
├── App.css             # App styles
├── index.css           # Global styles
└── main.tsx            # Entry point
\`\`\`

## Future Roadmap

The codebase is architected to support:

- 🌐 **Online multiplayer** - Game state is serializable and action-based for network sync
- 👤 **Account system** - Player IDs and state management ready for user authentication
- 💾 **Game persistence** - Save and resume games
- 🏆 **Leaderboards** - Track wins and statistics

## License

MIT License - see [LICENSE](LICENSE) for details

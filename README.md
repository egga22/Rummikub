# Rummikub

A customizable web app to play the classic game of Rummikub — built with **plain HTML, CSS, and JavaScript** (no frameworks, no dependencies, no build step).

## How to Play

Just open `index.html` in any modern browser. No installation needed.

## Features

- 🎮 **Classic Rummikub gameplay** — Place tiles in runs (consecutive numbers, same color) or groups (same number, different colors)
- ⚙️ **Customizable settings** — Adjust number of players, initial tiles, meld requirements, jokers, and turn time limits
- 🎲 **Local multiplayer** — Play with 2-4 players on the same device
- 🖱️ **Drag and drop interface** — Intuitive tile placement with visual feedback
- ✨ **Beautiful UI** — Modern, responsive design with smooth animations
- ⏱️ **Optional turn timer** — Auto-draws a tile when time expires

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
   - Play tiles from your hand to the board (drag & drop, or select then click "Create Set")
   - Manipulate existing sets on the board (drag tiles between sets)
   - Draw a tile if you can't or don't want to play
2. Initial meld must be worth at least 30 points (customizable)
3. All sets on the board must be valid when you end your turn
4. Jokers can substitute for any tile
5. Click a board tile that you placed this turn to return it to your hand

## Technology

Single self-contained `index.html` — vanilla HTML, CSS, and JavaScript. No build tools, no npm install, no frameworks.

## Future Roadmap

- 🌐 **Online multiplayer** — Game state is fully serializable for network sync
- 💾 **Game persistence** — Save and resume games

## License

MIT License — see [LICENSE](LICENSE) for details

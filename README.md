# Game Scoreboard

A web application that displays game statistics and leaderboards by reading gameplay data from a static JSON file, showing player rankings based on win percentages and skill ratings with GitHub avatars.

## Features

- **Leaderboard Display**: Shows all players ranked by skill rating with comprehensive stats
- **Date Range Filtering**: Filter games by custom or preset date ranges (Today, Yesterday, Last Week, Last Month, Last Year)
- **Player Statistics**: Detailed breakdown showing games played, wins, runner-ups, losses, win percentage, and skill rating
- **Game History**: Chronological list of all games with player placements and rating changes
- **Player Filtering**: Filter game history by specific players
- **Theme Support**: Light and dark mode with persistent preference
- **Responsive Design**: Optimized for mobile, tablet, and desktop

## Data Format

The application reads game data from `/public/games.json`. Each game should follow this structure:

```json
[
  {
    "played_at": "2025-11-19T15:04:42.000Z",
    "players": ["player1", "player2", "player3", "player4"]
  }
]
```

**Important**: Players are listed in order of their placement (1st place, 2nd place, etc.). The first player in the array is the winner.

## How It Works

1. **Skill Rating**: Uses the OpenSkill (TrueSkill2) rating system to calculate player skill ratings based on game outcomes
2. **Win Calculation**: 
   - First place = 1 point
   - Runner-up (middle positions) = 0.5 points
   - Last place = 0 points
3. **Leaderboard Ranking**: Players are ranked by skill rating (highest first)
4. **Rating Changes**: Shows how each player's rating changed after each game

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Add your game data to `/public/games.json`
4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Adding Games

Add games to `/public/games.json` in chronological order. Each game object should have:
- `played_at`: ISO 8601 timestamp of when the game was played
- `players`: Array of GitHub usernames in order of placement (winner first)

Example:
```json
{
  "played_at": "2025-11-19T15:04:42.000Z",
  "players": ["winner", "second_place", "third_place", "last_place"]
}
```

### Viewing Stats

- **Leaderboard Tab**: See all players ranked by skill rating
- **Game History Tab**: View all games in reverse chronological order
- **Date Filters**: Use preset or custom date ranges to analyze specific time periods
- **Player Filter** (in Game History): Filter to see games for a specific player

### GitHub Avatars

Player avatars are automatically fetched from GitHub using the player usernames. Make sure usernames match valid GitHub accounts for avatars to display correctly.

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Skill Rating**: OpenSkill (TrueSkill2 algorithm)
- **Date Handling**: date-fns
- **Icons**: Phosphor Icons
- **Build Tool**: Vite

## Customization

### Changing the Title

Edit the title in:
- `/index.html` - Page title (line 7)
- `/src/App.tsx` - App header (lines 76-80)

### Modifying Colors

The color scheme is defined in `/src/styles/theme.css` using CSS custom properties for easy customization.

### Adjusting Scoring

Edit the scoring logic in `/src/lib/stats.ts` in the `calculatePlayerStats` function to modify how wins, runner-ups, and losses are weighted.

## License

MIT License - Copyright GitHub, Inc.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

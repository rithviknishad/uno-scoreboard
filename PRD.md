# Planning Guide

A web application that displays game statistics and leaderboards by reading gameplay data from a static JSON file, showing player rankings based on win percentages with GitHub avatars.

**Experience Qualities**: 
1. **Clear**: Statistics and rankings should be immediately understandable with minimal cognitive load
2. **Competitive**: Design should emphasize rankings and achievements to encourage friendly competition
3. **Responsive**: Fast-loading data visualization that updates smoothly when filters change

**Complexity Level**: Light Application (multiple features with basic state)
  - This is a data visualization dashboard with filtering capabilities, basic state management for date ranges, but no user authentication or data mutation

## Essential Features

### Leaderboard Display
- **Functionality**: Shows all players ranked by win percentage with their stats
- **Purpose**: Primary view for understanding competitive standings
- **Trigger**: Landing page / default view
- **Progression**: Load JSON data → Calculate win percentages → Sort by percentage → Display with avatars and stats
- **Success criteria**: Players see accurate rankings with GitHub avatars, games played, and win percentage

### Date Range Filtering
- **Functionality**: Filter games by custom or preset date ranges
- **Purpose**: Allows analysis of performance over specific time periods
- **Trigger**: User selects preset filter (Today, Yesterday, Last Week, Last Month, Last Year) or custom date range
- **Progression**: User selects filter → Filter JSON data by played_at timestamp → Recalculate stats → Update leaderboard display
- **Success criteria**: Stats update correctly based on selected date range, showing only relevant games

### Player Statistics Cards
- **Functionality**: Display individual player metrics (games played, wins, runner-ups, losses, win %)
- **Purpose**: Provide detailed breakdown of player performance
- **Trigger**: Render alongside leaderboard
- **Progression**: Calculate stats from filtered data → Display in card format with visual hierarchy
- **Success criteria**: Each player card shows accurate statistics with clear visual distinction between metrics

### Game History View
- **Functionality**: Chronological list of all games with player placements
- **Purpose**: Provides transparency and allows verification of rankings
- **Trigger**: User switches to history tab/view
- **Progression**: User clicks history view → Display filtered games chronologically → Show player order with visual ranking indicators
- **Success criteria**: Games display in reverse chronological order with clear winner/loser indication

## Edge Case Handling
- **Empty Data**: Show empty state with friendly message when no games match filters
- **Missing GitHub Avatars**: Display fallback avatar/initials if GitHub API fails or user doesn't exist
- **Single Player Games**: Handle edge case of games with only one player gracefully
- **Invalid JSON**: Display error message if JSON is malformed or missing
- **No Games Played**: Show zero state encouraging first game entry
- **Tie Scores**: Display players with identical win percentages in alphabetical order

## Design Direction
The design should feel competitive and energetic like a sports scoreboard, with bold typography and clear data visualization that makes rankings immediately scannable, using a rich interface with card-based layouts and vibrant accent colors to celebrate winners.

## Color Selection
Triadic color scheme - Using vibrant, high-energy colors to create a playful yet competitive atmosphere that reflects the fun nature of competitive gaming.

- **Primary Color**: Bold Blue (oklch(0.55 0.18 250)) - Represents trust and competition, used for primary actions and top rankings
- **Secondary Colors**: 
  - Warm Orange (oklch(0.70 0.15 50)) - Celebrates winners and highlights
  - Deep Purple (oklch(0.45 0.12 290)) - Provides depth for cards and secondary elements
- **Accent Color**: Bright Yellow (oklch(0.85 0.15 90)) - Attention-grabbing highlight for #1 ranking and CTAs
- **Foreground/Background Pairings**:
  - Background (White oklch(1 0 0)): Dark text oklch(0.20 0 0) - Ratio 16.9:1 ✓
  - Card (Light Gray oklch(0.97 0 0)): Dark text oklch(0.20 0 0) - Ratio 15.8:1 ✓
  - Primary (Bold Blue oklch(0.55 0.18 250)): White text oklch(1 0 0) - Ratio 5.2:1 ✓
  - Secondary (Warm Orange oklch(0.70 0.15 50)): Dark text oklch(0.20 0 0) - Ratio 7.1:1 ✓
  - Accent (Bright Yellow oklch(0.85 0.15 90)): Dark text oklch(0.20 0 0) - Ratio 12.8:1 ✓
  - Muted (Light Gray oklch(0.95 0 0)): Muted text oklch(0.50 0 0) - Ratio 6.5:1 ✓

## Font Selection
Modern, bold sans-serif fonts that convey energy and clarity, making numbers and rankings instantly readable with strong hierarchy.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/32px/tight letter spacing (-0.02em)
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing
  - H3 (Player Names): Inter Medium/18px/normal spacing
  - Body (Stats/Labels): Inter Regular/14px/relaxed line height (1.6)
  - Numbers (Scores): Inter Bold/20px/tabular numbers for alignment
  - Small (Metadata): Inter Regular/12px/muted color

## Animations
Subtle and performance-focused animations that provide feedback during data filtering and emphasize ranking changes, with celebratory micro-interactions for top performers.

- **Purposeful Meaning**: Rankings should animate in with staggered timing to create a reveal effect, while filter changes should use smooth fade transitions to indicate data updates
- **Hierarchy of Movement**: 
  - #1 rank gets subtle pulse/glow animation
  - Card hover states lift slightly with shadow change
  - Filter selections provide immediate visual feedback
  - Data loading shows skeleton states that morph into content

## Component Selection
- **Components**: 
  - Card (shadcn) - For player stat cards with hover effects and subtle shadows
  - Tabs (shadcn) - Switch between Leaderboard and History views
  - Select (shadcn) - Date range preset dropdown with custom Popover for date picker
  - Calendar (shadcn) with date-fns - Custom date range selection
  - Avatar (shadcn) - GitHub profile pictures with fallback initials
  - Badge (shadcn) - Rank indicators (#1, #2, #3) with color coding
  - Separator (shadcn) - Visual dividers between sections
  - Table (shadcn) - For game history view with alternating rows
  - Skeleton (shadcn) - Loading states for data fetching
- **Customizations**: 
  - Custom leaderboard card with ranking badge overlay
  - Animated rank number with gradient for top 3
  - Custom empty state illustrations/messages
  - Trophy icons from Phosphor for top 3 positions
- **States**: 
  - Cards: default, hover (lift + shadow), loading (skeleton)
  - Filters: default, active (highlighted), disabled
  - Rankings: standard, podium (top 3 with special styling)
- **Icon Selection**: 
  - Trophy (Phosphor) for winners
  - Medal (Phosphor) for podium positions
  - CalendarBlank (Phosphor) for date filters
  - ListBullets (Phosphor) for history view
  - Crown (Phosphor) for #1 rank
- **Spacing**: 
  - Card padding: p-6
  - Section gaps: gap-8
  - Grid gaps: gap-4
  - List items: gap-2
  - Page margins: px-4 md:px-8 lg:px-16
- **Mobile**: 
  - Stack leaderboard cards vertically on mobile
  - Collapsible filters in mobile drawer
  - Simplified table view for history (cards instead of table rows)
  - Fixed header with scrollable content area
  - Bottom navigation for tab switching on mobile

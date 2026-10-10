# Architecture: Typing Master

## Overview
Typing Master utilizes a modern frontend stack built with React, TypeScript, and Vite. It is designed as an offline-first Progressive Web App (PWA) with a feature-based modular architecture.

## Feature-Based Modular Architecture
The `src/` directory is structured around domains/features to keep related code together.

```
src/
├── assets/         # Static assets (images, fonts, sounds)
├── components/     # Shared generic UI components (Buttons, Inputs, Layouts)
├── config/         # App-wide configurations (constants, routes, themes)
├── features/       # Feature modules
│   ├── typing/     # Core typing test feature
│   ├── lessons/    # Lesson/curriculum feature
│   ├── games/      # Mini-games feature
│   ├── stats/      # Statistics & dashboards
│   └── settings/   # App settings & preferences
├── hooks/          # Shared custom React hooks
├── lib/            # Third-party library wrappers/setups (e.g., Dexie)
├── services/       # API and local storage interaction logic
├── store/          # Redux setup and root reducer
├── styles/         # Global styles and theme CSS variables
├── types/          # Global TypeScript definitions
└── utils/          # Helper functions and pure logic utilities
```

## Component Hierarchy
- `App` (Root)
  - `Providers` (Redux, Theme, Router)
  - `LayoutShell` (Sidebar, Topbar)
    - `RouterOutlet` (Views mapped to routes)
      - `TypingTestView`
      - `DashboardView`
      - `LessonsView`
      - `GamesView`
      - `SettingsView`

## State Management Strategy
- **Redux Toolkit**: Used for global, shared state. E.g., user settings, active theme, global user statistics, and lesson progress.
- **Local State (useState/useReducer)**: Used for highly active UI state, especially during a typing session to prevent re-rendering the entire app for every keystroke.

## Data Flow Patterns
1. User interacts with UI.
2. Local component state updates immediately (e.g., typing input).
3. On test completion, a Redux thunk or generic service is called.
4. The service saves data to the Storage Layer (IndexedDB via Dexie).
5. The Redux store is updated with the new global stats/progress.
6. The UI automatically reflects the updated Redux state.

## Typing Engine Architecture
- **State**: The typing engine manages a snapshot of text, cursor position, current word index, and arrays of keystroke data.
- **Hooks**: A core `useTypingEngine` hook handles keystroke events, validations (correct, incorrect, extra), backspace logic, and metrics calculation (WPM, Raw WPM, Accuracy) based on timestamps.
- **Render**: The typing text is rendered by mapping over words and characters, applying CSS classes based on their state (e.g., `.correct`, `.incorrect`, `.active`).

## Game Engine Registry Pattern
- Mini-games are dynamically loaded or registered using a Registry Pattern.
- `GameRegistry.ts` exports a list of available games.
- Each game adheres to a standard `GameModule` interface containing its name, description, cover image, and the main React component to mount.
- This allows for easy addition of new games without touching the core routing or UI logic.

## Storage Layer (Dexie.js for IndexedDB)
- The app must be fully offline-capable.
- All persistent data (sessions, stats, settings, custom lists) is stored in the browser's IndexedDB.
- Dexie.js is used as a lightweight wrapper for IndexedDB.
- `src/lib/db.ts` defines the Dexie instance and tables.

## Service Layer Design
- Provides a clean API for components to fetch and store data.
- Separates IndexedDB queries from React components.
- Example: `StatsService.ts` contains `getLifetimeStats()`, `saveSession(session)`, `getRecentSessions(limit)`.

## PWA Strategy
- Standard Vite PWA plugin implementation.
- Strategies for caching fonts, JS/CSS assets, and sounds.
- App is fully installable and functions 100% offline.

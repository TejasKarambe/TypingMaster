# Project Plan: Typing Master

This document outlines the high-level project plan covering the 11 implementation phases for the Typing Master application.

## Phases

### Phase 1: Project Setup & Foundation
- Initialize React project with TypeScript and Vite.
- Configure ESLint, Prettier, and Husky.
- Set up absolute imports and folder structure (`src/components`, `src/features`, `src/hooks`, etc.).
- Set up Redux Toolkit for global state.
- Set up React Router for navigation.
- Implement basic layout shell (Sidebar, Header, Main Content area).

### Phase 2: Core Typing Engine & Data Models
- Implement the core typing engine logic (input handling, WPM/accuracy calculation).
- Define all TypeScript interfaces for data models (Settings, TypingSession, etc.).
- Set up Dexie.js for IndexedDB storage.
- Create service layer for interacting with Dexie (Storage services).

### Phase 3: Basic UI & Navigation
- Build the core UI components (Buttons, Inputs, Cards, Modals).
- Implement the navigation sidebar and routing.
- Set up the Redux slices for UI state (e.g., active theme, sidebar toggled).

### Phase 4: Standard Typing Test Mode
- Implement the main typing test view.
- Support time-based and word-count-based modes.
- Implement real-time typing feedback (correct, incorrect, extra characters).
- Integrate the typing engine with the UI and save results to Dexie.

### Phase 5: Practice Modes & Custom Tests
- Implement custom text input for practice.
- Support pasting text or loading from pre-defined custom lists.
- Implement the UI for selecting practice modes.

### Phase 6: Lessons & Curriculum
- Design the lesson data structure.
- Create lesson progression logic and tracking.
- Build the UI for the lesson map and individual lesson screens.

### Phase 7: Mini-games (Engine + Games)
- Implement the Game Engine Registry pattern.
- Build the base Game Component.
- Develop 2-3 initial mini-games (e.g., Word Drop, Typing Invaders).
- Save game high scores to the local database.

### Phase 8: Statistics & Analytics Dashboard
- Build the statistics dashboard view.
- Implement charts (using Recharts or Chart.js) for WPM over time, accuracy, etc.
- Calculate and display lifetime stats, daily activity, and heatmaps.

### Phase 9: Settings & Theming System
- Implement the theming engine using CSS variables.
- Create 10+ built-in themes.
- Build the settings page to configure themes, typing preferences, and sounds.

### Phase 10: PWA & Offline Support
- Configure Vite PWA plugin.
- Set up service workers for caching assets.
- Ensure the app is fully functional offline using Dexie.js.

### Phase 11: Final Polish, Animations, & Testing
- Add Framer Motion for smooth transitions and micro-interactions.
- Perform accessibility audits and keyboard navigation testing.
- Write unit tests for core utilities and components.
- Final bug fixing and performance optimization.

## Milestones
- **M1: Alpha** (End of Phase 4) - Core typing test is functional and can save results.
- **M2: Beta** (End of Phase 8) - All major modes (Lessons, Games, Stats) are functional.
- **M3: v1.0 Release** (End of Phase 11) - Fully polished PWA ready for production.

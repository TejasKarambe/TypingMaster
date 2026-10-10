# Typing Master — Premium Typing Training Platform

A modern, offline-first typing training web application inspired by Monkeytype with structured progression lessons, interactive typing games, comprehensive analytics, and customizable themes.

---

## 🚀 Features

- **Customizable Typing Test**: Time, word count, quote, custom text, numbers, punctuation, difficulty presets.
- **Progressive Lessons**: 10 curriculum levels with over 70 structured lessons (Home row, Upper row, Lower row, Fluency, Symbols, etc.).
- **Interactive Typing Games**: Real-time games including Falling Words with level scaling, combos, lives, and high scores.
- **Analytics & History**: Full local test tracking with WPM over time, accuracy distribution, consistency metrics, and mistake keymaps.
- **Gamification**: XP points, levels, and milestone/accuracy/speed achievements.
- **10+ Custom Themes**: Dark & light themes (Midnight, Graphite, Paper, Forest, Ocean, Sunset, Neon, Lavender, Monochrome, High Contrast).
- **Offline-First & PWA**: IndexedDB storage via Dexie.js and Service Worker caching via Vite PWA. No external backend required.

---

## 🛠️ Tech Stack

- **React 19** + **TypeScript** (Strict mode)
- **Vite**
- **Tailwind CSS v4**
- **Redux Toolkit** (UI & Active Session State)
- **Dexie.js** (IndexedDB persistent storage)
- **Recharts** (Visual analytics)
- **Framer Motion** (Smooth animations)
- **Lucide React** (Icons)
- **Vite PWA** (Offline & Installable App Shell)

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Run Tests
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 GitHub Pages Deployment

The repository includes a ready-to-use GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

### Steps to Deploy:

1. Push this repository to GitHub.
2. In your repository settings on GitHub, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, choose **GitHub Actions**.
4. Push to `main` (or `master`), or trigger the workflow manually under **Actions** > **Deploy to GitHub Pages** > **Run workflow**.
5. Your site will be automatically built and published at `https://<username>.github.io/<repository-name>/`.

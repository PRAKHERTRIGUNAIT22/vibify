# Vibify Frontend (Tailwind CSS)

This is the dedicated frontend for Vibify, styled with Tailwind CSS.

## Getting Started

1. **Start the Backend Server**:
   Ensure your backend is running on port 5001:
   ```bash
   cd ../backend
   npm start
   ```

2. **Open the Frontend**:
   Simply open `index.html` in your browser:
   - Double-click `index.html` directly in File Explorer, OR
   - Right-click `index.html` and choose **"Open with Live Server"** (VS Code), OR
   - Run a static local server:
     ```bash
     npx serve .
     ```

## Features
- **Tailwind CSS Dark Theme**: Modern glassmorphism UI with neon purple, cyan, and emerald accents.
- **Song Catalog**: Browse, search, and filter by mood (`⚡ Hype`, `🌊 Chill`, `✨ Lowkey`) or genre.
- **Synthesizer Audio Player**: Play real audio directly in the browser via Web Audio API.
- **Live Jam Session**: Create a session, share join code, and test host-priority queue management.
- **Playlist & LRU Cache**: Save custom playlists and view the 5 most recently played songs.

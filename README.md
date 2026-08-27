# 🚀 Space Arcade — Retro & Multiplayer Gaming Suite 👾

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Vite](https://img.shields.io/badge/Build%20Engine-Vite%208.x-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/Code-Vanilla%20JS%20ES6%2B-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![WebRTC](https://img.shields.io/badge/P2P%20Networking-PeerJS%20(WebRTC)-3399FF?style=flat&logo=webrtc&logoColor=white)](https://peerjs.com/)
[![Deployment](https://img.shields.io/badge/Host-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

> **Space Arcade** is a high-performance, neon-infused retro arcade web platform packed with 10+ games, online peer-to-peer multiplayer, smartphone-as-controller console mode, and instant zero-download gameplay.

---

## ✨ Features at a Glance

* **🕹️ Instant Browser Gaming**: 100% free, zero downloads, zero login required. Powered by pure HTML5 Canvas & ES6 JavaScript.
* **🎉 Online Party Lounge (P2P Multiplayer)**: Connect with friends anywhere using 6-character room codes powered by **PeerJS (WebRTC)**. Zero server latency, zero backend overhead!
* **📱 Smartphone Controller Mode**: Turn your smartphone into a wireless touch gamepad to control games on your PC or TV monitor screen!
* **👫 Local 2-Player Couch Play**: Play head-to-head on a shared keyboard in local battle modes.
* **⚡ Eco Turbo Mode**: Built-in power saving engine for low-spec devices and extended battery life.
* **🔊 Retro Web Audio Synth**: Nostalgic arcade sound effects dynamically synthesized using browser audio APIs.
* **🌌 Cosmic Visual FX**: Dynamic Canvas starfields, retro CRT scanline filters, smooth neon glows, and custom cursors.

---

## 🎮 Game Directory

| Game | Category | Description | Controls |
| :--- | :--- | :--- | :--- |
| 🐍 **Space Worm** | Retro / Endless | Guide your cosmic snake, collect stars, and grow without hitting walls! | `Arrow Keys` |
| 👻 **Pac-Man** | Retro / Action | Outmaneuver ghosts and gobble dots in the space maze. | `Arrow Keys` |
| 👾 **Space Troopers** | Action / Shooter | Blast incoming alien invaders before they breach your defense zone. | `Arrows` + `Space` |
| 🧱 **Cosmic Blocks** | Puzzle / Retro | Classic line-clearing block puzzle. Rotate, drop, and score big! | `Arrow Keys` |
| 💥 **Block Blast** | Puzzle / Casual | Drag & drop colorful blocks into grids to clear lines and rows. | `Touch` / `Mouse Drag` |
| 🥷 **Blackhole Ninja** | Action / Platformer | Guide a ninja jumping platforms to escape gravitational black holes. | `Space` / `Click` |
| 🪐 **Galactic Wordle** | Puzzle / Word | Guess the secret 5-letter cosmic word in 6 attempts. | `Keyboard` |
| 🔥 **Block Blast: Extreme** | Action / Endless | Infinite high-octane block survival mode with no score limits! | `Touch` / `Mouse` |
| 🔨 **Mole Hammer** | Casual / Arcade | Fast-reaction whack-a-mole cosmic arcade challenge. | `Click` / `Touch` |
| 🏓 **Space Pong** | Retro / 2-Player | Retro table tennis arcade action against AI or local friends. | `W/S` or `Up/Down` |
| ⚔️ **Star Combat Chess** | Strategy / P2P | Star Wars themed chess with 3 difficulty modes, smooth sliding animations, P2P online multiplayer, custom vector pieces (Yoda, Vader, Leia, Falcon, Death Star), tournament clocks, and lock-in buzzers! | `Click` / `Touch` / `Space` |

---

### ⚔️ Spotlight: Star Combat Chess
A custom-built HTML5 galactic chess game featuring:
* **Themed Army Sets**: Play as the **Light Side** (featuring Yoda as King, Leia as Queen, and the Millennium Falcon as Rook) or the **Dark Side** (featuring Darth Vader as King, Emperor Palpatine as Queen, and the Death Star as Rook).
* **High-Quality 2D Vector Pieces**: Stylized vector graphics inspired by geometric Star Wars aesthetics with custom color shading.
* **Imperial Tactical AI**: Play singleplayer against three AI levels (Padawan, Trooper, Sith Lord) powered by a minimax engine with alpha-beta pruning.
* **Cubic Easing Animations**: Smooth slide-in movements when pieces traverse the battlefield.
* **Online P2P Tournament**: Connect with peers via PeerJS WebRTC to play dual-player chess from each player's respective color viewpoint. Includes a live **Lock-In Buzzer** (no instant locking!) and tournament clocks (5 min blitz per side) with time out forfeits.

---

## 🕹️ Game Modes

```
                    ┌─────────────────────────────────────────┐
                    │               SPACE ARCADE              │
                    └────────────────────┬────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │                                │                                │
┌───────▼───────┐                ┌───────▼───────┐                ┌───────▼───────┐
│ 🕹️ Singleplayer│                │ 🎉 Party Mode │                │ 📱 Console    │
│  Arcade Mode  │                │ (WebRTC P2P)  │                │ Gamepad Mode  │
└───────────────┘                └───────────────┘                └───────────────┘
```

### 1. 🕹️ Singleplayer Arcade
Choose any retro classic from the home page. Smooth Canvas rendering, global high-score saving in `localStorage`, and instant category filters (`Retro`, `Puzzle`, `Action`, `Endless`, `Casual`).

### 2. 🎉 Online Party Mode (WebRTC P2P)
Host or join a multiplayer room using a **6-digit code**. Powered by PeerJS data channels:
* Real-time lobby player ready states
* Synchronized host game selection
* Zero central server dependency — direct peer-to-peer data streaming

### 3. 📱 Console Mode (Mobile Gamepad)
1. Open `Console Mode` on your desktop/TV browser.
2. Scan the QR code or visit `controller.html` on your mobile phone.
3. Your phone turns into a wireless arcade controller sending real-time d-pad and action button inputs to the big screen via WebRTC!

### 4. 👫 Local 2-Player Play
Grab a friend and play dual-player split-keyboard arcade games directly in the `offline.html` lounge.

---

## 🛠️ Tech Stack & Technologies

* **HTML5 & CSS3**: Semantic UI structure and pure Vanilla CSS (CSS variables, keyframe animations, glassmorphism, scanlines). *No Tailwind or Bootstrap frameworks required.*
* **Vanilla JavaScript (ES6 Modules)**: Modular game engine logic (`previews.js`, `audio.js`, `cursor.js`, `nav.js`, `stars.js`).
* **PeerJS (WebRTC)**: Direct P2P browser networking for zero-latency controller pairing and multiplayer lounges.
* **Vite**: Ultra-fast build tool and development server.
* **Vercel**: Production edge hosting with customized security headers (`X-Frame-Options`, `X-Content-Type-Options`) and static asset caching.

---

## 🚀 Quick Start & Local Development

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v16 or higher) installed.

### 1. Clone Repository
```bash
git clone https://github.com/Abhixarvar/retrogamingsite.git
cd retrogamingsite
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173` in your web browser.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 📁 Project Directory Structure

```
SpaceArcade/
├── assets/                  # SVG icons, audio assets & graphics
├── css/                     # Vanilla CSS stylesheets
│   ├── style.css            # Core arcade design system & theme
│   └── mobile-controls.css  # Mobile gamepad layout styles
├── games/                   # Individual HTML & JS game implementations
│   ├── snake.html / .js
│   ├── pacman.html / .js
│   ├── tetris.html / .js
│   ├── blockblast.html / .js
│   ├── blackholeninja.html / .js
│   ├── troopers.html / .js
│   ├── wordle.html / .js
│   └── ...
├── js/                      # Core arcade JavaScript modules
│   ├── audio.js             # Web Audio sound generator
│   ├── console-engine.js    # Big screen console receiver
│   ├── controller-engine.js # Mobile gamepad input transmitter
│   ├── lobby.js             # PeerJS WebRTC party manager
│   ├── nav.js               # Category filters & UI navigation
│   ├── previews.js          # Live animated canvas card previews
│   └── stars.js             # Dynamic background starfield generator
├── index.html               # Main Arcade Landing Page
├── party.html               # Online Party Lounge (P2P)
├── console.html             # Console Monitor Mode
├── controller.html          # Smartphone Controller Interface
├── singleplayer.html        # Singleplayer Hub
├── offline.html             # Local 2-Player Lounge
├── vercel.json              # Vercel deployment & security headers config
├── vite.config.js           # Vite bundler configuration
└── package.json             # Project metadata & dependencies
```

---

## 🌐 Deployment

This project is optimized for **Vercel** out of the box with `vercel.json` configured for:
* **Clean URLs**: `.html` extensions automatically hidden in navigation
* **Cache-Control**: Immutable long-term caching for static JS/CSS assets
* **Security Headers**: Built-in protection against clickjacking and MIME sniffing

To deploy your own instance:
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/Abhixarvar/retrogamingsite)

---

## 🤝 Contributing

Contributions, game ideas, and bug fixes are very welcome!

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingGame`)
3. **Commit** your changes (`git commit -m 'Add AmazingGame'`)
4. **Push** to the branch (`git push origin feature/AmazingGame`)
5. **Open** a Pull Request

---

## 📜 License

Distributed under the **ISC License**. See `package.json` for details.

---

<p align="center">
  Crafted with ❤️ and retro arcade energy by <a href="https://github.com/Abhixarvar">Abhixarvar</a>
  <br>
  <i>⭐ If you enjoyed playing Space Arcade, give this repository a star!</i>
</p>

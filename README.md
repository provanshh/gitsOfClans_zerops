# ⚔️ GITS OF CLANS

> **Transform GitHub Repositories into Living 3D Minecraft Villages with AI-Powered Crew Builders**
### 🚨Though fully working on: https://frontend-2e76.prg1.zerops.app 
### If not working please find it on: https://gits-of-clans-zerops.vercel.app

![Gits of Clans Banner](https://img.shields.io/badge/Minecraft-3D%20Repository%20Engine-4CAF35?style=for-the-badge&logo=minecraft&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-R3F-000000?style=for-the-badge&logo=three.js&logoColor=white)
![OpenRouter AI](https://img.shields.io/badge/AI Engine-OpenRouter-FF9D19?style=for-the-badge&logo=openai&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-72D34A?style=for-the-badge)

---

## 📜 Overview

**Gits of Clans** turns abstract GitHub codebases into navigable, interactive 3D Minecraft villages. Code files become voxel skyscrapers whose height reflects lines of code, directories form town districts, open Pull Requests dock at the harbor as heavily armed pirate galleons, and AI crew members physically edit code in real-time while you approve changes using a Mayor Permit system.

---

## 🚨 The Problems It Solves

```
$ git log --oneline --graph | head -50
> ERROR: Cannot parse 14,000 commits mentally

$ cat src/components/App.jsx | wc -l
> 3,847 lines — impossible to review manually
```

| # | Problem | Developer Pain | How Gits of Clans Solves It |
|---|---|---|---|
| **01** | **Codebase Blindness** | Large repos feel like black boxes with no spatial mental map. | **Voxel 3D World**: Building height = lines of code; position = directory tree; color = language. |
| **02** | **PR Review Hell** | Dozens of open PRs create reviewer burnout and hidden breaking changes. | **Pirate Galleons**: Open PRs dock at the village port as ships. Inspect modifications visually before merging. |
| **03** | **Blind AI Edits** | AI tools edit code across files without visual feedback on blast radius. | **Realtime Extrusion & Mayor Permit**: Watch buildings physically grow/shrink in 3D as AI edits code, gated by your stamp. |
| **04** | **Multi-Repo Complexity** | Comparing microservices or frontend/backend repos requires constant context switching. | **Archipelago Mode**: Floating islands placed side-by-side in one shared ocean for instant architectural comparison. |

---

## 🏗️ System Architecture

```
                                  +---------------------------------------+
                                  |         GITS OF CLANS FRONTEND        |
                                  |  (React 18 + R3F + Three.js + WebAudio)|
                                  +-------------------+-------------------+
                                                      |
                                       HTTP / REST    | JSON City Schema
                                                      v
                                  +---------------------------------------+
                                  |          EXPRESS API SERVER           |
                                  |          (Node.js / Port 3000)        |
                                  +---------+-------------------+---------+
                                            |                   |
                     GitHub REST API        |                   | OpenRouter AI API
                     (Repo Trees & PRs)     v                   v (GPT-4o / Claude 3.5 / Haiku)
                                  +-------------------+   +-------------------+
                                  |   GitHub API      |   |   OpenRouter AI   |
                                  |   (api.github.com)|   |   (openrouter.ai) |
                                  +-------------------+   +-------------------+
```

---

## 🏛️ 3D Village Mapping Engine Rules

| Repository Element | 3D Village Representation | Visual Rule / Logic |
|---|---|---|
| **Source File (`.js`, `.py`, etc.)** | Voxel Skyscraper | Height = $\log_2(\text{Lines of Code} + 1) \times 3.5$; Base = $2.2 \times 2.2$ blocks |
| **File Extension / Language** | Roof Trim Color | `.jsx`/`.ts` = Blue (`#3b82f6`), `.css` = Pink (`#ec4899`), `.json`/`.md` = Yellow (`#eab308`), Python = Green (`#22c55e`) |
| **Directory / Folder** | Town District | Bounding box perimeter outlining folder clusters with floating 3D labels |
| **`README.md`** | Town Square Fountain | Central glowing golden fountain with animated water pool at position `[0,0,0]` |
| **Pull Requests (PRs)** | Pirate Galleons | Armed ships anchored around the island coast; clicking inspects diffs & author |
| **AI Crew Dispatch** | Builder Drone & Villager | Drones hover over target structures while animated 3D characters walk to the building site |

---

## 🤖 AI Mayor Console & Crew Dispatch Flow

```
[User / Demo] ➔ Select Structure ➔ Choose Crew (Architect / Worker / Engineer)
                       │
                       ▼
            Type AI Edit Order ➔ Dispatch to OpenRouter API
                       │
                       ▼
           AI Returns Code Diff & Explanation ➔ Proposal Rendered
                       │
                       ▼
      [MAYOR STAMP PERMIT] ➔ 3D Building Extrudes / Height Updates Live!
```

- **Master Architect (Claude-3.5 Sonnet / Wizard)**: Best for complex refactoring and structural changes.
- **Site Foreman (GPT-4o / Worker)**: Optimized for fast feature implementation and performance routines.
- **Code Runner (Haiku / Engineer)**: Lightweight bug fixes and quick edits.

---

## 🎨 Design System & Sound Engine

- **Visual Aesthetic**: AAA Minecraft & Clash of Clans fantasy adventure theme.
- **Palette**: Grass green (`#4CAF35`), Deep Forest (`#163B20`), Minecraft Dirt (`#6B3F20`), Wood (`#9A622E`), Stone (`#6F7470`), Sky Blue (`#42A5E8`), Emerald (`#72D34A`), Gold CTA (`#FF9D19`).
- **Typography**: `Press Start 2P`, `Pixelify Sans` for headings; `VT323`, `Share Tech Mono` for terminal & UI labels.
- **Web Audio Sound Engine**: Zero external audio assets required. Synthesizes chiptune background music (BGM) loops and retro square-wave hover/click sound effects dynamically via browser `AudioContext`.

---

## 🚀 Quick Start & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/provanshh/gitsOfClans_zerops.git

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Start Development Servers

```bash
# Terminal 1: Start Express Backend API (Port 3000)
npm start

# Terminal 2: Start Vite React Frontend (Port 5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🎮 How to Play / Operate

1. **Enter Repository Coordinates**: Paste any GitHub repository URL (e.g. `facebook/react`, `expressjs/express`) or select a preset.
2. **Run Automatic Guided Demo**: Click **🎮 RUN AUTOMATIC GUIDED DEMO** on the landing page to watch the automated 5-step workflow:
   - Spawning 3D world
   - Auto camera revolving & smooth zoom-in
   - Architect crew selection
   - Live AI order typing
   - Stamp permit & real-time building height extrusion!
3. **Configure OpenRouter AI Key**: Click **🔑 API KEY** in the header to enter your custom key from [openrouter.ai/keys](https://openrouter.ai/keys).

---

## 📄 License

Distributed under the MIT License. Built with ❤️ for the developer community using React, Three.js, React Three Fiber, and OpenRouter AI.

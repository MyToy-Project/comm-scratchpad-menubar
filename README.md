# Comm Scratchpad Menubar

A lightweight macOS menubar app for capturing quick thoughts and communication drafts — built with Electron.

## Features

- 📌 Lives in your macOS menu bar — always one click away
- ⚡ Instant open/close with global shortcut `⌃⇧S`
- 💾 Notes are persisted locally at `~/.comm-scratchpad.json`
- 🗑️ Delete individual notes on hover
- 🖥️ Stays on top of other windows

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- macOS

### Install & Run

```bash
npm install
npm start
```

## Usage

| Action | How |
|---|---|
| Open / Close | Click the menu bar icon or press `⌃⇧S` |
| Save a note | Type and press `Enter` (or click **Save**) |
| Delete a note | Hover over a note and click the trash icon |

## Tech Stack

- [Electron](https://www.electronjs.org/)
- [menubar](https://github.com/maxogden/menubar)
- [Tailwind CSS](https://tailwindcss.com/) (CDN)
- [Feather Icons](https://feathericons.com/)

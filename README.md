# Comm Scratchpad Menubar

A lightweight macOS menubar app for capturing quick thoughts and communication drafts — built with Electron.

## Features

- 📌 **Always accessible**: Lives in your macOS menu bar.
- ⚡ **Global Shortcut**: Instant open/close with `⌃⇧S`.
- 📝 **Contextual Recaps**: Add multiple recap sections to any memo for synthesis and drafts.
- 🏷️ **Custom Labels**: Name your recaps while keeping their numerical order (e.g., Recap #1: Feedback).
- 📋 **Selective Copy**: Choose exactly what to copy (Original Memo + specific Recaps) in one go.
- ✏️ **Inline Editing**: Both original memos and recaps are fully editable with auto-save.
- 💾 **Local Persistence**: Notes are saved at `~/.comm-scratchpad.json`.
- 🗑️ **Management**: Easily delete notes or individual recaps with confirmation.

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
| Edit content | Click on any memo or recap to edit directly |
| Add Recap | Click the **Add Recap** button on any note |
| Copy Selection | Click the **Copy** icon on a note to select parts to copy |
| Delete | Click the trash icon (note) or **x** icon (recap) |

## Tech Stack

- [Electron](https://www.electronjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [menubar](https://github.com/maxogden/menubar)
- [Tailwind CSS](https://tailwindcss.com/)
- [Feather Icons](https://feathericons.com/)

## Development

The project uses TypeScript. Use `npm run watch` during development to auto-compile changes.

```bash
npm run build   # Compile TS to JS
npm run watch   # Compile in watch mode
```

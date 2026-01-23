# CLAUDE.md - Project Instructions for Claude

This file contains instructions and rules that Claude should follow when working on this project.

## Project Overview
- **Name:** Ascendance Hub
- **Type:** PWA for store management
- **Language:** JavaScript (vanilla), HTML, CSS
- **Backend:** Firebase (Firestore, Auth, Cloud Functions)
- **Stores:** VSU (multiple locations), Loyal Vaper, Miramar Wine & Liquor

## Development Rules

### General
- Always increment version numbers in index.html after modifying JS files (e.g., `script.js?v=81` -> `script.js?v=82`)
- All user-facing text should be in **English**
- Make push after completing changes
- Document significant changes in the Development Log (`js/development-log.js`)

### Code Style
- Use modern JavaScript (ES6+)
- Keep functions concise and well-named
- Add console.log statements for debugging with prefixes like `[Module]`

### Firebase
- Always check if Firebase is initialized before operations
- Use the existing manager patterns (e.g., `firebaseRestockRequestsManager`)
- Handle errors gracefully with try/catch

### UI/UX
- Follow the existing design system (colors, spacing, etc.)
- Use Font Awesome icons (already loaded)
- Make components responsive (mobile-first)
- Use `var(--variable)` CSS variables for theming

## Custom Rules (Add your own below)

<!-- Add your specific rules here -->


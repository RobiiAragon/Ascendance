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
- Document all changes in the Development Log (`js/development-log.js`)

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

## Custom Rules

1. **Mobile First** - Always check how changes look on mobile. Test responsive layouts.

2. **Don't Break Existing Features** - Before modifying code, understand what it does. Never remove or change functionality that already works without explicit permission.

3. **Think Before Acting** - For complex changes, take time to analyze the codebase and plan the approach before writing code.

4. **Document in Development Log** - After completing significant changes, add entries to the Development Log (`js/development-log.js`) documenting what was done.


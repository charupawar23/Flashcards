Flashcards Quiz App

A small, single-page flashcards app that runs entirely in the browser.

Features
- Question on the front, answer on the back ("Show Answer").
- Next / Previous navigation and keyboard shortcuts (← → and space to show).
- Add, edit, delete cards.
- Import / Export JSON of cards.
- Data saved to localStorage.
 - Multiple decks: create and delete decks, switch active deck from the header dropdown.

How to run
1. Open `index.html` in your browser. For full file APIs (import/export) it's best served over HTTP.

Quick server (from PowerShell):

```powershell
# if you have Python 3 installed
python -m http.server 8000
# then open http://localhost:8000/flashcards-app/
```

Files
- `index.html` — main UI
- `styles.css` — simple styles
- `app.js` — application logic

Notes
- This is intentionally simple and dependency-free.
- Improvements: store per-deck, add spaced repetition scheduling, sync to cloud.

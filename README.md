# Color Palette Generator

A small frontend project that creates five-color palettes for design practice. It is built with plain HTML, CSS and JavaScript, with no build step, server or external dependency.

## Features

- Generate a new five-color palette
- Lock colors that should stay unchanged
- Copy any color's hex code
- Automatic light or dark text for readability
- Save favorite palettes in browser local storage
- Apply or delete saved palettes
- Keyboard shortcut with Space to generate
- Responsive desktop and mobile layout

## Files

- `index.html` - page structure and palette sections
- `styles.css` - responsive palette cards, saved palettes and visual design
- `script.js` - random colors, locking, copying, saved palettes and local storage

## How to run

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Generate a palette, lock colors you like and save favorites.

No account, package install or server is required.

## How it works

The JavaScript creates five random hex colors and renders each one as a card. Locked colors are kept when a new palette is generated. Saved palettes are stored in local storage, so they remain available in the same browser after a reload.

## Testing

The project was checked in a browser with functional tests for generation, locked colors, hex copy feedback, palette saving, applying, deleting, local storage reload state, keyboard generation and readable text themes. Desktop and mobile layouts were visually inspected.

## Note

This project was built with the help of an AI assistant (Instinct) as a learning project.

# **App Name**: Sudoku Sensei

## Core Features:

- Image to Grid: Scan a Sudoku puzzle from an image, and display it in an editable grid on the screen using OCR.
- Manual Grid Entry: Allow users to manually input and edit Sudoku grids.
- Error Check: Check the Sudoku grid for any rule violations or errors using an AI reasoning tool.
- AI Hint: Provide a context-aware hint for the next logical move based on the current board state, using AI reasoning. The hint should recommend filling a single cell, and explain the deduction required to arrive at that solution. The complexity of reasoning applied when determining hints can be configured in settings.
- Conflict Highlighting: Visually highlight conflicting numbers to make them easily identifiable in the grid.
- Game Saving: Enable users to save and load multiple Sudoku games to continue later.

## Style Guidelines:

- Primary color: Pure red (#FF0000) for immediate feedback about rule violations, and emphasis of hints.
- Background color: Near white (#F2F2F2) to evoke the traditional appearance of Sudoku puzzles, while being gentle on the eyes during long play sessions.
- Accent color: Slightly desaturated light red (#FF6666) to highlight hints and selected numbers without being visually jarring.
- Body and headline font: 'Inter' sans-serif with a modern, machined, objective, neutral look; suitable for headlines or body text
- Use clear, minimalist icons for actions like scanning, checking, and hinting.
- Ensure a clean and uncluttered grid layout with clearly defined cells. Use appropriate spacing and padding for a user-friendly experience.
- Implement subtle transitions for cell selections and value changes to provide smooth user feedback.
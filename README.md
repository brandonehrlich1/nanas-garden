# Nana's Garden Tracker

## What this app does
Nana's Garden Tracker is a simple static web app for tracking potted plants in **Section A** and **Section B**.

It now includes:
- A visual two-section layout with multiple plant spots per section.
- Plant spot add/edit/remove actions.
- Watering helpers like “Mark watered today,” days since last watered, and a simple watering-due indicator.
- Plant age tracking (days since planting).
- Seasonal tips and category-level care suggestions (flower, herb, vegetable, other).

## How to open it locally
1. Clone or download this repo.
2. Open `index.html` in any modern web browser.

No build tools or dependencies are required.

## What data is saved locally
The app saves all plant spot data in your browser `localStorage`.

Storage keys:
- `nanasGardenDataV2` (current)
- `nanasGardenData` (legacy key from older app; old data is migrated when possible)

Each plant record includes:
- `id`
- `sectionId`
- `name`
- `plantType`
- `plantingDate`
- `sunlight`
- `wateringFrequency`
- `notes`
- `lastWatered`
- `status`

## Known limitations
- This app uses broad, general gardening suggestions and is not plant-specific care guidance.
- Data is tied to the browser/device where it was entered (no cloud sync).
- No offline backup/export yet.

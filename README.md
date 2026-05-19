# Nana's Garden Tracker

## What this app does
Nana's Garden Tracker is a simple static web app for mapping and tending Nana’s real raised garden beds in **Raised Bed A** and **Raised Bed B**.

It now includes:
- Real garden bed photo uploads saved locally in the browser.
- Tappable, named growing zones mapped over each bed photo with x/y position and width/height percentages.
- Empty zones that invite planting and filled zones that show plant, watering, health, and quick-note details.
- Plant zone add/edit/remove actions.
- Watering helpers like “Watered today,” days since last watered, and a simple watering-due indicator.
- Plant age tracking (days since planting).
- Seasonal tips and category-level care suggestions (flower, herb, vegetable, other).

## How to open it locally
1. Clone or download this repo.
2. Open `index.html` in any modern web browser.

No build tools or dependencies are required.

## What data is saved locally
The app saves bed photos and plant zone data in your browser `localStorage`.

Storage keys:
- `nanasGardenDataV3` (current)
- `nanasGardenDataV2` (previous version; migrated when possible)
- `nanasGardenData` (legacy key from older app; old data is migrated when possible)

Each bed record can include:
- `backgroundImage` (a resized photo data URL stored locally)

Each plant zone record includes:
- `id`
- `sectionId`
- `zoneLabel`
- `zoneX`
- `zoneY`
- `zoneWidth`
- `zoneHeight`
- `name`
- `plantType`
- `plantingDate`
- `sunlight`
- `wateringFrequency`
- `notes`
- `lastWatered`
- `status`
- `careProfile`

## Known limitations
- This app uses broad, general gardening suggestions and is not plant-specific care guidance.
- Data is tied to the browser/device where it was entered (no cloud sync).
- Photos are stored as local browser data URLs, so very large uploads may hit browser storage limits.
- No offline backup/export yet.

# Nana's Garden Tracker

## What this app does
Nana's Garden Tracker is a simple static web app that opens directly to a warm **Virtual Garden** view of Nana’s two raised garden beds.

It includes:
- A cute raised-bed schematic of the **Left Bed** and **Right Bed**.
- Nana's seeded tomatoes, cucumber, jalapeño pepper, and marigold clusters placed in their real garden spots.
- Large tappable plant markers with emoji/icons and plant names.
- A simple plant detail card with water status, care tips, notes, and quick actions.
- Secondary add/edit tools for changing plants without making setup feel required.
- Local care profiles for the seeded plants.
- Automatic seeded garden loading only when browser `localStorage` has no existing app data.

## How to open it locally
1. Clone or download this repo.
2. Open `index.html` in any modern web browser.

No build tools or dependencies are required.

## What data is saved locally
The app saves garden and plant data in your browser `localStorage`.

Storage keys:
- `nanasGardenDataV5LeftRight` (current)
- `nanasGardenDataV4`, `nanasGardenDataV3`, `nanasGardenDataV2`, and `nanasGardenData` (older app data is retained only as previous local data)

The app keeps plant placement and care data internally so Nana sees friendly words like bed, plant, spot, and garden instead of setup details.

## Known limitations
- This app uses broad, general gardening suggestions and is not plant-specific professional advice.
- Data is tied to the browser/device where it was entered (no cloud sync).
- No offline backup/export yet.

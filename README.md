# Shrine — a room of five elements

An isometric balcony-room in three.js, inspired by
[my-room-in-3d](https://github.com/brunosimon/my-room-in-3d). A desk,
a computer, a chair — and more nature than a room usually gets. Every
corner of the scene belongs to one of the five elements:

| element | larger feature | smaller feature | into the distance |
|---------|----------------|-----------------|-------------------|
| earth | balcony is not paved | rocks, plants, soil | cliff, mountain |
| water | water feature | glass of water | lake |
| fire | fireplace | lamp | sun |
| air | open windows | ducted aircon | big view |
| space | portal | pooja shrine | celestial objects |

## Run it

    npm install
    npm run dev

## Interactivity

Hover any object to see its element; click to activate it (per-element
behaviours grow from here — stoke the fire, ripple the water, open the portal).

## Stack

Vite + TypeScript + three.js. Scene lives in `src/`:
`room.ts` (shell + distance), `objects.ts` (everything in it, element-tagged),
`lighting.ts` (sun + warmth), `main.ts` (camera, interactivity, life).

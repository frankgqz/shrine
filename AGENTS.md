# Shrine — technical state

## Structure
- Vite + TypeScript + three.js (^0.180). No assets pipeline yet — all meshes
  are procedural primitives (room.ts / objects.ts / lighting.ts).
- Camera: long lens (fov 25) corner view = the isometric look; OrbitControls
  with damping + slow auto-rotate. "Isometric" is achieved with perspective,
  not ortho — matches the reference project's feel.

## Element architecture (the project's spine)
Every object group is tagged `userData: { element, label }` with element in
earth | water | fire | air | space (Frank's five-element table — see README).
Hover = label; click = activation hook (console for now). New features should
be tagged the same way so interactivity stays uniform.

## Conventions
- Build check: `npm run build` (tsc --noEmit + vite build). node_modules is
  platform-sensitive (win32 on Frank's box, linux here) — whichever side last
  ran `npm install` owns the natives.
- Roadmap = `C:\Code\⌁ docs\roadmaps\shrine.md` (Frank's; agents read-only).

# The brief (Frank 2026-10-11)

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

## Run

    npm install
    npm run dev

## Interactivity

Hover any object to see its element; click to activate it (per-element
behaviours grow from here — stoke the fire, ripple the water, open the portal).

## Stack (first pass)

Vite + TypeScript + three.js. Scene lives in `src/`:
`room.ts` (shell + distance), `objects.ts` (everything in it, element-tagged),
`lighting.ts` (sun + warmth), `main.ts` (camera, interactivity, life).

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

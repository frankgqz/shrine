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

## The placement language (Frank 2026-10-11) — how we talk about the room
The room is a 3x3x3 cube; 27 named slots. Numbering runs 1-9 within each
layer: 1 = the close right corner (away from the balcony, away from the
computer) -> 3 = toward the computer; 4-6 = the middle band (the roller wall);
7-9 = outside on the balcony. Layers: bottom = floor, mid = standing/eye,
top = high. Say "mid-5" and the position is unambiguous (src/slots.ts maps
slot names to coordinates; press G in the app to see the grid overlaid).

Camera is composed, NOT free-360 (the inspiration's feel): keys 1/2/3 jump
between three views — 1 front-on facing out, 2 from the right, 3 from the top —
each with a clamped orbit around it. New objects should be placed by slot name
in code comments (e.g. "lantern at top-5").

## Interactive objects (current, 2026-10-12)
- Sliding glass (mid-4..6 band): 4 panes, dark fresnel tint. Click choreography:
  pane 4 -> tucks into 3; pane 3 -> 3+4 stack into 1+2; pane 1/2 -> reset.
  Scene STARTS OPEN. (`glassState` in main.ts.)
- UST projector (under the projection, left wall): click = on/off. On =
  animated landscape canvas on the screen + a faint V light ray up the wall
  (FrontSide! see lessons). Screen is a blank wall when off.
- Speakers on the desk: click = music on/off (`public/audio/song.mp4`,
  Frank's track — COPYRIGHT: the repo is public, see threads).
- Wall switch (right wall): air mode cycle warm(red)/cool(blue)/still —
  vent grilles lift their blades and lights pulse with the mode.
- Second switch ABOVE the first (above the shelf): day/night (same as key L).
- Water wheel on the coffee-table fountain turns (water-driven look — the
  wheel is tucked against the rocks deliberately).
- Keys: G slot grid, L day/night, 1/2/3 composed views.
- Everything else: hover shows the element label.

## Scene map (2026-10-12, fast)
Desk zone left wall (dual monitors w/ calm VS-Code code, luxury chair, ghee
lamp, speakers, subwoofer, plants), projector wall left (screen + UST),
white fluffy L-sofa right/close + rug + fountain table, bookshelf on the
right wall (open frame, portal bay = faint breathing circles, pooja items),
balcony: wooden deck at the fire (semicircle seats), rock climb at far
left with a water sheet + pool + catchments + moss/shrubs, trees + bushy
grass + hanging herb planter, railing posts aligned to the glass mullions,
distant world = sun, twin ranges w/ snow, lake, clouds, stars.

## Rendering lessons (photo-discovered — do not re-learn)
- Textured alpha-map planes (radial-gradient puffs) DID NOT RENDER here;
  plain geometry (cylinders/cones) always did. Build effects from geometry
  first, textures as polish only.
- DoubleSide + AdditiveBlending doubles the silhouette -> bright seams
  (the white line by the screen was exactly this). Use FrontSide.
- MeshPhysicalMaterial `transmission` swallows objects INSIDE the mesh
  (the cup's water was invisible inside a solid transmissive cylinder).
  Vessels with contents: plain transparent StandardMaterial.
- Sub-objects positioned in world coords do NOT follow their group (the
  portal drifted when the shelf moved). Anchor to the group's frame.
- room.ts has NO `mesh()` helper (objects.ts only) — `new THREE.Mesh`
  there. (Bitten twice.)
- BoxGeometry's long axis is X; `lookAt` aligns -Z — swap dims for
  rail/beam runs (a rail top ended up crosswise = overhanging plank).
- Rocks: Dodecahedron detail 0 + wide jitter = crystal shards; detail 1 +
  mild jitter = boulders. Granite colors #8a8279/#948c82/#7d7770.
- Sofa cushions: check which dimension splits along the run — a swapped
  width/depth made 5.5-unit slabs jut past the backrest.
- Random-scatter placement needs explicit clamps per concern: window line,
  fire clearance, deck footprint (rocks violated all three at some point).

## Current open threads (2026-10-12)
-> Song in public/audio/ = a commercial remix; Frank's call: push, or
   gitignore + CC-licensed stand-in for the live site.
-> Flowing water v2 (the waterfall is parked): method proven = draped
   displaced sheet + scrolling canvas texture (the sheet over the rocks
   uses it now).
-> gqz Shrine card (0d14f01) committed; push deploys gqz.app (Frank's).

## Bringing in models (2026-10-12)
`src/loader.ts` = the door: `loadModel(scene, "chair.glb", { position, scale,
element, label })` with the file in `public/models/`. CC0 packs (no
attribution): Kenney.nl, Quaternius, Poly Haven. Bespoke ritual pieces stay
procedural; models are for furniture/plants/clutter.


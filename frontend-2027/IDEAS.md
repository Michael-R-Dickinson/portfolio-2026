# Portfolio 2027 — Concept Ideas

## Constraints (all concepts)
- Single route, max 3 sections (~300vh): **About → Projects → Timeline (past → future)**
- No standalone Stack section — skills appear as tags on projects / timeline entries
- Prototypes live in one Vite + React + TS + Tailwind app; switch concepts via `?v=a`, `?v=d`, etc.

## Content
- **About:** CS + Honors Math double major at UBC (grad Apr 2028). Builds autonomy and perception systems — infra + math + ML.
- **Projects:** CHI 2027 Gaussian Splatting live-reconstruction pipeline, UAS autonomy/telemetry stack, BERT + ViT multimodal research (APA award), plus 1–2 web projects (job automation platform, FasTest)
- **Timeline:** SheerID '22 → Twenty Ideas '23 → UBC UAS '24– (Software Team Lead, 4th AEAC 2026) → DevSwarm '25 → MUX Lab '26 → CHI '27 → Grad Apr '28 → target role (dashed / future)
  - Direction: autonomy / perception / robotics
  - DevSwarm stays on the site (just cut from a specific resume)
- Source of truth for experience details: latest resume (career-ops CVs) + `../frontend/src/data.ts`

## Traditional ("pre-AI feel")

### A. Split hero
- Left 1/3: name, one-line bio, links (GitHub, LinkedIn, resume), "currently" line
- Right 2/3: full-bleed photo — `aeac-2027-team-photo.jpg` (UBC UAS team at AEAC with the aircraft, 4:3 landscape; user is top-right)
  - Has a red "Me" arrow annotation — need a clean copy for the site
  - Crop/`object-position` must keep the drone + user in frame
- Projects: plain 2×2 grid. Timeline: vertical line, future entries dashed/greyed

### B. Plain document
- Serif, single narrow column, blue underlined links — old-school personal homepage
- Projects as numbered list; timeline as year | what table

### C. Terminal / monospace
- Monospace, muted palette, restrained `$ whoami`-style headers
- Timeline as `git log --graph`; future goals are unmerged branches

## 3D (three.js / react-three-fiber)

### D. Drone flythrough
- Drone hovers in hero, flies the page on scroll
- Projects revealed like aerial image frames (nod to aerial image streaming)
- Timeline = flight path over terrain; experiences are waypoints, future goals unflown waypoints

### G. SLAM reconstruction (strongest tie-in)
- Hero starts as sparse point cloud that reconstructs into a scene as you scroll
- Ideal: real Gaussian splat of user / aircraft captured with the MUX Lab pipeline, rendered via a web splat viewer
- No splat available yet → build with a stylized point cloud; swap in a real splat later
- Timeline = camera trajectory through the scene, experiences as keyframes

### I. Exploded-view drone
- Assembled drone in hero; scroll explodes it into labeled parts
- Parts map to work: radio → 10km telemetry, flight controller → ROS2–MAVLink, camera → SLAM/CV, compute → MUX Lab perception
- Projects section *is* the exploded diagram

## Drone model
- Default: procedural R3F geometry (frame, arms, motors, spinning props, GPS mast, gimbal) — no license, tiny, per-part animatable (needed for I)
- Fallbacks: [Sloyd police drone (CC BY 4.0)](https://www.sloyd.ai/free-3d-models/model/me-a-police-drone-7io0rutd), [Fab quadcopter](https://www.fab.com/listings/1ca0156f-cdb8-411e-9b3b-37ddb9439f47) (license unverified), [Poly Pizza](https://poly.pizza)
- Best case: export of UBC UAS team CAD

## Dropped
- E. Ground control station HUD
- F. Split hero with live 3D scene

## Plan
- First build: **A + D + G**; drone geometry shared between D and I
- G starts as stylized point cloud (no splat yet)

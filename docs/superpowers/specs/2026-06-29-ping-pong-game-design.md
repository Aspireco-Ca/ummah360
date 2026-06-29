# Ping Pong Game Design

Date: 2026-06-29
Project: Ummah360

## Goal

Build a standalone browser ping pong game inside this repository without changing the existing Islamic quiz card game flow. The game should be playable from its own generated page and should use the current Phaser and webpack toolchain.

## Non-Goals

- No multiplayer networking.
- No changes to the existing quiz menu, scenes, rooms, leaderboard, or backend APIs.
- No persistent scores or user accounts.
- No new art or audio dependency.

## Recommended Approach

Create a dedicated Ping Pong frontend entry that runs independently from the current quiz entrypoint. Webpack will generate a separate HTML page for it, while the existing `index.html` quiz build remains available.

This keeps the feature isolated, allows a normal `npm run build` to produce both pages, and avoids adding unrelated menu behavior to the current app.

## Gameplay

- Player paddle starts on the left.
- CPU paddle starts on the right.
- Ball starts in the center and serves toward a random side.
- First player to 7 points wins.
- After each point, the ball resets with a short pause.
- Ball speed increases gradually during rallies, capped to keep the game playable.
- Paddle hit position changes the outgoing ball angle, so edge hits are sharper than center hits.
- A restart command appears after the win state.

## Controls

- Desktop: `W` and `S`, arrow up and arrow down.
- Mobile or pointer devices: drag or hold on the court to move the player paddle toward the pointer.
- Keyboard `Space` restarts after a completed match.

## Visual Direction

Use an arcade table-tennis court style that is distinct from the Islamic quiz theme:

- Near-black court surface with restrained teal court markings.
- White center divider and boundary lines.
- Warm amber ball with a subtle glow/trail.
- Compact scoreboard at the top, sized for quick scanning.
- Minimal instructions at the bottom edge so they do not compete with the play area.

The scene should stay full-screen and responsive. Text must remain readable on mobile, and gameplay objects should use size ratios based on the viewport rather than fixed desktop-only values.

## Architecture

Files to add:

- `frontend/src/pingpong.js`: standalone Phaser bootstrap for the ping pong page.
- `frontend/src/scenes/PingPongScene.js`: gameplay scene.
- `frontend/src/styles/pingpong.css`: page-level styling for the standalone game container.
- `frontend/src/pingpong.html`: HTML template for the generated page.

Files to update:

- `webpack.config.js`: add a second entry and a second `HtmlWebpackPlugin` output for `pingpong.html`.

The existing quiz entrypoint and scene list should remain unchanged.

## Game State

`PingPongScene` owns all runtime state:

- Player score.
- CPU score.
- Ball velocity and speed tier.
- Match status: ready, playing, point pause, game over.
- Current input direction or pointer target.

State resets through scene methods rather than page reloads.

## Error Handling

- On resize, recompute court bounds, paddle sizes, score text positions, and ball reset position.
- If the browser tab loses focus, pause movement and resume cleanly when visible again.
- If Phaser fails to mount, the HTML page should still show a simple loading/fallback message from the template.

## Testing

Add focused Jest tests for pure game math helpers before implementation:

- Paddle collision angle is based on hit offset.
- Ball speed increases but does not exceed the max speed.
- Score state identifies the winner at 7 points.

Manual verification after implementation:

- Build passes with `npm run build`.
- The standalone page loads through webpack dev server.
- Keyboard and pointer controls work.
- Desktop and mobile viewport sizes remain playable.

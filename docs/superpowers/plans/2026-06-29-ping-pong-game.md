# Ping Pong Game Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Phaser ping pong game page inside the Ummah360 repository without changing the existing quiz game flow.

**Architecture:** Add a separate Phaser entrypoint and generated HTML page for ping pong. Keep core ball and scoring math in a CommonJS helper so Jest can test it without changing the existing project module setup. The Phaser scene becomes the rendering and input adapter around those tested rules.

**Tech Stack:** JavaScript, Phaser 3.70, webpack 5, HtmlWebpackPlugin, Jest 29.

## Global Constraints

- Build a standalone browser ping pong game inside this repository without changing the existing Islamic quiz card game flow.
- Use the current Phaser and webpack toolchain.
- No multiplayer networking.
- No changes to the existing quiz menu, scenes, rooms, leaderboard, or backend APIs.
- No persistent scores or user accounts.
- No new art or audio dependency.
- First player to 7 points wins.
- Desktop controls are `W`, `S`, arrow up, and arrow down.
- Mobile or pointer controls use drag or hold on the court to move the player paddle toward the pointer.
- Keyboard `Space` restarts after a completed match.
- Visual direction is a near-black court surface, restrained teal markings, white divider and boundary lines, warm amber glowing ball, compact scoreboard, and minimal instructions.
- Text must remain readable on mobile.
- Gameplay objects must use size ratios based on the viewport rather than fixed desktop-only values.
- Add focused Jest tests for pure game math helpers before implementation.

---

## File Structure

- Create `frontend/src/game/pingPongMath.js`: pure game rule helpers for bounce angles, speed caps, winner detection, and responsive layout values.
- Create `frontend/src/game/pingPongMath.test.js`: Jest tests for pure helper behavior.
- Create `frontend/src/scenes/PingPongScene.js`: standalone Phaser scene for court rendering, controls, CPU paddle, scoring, resize behavior, and match restart.
- Create `frontend/src/pingpong.js`: Phaser bootstrap for the standalone ping pong page.
- Create `frontend/src/styles/pingpong.css`: page-level fullscreen styling and fallback message styling.
- Create `frontend/src/pingpong.html`: HTML template for the generated ping pong page.
- Modify `webpack.config.js`: keep the existing quiz bundle output as `bundle.js`, add a `pingpong.bundle.js` entry, and generate `pingpong.html`.

---

### Task 1: Ping Pong Rule Helpers

**Files:**
- Create: `frontend/src/game/pingPongMath.test.js`
- Create: `frontend/src/game/pingPongMath.js`

**Interfaces:**
- Produces: `calculateBounceVelocity({ hitY, paddleCenterY, paddleHeight, directionX, speed }): { x, y }`
- Produces: `increaseBallSpeed(currentSpeed, increment, maxSpeed): number`
- Produces: `getWinner(playerScore, cpuScore, targetScore): 'player' | 'cpu' | null`
- Produces: `createCourtLayout(width, height): object`
- Produces: `clamp(value, min, max): number`

- [ ] **Step 1: Write the failing helper tests**

Create `frontend/src/game/pingPongMath.test.js`:

```javascript
const {
  calculateBounceVelocity,
  increaseBallSpeed,
  getWinner,
  createCourtLayout
} = require('./pingPongMath');

describe('ping pong rule helpers', () => {
  test('paddle hit offset controls outgoing ball angle', () => {
    const centerHit = calculateBounceVelocity({
      hitY: 100,
      paddleCenterY: 100,
      paddleHeight: 100,
      directionX: 1,
      speed: 400
    });

    const topEdgeHit = calculateBounceVelocity({
      hitY: 50,
      paddleCenterY: 100,
      paddleHeight: 100,
      directionX: 1,
      speed: 400
    });

    const bottomEdgeHit = calculateBounceVelocity({
      hitY: 150,
      paddleCenterY: 100,
      paddleHeight: 100,
      directionX: -1,
      speed: 400
    });

    expect(centerHit.x).toBeGreaterThan(399);
    expect(Math.abs(centerHit.y)).toBeLessThan(1);
    expect(topEdgeHit.x).toBeGreaterThan(0);
    expect(topEdgeHit.y).toBeLessThan(0);
    expect(bottomEdgeHit.x).toBeLessThan(0);
    expect(bottomEdgeHit.y).toBeGreaterThan(0);
  });

  test('ball speed increases without exceeding max speed', () => {
    expect(increaseBallSpeed(400, 25, 760)).toBe(425);
    expect(increaseBallSpeed(750, 25, 760)).toBe(760);
  });

  test('winner is identified only when a player reaches the target score', () => {
    expect(getWinner(6, 2, 7)).toBeNull();
    expect(getWinner(7, 2, 7)).toBe('player');
    expect(getWinner(3, 7, 7)).toBe('cpu');
  });

  test('responsive layout keeps court and game objects inside a mobile viewport', () => {
    const layout = createCourtLayout(390, 844);

    expect(layout.court.x).toBeGreaterThanOrEqual(18);
    expect(layout.court.y).toBeGreaterThanOrEqual(78);
    expect(layout.court.x + layout.court.width).toBeLessThanOrEqual(390);
    expect(layout.court.y + layout.court.height).toBeLessThanOrEqual(844);
    expect(layout.paddleHeight).toBeGreaterThanOrEqual(76);
    expect(layout.ballRadius).toBeGreaterThanOrEqual(6);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
npm test -- frontend/src/game/pingPongMath.test.js --runInBand
```

Expected: FAIL with a module resolution error for `./pingPongMath`.

- [ ] **Step 3: Write the minimal helper implementation**

Create `frontend/src/game/pingPongMath.js`:

```javascript
const MAX_BOUNCE_ANGLE = Math.PI / 3;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function calculateBounceVelocity({ hitY, paddleCenterY, paddleHeight, directionX, speed }) {
  const halfPaddle = paddleHeight / 2;
  const normalizedOffset = halfPaddle === 0
    ? 0
    : clamp((hitY - paddleCenterY) / halfPaddle, -1, 1);
  const angle = normalizedOffset * MAX_BOUNCE_ANGLE;
  const xDirection = directionX < 0 ? -1 : 1;

  return {
    x: Math.cos(angle) * speed * xDirection,
    y: Math.sin(angle) * speed
  };
}

function increaseBallSpeed(currentSpeed, increment = 22, maxSpeed = 760) {
  return Math.min(currentSpeed + increment, maxSpeed);
}

function getWinner(playerScore, cpuScore, targetScore = 7) {
  if (playerScore >= targetScore) {
    return 'player';
  }

  if (cpuScore >= targetScore) {
    return 'cpu';
  }

  return null;
}

function createCourtLayout(width, height) {
  const safeWidth = Math.max(width, 320);
  const safeHeight = Math.max(height, 480);
  const marginX = clamp(safeWidth * 0.055, 18, 58);
  const top = clamp(safeHeight * 0.14, 78, 124);
  const bottom = clamp(safeHeight * 0.1, 58, 92);
  const sideGap = clamp(safeWidth * 0.042, 24, 50);
  const court = {
    x: marginX,
    y: top,
    width: safeWidth - marginX * 2,
    height: safeHeight - top - bottom
  };

  return {
    court,
    paddleWidth: clamp(safeWidth * 0.018, 10, 18),
    paddleHeight: clamp(court.height * 0.2, 76, 148),
    ballRadius: clamp(Math.min(safeWidth, safeHeight) * 0.015, 6, 13),
    playerPaddleX: court.x + sideGap,
    cpuPaddleX: court.x + court.width - sideGap,
    paddleSpeed: clamp(safeHeight * 0.82, 420, 780),
    baseBallSpeed: clamp(safeWidth * 0.55, 330, 430),
    maxBallSpeed: clamp(safeWidth * 0.94, 620, 820),
    scoreFont: `${Math.round(clamp(safeWidth * 0.095, 34, 76))}px`,
    labelFont: `${Math.round(clamp(safeWidth * 0.032, 12, 18))}px`
  };
}

module.exports = {
  calculateBounceVelocity,
  increaseBallSpeed,
  getWinner,
  createCourtLayout,
  clamp
};
```

- [ ] **Step 4: Run the helper tests to verify they pass**

Run:

```bash
npm test -- frontend/src/game/pingPongMath.test.js --runInBand
```

Expected: PASS with 4 passing tests.

- [ ] **Step 5: Commit Task 1**

Run:

```bash
git add frontend/src/game/pingPongMath.js frontend/src/game/pingPongMath.test.js
git commit -m "Add ping pong rule helpers"
```

---

### Task 2: Standalone Phaser Scene

**Files:**
- Create: `frontend/src/scenes/PingPongScene.js`
- Test: `frontend/src/game/pingPongMath.test.js`

**Interfaces:**
- Consumes: `calculateBounceVelocity`, `increaseBallSpeed`, `getWinner`, `createCourtLayout`, and `clamp` from `frontend/src/game/pingPongMath.js`
- Produces: Phaser scene class `PingPongScene` with scene key `PingPongScene`

- [ ] **Step 1: Confirm the rule tests are green before adding the scene**

Run:

```bash
npm test -- frontend/src/game/pingPongMath.test.js --runInBand
```

Expected: PASS with 4 passing tests.

- [ ] **Step 2: Create the Phaser scene**

Create `frontend/src/scenes/PingPongScene.js`:

```javascript
import Phaser from 'phaser';
import pingPongMath from '../game/pingPongMath';

const {
  calculateBounceVelocity,
  increaseBallSpeed,
  getWinner,
  createCourtLayout,
  clamp
} = pingPongMath;

const TARGET_SCORE = 7;
const POINT_PAUSE_MS = 850;

class PingPongScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PingPongScene' });
    this.layout = null;
    this.playerScore = 0;
    this.cpuScore = 0;
    this.ballSpeed = 0;
    this.ballVelocity = { x: 0, y: 0 };
    this.matchStatus = 'ready';
    this.pointerTargetY = null;
    this.wasPlayingBeforeHidden = false;
    this.trailPoints = [];
  }

  create() {
    this.layout = createCourtLayout(this.cameras.main.width, this.cameras.main.height);
    this.createCourt();
    this.createActors();
    this.createHud();
    this.setupInput();
    this.setupLifecycle();
    this.resetMatch();
    this.startRound(500);
  }

  createCourt() {
    this.background = this.add.rectangle(0, 0, 1, 1, 0x041315).setOrigin(0);
    this.courtGraphics = this.add.graphics();
    this.trailGraphics = this.add.graphics();
    this.redrawCourt();
  }

  redrawCourt() {
    const { court } = this.layout;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.background.setDisplaySize(width, height);
    this.courtGraphics.clear();
    this.courtGraphics.fillStyle(0x071f22, 1);
    this.courtGraphics.fillRoundedRect(court.x, court.y, court.width, court.height, 10);
    this.courtGraphics.lineStyle(2, 0x58d8c4, 0.72);
    this.courtGraphics.strokeRoundedRect(court.x, court.y, court.width, court.height, 10);
    this.courtGraphics.lineStyle(1, 0xe8fbff, 0.55);
    this.courtGraphics.lineBetween(court.x + court.width / 2, court.y, court.x + court.width / 2, court.y + court.height);

    for (let y = court.y + 18; y < court.y + court.height - 18; y += 30) {
      this.courtGraphics.fillStyle(0xe8fbff, 0.28);
      this.courtGraphics.fillRect(court.x + court.width / 2 - 2, y, 4, 14);
    }
  }

  createActors() {
    this.playerPaddle = this.add.rectangle(0, 0, 1, 1, 0xe8fbff, 1);
    this.cpuPaddle = this.add.rectangle(0, 0, 1, 1, 0x58d8c4, 1);
    this.ballGlow = this.add.circle(0, 0, 1, 0xffb84d, 0.22);
    this.ball = this.add.circle(0, 0, 1, 0xffc861, 1);
    this.positionActors(false);
  }

  createHud() {
    this.scoreText = this.add.text(0, 0, '', {
      fontFamily: 'Verdana, Arial, sans-serif',
      fontStyle: 'bold',
      color: '#f5fbff',
      align: 'center'
    }).setOrigin(0.5);

    this.statusText = this.add.text(0, 0, '', {
      fontFamily: 'Verdana, Arial, sans-serif',
      color: '#bdeee7',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5);

    this.hintText = this.add.text(0, 0, 'W/S or arrows to move. Drag on touch. First to 7 wins.', {
      fontFamily: 'Verdana, Arial, sans-serif',
      color: '#83aaa9',
      align: 'center'
    }).setOrigin(0.5);

    this.positionHud();
    this.updateScoreText();
  }

  setupInput() {
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });

    this.input.on('pointerdown', (pointer) => {
      if (this.matchStatus === 'gameOver') {
        this.restartMatch();
        return;
      }

      this.pointerTargetY = pointer.y;
    });

    this.input.on('pointermove', (pointer) => {
      if (pointer.isDown) {
        this.pointerTargetY = pointer.y;
      }
    });

    this.input.on('pointerup', () => {
      this.pointerTargetY = null;
    });
  }

  setupLifecycle() {
    this.scale.on('resize', this.handleResize, this);
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.pauseForVisibility, this);
    this.game.events.on(Phaser.Core.Events.VISIBLE, this.resumeFromVisibility, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.teardownLifecycle, this);
  }

  teardownLifecycle() {
    this.scale.off('resize', this.handleResize, this);
    this.game.events.off(Phaser.Core.Events.HIDDEN, this.pauseForVisibility, this);
    this.game.events.off(Phaser.Core.Events.VISIBLE, this.resumeFromVisibility, this);
  }

  resetMatch() {
    this.playerScore = 0;
    this.cpuScore = 0;
    this.updateScoreText();
    this.resetBall();
    this.matchStatus = 'ready';
  }

  restartMatch() {
    this.resetMatch();
    this.startRound(350);
  }

  startRound(delay = 0) {
    this.matchStatus = 'pointPause';
    this.statusText.setText('Get ready');
    this.resetBall();
    this.time.delayedCall(delay, () => this.serveBall());
  }

  serveBall() {
    if (this.matchStatus === 'gameOver') {
      return;
    }

    const directionX = Math.random() < 0.5 ? -1 : 1;
    const angle = Phaser.Math.FloatBetween(-0.28, 0.28);
    this.ballSpeed = this.layout.baseBallSpeed;
    this.ballVelocity = {
      x: Math.cos(angle) * this.ballSpeed * directionX,
      y: Math.sin(angle) * this.ballSpeed
    };
    this.statusText.setText('');
    this.matchStatus = 'playing';
  }

  resetBall() {
    const { court } = this.layout;
    this.ballSpeed = this.layout.baseBallSpeed;
    this.ballVelocity = { x: 0, y: 0 };
    this.ball.setPosition(court.x + court.width / 2, court.y + court.height / 2);
    this.ballGlow.setPosition(this.ball.x, this.ball.y);
    this.trailPoints = [];
    this.redrawTrail();
  }

  handleResize(gameSize) {
    this.layout = createCourtLayout(gameSize.width, gameSize.height);
    this.redrawCourt();
    this.positionActors(true);
    this.positionHud();
  }

  positionActors(keepBallPosition) {
    const { court } = this.layout;
    this.playerPaddle
      .setDisplaySize(this.layout.paddleWidth, this.layout.paddleHeight)
      .setPosition(this.layout.playerPaddleX, clamp(this.playerPaddle.y || court.y + court.height / 2, court.y + this.layout.paddleHeight / 2, court.y + court.height - this.layout.paddleHeight / 2));

    this.cpuPaddle
      .setDisplaySize(this.layout.paddleWidth, this.layout.paddleHeight)
      .setPosition(this.layout.cpuPaddleX, clamp(this.cpuPaddle.y || court.y + court.height / 2, court.y + this.layout.paddleHeight / 2, court.y + court.height - this.layout.paddleHeight / 2));

    this.ball.setRadius(this.layout.ballRadius);
    this.ballGlow.setRadius(this.layout.ballRadius * 2.4);

    if (!keepBallPosition || this.matchStatus !== 'playing') {
      this.resetBall();
    } else {
      this.ball.setPosition(
        clamp(this.ball.x, court.x + this.layout.ballRadius, court.x + court.width - this.layout.ballRadius),
        clamp(this.ball.y, court.y + this.layout.ballRadius, court.y + court.height - this.layout.ballRadius)
      );
      this.ballGlow.setPosition(this.ball.x, this.ball.y);
    }
  }

  positionHud() {
    const { court } = this.layout;
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    this.scoreText
      .setFontSize(this.layout.scoreFont)
      .setPosition(width / 2, court.y * 0.52);

    this.statusText
      .setFontSize(Math.round(clamp(width * 0.036, 15, 24)))
      .setPosition(width / 2, court.y + court.height / 2);

    this.hintText
      .setFontSize(this.layout.labelFont)
      .setWordWrapWidth(width - 40)
      .setPosition(width / 2, height - 28);
  }

  update(time, delta) {
    if (this.keys.space && Phaser.Input.Keyboard.JustDown(this.keys.space) && this.matchStatus === 'gameOver') {
      this.restartMatch();
      return;
    }

    if (this.matchStatus !== 'playing') {
      return;
    }

    const dt = delta / 1000;
    this.updatePlayerPaddle(dt);
    this.updateCpuPaddle(dt);
    this.updateBall(dt);
    this.recordTrailPoint();
    this.redrawTrail();
  }

  updatePlayerPaddle(dt) {
    const { court } = this.layout;
    const minY = court.y + this.layout.paddleHeight / 2;
    const maxY = court.y + court.height - this.layout.paddleHeight / 2;
    const upPressed = this.keys.up.isDown || this.keys.w.isDown;
    const downPressed = this.keys.down.isDown || this.keys.s.isDown;
    const keyboardDirection = (downPressed ? 1 : 0) - (upPressed ? 1 : 0);

    if (keyboardDirection !== 0) {
      this.playerPaddle.y = clamp(
        this.playerPaddle.y + keyboardDirection * this.layout.paddleSpeed * dt,
        minY,
        maxY
      );
      return;
    }

    if (this.pointerTargetY !== null) {
      const maxStep = this.layout.paddleSpeed * dt;
      const diff = this.pointerTargetY - this.playerPaddle.y;
      this.playerPaddle.y = clamp(
        this.playerPaddle.y + clamp(diff, -maxStep, maxStep),
        minY,
        maxY
      );
    }
  }

  updateCpuPaddle(dt) {
    const { court } = this.layout;
    const minY = court.y + this.layout.paddleHeight / 2;
    const maxY = court.y + court.height - this.layout.paddleHeight / 2;
    const targetY = this.ballVelocity.x > 0
      ? this.ball.y
      : court.y + court.height / 2;
    const maxStep = this.layout.paddleSpeed * 0.78 * dt;

    this.cpuPaddle.y = clamp(
      this.cpuPaddle.y + clamp(targetY - this.cpuPaddle.y, -maxStep, maxStep),
      minY,
      maxY
    );
  }

  updateBall(dt) {
    const { court } = this.layout;
    const radius = this.layout.ballRadius;

    this.ball.x += this.ballVelocity.x * dt;
    this.ball.y += this.ballVelocity.y * dt;

    if (this.ball.y - radius <= court.y) {
      this.ball.y = court.y + radius;
      this.ballVelocity.y = Math.abs(this.ballVelocity.y);
    } else if (this.ball.y + radius >= court.y + court.height) {
      this.ball.y = court.y + court.height - radius;
      this.ballVelocity.y = -Math.abs(this.ballVelocity.y);
    }

    if (this.ballVelocity.x < 0 && this.isCollidingWithPaddle(this.playerPaddle)) {
      this.bounceFromPaddle(this.playerPaddle, 1);
    } else if (this.ballVelocity.x > 0 && this.isCollidingWithPaddle(this.cpuPaddle)) {
      this.bounceFromPaddle(this.cpuPaddle, -1);
    }

    this.ballGlow.setPosition(this.ball.x, this.ball.y);

    if (this.ball.x + radius < court.x) {
      this.awardPoint('cpu');
    } else if (this.ball.x - radius > court.x + court.width) {
      this.awardPoint('player');
    }
  }

  isCollidingWithPaddle(paddle) {
    return Math.abs(this.ball.x - paddle.x) <= this.layout.paddleWidth / 2 + this.layout.ballRadius
      && Math.abs(this.ball.y - paddle.y) <= this.layout.paddleHeight / 2 + this.layout.ballRadius;
  }

  bounceFromPaddle(paddle, directionX) {
    this.ballSpeed = increaseBallSpeed(this.ballSpeed, 24, this.layout.maxBallSpeed);
    this.ballVelocity = calculateBounceVelocity({
      hitY: this.ball.y,
      paddleCenterY: paddle.y,
      paddleHeight: this.layout.paddleHeight,
      directionX,
      speed: this.ballSpeed
    });
    this.ball.x = paddle.x + directionX * (this.layout.paddleWidth / 2 + this.layout.ballRadius + 1);
    this.cameras.main.shake(55, 0.002);
  }

  awardPoint(scoringSide) {
    if (this.matchStatus !== 'playing') {
      return;
    }

    if (scoringSide === 'player') {
      this.playerScore += 1;
    } else {
      this.cpuScore += 1;
    }

    this.updateScoreText();

    const winner = getWinner(this.playerScore, this.cpuScore, TARGET_SCORE);
    if (winner) {
      this.finishMatch(winner);
      return;
    }

    this.startRound(POINT_PAUSE_MS);
  }

  finishMatch(winner) {
    this.matchStatus = 'gameOver';
    this.ballVelocity = { x: 0, y: 0 };
    this.statusText.setText(winner === 'player'
      ? 'You win\nPress Space or tap to restart'
      : 'CPU wins\nPress Space or tap to restart');
  }

  updateScoreText() {
    if (this.scoreText) {
      this.scoreText.setText(`${this.playerScore}  ${this.cpuScore}`);
    }
  }

  recordTrailPoint() {
    this.trailPoints.push({ x: this.ball.x, y: this.ball.y });

    if (this.trailPoints.length > 12) {
      this.trailPoints.shift();
    }
  }

  redrawTrail() {
    if (!this.trailGraphics) {
      return;
    }

    this.trailGraphics.clear();
    this.trailPoints.forEach((point, index) => {
      const alpha = (index + 1) / this.trailPoints.length;
      this.trailGraphics.fillStyle(0xffb84d, alpha * 0.18);
      this.trailGraphics.fillCircle(point.x, point.y, this.layout.ballRadius * alpha * 1.9);
    });
  }

  pauseForVisibility() {
    this.wasPlayingBeforeHidden = this.matchStatus === 'playing';
    if (this.wasPlayingBeforeHidden) {
      this.matchStatus = 'paused';
      this.statusText.setText('Paused');
    }
  }

  resumeFromVisibility() {
    if (this.matchStatus === 'paused' && this.wasPlayingBeforeHidden) {
      this.matchStatus = 'playing';
      this.statusText.setText('');
    }
  }
}

export default PingPongScene;
```

- [ ] **Step 3: Run the helper tests after adding the scene**

Run:

```bash
npm test -- frontend/src/game/pingPongMath.test.js --runInBand
```

Expected: PASS with 4 passing tests.

- [ ] **Step 4: Commit Task 2**

Run:

```bash
git add frontend/src/scenes/PingPongScene.js frontend/src/game/pingPongMath.js frontend/src/game/pingPongMath.test.js
git commit -m "Add standalone ping pong scene"
```

---

### Task 3: Ping Pong Entry, HTML, and Styles

**Files:**
- Create: `frontend/src/pingpong.js`
- Create: `frontend/src/pingpong.html`
- Create: `frontend/src/styles/pingpong.css`
- Test: `frontend/src/game/pingPongMath.test.js`

**Interfaces:**
- Consumes: `PingPongScene` from `frontend/src/scenes/PingPongScene.js`
- Produces: DOM mount target `#pingpong-container`

- [ ] **Step 1: Confirm tests are green before adding the page entry**

Run:

```bash
npm test -- frontend/src/game/pingPongMath.test.js --runInBand
```

Expected: PASS with 4 passing tests.

- [ ] **Step 2: Create the standalone entrypoint**

Create `frontend/src/pingpong.js`:

```javascript
import Phaser from 'phaser';
import './styles/pingpong.css';
import PingPongScene from './scenes/PingPongScene';

function createGameConfig() {
  return {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'pingpong-container',
    backgroundColor: '#041315',
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      min: {
        width: 320,
        height: 480
      },
      max: {
        width: 1920,
        height: 1080
      }
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false
    },
    input: {
      activePointers: 1,
      smoothFactor: 0.2
    },
    scene: [PingPongScene]
  };
}

function mountPingPongGame() {
  const container = document.getElementById('pingpong-container');

  if (!container) {
    return;
  }

  container.innerHTML = '';
  const game = new Phaser.Game(createGameConfig());
  window.pingPongGame = game;

  window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
  });

  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });
}

document.addEventListener('DOMContentLoaded', mountPingPongGame);
```

- [ ] **Step 3: Create the HTML template**

Create `frontend/src/pingpong.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Ping Pong | Ummah360</title>
</head>
<body>
  <main id="pingpong-container" aria-label="Ping pong game">
    <div class="fallback-message">Loading Ping Pong...</div>
  </main>
</body>
</html>
```

- [ ] **Step 4: Create the page styles**

Create `frontend/src/styles/pingpong.css`:

```css
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: #041315;
  color: #f5fbff;
  font-family: Verdana, Arial, sans-serif;
  touch-action: none;
}

* {
  box-sizing: border-box;
}

#pingpong-container {
  width: 100vw;
  height: 100vh;
  min-width: 320px;
  min-height: 480px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 25%, rgba(88, 216, 196, 0.14), transparent 34%),
    #041315;
}

#pingpong-container canvas {
  display: block;
  width: 100%;
  height: 100%;
}

.fallback-message {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  color: #bdeee7;
  font-size: 16px;
  text-align: center;
}
```

- [ ] **Step 5: Run tests after adding the page files**

Run:

```bash
npm test -- frontend/src/game/pingPongMath.test.js --runInBand
```

Expected: PASS with 4 passing tests.

- [ ] **Step 6: Commit Task 3**

Run:

```bash
git add frontend/src/pingpong.js frontend/src/pingpong.html frontend/src/styles/pingpong.css
git commit -m "Add ping pong standalone page"
```

---

### Task 4: Webpack Multi-Page Build

**Files:**
- Modify: `webpack.config.js`
- Test: `frontend/src/game/pingPongMath.test.js`

**Interfaces:**
- Consumes: `frontend/src/index.js` as entry `main`
- Consumes: `frontend/src/pingpong.js` as entry `pingpong`
- Produces: `frontend/dist/index.html`
- Produces: `frontend/dist/bundle.js`
- Produces: `frontend/dist/pingpong.html`
- Produces: `frontend/dist/pingpong.bundle.js`

- [ ] **Step 1: Confirm tests are green before changing webpack**

Run:

```bash
npm test -- frontend/src/game/pingPongMath.test.js --runInBand
```

Expected: PASS with 4 passing tests.

- [ ] **Step 2: Update webpack config**

Replace `webpack.config.js` with:

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    main: './frontend/src/index.js',
    pingpong: './frontend/src/pingpong.js'
  },
  output: {
    path: path.resolve(__dirname, 'frontend/dist'),
    filename: (pathData) => (
      pathData.chunk && pathData.chunk.name === 'main'
        ? 'bundle.js'
        : '[name].bundle.js'
    ),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|mp3|ogg|wav)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './frontend/src/index.html',
      filename: 'index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: './frontend/src/pingpong.html',
      filename: 'pingpong.html',
      chunks: ['pingpong']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './frontend/assets', to: 'assets', noErrorOnMissing: true }
      ]
    })
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'frontend/dist')
    },
    compress: true,
    port: 8080,
    open: true,
    hot: true
  },
  mode: 'development'
};
```

- [ ] **Step 3: Run tests after the webpack change**

Run:

```bash
npm test -- frontend/src/game/pingPongMath.test.js --runInBand
```

Expected: PASS with 4 passing tests.

- [ ] **Step 4: Run the production build**

Run:

```bash
npm run build
```

Expected: PASS. Output includes `frontend/dist/index.html`, `frontend/dist/bundle.js`, `frontend/dist/pingpong.html`, and `frontend/dist/pingpong.bundle.js`.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add webpack.config.js frontend/dist
git commit -m "Build ping pong as standalone page"
```

---

### Task 5: Browser Verification and Final Adjustments

**Files:**
- Modify only files from Tasks 1-4 if verification exposes a concrete issue.
- Test: `frontend/src/game/pingPongMath.test.js`

**Interfaces:**
- Verifies: `http://localhost:8080/pingpong.html`
- Verifies: `http://localhost:8080/index.html`

- [ ] **Step 1: Start the webpack dev server**

Run:

```bash
npm run dev-frontend
```

Expected: webpack dev server starts on `http://localhost:8080/`.

- [ ] **Step 2: Verify the ping pong page in a desktop viewport**

Open:

```text
http://localhost:8080/pingpong.html
```

Expected:
- The page shows the ping pong court, two paddles, ball, score, and bottom control hint.
- `W`, `S`, arrow up, and arrow down move the left paddle.
- The CPU paddle follows the ball.
- The ball bounces off paddles and top and bottom court edges.
- Scores update when the ball exits the left or right side.
- At 7 points, the game shows a win message and restart instruction.
- Pressing `Space` after match end restarts the score at `0  0`.

- [ ] **Step 3: Verify the ping pong page in a mobile viewport**

Use browser device emulation at `390x844`.

Expected:
- The score, status text, and control hint fit without overlapping the court.
- Dragging or holding on the court moves the player paddle toward the pointer.
- The ball and paddles remain inside the visible court.

- [ ] **Step 4: Verify the existing quiz page still builds and loads**

Open:

```text
http://localhost:8080/index.html
```

Expected:
- The existing quiz app still mounts from the generated `index.html`.
- The ping pong bundle is not loaded by `index.html`.

- [ ] **Step 5: Run the final automated checks**

Run:

```bash
npm test -- frontend/src/game/pingPongMath.test.js --runInBand
npm run build
```

Expected: both commands pass.

- [ ] **Step 6: Commit verification adjustments**

If verification required edits, run:

```bash
git add frontend/src/game frontend/src/scenes/PingPongScene.js frontend/src/pingpong.js frontend/src/pingpong.html frontend/src/styles/pingpong.css webpack.config.js frontend/dist
git commit -m "Polish ping pong verification issues"
```

If verification required no edits, do not create an empty commit.

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const homeScoreEl = document.getElementById('homeScore');
  const awayScoreEl = document.getElementById('awayScore');
  const clockEl = document.getElementById('clock');
  const messageEl = document.getElementById('message');
  const restartButton = document.getElementById('restartButton');
  const gameShell = document.getElementById('gameShell');
  const startButton = document.getElementById('startButton');
  const soundButton = document.getElementById('soundButton');

  const keys = new Set();
  const pressed = {
    left: false,
    right: false,
    jump: false,
    kick: false
  };

  const state = {
    width: 0,
    height: 0,
    scale: 1,
    groundY: 0,
    leftGoalX: 0,
    rightGoalX: 0,
    goalTop: 0,
    goalBottom: 0,
    matchSeconds: 90,
    clock: 90,
    score: { home: 0, away: 0 },
    mode: 'menu',
    running: false,
    pausedForGoal: 0,
    particles: [],
    cameraShake: 0,
    lastTime: performance.now()
  };

  const home = createPlayer({
    side: 'home',
    name: 'HOME',
    colors: ['#4cc9f0', '#1d6fff'],
    skin: '#f4b382',
    hair: '#1f2a44'
  });

  const away = createPlayer({
    side: 'away',
    name: 'CPU',
    colors: ['#ff4d8d', '#8b2cff'],
    skin: '#c47a45',
    hair: '#3a1c16'
  });

  const ball = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: 20,
    spin: 0
  };

  const audio = {
    context: null,
    enabled: true,
    menuTimer: null,
    lastTap: 0
  };

  function createPlayer(config) {
    return {
      ...config,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      width: 48,
      height: 92,
      headRadius: 34,
      footReach: 58,
      facing: config.side === 'home' ? 1 : -1,
      onGround: false,
      kickCooldown: 0,
      jumpGrace: 0
    };
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = Math.max(320, window.innerWidth);
    state.height = Math.max(480, window.innerHeight);
    state.scale = Math.min(state.width / 960, state.height / 540);
    canvas.width = Math.floor(state.width * dpr);
    canvas.height = Math.floor(state.height * dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    state.groundY = state.height - Math.max(96, state.height * 0.18);
    state.leftGoalX = Math.max(18, state.width * 0.045);
    state.rightGoalX = state.width - state.leftGoalX;
    state.goalTop = state.groundY - Math.max(125, state.height * 0.28);
    state.goalBottom = state.groundY - 8;

    const playerScale = clamp(state.scale, 0.68, 1.2);
    [home, away].forEach((player) => {
      player.width = 46 * playerScale;
      player.height = 94 * playerScale;
      player.headRadius = 35 * playerScale;
      player.footReach = 62 * playerScale;
    });

    ball.radius = clamp(Math.min(state.width, state.height) * 0.034, 15, 24);
    placeActors();
  }

  function placeActors() {
    home.x = state.width * 0.26;
    away.x = state.width * 0.74;
    home.y = state.groundY;
    away.y = state.groundY;
    home.vx = 0;
    away.vx = 0;
    home.vy = 0;
    away.vy = 0;
    home.facing = 1;
    away.facing = -1;
    resetBall(Math.random() < 0.5 ? -1 : 1);
  }

  function resetBall(direction = 1) {
    ball.x = state.width / 2;
    ball.y = state.goalTop + (state.goalBottom - state.goalTop) * 0.32;
    ball.vx = direction * state.width * 0.16;
    ball.vy = -state.height * 0.08;
    ball.spin = 0;
  }

  function resetMatch() {
    state.score.home = 0;
    state.score.away = 0;
    state.clock = state.matchSeconds;
    state.mode = 'playing';
    state.running = true;
    state.pausedForGoal = 0;
    state.particles = [];
    state.cameraShake = 0;
    placeActors();
    gameShell.classList.remove('is-menu');
    showMessage('Headshots', 'Score more before the clock runs out.', 1600);
    syncHud();
  }

  function showMainMenu() {
    state.mode = 'menu';
    state.running = false;
    state.clock = state.matchSeconds;
    gameShell.classList.add('is-menu');
    showMessage('Headshots', 'Score more before the clock runs out.', 0);
    syncHud();
  }

  function startMatch() {
    unlockAudio();
    stopMenuLoop();
    playSound('start');
    resetMatch();
  }

  function syncHud() {
    homeScoreEl.textContent = state.score.home;
    awayScoreEl.textContent = state.score.away;
    clockEl.textContent = Math.max(0, Math.ceil(state.clock));
  }

  function showMessage(title, copy, duration = 1200) {
    messageEl.innerHTML = `<strong>${title}</strong><span>${copy}</span>`;
    messageEl.classList.add('is-visible');

    if (duration > 0) {
      window.clearTimeout(showMessage.timer);
      showMessage.timer = window.setTimeout(() => {
        messageEl.classList.remove('is-visible');
      }, duration);
    }
  }

  function unlockAudio() {
    if (!audio.enabled) {
      return;
    }

    if (!audio.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        audio.enabled = false;
        soundButton.textContent = 'No Sound';
        soundButton.setAttribute('aria-pressed', 'false');
        return;
      }
      audio.context = new AudioContext();
    }

    if (audio.context.state === 'suspended') {
      audio.context.resume();
    }
  }

  function playTone(frequency, duration, type = 'square', gain = 0.07, delay = 0) {
    if (!audio.enabled || !audio.context) {
      return;
    }

    const now = audio.context.currentTime + delay;
    const oscillator = audio.context.createOscillator();
    const volume = audio.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    volume.gain.setValueAtTime(0, now);
    volume.gain.linearRampToValueAtTime(gain, now + 0.012);
    volume.gain.exponentialRampToValueAtTime(0.001, now + duration);
    oscillator.connect(volume);
    volume.connect(audio.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  function playNoise(duration = 0.18, gain = 0.08) {
    if (!audio.enabled || !audio.context) {
      return;
    }

    const length = Math.floor(audio.context.sampleRate * duration);
    const buffer = audio.context.createBuffer(1, length, audio.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    }
    const source = audio.context.createBufferSource();
    const volume = audio.context.createGain();
    source.buffer = buffer;
    volume.gain.value = gain;
    source.connect(volume);
    volume.connect(audio.context.destination);
    source.start();
  }

  function playSound(name) {
    if (!audio.enabled) {
      return;
    }

    unlockAudio();
    if (!audio.context) {
      return;
    }

    if (name === 'menu') {
      playTone(392, 0.07, 'triangle', 0.035);
      playTone(587, 0.08, 'triangle', 0.03, 0.09);
    } else if (name === 'start') {
      playTone(294, 0.08, 'square', 0.055);
      playTone(440, 0.08, 'square', 0.055, 0.09);
      playTone(880, 0.18, 'triangle', 0.07, 0.18);
    } else if (name === 'jump') {
      playTone(520, 0.08, 'sine', 0.04);
      playTone(780, 0.1, 'sine', 0.035, 0.05);
    } else if (name === 'kick') {
      playNoise(0.08, 0.07);
      playTone(130, 0.09, 'sawtooth', 0.08);
    } else if (name === 'goal') {
      playNoise(0.28, 0.12);
      playTone(523, 0.1, 'square', 0.06);
      playTone(659, 0.1, 'square', 0.06, 0.1);
      playTone(784, 0.24, 'square', 0.07, 0.2);
    } else if (name === 'tap') {
      const now = performance.now();
      if (now - audio.lastTap > 80) {
        audio.lastTap = now;
        playTone(720, 0.045, 'triangle', 0.025);
      }
    }
  }

  function startMenuLoop() {
    if (!audio.enabled || audio.menuTimer) {
      return;
    }

    audio.menuTimer = window.setInterval(() => {
      if (state.mode === 'menu') {
        playSound('menu');
      }
    }, 1050);
  }

  function stopMenuLoop() {
    if (audio.menuTimer) {
      window.clearInterval(audio.menuTimer);
      audio.menuTimer = null;
    }
  }

  function update(time) {
    const dt = Math.min((time - state.lastTime) / 1000, 0.033);
    state.lastTime = time;

    if (state.mode === 'playing' && state.running) {
      if (state.pausedForGoal > 0) {
        state.pausedForGoal -= dt;
        if (state.pausedForGoal <= 0) {
          messageEl.classList.remove('is-visible');
          placeActors();
        }
      } else {
        state.clock = Math.max(0, state.clock - dt);
        if (state.clock === 0) {
          finishMatch();
        }

        updatePlayer(home, dt, getHumanInput());
        updatePlayer(away, dt, getCpuInput(dt));
        updateBall(dt);
      }
    }

    updateParticles(dt);
    draw();
    requestAnimationFrame(update);
  }

  function getHumanInput() {
    return {
      left: pressed.left || keys.has('ArrowLeft') || keys.has('KeyA'),
      right: pressed.right || keys.has('ArrowRight') || keys.has('KeyD'),
      jump: pressed.jump || keys.has('ArrowUp') || keys.has('KeyW') || keys.has('Space'),
      kick: pressed.kick || keys.has('ArrowDown') || keys.has('KeyF') || keys.has('KeyK')
    };
  }

  function getCpuInput(dt) {
    const goalDanger = ball.x > state.width * 0.58 && ball.vx > -state.width * 0.08;
    const attackLine = ball.x < state.width * 0.52 ? state.width * 0.68 : ball.x;
    const targetX = goalDanger ? ball.x - away.footReach * 0.45 : attackLine;
    const diff = targetX - away.x;
    const closeBall = distance(away.x, away.y - away.height * 0.55, ball.x, ball.y) < away.footReach * 1.45;
    const shouldJump = closeBall && ball.y < away.y - away.height * 0.65 && away.onGround;

    away.aiKickDelay = Math.max(0, (away.aiKickDelay || 0) - dt);
    const shouldKick = closeBall && away.aiKickDelay === 0;
    if (shouldKick) {
      away.aiKickDelay = 0.38 + Math.random() * 0.3;
    }

    return {
      left: diff < -10,
      right: diff > 10,
      jump: shouldJump,
      kick: shouldKick
    };
  }

  function updatePlayer(player, dt, input) {
    const acceleration = state.width * 3.2;
    const maxSpeed = state.width * 0.36;
    const gravity = state.height * 2.35;
    const jumpPower = state.height * 0.86;
    const friction = player.onGround ? 0.82 : 0.96;

    if (input.left) {
      player.vx -= acceleration * dt;
      player.facing = -1;
    }

    if (input.right) {
      player.vx += acceleration * dt;
      player.facing = 1;
    }

    player.vx = clamp(player.vx, -maxSpeed, maxSpeed);
    player.vx *= friction;

    if (input.jump && (player.onGround || player.jumpGrace > 0)) {
      player.vy = -jumpPower;
      player.onGround = false;
      player.jumpGrace = 0;
      burst(player.x, player.y - 8, '#ffffff', 8);
      if (player.side === 'home') {
        playSound('jump');
      }
    }

    player.vy += gravity * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    const minX = state.leftGoalX + player.width * 0.7;
    const maxX = state.rightGoalX - player.width * 0.7;
    player.x = clamp(player.x, minX, maxX);

    if (player.y >= state.groundY) {
      player.y = state.groundY;
      player.vy = 0;
      player.onGround = true;
      player.jumpGrace = 0.09;
    } else {
      player.onGround = false;
      player.jumpGrace = Math.max(0, player.jumpGrace - dt);
    }

    player.kickCooldown = Math.max(0, player.kickCooldown - dt);
    resolvePlayerBallCollision(player, input.kick);
  }

  function resolvePlayerBallCollision(player, wantsKick) {
    const chestX = player.x;
    const chestY = player.y - player.height * 0.54;
    const bodyRadius = player.headRadius * 1.08;
    const dx = ball.x - chestX;
    const dy = ball.y - chestY;
    const minDist = bodyRadius + ball.radius;
    const dist = Math.max(1, Math.hypot(dx, dy));

    if (dist < minDist) {
      const nx = dx / dist;
      const ny = dy / dist;
      const overlap = minDist - dist;
      ball.x += nx * overlap;
      ball.y += ny * overlap;
      const power = state.width * 0.24;
      ball.vx += nx * power + player.vx * 0.7;
      ball.vy += ny * power + player.vy * 0.28;
      ball.spin += nx * 0.2;
      burst(ball.x, ball.y, '#e9fff7', 4);
    }

    if (wantsKick && player.kickCooldown === 0) {
      player.kickCooldown = 0.34;
      const footX = player.x + player.facing * player.footReach;
      const footY = player.y - player.height * 0.2;
      const kickDist = distance(footX, footY, ball.x, ball.y);

      if (kickDist < player.footReach + ball.radius * 1.1) {
        const direction = player.facing;
        ball.vx = direction * state.width * 0.92 + player.vx * 0.35;
        ball.vy = -state.height * 0.42;
        ball.spin = direction * 0.55;
        state.cameraShake = 10;
        burst(ball.x, ball.y, player.side === 'home' ? '#4cc9f0' : '#ff4d8d', 18);
        playSound('kick');
      }
    }
  }

  function updateBall(dt) {
    const gravity = state.height * 1.55;
    const drag = 0.995;
    const wallBounce = 0.78;
    const floorBounce = 0.58;

    ball.vy += gravity * dt;
    ball.vx *= drag;
    ball.vy *= 0.999;
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;
    ball.spin += ball.vx * dt * 0.0009;

    const ceiling = Math.max(76, state.height * 0.12);
    if (ball.y - ball.radius < ceiling) {
      ball.y = ceiling + ball.radius;
      ball.vy = Math.abs(ball.vy) * wallBounce;
    }

    if (ball.y + ball.radius > state.groundY) {
      ball.y = state.groundY - ball.radius;
      ball.vy = -Math.abs(ball.vy) * floorBounce;
      ball.vx *= 0.9;
      burst(ball.x, ball.y + ball.radius, '#b9ffe8', 3);
    }

    const inGoalMouth = ball.y > state.goalTop && ball.y < state.goalBottom;

    if (ball.x - ball.radius < state.leftGoalX) {
      if (inGoalMouth) {
        scoreGoal('away');
      } else {
        ball.x = state.leftGoalX + ball.radius;
        ball.vx = Math.abs(ball.vx) * wallBounce;
      }
    }

    if (ball.x + ball.radius > state.rightGoalX) {
      if (inGoalMouth) {
        scoreGoal('home');
      } else {
        ball.x = state.rightGoalX - ball.radius;
        ball.vx = -Math.abs(ball.vx) * wallBounce;
      }
    }

    ball.vx = clamp(ball.vx, -state.width * 1.25, state.width * 1.25);
    ball.vy = clamp(ball.vy, -state.height * 1.5, state.height * 1.5);
  }

  function scoreGoal(side) {
    state.score[side] += 1;
    state.pausedForGoal = 1.35;
    state.cameraShake = 18;
    syncHud();
    burst(ball.x, ball.y, side === 'home' ? '#4cc9f0' : '#ff4d8d', 42);
    playSound('goal');
    showMessage('GOAL!', side === 'home' ? 'Home smashes it in.' : 'CPU answers back.', 1200);
    ball.vx = 0;
    ball.vy = 0;
  }

  function finishMatch() {
    state.running = false;
    const homeScore = state.score.home;
    const awayScore = state.score.away;
    const title = homeScore === awayScore ? 'Draw' : homeScore > awayScore ? 'You win' : 'CPU wins';
    const copy = `${homeScore} - ${awayScore}. Press restart for another match.`;
    showMessage(title, copy, 0);
  }

  function updateParticles(dt) {
    state.cameraShake = Math.max(0, state.cameraShake - dt * 28);
    state.particles = state.particles.filter((particle) => {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += state.height * 0.9 * dt;
      return particle.life > 0;
    });
  }

  function burst(x, y, color, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (90 + Math.random() * 240) * state.scale;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: (2 + Math.random() * 5) * clamp(state.scale, 0.7, 1.2),
        color,
        life: 0.28 + Math.random() * 0.42
      });
    }
  }

  function draw() {
    const shakeX = (Math.random() - 0.5) * state.cameraShake;
    const shakeY = (Math.random() - 0.5) * state.cameraShake;
    ctx.save();
    ctx.translate(shakeX, shakeY);
    drawBackground();
    drawField();
    drawGoal('left');
    drawGoal('right');
    drawPlayer(home);
    drawPlayer(away);
    drawBall();
    drawParticles();
    ctx.restore();
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, state.groundY);
    sky.addColorStop(0, '#111d3c');
    sky.addColorStop(0.4, '#183c67');
    sky.addColorStop(0.78, '#0b1b34');
    sky.addColorStop(1, '#07111f');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, state.width, state.height);

    const roofY = state.height * 0.05;
    const standTop = state.height * 0.15;
    const standBottom = state.groundY - state.height * 0.1;

    ctx.fillStyle = 'rgba(2, 8, 18, 0.62)';
    ctx.beginPath();
    ctx.moveTo(0, roofY);
    ctx.lineTo(state.width, roofY);
    ctx.lineTo(state.width, standTop + state.height * 0.035);
    ctx.quadraticCurveTo(state.width / 2, standTop - state.height * 0.06, 0, standTop + state.height * 0.035);
    ctx.closePath();
    ctx.fill();

    const stand = ctx.createLinearGradient(0, standTop, 0, standBottom);
    stand.addColorStop(0, 'rgba(91, 125, 153, 0.56)');
    stand.addColorStop(0.5, 'rgba(29, 60, 88, 0.72)');
    stand.addColorStop(1, 'rgba(8, 20, 36, 0.9)');
    ctx.fillStyle = stand;
    ctx.fillRect(0, standTop, state.width, standBottom - standTop);

    const aisleWidth = Math.max(58, state.width * 0.08);
    for (let i = 0; i < 6; i += 1) {
      const x = i * state.width / 5;
      const aisle = ctx.createLinearGradient(x - aisleWidth, standTop, x + aisleWidth, standBottom);
      aisle.addColorStop(0, 'rgba(255, 255, 255, 0.13)');
      aisle.addColorStop(0.55, 'rgba(255, 255, 255, 0.04)');
      aisle.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = aisle;
      ctx.beginPath();
      ctx.moveTo(x - aisleWidth * 0.38, standTop);
      ctx.lineTo(x + aisleWidth * 0.38, standTop);
      ctx.lineTo(x + aisleWidth, standBottom);
      ctx.lineTo(x - aisleWidth, standBottom);
      ctx.closePath();
      ctx.fill();
    }

    const rows = 7;
    const seatColors = ['#dcecff', '#68d8ff', '#ffd166', '#ff74a6'];
    for (let row = 0; row < rows; row += 1) {
      const y = standTop + row * ((standBottom - standTop) / rows) + 12;
      const count = Math.ceil(state.width / 30);
      for (let i = 0; i < count; i += 1) {
        if ((i + row) % 4 !== 0) {
          ctx.fillStyle = seatColors[(i + row * 2) % seatColors.length];
          ctx.globalAlpha = 0.13 + row * 0.018;
          roundedRect(ctx, i * 30 + (row % 2) * 12, y, 14, 8, 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }

    const boardY = state.groundY - state.height * 0.125;
    const boardHeight = Math.max(24, state.height * 0.045);
    for (let i = 0; i < 8; i += 1) {
      const x = i * state.width / 8;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 209, 102, 0.72)' : 'rgba(76, 201, 240, 0.72)';
      roundedRect(ctx, x + 4, boardY, state.width / 8 - 8, boardHeight, 8);
      ctx.fill();
      ctx.fillStyle = 'rgba(5, 12, 23, 0.75)';
      ctx.font = `900 ${Math.max(10, boardHeight * 0.45)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(i % 2 === 0 ? 'HEADSHOTS' : 'POWER KICK', x + state.width / 16, boardY + boardHeight / 2);
    }

    for (let i = 0; i < 4; i += 1) {
      const x = state.width * (0.16 + i * 0.22);
      const beam = ctx.createRadialGradient(x, state.height * 0.08, 5, x, state.height * 0.34, state.height * 0.34);
      beam.addColorStop(0, 'rgba(255, 240, 168, 0.34)');
      beam.addColorStop(1, 'rgba(255, 240, 168, 0)');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.ellipse(x, state.height * 0.2, state.width * 0.14, state.height * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff4a8';
      ctx.beginPath();
      ctx.arc(x, state.height * 0.085, Math.max(6, state.scale * 9), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawField() {
    const fieldTop = state.groundY - state.height * 0.05;
    const field = ctx.createLinearGradient(0, fieldTop, 0, state.height);
    field.addColorStop(0, '#22c58a');
    field.addColorStop(0.42, '#159c70');
    field.addColorStop(1, '#0c4539');
    ctx.fillStyle = field;
    ctx.fillRect(0, fieldTop, state.width, state.height - fieldTop);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let stripe = 0; stripe < 9; stripe += 1) {
      if (stripe % 2 === 0) {
        const x = stripe * state.width / 9;
        ctx.beginPath();
        ctx.moveTo(x, fieldTop);
        ctx.lineTo(x + state.width / 9, fieldTop);
        ctx.lineTo(x + state.width / 6, state.height);
        ctx.lineTo(x - state.width / 18, state.height);
        ctx.closePath();
        ctx.fill();
      }
    }

    ctx.strokeStyle = 'rgba(233, 255, 247, 0.65)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, state.groundY);
    ctx.lineTo(state.width, state.groundY);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.22;
    for (let x = -state.width; x < state.width * 2; x += 42) {
      ctx.beginPath();
      ctx.moveTo(x, state.groundY + 34);
      ctx.lineTo(x + 120, state.height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ctx.strokeStyle = 'rgba(233, 255, 247, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(state.width / 2, state.groundY + 2, Math.min(state.width, state.height) * 0.13, Math.PI, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(state.width / 2, state.groundY - state.height * 0.05);
    ctx.lineTo(state.width / 2, state.height);
    ctx.stroke();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.fillRect(0, state.groundY + 2, state.width, 8);
  }

  function drawGoal(side) {
    const isLeft = side === 'left';
    const x = isLeft ? state.leftGoalX : state.rightGoalX;
    const direction = isLeft ? -1 : 1;
    const depth = Math.max(34, state.width * 0.055);
    const postColor = '#eefaff';

    ctx.strokeStyle = postColor;
    ctx.lineWidth = Math.max(7, state.scale * 9);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, state.goalTop);
    ctx.lineTo(x, state.goalBottom);
    ctx.lineTo(x + direction * depth, state.goalBottom);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(76, 201, 240, 0.44)';
    ctx.lineWidth = Math.max(3, state.scale * 4);
    ctx.beginPath();
    ctx.moveTo(x + direction * depth, state.goalBottom);
    ctx.lineTo(x + direction * depth, state.goalTop + 18);
    ctx.lineTo(x, state.goalTop);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(233, 255, 247, 0.24)';
    ctx.lineWidth = 1;
    for (let y = state.goalTop + 12; y < state.goalBottom; y += 14) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + direction * depth, y + 5);
      ctx.stroke();
    }
  }

  function drawPlayer(player) {
    const headY = player.y - player.height * 0.78;
    const headX = player.x + player.facing * player.width * 0.08;
    const kickLift = player.kickCooldown > 0.18 ? 1 : 0;

    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.scale(player.facing, 1);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 6, player.width * 0.75, player.width * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
    roundedRect(ctx, -player.width * 0.34, -player.height * 0.5, player.width * 0.88, player.height * 0.49, player.width * 0.2);
    ctx.fill();

    drawLimb(-player.width * 0.2, -player.height * 0.18, -player.width * 0.34, 0, player.colors[1]);
    drawLimb(player.width * 0.18, -player.height * 0.18, player.width * (0.5 + kickLift * 0.55), -player.height * (0.05 + kickLift * 0.22), player.colors[0]);

    const jersey = ctx.createLinearGradient(-player.width * 0.44, -player.height * 0.62, player.width * 0.44, -player.height * 0.12);
    jersey.addColorStop(0, player.colors[0]);
    jersey.addColorStop(0.46, lighten(player.colors[0], 0.18));
    jersey.addColorStop(1, player.colors[1]);
    ctx.fillStyle = jersey;
    roundedRect(ctx, -player.width * 0.43, -player.height * 0.58, player.width * 0.86, player.height * 0.48, player.width * 0.2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
    ctx.lineWidth = Math.max(2, player.width * 0.045);
    ctx.beginPath();
    ctx.moveTo(-player.width * 0.25, -player.height * 0.5);
    ctx.quadraticCurveTo(0, -player.height * 0.62, player.width * 0.25, -player.height * 0.5);
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = `900 ${Math.max(18, player.headRadius * 0.58)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.side === 'home' ? '7' : '9', 0, -player.height * 0.35);
    ctx.restore();

    ctx.save();
    ctx.translate(headX, headY);
    drawHead(player);
    ctx.restore();

    function drawLimb(x1, y1, x2, y2, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(8, player.width * 0.16);
      ctx.lineCap = 'round';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = '#f8fbff';
      ctx.beginPath();
      ctx.ellipse(x2, y2 + 4, player.width * 0.24, player.width * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
      ctx.beginPath();
      ctx.ellipse(x2 + player.width * 0.04, y2 + 7, player.width * 0.18, player.width * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawHead(player) {
    const r = player.headRadius;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.arc(4, 6, r * 1.03, 0, Math.PI * 2);
    ctx.fill();

    const face = ctx.createRadialGradient(-r * 0.28, -r * 0.35, r * 0.12, 0, 0, r);
    face.addColorStop(0, lighten(player.skin, 0.28));
    face.addColorStop(0.55, player.skin);
    face.addColorStop(1, darken(player.skin, 0.28));
    ctx.fillStyle = face;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    const hair = ctx.createLinearGradient(-r, -r, r, r * 0.2);
    hair.addColorStop(0, lighten(player.hair, 0.16));
    hair.addColorStop(1, player.hair);
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.arc(-r * 0.14, -r * 0.38, r * 0.78, Math.PI * 0.95, Math.PI * 2.05);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = Math.max(2, r * 0.06);
    ctx.beginPath();
    ctx.arc(-r * 0.22, -r * 0.22, r * 0.58, Math.PI * 1.04, Math.PI * 1.55);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(r * 0.28, -r * 0.1, r * 0.16, 0, Math.PI * 2);
    ctx.arc(-r * 0.18, -r * 0.1, r * 0.13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.arc(r * 0.32, -r * 0.08, r * 0.065, 0, Math.PI * 2);
    ctx.arc(-r * 0.14, -r * 0.08, r * 0.055, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.arc(r * 0.35, -r * 0.11, r * 0.024, 0, Math.PI * 2);
    ctx.arc(-r * 0.12, -r * 0.11, r * 0.02, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = Math.max(2, r * 0.08);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(r * 0.12, r * 0.23, r * 0.24, 0, Math.PI * 0.82);
    ctx.stroke();
  }

  function drawBall() {
    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.spin);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(4, 6, ball.radius * 1.08, ball.radius * 0.92, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff8e7';
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = Math.max(2, ball.radius * 0.12);
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, ball.radius * (0.35 + i * 0.12), i, i + Math.PI * 0.75);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawParticles() {
    state.particles.forEach((particle) => {
      ctx.globalAlpha = clamp(particle.life * 2.2, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function roundedRect(renderingContext, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    renderingContext.beginPath();
    renderingContext.moveTo(x + r, y);
    renderingContext.lineTo(x + width - r, y);
    renderingContext.quadraticCurveTo(x + width, y, x + width, y + r);
    renderingContext.lineTo(x + width, y + height - r);
    renderingContext.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    renderingContext.lineTo(x + r, y + height);
    renderingContext.quadraticCurveTo(x, y + height, x, y + height - r);
    renderingContext.lineTo(x, y + r);
    renderingContext.quadraticCurveTo(x, y, x + r, y);
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function lighten(hex, amount) {
    return adjustHex(hex, Math.abs(amount));
  }

  function darken(hex, amount) {
    return adjustHex(hex, -Math.abs(amount));
  }

  function adjustHex(hex, amount) {
    const clean = hex.replace('#', '');
    const value = Number.parseInt(clean, 16);
    const r = clamp(((value >> 16) & 255) + 255 * amount, 0, 255);
    const g = clamp(((value >> 8) & 255) + 255 * amount, 0, 255);
    const b = clamp((value & 255) + 255 * amount, 0, 255);
    return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
  }

  function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  window.addEventListener('resize', resize);

  window.addEventListener('keydown', (event) => {
    keys.add(event.code);
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
  });

  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
  });

  document.querySelectorAll('[data-control]').forEach((button) => {
    const control = button.dataset.control;
    const set = (value) => {
      pressed[control] = value;
      button.classList.toggle('is-pressed', value);
    };

    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      playSound('tap');
      set(true);
    });
    button.addEventListener('pointerup', () => set(false));
    button.addEventListener('pointercancel', () => set(false));
    button.addEventListener('pointerleave', () => set(false));
  });

  restartButton.addEventListener('click', () => {
    playSound('start');
    resetMatch();
  });

  startButton.addEventListener('click', startMatch);

  window.addEventListener('pointerdown', () => {
    if (state.mode === 'menu' && audio.enabled) {
      unlockAudio();
      playSound('menu');
      startMenuLoop();
    }
  }, { once: true });

  soundButton.addEventListener('click', () => {
    audio.enabled = !audio.enabled;
    soundButton.textContent = audio.enabled ? 'Sound On' : 'Sound Off';
    soundButton.setAttribute('aria-pressed', String(audio.enabled));
    if (audio.enabled) {
      unlockAudio();
      playSound('menu');
      startMenuLoop();
    } else {
      stopMenuLoop();
    }
  });

  resize();
  showMainMenu();
  requestAnimationFrame(update);
})();

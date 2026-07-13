/* ===== Blackhole Ninja — Science Lab Runner ===== */
(function () {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const levelEl = document.getElementById('level');
  const timerEl = document.getElementById('timer');
  const scoreEl = document.getElementById('score');
  const startOverlay = document.getElementById('start-overlay');
  const gameoverOverlay = document.getElementById('gameover-overlay');
  const gameoverText = document.getElementById('gameover-text');
  const levelOverlay = document.getElementById('level-overlay');
  const levelTitle = document.getElementById('level-title');
  const levelText = document.getElementById('level-text');
  const victoryOverlay = document.getElementById('victory-overlay');
  const victoryText = document.getElementById('victory-text');
  const startBtn = document.getElementById('start-btn');
  const retryBtn = document.getElementById('retry-btn');
  const nextLevelBtn = document.getElementById('next-level-btn');
  const playAgainBtn = document.getElementById('play-again-btn');
  const backBtn = document.getElementById('back-arcade-btn');
  const backBtn2 = document.getElementById('back-arcade-btn-2');

  const W = canvas.width;   // 700
  const H = canvas.height;  // 400

  // ---- CONSTANTS ----
  const GROUND_Y = H - 60;
  const GRAVITY = 0.35;
  const JUMP_FORCE = -10;
  const MAX_JUMPS = 2;
  const LEVEL_DURATIONS = [25, 45, 55]; // seconds
  const POWERUP_INTERVAL = 15000; // ms between powerup spawns
  const INVINCIBLE_DURATION = 5000; // ms

  const LEVEL_SPEEDS = [1.0, 1.3, 1.7]; // Fastest but not too fast
  const LEVEL_NAMES = ['Lab Escape', 'Corridor Run', 'Final Sprint'];

  const COLORS = {
    ninja: '#1a1a2e',
    headband: '#ff007f',
    headbandTail: '#ff007f',
    ground: '#333333', // greyish lab floor
    groundLine: '#444444',
    labTable: '#4a5568',
    labTableTop: '#718096',
    barrel: '#ff3366', // more colorful
    barrelStripe: '#ffcc00', // more colorful
    laser: '#ff00ff', // more colorful
    laserGlow: 'rgba(255, 0, 255, 0.3)',
    testTube: '#00ffcc', // more colorful
    testTubeFluid: '#00ccff', // more colorful
    powerup: '#ffff00', // more colorful
    powerupGlow: 'rgba(255, 255, 0, 0.4)',
    invincible: '#ff9900',
    invincibleGlow: 'rgba(255, 153, 0, 0.4)',
    blackhole: '#1a0033',
    blackholeRing: ['#ff00ff', '#cc00ff', '#9900ff', '#6600ff'], // more colorful
    particle: ['#ff007f', '#ffd700', '#00f0ff', '#00ff88', '#b44aff', '#ff4444'],
    bg1: '#2b2b2b', // greyish background
    bg2: '#3d3d3d', // greyish background
    shelf: '#4d4d4d',
    beaker: '#00ffcc', // more colorful
    monitor: '#ff00ff', // more colorful
  };

  // ---- STATE ----
  let ninja, obstacles, particles, powerups, bgElements;
  let score, level, timeLeft, running, gameState;
  let scrollSpeed, scrollOffset;
  let lastObstacleSpawn, obstacleInterval;
  let lastPowerupSpawn;
  let blackholeX, blackholePhase;
  let shakeTimer, shakeMag;
  let spaceshipActive, spaceship;
  let frameId, lastTime;

  // ---- NINJA ----
  function createNinja() {
    return {
      x: 120,
      y: GROUND_Y,
      w: 28,
      h: 42,
      vy: 0,
      jumpCount: 0,
      grounded: true,
      invincible: false,
      invincibleTimer: 0,
      runPhase: 0,
      headbandWave: 0,
      alive: true,
    };
  }

  // ---- INIT ----
  function init() {
    ninja = createNinja();
    obstacles = [];
    particles = [];
    powerups = [];
    bgElements = generateBgElements();
    score = 0;
    level = 1;
    timeLeft = LEVEL_DURATIONS[0];
    running = false;
    gameState = 'start'; // start, playing, levelclear, victory, gameover
    scrollSpeed = 3 * LEVEL_SPEEDS[0];
    scrollOffset = 0;
    lastObstacleSpawn = 0;
    obstacleInterval = 1800;
    lastPowerupSpawn = 0;
    blackholeX = -80;
    blackholePhase = 0;
    shakeTimer = 0;
    shakeMag = 0;
    spaceshipActive = false;
    spaceship = null;
    frameId = null;
    lastTime = 0;
    updateHUD();
  }

  function updateHUD() {
    levelEl.textContent = level;
    timerEl.textContent = Math.ceil(timeLeft);
    scoreEl.textContent = score;
  }

  // ---- BACKGROUND ELEMENTS ----
  function generateBgElements() {
    const els = [];
    // Generate lab background items
    for (let i = 0; i < 20; i++) {
      const type = Math.random();
      if (type < 0.35) {
        // Shelf
        els.push({
          type: 'shelf',
          x: Math.random() * W * 3,
          y: 60 + Math.random() * 100,
          w: 50 + Math.random() * 40,
          h: 8,
          layer: 0.3,
        });
      } else if (type < 0.6) {
        // Beaker
        els.push({
          type: 'beaker',
          x: Math.random() * W * 3,
          y: 80 + Math.random() * 80,
          size: 8 + Math.random() * 10,
          layer: 0.4,
        });
      } else if (type < 0.8) {
        // Monitor
        els.push({
          type: 'monitor',
          x: Math.random() * W * 3,
          y: 50 + Math.random() * 60,
          w: 25 + Math.random() * 15,
          h: 18 + Math.random() * 10,
          layer: 0.2,
          flicker: Math.random() * Math.PI * 2,
        });
      } else {
        // Pipe
        els.push({
          type: 'pipe',
          x: Math.random() * W * 3,
          y: 30 + Math.random() * 40,
          length: 80 + Math.random() * 120,
          layer: 0.15,
        });
      }
    }
    return els;
  }

  // ---- OBSTACLE SPAWNING ----
  function spawnObstacle() {
    const speedMul = LEVEL_SPEEDS[level - 1];
    const type = Math.random();
    let obs;

    if (type < 0.3) {
      // Lab table
      const w = 50 + Math.random() * 30;
      const h = 30 + Math.random() * 15;
      obs = {
        type: 'table',
        x: W + 20,
        y: GROUND_Y - h,
        w: w,
        h: h,
        speed: scrollSpeed,
      };
    } else if (type < 0.55) {
      // Chemical barrel
      const r = 16 + Math.random() * 8;
      obs = {
        type: 'barrel',
        x: W + 20,
        y: GROUND_Y - r * 2,
        w: r * 2,
        h: r * 2,
        r: r,
        speed: scrollSpeed,
      };
    } else if (type < 0.75) {
      // Laser beam — horizontal
      const laserY = GROUND_Y - 40 - Math.random() * 60;
      obs = {
        type: 'laser',
        x: W + 20,
        y: laserY,
        w: 60 + Math.random() * 40,
        h: 6,
        speed: scrollSpeed,
        phase: 0,
      };
    } else {
      // Floating test tube cluster
      const tubeY = GROUND_Y - 50 - Math.random() * 70;
      obs = {
        type: 'testtube',
        x: W + 20,
        y: tubeY,
        w: 14,
        h: 35,
        speed: scrollSpeed,
        bobPhase: Math.random() * Math.PI * 2,
      };
    }

    // Occasionally spawn double obstacles on higher levels
    if (level >= 2 && Math.random() < 0.25) {
      obstacles.push(obs);
      // Add a second obstacle nearby
      const obs2 = { ...obs };
      obs2.x += obs.w + 60 + Math.random() * 40;
      if (obs2.type === 'testtube') {
        obs2.y = GROUND_Y - 50 - Math.random() * 70;
      }
      obstacles.push(obs2);
    } else {
      obstacles.push(obs);
    }
  }

  // ---- POWERUP SPAWNING ----
  function spawnPowerup() {
    powerups.push({
      x: W + 20,
      y: GROUND_Y - 60 - Math.random() * 40,
      w: 22,
      h: 22,
      speed: scrollSpeed,
      phase: 0,
      collected: false,
    });
  }

  // ---- SPACESHIP ----
  function spawnSpaceship() {
    spaceshipActive = true;
    spaceship = {
      x: W + 60,
      y: GROUND_Y - 80,
      w: 80,
      h: 50,
      boarded: false,
      flyPhase: 0,
    };
  }

  // ---- PARTICLES ----
  function emitParticles(x, y, count, colors, spread) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * spread,
        vy: (Math.random() - 0.8) * spread,
        life: 1,
        decay: 0.015 + Math.random() * 0.025,
        size: 2 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  // ---- INPUT ----
  let jumpPressed = false;

  function handleJump() {
    if (gameState !== 'playing' || !ninja.alive) return;
    if (ninja.jumpCount < MAX_JUMPS) {
      ninja.vy = JUMP_FORCE * (ninja.jumpCount === 1 ? 0.85 : 1);
      ninja.jumpCount++;
      ninja.grounded = false;
      emitParticles(ninja.x + ninja.w / 2, ninja.y + ninja.h, 6,
        ['#00f0ff', '#b44aff', '#fff'], 4);
    }
  }

  document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !jumpPressed) {
      e.preventDefault();
      jumpPressed = true;
      handleJump();
    }
  });

  document.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      jumpPressed = false;
    }
  });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleJump();
  });
  canvas.addEventListener('mousedown', (e) => {
    if (gameState === 'playing') handleJump();
  });

  // ---- COLLISION ----
  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ---- DRAWING ----

  function drawBackground(dt) {
    // Dark gradient background
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, '#1a1a1a'); // greyish
    grad.addColorStop(0.6, COLORS.bg1);
    grad.addColorStop(1, COLORS.bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Parallax lab elements
    bgElements.forEach(el => {
      const px = ((el.x - scrollOffset * el.layer) % (W * 3) + W * 3) % (W * 3) - W * 0.5;
      if (px < -100 || px > W + 100) return;

      ctx.globalAlpha = 0.15 + el.layer * 0.2;

      if (el.type === 'shelf') {
        ctx.fillStyle = COLORS.shelf;
        ctx.fillRect(px, el.y, el.w, el.h);
        ctx.fillRect(px + 2, el.y - 15, 6, 15);
        ctx.fillRect(px + el.w - 8, el.y - 15, 6, 15);
      } else if (el.type === 'beaker') {
        ctx.fillStyle = COLORS.beaker;
        ctx.beginPath();
        ctx.moveTo(px - el.size * 0.3, el.y);
        ctx.lineTo(px - el.size * 0.5, el.y + el.size);
        ctx.lineTo(px + el.size * 0.5, el.y + el.size);
        ctx.lineTo(px + el.size * 0.3, el.y);
        ctx.closePath();
        ctx.fill();
      } else if (el.type === 'monitor') {
        el.flicker += dt * 3;
        const brightness = 0.6 + Math.sin(el.flicker) * 0.4;
        ctx.fillStyle = COLORS.monitor;
        ctx.globalAlpha *= brightness;
        ctx.fillRect(px, el.y, el.w, el.h);
        ctx.fillStyle = '#111';
        ctx.fillRect(px + 2, el.y + 2, el.w - 4, el.h - 4);
        // Screen glow lines
        ctx.fillStyle = COLORS.monitor;
        ctx.globalAlpha *= 0.6;
        for (let j = 0; j < 3; j++) {
          ctx.fillRect(px + 5, el.y + 5 + j * 4, el.w - 10, 1);
        }
      } else if (el.type === 'pipe') {
        ctx.fillStyle = '#3d2b5e';
        ctx.fillRect(px, el.y, el.length, 4);
        // Joints
        ctx.fillRect(px, el.y - 2, 6, 8);
        ctx.fillRect(px + el.length - 6, el.y - 2, 6, 8);
      }

      ctx.globalAlpha = 1;
    });
  }

  function drawGround() {
    // Ground fill
    ctx.fillStyle = COLORS.ground;
    ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);

    // Grid lines on ground
    ctx.strokeStyle = COLORS.groundLine;
    ctx.lineWidth = 1;
    const tileW = 40;
    const offset = scrollOffset % tileW;
    for (let x = -offset; x < W; x += tileW) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    // Horizontal lines
    for (let y = GROUND_Y; y < H; y += 15) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    // Ground top edge glow
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#7c3aed';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(W, GROUND_Y);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawBlackHole() {
    const cx = blackholeX;
    const cy = H / 2 + 20;
    const baseR = 65;

    // Accretion disk rings
    for (let i = 4; i >= 0; i--) {
      const r = baseR + i * 22;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = i % 2 === 0 ? COLORS.blackholeRing[i % 4] : '#ff0040';
      ctx.lineWidth = 4 + i;
      ctx.globalAlpha = 0.4 + Math.sin(blackholePhase * 2 + i) * 0.2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Swirling arms
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(blackholePhase * 0.8);
    for (let arm = 0; arm < 6; arm++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      for (let t = 0; t < 80; t++) {
        const angle = t * 0.15;
        const r = 20 + t * 1.5;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(255, 0, 64, 0.3)`;
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    ctx.restore();

    // Core — dark center with red edge
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR);
    coreGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
    coreGrad.addColorStop(0.6, 'rgba(20, 0, 0, 1)');
    coreGrad.addColorStop(0.9, 'rgba(255, 0, 0, 0.8)');
    coreGrad.addColorStop(1, 'rgba(124, 58, 237, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR, 0, Math.PI * 2);
    ctx.fill();

    // Distortion pull lines
    ctx.strokeStyle = 'rgba(255, 0, 64, 0.15)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const angle = (blackholePhase * 0.5) + (i * Math.PI / 6);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * baseR, cy + Math.sin(angle) * baseR);
      ctx.lineTo(cx + Math.cos(angle) * (baseR + 250), cy + Math.sin(angle) * 120);
      ctx.stroke();
    }
  }

  function drawNinja() {
    if (!ninja.alive) return;

    const nx = ninja.x;
    const ny = ninja.y;
    const phase = ninja.runPhase;

    ctx.save();

    // Default glow to highlight from background
    if (!ninja.invincible) {
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
    }

    // Invincible glow
    if (ninja.invincible) {
      ctx.shadowColor = COLORS.invincible;
      ctx.shadowBlur = 20;
      const glowAlpha = 0.3 + Math.sin(Date.now() * 0.01) * 0.2;
      ctx.fillStyle = `rgba(255, 215, 0, ${glowAlpha})`;
      ctx.beginPath();
      ctx.arc(nx + ninja.w / 2, ny + ninja.h / 2, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 15;
    }

    // Body
    ctx.fillStyle = COLORS.ninja;
    ctx.fillRect(nx + 6, ny + 14, 16, 18);

    // Head
    ctx.fillStyle = COLORS.ninja;
    ctx.beginPath();
    ctx.arc(nx + 14, ny + 10, 10, 0, Math.PI * 2);
    ctx.fill();

    // Remove shadow for facial features
    ctx.shadowBlur = 0;

    // Eyes — white with determination
    ctx.fillStyle = '#fff';
    ctx.fillRect(nx + 10, ny + 7, 4, 3);
    ctx.fillRect(nx + 16, ny + 7, 4, 3);
    // Pupils
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(nx + 12, ny + 8, 2, 2);
    ctx.fillRect(nx + 18, ny + 8, 2, 2);

    // Headband
    ctx.fillStyle = COLORS.headband;
    ctx.fillRect(nx + 4, ny + 5, 20, 3);

    // Headband tails — flowing behind
    ctx.strokeStyle = COLORS.headbandTail;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(nx + 4, ny + 6);
    const tailWave = Math.sin(ninja.headbandWave) * 5;
    const tailWave2 = Math.sin(ninja.headbandWave + 1) * 4;
    ctx.quadraticCurveTo(nx - 6, ny + 3 + tailWave, nx - 14, ny + 5 + tailWave2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(nx + 4, ny + 8);
    ctx.quadraticCurveTo(nx - 4, ny + 10 + tailWave2, nx - 12, ny + 8 + tailWave);
    ctx.stroke();

    // Legs — running animation
    if (ninja.grounded) {
      const legAngle = Math.sin(phase) * 0.5;
      // Left leg
      ctx.strokeStyle = COLORS.ninja;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(nx + 10, ny + 32);
      ctx.lineTo(nx + 10 - Math.sin(legAngle) * 10, ny + 42);
      ctx.stroke();
      // Right leg
      ctx.beginPath();
      ctx.moveTo(nx + 18, ny + 32);
      ctx.lineTo(nx + 18 + Math.sin(legAngle) * 10, ny + 42);
      ctx.stroke();
    } else {
      // Legs tucked while jumping
      ctx.strokeStyle = COLORS.ninja;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(nx + 10, ny + 32);
      ctx.lineTo(nx + 6, ny + 38);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(nx + 18, ny + 32);
      ctx.lineTo(nx + 22, ny + 38);
      ctx.stroke();
    }

    // Arms
    ctx.strokeStyle = COLORS.ninja;
    ctx.lineWidth = 3;
    if (ninja.grounded) {
      const armSwing = Math.sin(phase + Math.PI) * 0.4;
      ctx.beginPath();
      ctx.moveTo(nx + 8, ny + 18);
      ctx.lineTo(nx + 2 - Math.sin(armSwing) * 6, ny + 26);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(nx + 20, ny + 18);
      ctx.lineTo(nx + 26 + Math.sin(armSwing) * 6, ny + 26);
      ctx.stroke();
    } else {
      // Arms up while jumping
      ctx.beginPath();
      ctx.moveTo(nx + 8, ny + 18);
      ctx.lineTo(nx + 2, ny + 12);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(nx + 20, ny + 18);
      ctx.lineTo(nx + 26, ny + 12);
      ctx.stroke();
    }

    // Draw the key in the right hand
    ctx.fillStyle = '#ffd700'; // Gold key
    ctx.strokeStyle = '#daa520';
    ctx.lineWidth = 1.5;
    let handX, handY;
    if (ninja.grounded) {
      const armSwing = Math.sin(phase + Math.PI) * 0.4;
      handX = nx + 26 + Math.sin(armSwing) * 6;
      handY = ny + 26;
    } else {
      handX = nx + 26;
      handY = ny + 12;
    }

    // Key ring
    ctx.beginPath();
    ctx.arc(handX + 4, handY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Key shaft and teeth
    ctx.beginPath();
    ctx.moveTo(handX + 1, handY);
    ctx.lineTo(handX - 8, handY);
    ctx.lineTo(handX - 8, handY + 3);
    ctx.lineTo(handX - 6, handY + 3);
    ctx.lineTo(handX - 6, handY);
    ctx.lineTo(handX - 4, handY + 3);
    ctx.lineTo(handX - 2, handY + 3);
    ctx.lineTo(handX - 2, handY);
    ctx.stroke();

    ctx.restore();
  }

  function drawObstacle(obs) {
    ctx.save();

    if (obs.type === 'table') {
      // Lab table
      ctx.fillStyle = COLORS.labTable;
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      // Table top
      ctx.fillStyle = COLORS.labTableTop;
      ctx.fillRect(obs.x - 3, obs.y, obs.w + 6, 5);
      // Legs
      ctx.fillStyle = COLORS.labTable;
      ctx.fillRect(obs.x + 3, obs.y + obs.h - 2, 4, 2);
      ctx.fillRect(obs.x + obs.w - 7, obs.y + obs.h - 2, 4, 2);
      // Items on table
      ctx.fillStyle = COLORS.beaker;
      ctx.globalAlpha = 0.6;
      ctx.fillRect(obs.x + 8, obs.y - 8, 5, 8);
      ctx.fillRect(obs.x + obs.w - 15, obs.y - 6, 4, 6);
      ctx.globalAlpha = 1;
    } else if (obs.type === 'barrel') {
      // Chemical barrel
      const cx = obs.x + obs.r;
      const cy = obs.y + obs.r;
      ctx.fillStyle = COLORS.barrel;
      ctx.beginPath();
      ctx.arc(cx, cy, obs.r, 0, Math.PI * 2);
      ctx.fill();
      // Stripe
      ctx.fillStyle = COLORS.barrelStripe;
      ctx.fillRect(obs.x + 4, cy - 3, obs.w - 8, 6);
      // Hazard symbol (triangle)
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 6);
      ctx.lineTo(cx - 5, cy + 3);
      ctx.lineTo(cx + 5, cy + 3);
      ctx.closePath();
      ctx.fill();
    } else if (obs.type === 'laser') {
      // Laser beam
      obs.phase += 0.15;
      const pulse = 0.7 + Math.sin(obs.phase) * 0.3;
      // Glow
      ctx.fillStyle = COLORS.laserGlow;
      ctx.fillRect(obs.x - 3, obs.y - 6, obs.w + 6, obs.h + 12);
      // Beam
      ctx.fillStyle = COLORS.laser;
      ctx.globalAlpha = pulse;
      ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
      ctx.globalAlpha = 1;
      // Emitters at ends
      ctx.fillStyle = '#666';
      ctx.fillRect(obs.x - 4, obs.y - 4, 6, obs.h + 8);
      ctx.fillRect(obs.x + obs.w - 2, obs.y - 4, 6, obs.h + 8);
    } else if (obs.type === 'testtube') {
      // Floating test tube
      obs.bobPhase += 0.05;
      const bob = Math.sin(obs.bobPhase) * 4;
      const ty = obs.y + bob;
      // Tube body
      ctx.fillStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.strokeStyle = COLORS.testTube;
      ctx.lineWidth = 2;
      // Rounded rectangle for tube
      const tr = 5;
      ctx.beginPath();
      ctx.moveTo(obs.x + tr, ty);
      ctx.lineTo(obs.x + obs.w - tr, ty);
      ctx.quadraticCurveTo(obs.x + obs.w, ty, obs.x + obs.w, ty + tr);
      ctx.lineTo(obs.x + obs.w, ty + obs.h - tr * 2);
      ctx.quadraticCurveTo(obs.x + obs.w, ty + obs.h, obs.x + obs.w / 2, ty + obs.h);
      ctx.quadraticCurveTo(obs.x, ty + obs.h, obs.x, ty + obs.h - tr * 2);
      ctx.lineTo(obs.x, ty + tr);
      ctx.quadraticCurveTo(obs.x, ty, obs.x + tr, ty);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Fluid inside
      ctx.fillStyle = COLORS.testTubeFluid;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(obs.x + 2, ty + obs.h * 0.4, obs.w - 4, obs.h * 0.5);
      ctx.globalAlpha = 1;
      // Bubbles
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(obs.x + 5, ty + obs.h * 0.5 + bob * 0.5, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(obs.x + 9, ty + obs.h * 0.6 - bob * 0.3, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawPowerup(pu) {
    ctx.save();
    pu.phase += 0.08;
    const bob = Math.sin(pu.phase) * 3;
    const px = pu.x;
    const py = pu.y + bob;

    // Glow circle
    ctx.fillStyle = COLORS.powerupGlow;
    ctx.beginPath();
    ctx.arc(px + pu.w / 2, py + pu.h / 2, 18, 0, Math.PI * 2);
    ctx.fill();

    // Shield icon
    ctx.fillStyle = COLORS.powerup;
    ctx.shadowColor = COLORS.powerup;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(px + pu.w / 2, py);
    ctx.lineTo(px + pu.w, py + pu.h * 0.3);
    ctx.lineTo(px + pu.w * 0.85, py + pu.h * 0.7);
    ctx.lineTo(px + pu.w / 2, py + pu.h);
    ctx.lineTo(px + pu.w * 0.15, py + pu.h * 0.7);
    ctx.lineTo(px, py + pu.h * 0.3);
    ctx.closePath();
    ctx.fill();

    // Star inside
    ctx.fillStyle = '#fff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', px + pu.w / 2, py + pu.h * 0.6);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  function drawSpaceship() {
    if (!spaceship) return;
    ctx.save();
    const sx = spaceship.x;
    const sy = spaceship.y;

    // Body
    ctx.fillStyle = '#c0c0c0';
    ctx.beginPath();
    ctx.moveTo(sx + spaceship.w, sy + spaceship.h / 2); // nose
    ctx.lineTo(sx + spaceship.w * 0.7, sy);
    ctx.lineTo(sx, sy + 8);
    ctx.lineTo(sx, sy + spaceship.h - 8);
    ctx.lineTo(sx + spaceship.w * 0.7, sy + spaceship.h);
    ctx.closePath();
    ctx.fill();

    // Window
    ctx.fillStyle = '#00f0ff';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(sx + spaceship.w * 0.6, sy + spaceship.h / 2, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Wings
    ctx.fillStyle = '#888';
    // Top wing
    ctx.beginPath();
    ctx.moveTo(sx + 15, sy + 6);
    ctx.lineTo(sx + 5, sy - 12);
    ctx.lineTo(sx + 30, sy + 6);
    ctx.closePath();
    ctx.fill();
    // Bottom wing
    ctx.beginPath();
    ctx.moveTo(sx + 15, sy + spaceship.h - 6);
    ctx.lineTo(sx + 5, sy + spaceship.h + 12);
    ctx.lineTo(sx + 30, sy + spaceship.h - 6);
    ctx.closePath();
    ctx.fill();

    // Thruster flames (when not boarded yet or taking off)
    if (!spaceship.boarded || spaceship.flyPhase > 0) {
      const flameLength = 15 + Math.random() * 10;
      const grad = ctx.createLinearGradient(sx, sy + spaceship.h / 2, sx - flameLength, sy + spaceship.h / 2);
      grad.addColorStop(0, '#ffd700');
      grad.addColorStop(0.4, '#ff6600');
      grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(sx, sy + spaceship.h / 2 - 8);
      ctx.lineTo(sx - flameLength, sy + spaceship.h / 2);
      ctx.lineTo(sx, sy + spaceship.h / 2 + 8);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
  }

  function drawInvincibleTimer() {
    if (!ninja.invincible) return;
    const remaining = ninja.invincibleTimer / INVINCIBLE_DURATION;
    const barW = 60;
    const barH = 6;
    const bx = ninja.x + ninja.w / 2 - barW / 2;
    const by = ninja.y - 15;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = COLORS.invincible;
    ctx.fillRect(bx, by, barW * remaining, barH);
    ctx.strokeStyle = 'rgba(255,215,0,0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, barW, barH);
  }

  // ---- UPDATE ----
  function update(dt) {
    if (gameState !== 'playing') return;

    const speedMul = LEVEL_SPEEDS[level - 1];
    scrollSpeed = 3 * speedMul;
    scrollOffset += scrollSpeed;

    // Timer countdown
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      if (level < 3) {
        showLevelClear();
      } else {
        // Level 3 complete — spawn spaceship
        if (!spaceshipActive) {
          spawnSpaceship();
        }
      }
    }

    // Ninja physics
    if (!ninja.grounded) {
      ninja.vy += GRAVITY;
      ninja.y += ninja.vy;
      if (ninja.y >= GROUND_Y - ninja.h) {
        ninja.y = GROUND_Y - ninja.h;
        ninja.vy = 0;
        ninja.grounded = true;
        ninja.jumpCount = 0;
      }
    }

    // Run animation
    if (ninja.grounded) {
      ninja.runPhase += dt * 12 * speedMul;
    }
    ninja.headbandWave += dt * 8;

    // Invincibility timer
    if (ninja.invincible) {
      ninja.invincibleTimer -= dt * 1000;
      if (ninja.invincibleTimer <= 0) {
        ninja.invincible = false;
        ninja.invincibleTimer = 0;
      }
    }

    // Black hole slow approach
    blackholePhase += dt * 2;
    if (blackholeX < -30) {
      blackholeX += dt * 3 * speedMul;
    }

    // Spawn obstacles
    lastObstacleSpawn += dt * 1000;
    const spawnRate = Math.max(600, obstacleInterval / speedMul);
    if (lastObstacleSpawn > spawnRate && timeLeft > 3) {
      spawnObstacle();
      lastObstacleSpawn = 0;
      // Gradually decrease interval
      obstacleInterval = Math.max(500, obstacleInterval - 5);
    }

    // Spawn powerups
    lastPowerupSpawn += dt * 1000;
    if (lastPowerupSpawn > POWERUP_INTERVAL && timeLeft > 8) {
      spawnPowerup();
      lastPowerupSpawn = 0;
    }

    // Update obstacles
    obstacles.forEach(obs => {
      obs.x -= scrollSpeed;
    });
    obstacles = obstacles.filter(obs => obs.x + obs.w > -50);

    // Update powerups
    powerups.forEach(pu => {
      pu.x -= scrollSpeed;
    });
    powerups = powerups.filter(pu => pu.x + pu.w > -50 && !pu.collected);

    // Collision: ninja vs obstacles
    if (ninja.alive && !ninja.invincible) {
      for (const obs of obstacles) {
        let hitBox = { x: obs.x, y: obs.y, w: obs.w, h: obs.h };
        // Adjust hitbox for test tubes (bobbing)
        if (obs.type === 'testtube') {
          hitBox.y += Math.sin(obs.bobPhase) * 4;
        }
        // Shrink ninja hitbox slightly for fairness
        const ninjaBox = {
          x: ninja.x + 4,
          y: ninja.y + 4,
          w: ninja.w - 8,
          h: ninja.h - 6,
        };
        if (rectsOverlap(ninjaBox, hitBox)) {
          killNinja();
          break;
        }
      }
    }

    // Collision: ninja vs powerups
    for (const pu of powerups) {
      if (pu.collected) continue;
      const puBox = { x: pu.x, y: pu.y + Math.sin(pu.phase) * 3, w: pu.w, h: pu.h };
      const ninjaBox = { x: ninja.x, y: ninja.y, w: ninja.w, h: ninja.h };
      if (rectsOverlap(ninjaBox, puBox)) {
        pu.collected = true;
        ninja.invincible = true;
        ninja.invincibleTimer = INVINCIBLE_DURATION;
        score += 50;
        emitParticles(pu.x + pu.w / 2, pu.y + pu.h / 2, 15,
          ['#00ff88', '#ffd700', '#fff'], 6);
      }
    }

    // Spaceship logic
    if (spaceshipActive && spaceship) {
      if (!spaceship.boarded) {
        // Move spaceship towards a reachable spot
        if (spaceship.x > 500) {
          spaceship.x -= scrollSpeed * 0.5;
        }
        // Check if ninja reached spaceship
        const sBox = { x: spaceship.x, y: spaceship.y, w: spaceship.w, h: spaceship.h };
        const nBox = { x: ninja.x, y: ninja.y, w: ninja.w, h: ninja.h };
        if (rectsOverlap(nBox, sBox)) {
          spaceship.boarded = true;
          ninja.alive = false; // ninja "enters" ship
          emitParticles(spaceship.x + 40, spaceship.y + 25, 25,
            ['#ffd700', '#ff6600', '#00f0ff', '#fff'], 8);
        }
      } else {
        // Fly away!
        spaceship.flyPhase += dt;
        spaceship.x += 5 + spaceship.flyPhase * 20;
        spaceship.y -= 2 + spaceship.flyPhase * 5;
        emitParticles(spaceship.x, spaceship.y + spaceship.h / 2, 2,
          ['#ffd700', '#ff6600'], 3);

        if (spaceship.x > W + 200) {
          showVictory();
        }
      }
    }

    // Score increases with time survived
    score += Math.round(dt * 10 * speedMul);

    // Update particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= p.decay;
    });
    particles = particles.filter(p => p.life > 0);

    // Screen shake
    if (shakeTimer > 0) {
      shakeTimer -= dt;
    }

    updateHUD();
  }

  // ---- GAME EVENTS ----
  function killNinja() {
    ninja.alive = false;
    shakeTimer = 0.3;
    shakeMag = 8;
    emitParticles(ninja.x + ninja.w / 2, ninja.y + ninja.h / 2, 30,
      COLORS.particle, 8);
    setTimeout(() => showGameOver(), 800);
  }

  function showGameOver() {
    gameState = 'gameover';
    running = false;
    if (frameId) cancelAnimationFrame(frameId);
    gameoverText.innerHTML = `The black hole got you! Score: <span class="highlight">${score}</span>`;
    gameoverOverlay.classList.remove('hidden');
  }

  function showLevelClear() {
    gameState = 'levelclear';
    running = false;
    if (frameId) cancelAnimationFrame(frameId);
    levelTitle.textContent = `Level ${level} Clear!`;
    const nextSpeed = LEVEL_SPEEDS[level]; // next level speed
    levelText.textContent = level === 2
      ? `Final level incoming! Speed: ${nextSpeed}×`
      : `Speed increasing to ${nextSpeed}×…`;
    levelOverlay.classList.remove('hidden');
  }

  function showVictory() {
    gameState = 'victory';
    running = false;
    if (frameId) cancelAnimationFrame(frameId);
    victoryText.innerHTML = `Final Score: <span class="highlight">${score}</span>`;
    victoryOverlay.classList.remove('hidden');
  }

  function startLevel(lvl) {
    level = lvl;
    ninja = createNinja();
    obstacles = [];
    powerups = [];
    timeLeft = LEVEL_DURATIONS[lvl - 1];
    lastObstacleSpawn = 0;
    obstacleInterval = 1800 - (lvl - 1) * 200;
    lastPowerupSpawn = 0;
    blackholeX = -80;
    spaceshipActive = false;
    spaceship = null;
    scrollSpeed = 3 * LEVEL_SPEEDS[lvl - 1];
    bgElements = generateBgElements();

    // Hide all overlays
    startOverlay.classList.add('hidden');
    gameoverOverlay.classList.add('hidden');
    levelOverlay.classList.add('hidden');
    victoryOverlay.classList.add('hidden');

    gameState = 'playing';
    running = true;
    lastTime = performance.now();
    gameLoop(lastTime);
  }

  // ---- GAME LOOP ----
  function gameLoop(timestamp) {
    if (!running) return;

    const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;

    update(dt);

    // Apply screen shake
    ctx.save();
    if (shakeTimer > 0) {
      const sx = (Math.random() - 0.5) * shakeMag;
      const sy = (Math.random() - 0.5) * shakeMag;
      ctx.translate(sx, sy);
    }

    // Draw everything
    drawBackground(dt);
    drawGround();
    drawBlackHole();

    obstacles.forEach(drawObstacle);
    powerups.forEach(pu => { if (!pu.collected) drawPowerup(pu); });

    if (spaceshipActive) drawSpaceship();
    drawNinja();
    drawInvincibleTimer();
    drawParticles();

    ctx.restore();

    frameId = requestAnimationFrame(gameLoop);
  }

  // ---- BUTTON HANDLERS ----
  startBtn.addEventListener('click', () => {
    init();
    startLevel(1);
  });

  retryBtn.addEventListener('click', () => {
    init();
    startLevel(1);
  });

  nextLevelBtn.addEventListener('click', () => {
    startLevel(level + 1);
  });

  playAgainBtn.addEventListener('click', () => {
    init();
    startLevel(1);
  });

  backBtn.addEventListener('click', () => {
    window.location.href = '../singleplayer.html';
  });

  backBtn2.addEventListener('click', () => {
    window.location.href = '../singleplayer.html';
  });

  // ---- INITIAL STATE ----
  init();

  // Draw initial frame behind start overlay
  drawBackground(0);
  drawGround();
  drawBlackHole();
  drawNinja();


  // ---- SPACEBAR RESTART ----
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      const goOverlay = document.getElementById('gameover-overlay');
      const vicOverlay = document.getElementById('victory-overlay');
      const retryBtn = document.getElementById('retry-btn');
      const playAgainBtn = document.getElementById('play-again-btn');

      if (goOverlay && !goOverlay.classList.contains('hidden') && retryBtn) {
        retryBtn.click();
      } else if (vicOverlay && !vicOverlay.classList.contains('hidden') && playAgainBtn) {
        playAgainBtn.click();
      }
    }
  });
})();

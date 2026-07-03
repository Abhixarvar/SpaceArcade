/* ===== Space Rangers — Multiplayer Game Engine ===== */
(function () {
  'use strict';

  // ── Constants ────────────────────────────────────────
  const CANVAS_W = 800;
  const CANVAS_H = 600;
  const BG = '#05051a';

  // Game specific
  const MAX_PLAYER_HEALTH = 100;
  const BASE_BOSS_HEALTH = 500;
  const PLAYER_SPEED = 5;
  const PLAYER_SIZE = 40;
  const BULLET_SPEED = 8;
  const BULLET_COOLDOWN = 15;
  const BOSS_SIZE = 80;

  // ── DOM refs ─────────────────────────────────────────
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  
  const hudEl = document.getElementById('spacerangers-hud');
  const canvasWrap = document.getElementById('canvas-wrap');
  const controlsHint = document.getElementById('controls-hint');
  
  const hudBossName = document.getElementById('hud-boss-name');
  const hudBossHealth = document.getElementById('hud-boss-health');
  const hudPhaseDisplay = document.getElementById('hud-phase-display');
  
  const hudNameL = document.getElementById('hud-name-left');
  const hudNameR = document.getElementById('hud-name-right');
  const hudHealthL = document.getElementById('hud-health-left');
  const hudHealthR = document.getElementById('hud-health-right');

  // Overlays
  const lobbyOverlay = document.getElementById('lobby-overlay');
  const waitingOverlay = document.getElementById('waiting-overlay');
  const connectingOverlay = document.getElementById('connecting-overlay');
  const countdownOverlay = document.getElementById('countdown-overlay');
  const gameoverOverlay = document.getElementById('gameover-overlay');
  const disconnectOverlay = document.getElementById('disconnect-overlay');

  // Lobby
  const createNameInput = document.getElementById('create-name');
  const createBtn = document.getElementById('create-btn');
  const createError = document.getElementById('create-error');
  const joinNameInput = document.getElementById('join-name');
  const joinCodeInput = document.getElementById('join-code');
  const joinBtn = document.getElementById('join-btn');
  const joinError = document.getElementById('join-error');

  // Waiting
  const displayCode = document.getElementById('display-code');
  const roomCodeBox = document.getElementById('room-code-box');
  const cancelWaitBtn = document.getElementById('cancel-wait-btn');

  // Connecting
  const cancelConnectBtn = document.getElementById('cancel-connect-btn');

  // Countdown
  const countdownNum = document.getElementById('countdown-num');

  // Game Over
  const gameoverTitle = document.getElementById('gameover-title');
  const gameoverText = document.getElementById('gameover-text');
  const finalPhase = document.getElementById('final-phase');
  const rematchBtn = document.getElementById('rematch-btn');
  const rematchStatus = document.getElementById('rematch-status');

  // Disconnect
  const backLobbyBtn = document.getElementById('back-lobby-btn');

  // Images
  const imgShip1 = document.getElementById('img-ship1');
  const imgShip2 = document.getElementById('img-ship2');

  // ── State ────────────────────────────────────────────
  let peer = null;
  let conn = null;
  let isHost = false;
  let myName = '';
  let opponentName = '';
  let roomCode = '';
  let gameRunning = false;
  let animFrameId = null;
  let myRematchVote = false;
  let opponentRematchVote = false;

  let state = null;

  function initState() {
    return {
      phase: 1,
      boss: {
        x: CANVAS_W / 2,
        y: 80,
        vx: 3,
        maxHealth: BASE_BOSS_HEALTH,
        health: BASE_BOSS_HEALTH,
        shootTimer: 0,
        moveTimer: 0
      },
      players: {
        p1: { x: CANVAS_W / 3, y: CANVAS_H - 80, health: MAX_PLAYER_HEALTH, cooldown: 0 },
        p2: { x: (CANVAS_W / 3) * 2, y: CANVAS_H - 80, health: MAX_PLAYER_HEALTH, cooldown: 0 }
      },
      bullets: [],
      particles: [],
      screenShake: 0,
      gameOver: false
    };
  }

  // Input tracking
  const keys = {};
  document.addEventListener('keydown', e => { 
    if(e.code === 'Space') e.preventDefault();
    keys[e.key] = true; 
    keys[e.code] = true; 
  });
  document.addEventListener('keyup', e => { 
    keys[e.key] = false; 
    keys[e.code] = false; 
  });

  // ── Helpers ──────────────────────────────────────────
  function show(el) { el.classList.remove('hidden'); }
  function hide(el) { el.classList.add('hidden'); }
  function hideAll() {
    [lobbyOverlay, waitingOverlay, connectingOverlay, countdownOverlay, gameoverOverlay, disconnectOverlay].forEach(hide);
  }

  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function updateHUD() {
    if (!state) return;

    hudBossHealth.style.width = Math.max(0, (state.boss.health / state.boss.maxHealth) * 100) + '%';
    hudPhaseDisplay.textContent = 'Phase ' + state.phase;
    
    hudHealthL.style.width = Math.max(0, (state.players.p1.health / MAX_PLAYER_HEALTH) * 100) + '%';
    hudHealthR.style.width = Math.max(0, (state.players.p2.health / MAX_PLAYER_HEALTH) * 100) + '%';
  }

  // ── Networking ───────────────────────────────────────
  function createRoom() {
    const name = createNameInput.value.trim();
    if (!name) { createError.textContent = 'Enter your name!'; return; }
    createError.textContent = '';
    myName = name;
    isHost = true;
    roomCode = generateRoomCode();

    hideAll();
    show(waitingOverlay);
    displayCode.textContent = roomCode;

    peer = new Peer('sr-' + roomCode, { debug: 0 });

    peer.on('open', () => {
      displayCode.textContent = roomCode;
    });

    peer.on('connection', dataConn => {
      conn = dataConn;
      setupConnection();
    });

    peer.on('error', err => {
      if (err.type === 'unavailable-id') {
        peer.destroy();
        roomCode = generateRoomCode();
        peer = new Peer('sr-' + roomCode, { debug: 0 });
        displayCode.textContent = roomCode;
        peer.on('open', () => { displayCode.textContent = roomCode; });
        peer.on('connection', dataConn => { conn = dataConn; setupConnection(); });
      } else {
        createError.textContent = 'Connection error. Try again.';
        hideAll(); show(lobbyOverlay);
      }
    });
  }

  function joinRoom() {
    const name = joinNameInput.value.trim();
    const code = joinCodeInput.value.trim().toUpperCase();
    if (!name) { joinError.textContent = 'Enter your name!'; return; }
    if (!code) { joinError.textContent = 'Enter room code!'; return; }
    joinError.textContent = '';
    myName = name;
    isHost = false;

    hideAll();
    show(connectingOverlay);

    peer = new Peer({ debug: 0 });
    peer.on('open', () => {
      conn = peer.connect('sr-' + code, { reliable: true });
      conn.on('open', () => {
        setupConnection();
      });
      conn.on('error', () => {
        joinError.textContent = 'Failed to connect. Check code.';
        hideAll(); show(lobbyOverlay);
        peer.destroy();
      });
    });
    peer.on('error', err => {
      joinError.textContent = 'Peer error: ' + err.type;
      hideAll(); show(lobbyOverlay);
    });
  }

  function setupConnection() {
    conn.on('data', data => {
      if (data.type === 'handshake') {
        if (isHost) {
          opponentName = data.name;
          conn.send({ type: 'handshake', name: myName });
          startCountdown();
        } else {
          opponentName = data.name;
        }
      }
      else if (data.type === 'start') {
        if (!isHost) startCountdown();
      }
      else if (data.type === 'state') {
        if (!isHost) {
          state = data.state;
          if (state.gameOver && gameRunning) endGame();
        }
      }
      else if (data.type === 'input') {
        if (isHost && state) {
          handleGuestInput(data.keys);
        }
      }
      else if (data.type === 'rematch') {
        opponentRematchVote = true;
        rematchStatus.textContent = opponentName + ' wants to play again!';
        checkRematch();
      }
    });

    conn.on('close', handleDisconnect);
    if (isHost) {
      conn.send({ type: 'handshake', name: myName });
    }
  }

  function handleDisconnect() {
    gameRunning = false;
    cancelAnimationFrame(animFrameId);
    hideAll();
    show(disconnectOverlay);
    if (peer) peer.destroy();
  }

  // ── Game Flow ────────────────────────────────────────
  function startCountdown() {
    hideAll();
    show(countdownOverlay);
    
    hudNameL.textContent = isHost ? myName : opponentName;
    hudNameR.textContent = isHost ? opponentName : myName;

    state = initState();
    updateHUD();

    if (isHost) conn.send({ type: 'start' });

    let count = 3;
    countdownNum.textContent = count;
    countdownNum.style.animation = 'none';
    void countdownNum.offsetWidth;
    countdownNum.style.animation = 'popIn 1s ease';

    const iv = setInterval(() => {
      count--;
      if (count > 0) {
        countdownNum.textContent = count;
        countdownNum.style.animation = 'none';
        void countdownNum.offsetWidth;
        countdownNum.style.animation = 'popIn 1s ease';
        if (window.audioManager) window.audioManager.playSound('blip');
      } else {
        clearInterval(iv);
        if (window.audioManager) window.audioManager.playSound('start');
        startGame();
      }
    }, 1000);
  }

  function startGame() {
    hideAll();
    hudEl.style.display = 'block';
    canvasWrap.style.display = 'block';
    controlsHint.style.display = 'block';
    gameRunning = true;
    myRematchVote = false;
    opponentRematchVote = false;

    if (isHost) {
      lastTime = performance.now();
      animFrameId = requestAnimationFrame(hostLoop);
    } else {
      animFrameId = requestAnimationFrame(guestLoop);
    }
  }

  function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animFrameId);
    finalPhase.textContent = state.phase;
    setTimeout(() => {
      hideAll();
      show(gameoverOverlay);
      rematchStatus.textContent = '';
      rematchBtn.textContent = 'Play Again';
      rematchBtn.disabled = false;
    }, 1000);
  }

  // ── Game Logic (Host) ────────────────────────────────
  let lastTime = 0;
  
  function handleGuestInput(guestKeys) {
    // Guest is player 2
    let p = state.players.p2;
    if (p.health <= 0) return;
    
    if (guestKeys['ArrowLeft'] || guestKeys['a']) p.x -= PLAYER_SPEED;
    if (guestKeys['ArrowRight'] || guestKeys['d']) p.x += PLAYER_SPEED;
    if (guestKeys['ArrowUp'] || guestKeys['w']) p.y -= PLAYER_SPEED;
    if (guestKeys['ArrowDown'] || guestKeys['s']) p.y += PLAYER_SPEED;
    
    p.x = Math.max(PLAYER_SIZE/2, Math.min(CANVAS_W - PLAYER_SIZE/2, p.x));
    p.y = Math.max(CANVAS_H/2, Math.min(CANVAS_H - PLAYER_SIZE/2, p.y));

    if (guestKeys['Space'] && p.cooldown <= 0) {
      fireBullet(p.x, p.y - PLAYER_SIZE/2, -BULLET_SPEED, 'player');
      p.cooldown = BULLET_COOLDOWN;
      if (window.audioManager) window.audioManager.playSound('laser');
    }
  }

  function processHostInput() {
    let p = state.players.p1;
    if (p.health <= 0) return;

    if (keys['ArrowLeft'] || keys['a']) p.x -= PLAYER_SPEED;
    if (keys['ArrowRight'] || keys['d']) p.x += PLAYER_SPEED;
    if (keys['ArrowUp'] || keys['w']) p.y -= PLAYER_SPEED;
    if (keys['ArrowDown'] || keys['s']) p.y += PLAYER_SPEED;
    
    p.x = Math.max(PLAYER_SIZE/2, Math.min(CANVAS_W - PLAYER_SIZE/2, p.x));
    p.y = Math.max(CANVAS_H/2, Math.min(CANVAS_H - PLAYER_SIZE/2, p.y));

    if (keys['Space'] && p.cooldown <= 0) {
      fireBullet(p.x, p.y - PLAYER_SIZE/2, -BULLET_SPEED, 'player');
      p.cooldown = BULLET_COOLDOWN;
      if (window.audioManager) window.audioManager.playSound('laser');
    }
  }

  function fireBullet(x, y, vy, owner) {
    state.bullets.push({ x, y, vy, owner, width: 4, height: 16 });
  }

  function spawnExplosion(x, y, color, count=10) {
    for (let i=0; i<count; i++) {
      state.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 1.0,
        color: color
      });
    }
  }

  function updateLogic() {
    if (state.gameOver) return;

    processHostInput();

    // Cooldowns
    if (state.players.p1.cooldown > 0) state.players.p1.cooldown--;
    if (state.players.p2.cooldown > 0) state.players.p2.cooldown--;

    // Screenshake decay
    if (state.screenShake > 0) state.screenShake *= 0.9;
    if (state.screenShake < 0.5) state.screenShake = 0;

    // Boss AI
    let b = state.boss;
    b.x += b.vx;
    if (b.x < BOSS_SIZE/2 || b.x > CANVAS_W - BOSS_SIZE/2) {
      b.vx *= -1;
      b.x += b.vx;
    }
    
    // erratic boss movement based on phase
    b.moveTimer++;
    if (b.moveTimer > 60 - state.phase*2) {
      b.moveTimer = 0;
      if (Math.random() > 0.5) b.vx *= -1;
    }

    b.shootTimer++;
    if (b.shootTimer > 80 - Math.min(50, state.phase * 5)) {
      b.shootTimer = 0;
      // Fire
      fireBullet(b.x - 20, b.y + BOSS_SIZE/2, BULLET_SPEED * 0.7, 'boss');
      fireBullet(b.x + 20, b.y + BOSS_SIZE/2, BULLET_SPEED * 0.7, 'boss');
      if (state.phase > 3) {
        fireBullet(b.x, b.y + BOSS_SIZE/2 + 20, BULLET_SPEED * 0.9, 'boss');
      }
    }

    // Bullets update & collision
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      let b = state.bullets[i];
      b.y += b.vy;

      // out of bounds
      if (b.y < -50 || b.y > CANVAS_H + 50) {
        state.bullets.splice(i, 1);
        continue;
      }

      // Hit Boss
      if (b.owner === 'player' && Math.abs(b.x - state.boss.x) < BOSS_SIZE/2 && Math.abs(b.y - state.boss.y) < BOSS_SIZE/2) {
        state.bullets.splice(i, 1);
        state.boss.health -= 10;
        spawnExplosion(b.x, b.y - 10, '#00f0ff', 5);
        if (window.audioManager) window.audioManager.playSound('blip');
        
        if (state.boss.health <= 0) {
          // Boss Defeated -> Next Phase
          if (window.audioManager) window.audioManager.playSound('explosion');
          state.screenShake = 15;
          spawnExplosion(state.boss.x, state.boss.y, '#ff007f', 40);
          
          state.phase++;
          state.boss.maxHealth = BASE_BOSS_HEALTH + (state.phase * 200);
          state.boss.health = state.boss.maxHealth;
          state.boss.vx = (Math.random() > 0.5 ? 1 : -1) * (3 + state.phase * 0.5);
          
          // Revive and heal both players
          state.players.p1.health = MAX_PLAYER_HEALTH;
          state.players.p2.health = MAX_PLAYER_HEALTH;
        }
        continue;
      }

      // Hit Players
      if (b.owner === 'boss') {
        let p1 = state.players.p1;
        let p2 = state.players.p2;

        if (p1.health > 0 && Math.abs(b.x - p1.x) < PLAYER_SIZE/2 && Math.abs(b.y - p1.y) < PLAYER_SIZE/2) {
          p1.health -= 20;
          state.bullets.splice(i, 1);
          spawnExplosion(p1.x, p1.y, '#ffea00', 5);
          state.screenShake = 5;
          if (window.audioManager) window.audioManager.playSound('hit');
          if (p1.health <= 0) spawnExplosion(p1.x, p1.y, '#ff0000', 30);
          continue;
        }

        if (p2.health > 0 && Math.abs(b.x - p2.x) < PLAYER_SIZE/2 && Math.abs(b.y - p2.y) < PLAYER_SIZE/2) {
          p2.health -= 20;
          state.bullets.splice(i, 1);
          spawnExplosion(p2.x, p2.y, '#ffea00', 5);
          state.screenShake = 5;
          if (window.audioManager) window.audioManager.playSound('hit');
          if (p2.health <= 0) spawnExplosion(p2.x, p2.y, '#ff0000', 30);
          continue;
        }
      }
    }

    // Check game over
    if (state.players.p1.health <= 0 && state.players.p2.health <= 0) {
      state.gameOver = true;
      state.screenShake = 20;
    }

    // Particles
    for (let i = state.particles.length - 1; i >= 0; i--) {
      let p = state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.05;
      if (p.life <= 0) state.particles.splice(i, 1);
    }
  }

  function hostLoop(time) {
    if (!gameRunning) return;
    updateLogic();
    draw();
    updateHUD();
    
    // Broadcast state to guest
    if (conn && conn.open) {
      conn.send({ type: 'state', state: state });
    }

    if (state.gameOver) {
      endGame();
    } else {
      animFrameId = requestAnimationFrame(hostLoop);
    }
  }

  // ── Game Logic (Guest) ────────────────────────────────
  function guestLoop() {
    if (!gameRunning) return;
    
    // Send input to host
    if (conn && conn.open) {
      let outKeys = {
        'ArrowLeft': keys['ArrowLeft'],
        'ArrowRight': keys['ArrowRight'],
        'ArrowUp': keys['ArrowUp'],
        'ArrowDown': keys['ArrowDown'],
        'a': keys['a'], 'd': keys['d'], 'w': keys['w'], 's': keys['s'],
        'Space': keys['Space']
      };
      conn.send({ type: 'input', keys: outKeys });
    }

    if (state) {
      draw();
      updateHUD();
    }

    animFrameId = requestAnimationFrame(guestLoop);
  }

  // ── Rendering ─────────────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.save();
    if (state.screenShake > 0) {
      const dx = (Math.random() - 0.5) * state.screenShake;
      const dy = (Math.random() - 0.5) * state.screenShake;
      ctx.translate(dx, dy);
    }

    // Boss
    const boss = state.boss;
    ctx.fillStyle = '#ff007f';
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, BOSS_SIZE/2, Math.PI, 0, false);
    ctx.lineTo(boss.x + BOSS_SIZE/2, boss.y + BOSS_SIZE/2);
    ctx.lineTo(boss.x - BOSS_SIZE/2, boss.y + BOSS_SIZE/2);
    ctx.closePath();
    ctx.fill();
    
    // Boss eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(boss.x, boss.y + 10, 15, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    // Eye looks at player roughly
    let eyeOffsetX = Math.sin(Date.now() / 500) * 5;
    ctx.arc(boss.x + eyeOffsetX, boss.y + 10, 5, 0, Math.PI*2);
    ctx.fill();

    // Players
    const p1 = state.players.p1;
    const p2 = state.players.p2;
    
    if (p1.health > 0) {
      ctx.drawImage(imgShip1, p1.x - PLAYER_SIZE/2, p1.y - PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);
    }
    
    if (p2.health > 0) {
      ctx.drawImage(imgShip2, p2.x - PLAYER_SIZE/2, p2.y - PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);
    }

    // Bullets
    for (let b of state.bullets) {
      if (b.owner === 'player') ctx.fillStyle = '#00f0ff';
      else ctx.fillStyle = '#ffea00';
      ctx.fillRect(b.x - b.width/2, b.y - b.height/2, b.width, b.height);
      // glow
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fillRect(b.x - b.width/2, b.y - b.height/2, b.width, b.height);
      ctx.shadowBlur = 0;
    }

    // Particles
    for (let p of state.particles) {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    ctx.restore();
  }

  // ── Rematch Logic ────────────────────────────────────
  function checkRematch() {
    if (myRematchVote && opponentRematchVote) {
      startCountdown();
    }
  }

  rematchBtn.addEventListener('click', () => {
    myRematchVote = true;
    rematchBtn.textContent = 'Waiting for opponent...';
    rematchBtn.disabled = true;
    if (conn && conn.open) {
      conn.send({ type: 'rematch' });
    }
    checkRematch();
  });

  // ── Event Listeners ──────────────────────────────────
  createBtn.addEventListener('click', createRoom);
  joinBtn.addEventListener('click', joinRoom);
  
  cancelWaitBtn.addEventListener('click', () => {
    if (peer) peer.destroy();
    hideAll();
    show(lobbyOverlay);
  });
  
  cancelConnectBtn.addEventListener('click', () => {
    if (peer) peer.destroy();
    hideAll();
    show(lobbyOverlay);
  });

  backLobbyBtn.addEventListener('click', () => {
    hudEl.style.display = 'none';
    canvasWrap.style.display = 'none';
    controlsHint.style.display = 'none';
    hideAll();
    show(lobbyOverlay);
  });

})();

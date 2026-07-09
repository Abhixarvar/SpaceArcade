/* ===== Space Rangers — Multiplayer Game Engine ===== */
(function () {
  'use strict';

  // ── Constants ────────────────────────────────────────
  const CANVAS_W = 1000;
  const CANVAS_H = 750;
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
  let isPaused = false;
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
        vx: 1.5,
        maxHealth: BASE_BOSS_HEALTH,
        health: BASE_BOSS_HEALTH,
        shootTimer: 0,
        moveTimer: 0
      },
      players: {
        p1: { x: CANVAS_W / 3, y: CANVAS_H - 80, health: MAX_PLAYER_HEALTH, cooldown: 0, shield: 0 },
        p2: { x: (CANVAS_W / 3) * 2, y: CANVAS_H - 80, health: MAX_PLAYER_HEALTH, cooldown: 0, shield: 0 }
      },
      bullets: [],
      particles: [],
      diamonds: [],
      screenShake: 0,
      gameOver: false
    };
  }

  // Input tracking
  const keys = {};
  document.addEventListener('keydown', e => { 
    if(e.code === 'Space') e.preventDefault();
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && gameRunning) e.preventDefault();
    if ((e.key === 'p' || e.key === 'Escape' || e.key === 'P') && gameRunning) {
      isPaused = !isPaused;
      if (conn && conn.open) conn.send({ type: 'pause', paused: isPaused });
    }
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
    // Send handshake as soon as connection is open
    function sendHandshake() {
      if (conn && conn.open) {
        conn.send({ type: 'handshake', name: myName });
      }
    }

    conn.on('open', sendHandshake);
    // If already open (host side — PeerJS fires 'connection' with an already-open conn)
    if (conn.open) sendHandshake();

    conn.on('data', data => {
      if (data.type === 'handshake') {
        opponentName = data.name;
        // Host received guest's handshake → send ack + start countdown
        if (isHost) {
          conn.send({ type: 'handshake-ack', name: myName });
          startCountdown();
        }
      }
      else if (data.type === 'handshake-ack') {
        // Guest receives host's ack → now we know names; start is coming
        opponentName = data.name;
      }
      else if (data.type === 'start') {
        if (!isHost) startCountdown();
      }
      else if (data.type === 'state') {
        if (!isHost) {
          state = data.state;
        }
      }
      else if (data.type === 'gameover') {
        if (!isHost && gameRunning) endGame();
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
      else if (data.type === 'pause') {
        isPaused = data.paused;
      }
    });

    conn.on('close', handleDisconnect);
  }

  function handleDisconnect() {
    gameRunning = false;
    isPaused = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    hideAll();
    show(disconnectOverlay);
    hudEl.style.display = 'none';
    canvasWrap.style.display = 'none';
    controlsHint.style.display = 'none';
    if (peer) { try { peer.destroy(); } catch(e){} peer = null; }
    conn = null;
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
    isPaused = false;
    myRematchVote = false;
    opponentRematchVote = false;
    stateFrameCounter = 0;

    if (isHost) {
      lastTime = performance.now();
      animFrameId = requestAnimationFrame(hostLoop);
    } else {
      animFrameId = requestAnimationFrame(guestLoop);
    }
  }

  function endGame() {
    gameRunning = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    finalPhase.textContent = state.phase;
    if (isHost && conn && conn.open) {
      conn.send({ type: 'gameover' });
    }
    hideAll();
    show(gameoverOverlay);
    rematchStatus.textContent = '';
    rematchBtn.textContent = 'Play Again';
    rematchBtn.disabled = false;

    // Draw game over to canvas for spectators
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = '#ff4444';
    ctx.font = 'bold 40px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 20);
    ctx.fillStyle = '#fff';
    ctx.font = '20px "Courier New", Courier, monospace';
    ctx.fillText(`Phase: ${state.phase}`, CANVAS_W / 2, CANVAS_H / 2 + 20);
  }

  // ── Game Logic (Host) ────────────────────────────────
  let lastTime = 0;
  let stateFrameCounter = 0;
  const STATE_SEND_INTERVAL = 3; // send state every N frames (~20fps at 60fps)
  
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
      fireBullet(p.x, p.y - PLAYER_SIZE/2, 0, -BULLET_SPEED, 'player');
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
      fireBullet(p.x, p.y - PLAYER_SIZE/2, 0, -BULLET_SPEED, 'player');
      p.cooldown = BULLET_COOLDOWN;
      if (window.audioManager) window.audioManager.playSound('laser');
    }
  }

  function fireBullet(x, y, vx, vy, owner) {
    state.bullets.push({ x, y, vx, vy, owner, width: 4, height: 16 });
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
    if (!state.gameOver) {
      processHostInput();

      // Cooldowns and Shields
      if (state.players.p1.cooldown > 0) state.players.p1.cooldown--;
      if (state.players.p2.cooldown > 0) state.players.p2.cooldown--;
      if (state.players.p1.shield > 0) state.players.p1.shield--;
      if (state.players.p2.shield > 0) state.players.p2.shield--;

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
      if (b.shootTimer > 150 - Math.min(80, state.phase * 5)) {
        b.shootTimer = 0;
        // Fire unpredictably spread but slower bullets
        let spreadCount = 2 + Math.floor(state.phase / 3);
        for(let i=0; i<spreadCount; i++) {
           let vx = (Math.random() - 0.5) * 4; // Reduced horizontal spread
           let vy = 1.5 + Math.random() * 1.5; // Much slower downward speed
           fireBullet(b.x, b.y + BOSS_SIZE/2, vx, vy, 'boss');
        }
      }
    }

    // Bullets update & collision
    for (let i = state.bullets.length - 1; i >= 0; i--) {
      let b = state.bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      // out of bounds
      if (b.y < -50 || b.y > CANVAS_H + 50 || b.x < -50 || b.x > CANVAS_W + 50) {
        state.bullets.splice(i, 1);
        continue;
      }

      if (!state.gameOver) {
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
            state.boss.vx = (Math.random() > 0.5 ? 1 : -1) * (1.5 + state.phase * 0.3);
            
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
            state.bullets.splice(i, 1);
            if (p1.shield > 0) {
              spawnExplosion(p1.x, p1.y, '#00f0ff', 3);
            } else {
              p1.health -= 20;
              spawnExplosion(p1.x, p1.y, '#ffea00', 5);
              state.screenShake = 5;
              if (window.audioManager) window.audioManager.playSound('hit');
              if (p1.health <= 0) spawnExplosion(p1.x, p1.y, '#ff0000', 30);
            }
            continue;
          }

          if (p2.health > 0 && Math.abs(b.x - p2.x) < PLAYER_SIZE/2 && Math.abs(b.y - p2.y) < PLAYER_SIZE/2) {
            state.bullets.splice(i, 1);
            if (p2.shield > 0) {
              spawnExplosion(p2.x, p2.y, '#ffea00', 3);
            } else {
              p2.health -= 20;
              spawnExplosion(p2.x, p2.y, '#ffea00', 5);
              state.screenShake = 5;
              if (window.audioManager) window.audioManager.playSound('hit');
              if (p2.health <= 0) spawnExplosion(p2.x, p2.y, '#ff0000', 30);
            }
            continue;
          }
        }
      }
    }

    if (!state.gameOver) {
      // Spawn Diamond
      if (Math.random() < 0.002) {
        state.diamonds.push({ x: 40 + Math.random() * (CANVAS_W - 80), y: -20, vy: 2, radius: 15 });
      }

      // Update Diamonds
      for (let i = state.diamonds.length - 1; i >= 0; i--) {
        let d = state.diamonds[i];
        d.y += d.vy;
        if (d.y > CANVAS_H + 50) {
          state.diamonds.splice(i, 1);
          continue;
        }

        let p1 = state.players.p1;
        let p2 = state.players.p2;
        let hitP1 = (p1.health > 0 && Math.abs(d.x - p1.x) < PLAYER_SIZE/2 + d.radius && Math.abs(d.y - p1.y) < PLAYER_SIZE/2 + d.radius);
        let hitP2 = (p2.health > 0 && Math.abs(d.x - p2.x) < PLAYER_SIZE/2 + d.radius && Math.abs(d.y - p2.y) < PLAYER_SIZE/2 + d.radius);

        if (hitP1 || hitP2) {
           state.diamonds.splice(i, 1);
           if (window.audioManager) window.audioManager.playSound('blip');
           spawnExplosion(d.x, d.y, '#fff', 15);
           
           if (p1.health <= 0) {
             p1.health = MAX_PLAYER_HEALTH; // revive P1
             spawnExplosion(p1.x, p1.y, '#00f0ff', 20);
           } else if (p2.health <= 0) {
             p2.health = MAX_PLAYER_HEALTH; // revive P2
             spawnExplosion(p2.x, p2.y, '#ffea00', 20);
           } else {
             // both alive, shield for 5 seconds
             p1.shield = 300;
             p2.shield = 300;
           }
           continue;
        }
      }

      // Check game over
      if (state.players.p1.health <= 0 && state.players.p2.health <= 0) {
        state.gameOver = true;
        state.screenShake = 20;
        setTimeout(() => {
          endGame();
        }, 1500);
      }
    }

    // Screenshake decay
    if (state.screenShake > 0) state.screenShake *= 0.9;
    if (state.screenShake < 0.5) state.screenShake = 0;

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
    if (!isPaused) {
      updateLogic();
    }
    draw();
    if (isPaused) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#fff';
      ctx.font = '40px "Courier New", Courier, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', CANVAS_W / 2, CANVAS_H / 2);
      ctx.restore();
    }
    updateHUD();
    
    // Broadcast state to guest (throttled to ~20fps)
    stateFrameCounter++;
    if (conn && conn.open && stateFrameCounter >= STATE_SEND_INTERVAL) {
      stateFrameCounter = 0;
      const netState = {
        phase: state.phase,
        boss: state.boss,
        players: state.players,
        bullets: state.bullets,
        screenShake: state.screenShake,
        particles: state.particles,
        diamonds: state.diamonds,
        gameOver: state.gameOver
      };
      conn.send({ type: 'state', state: netState });
    }

    animFrameId = requestAnimationFrame(hostLoop);
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
      if (isPaused) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = '#fff';
        ctx.font = '40px "Courier New", Courier, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', CANVAS_W / 2, CANVAS_H / 2);
        ctx.restore();
      }
      updateHUD();
    }

    animFrameId = requestAnimationFrame(guestLoop);
  }

  // ── Rendering ─────────────────────────────────────────
  function draw() {
    // Background fill
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.save();
    if (state.screenShake > 0) {
      const dx = (Math.random() - 0.5) * state.screenShake;
      const dy = (Math.random() - 0.5) * state.screenShake;
      ctx.translate(dx, dy);
    }

    // Boss
    const boss = state.boss;
    // Boss glow
    ctx.save();
    ctx.shadowColor = '#ff007f';
    ctx.shadowBlur = 20;
    ctx.fillStyle = '#ff007f';
    ctx.beginPath();
    ctx.arc(boss.x, boss.y, BOSS_SIZE/2, Math.PI, 0, false);
    ctx.lineTo(boss.x + BOSS_SIZE/2, boss.y + BOSS_SIZE/2);
    ctx.lineTo(boss.x - BOSS_SIZE/2, boss.y + BOSS_SIZE/2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    
    // Boss eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(boss.x, boss.y + 10, 15, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    let eyeOffsetX = Math.sin(Date.now() / 500) * 5;
    ctx.arc(boss.x + eyeOffsetX, boss.y + 10, 5, 0, Math.PI*2);
    ctx.fill();

    // Players
    const p1 = state.players.p1;
    const p2 = state.players.p2;
    
    if (p1.health > 0) {
      ctx.save();
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 12;
      ctx.drawImage(imgShip1, p1.x - PLAYER_SIZE/2, p1.y - PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);
      ctx.restore();
    }
    
    if (p2.health > 0) {
      ctx.save();
      ctx.shadowColor = '#ffea00';
      ctx.shadowBlur = 12;
      ctx.drawImage(imgShip2, p2.x - PLAYER_SIZE/2, p2.y - PLAYER_SIZE/2, PLAYER_SIZE, PLAYER_SIZE);
      ctx.restore();
    }

    // Render Shields
    if (p1.health > 0 && p1.shield > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p1.x, p1.y, PLAYER_SIZE/2 + 10, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }
    
    if (p2.health > 0 && p2.shield > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 234, 0, 0.8)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#ffea00';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p2.x, p2.y, PLAYER_SIZE/2 + 10, 0, Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }

    // Render Diamonds
    if (state.diamonds) {
      for (let d of state.diamonds) {
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y - d.radius);
        ctx.lineTo(d.x + d.radius, d.y);
        ctx.lineTo(d.x, d.y + d.radius);
        ctx.lineTo(d.x - d.radius, d.y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
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

    // Spectating text
    let myPlayer = isHost ? p1 : p2;
    let otherPlayer = isHost ? p2 : p1;
    if (myPlayer.health <= 0 && otherPlayer.health > 0) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.font = '40px "Courier New", Courier, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOU DIED - SPECTATING', CANVAS_W / 2, CANVAS_H / 2);
    }

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
    handleDisconnect();
    hideAll();
    show(lobbyOverlay);
  });

  const backBtn = document.getElementById('back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', (e) => {
      if (window.parent !== window) {
        e.preventDefault();
        window.parent.postMessage({ type: 'LEAVE_GAME' }, '*');
      }
    });
  }

  const backArcadeBtn = document.getElementById('back-arcade-btn');
  if (backArcadeBtn) {
    backArcadeBtn.addEventListener('click', () => {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'LEAVE_GAME' }, '*');
      } else {
        window.location.href = '../index.html';
      }
    });
  }

  // Auto-connect from Global Lobby
  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get('role');
  const roomParam = urlParams.get('room');

  if (roleParam && roomParam) {
    hideAll();
    roomCode = roomParam.toUpperCase();
    
    if (roleParam === 'host') {
      isHost = true;
      myName = urlParams.get('name') || 'P1';
      show(waitingOverlay);
      displayCode.textContent = roomCode;
      peer = new Peer('sr-' + roomCode, { debug: 0 });
      peer.on('open', () => { displayCode.textContent = roomCode; });
      peer.on('connection', dataConn => { conn = dataConn; setupConnection(); });
      peer.on('error', err => {
        console.error('PeerJS error:', err);
        hideAll(); show(lobbyOverlay);
        createError.textContent = 'Connection error from Lobby.';
      });
    } else {
      isHost = false;
      myName = urlParams.get('name') || 'P2';
      show(connectingOverlay);
      peer = new Peer(undefined, { debug: 0 });
      peer.on('open', () => {
        conn = peer.connect('sr-' + roomCode, { reliable: true });
        conn.on('open', () => { setupConnection(); });
        conn.on('error', () => {
          hideAll(); show(lobbyOverlay);
          joinError.textContent = 'Could not connect from Lobby.';
        });
      });
      peer.on('error', err => {
        console.error('PeerJS error:', err);
        hideAll(); show(lobbyOverlay);
        joinError.textContent = 'Room not found from Lobby.';
      });
      setTimeout(() => {
        if (!conn || !conn.open) {
          hideAll(); show(lobbyOverlay);
          joinError.textContent = 'Connection timed out from Lobby.';
        }
      }, 10000);
    }
  }

})();

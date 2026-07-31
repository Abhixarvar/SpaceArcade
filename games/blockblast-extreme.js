/* ===== Block Blast: Extreme Saga ===== */
/* Endless high-score mode — no levels, pure score chase */
(function () {
  const canvas    = document.getElementById('game-canvas');
  const ctx       = canvas.getContext('2d');
  const scoreEl   = document.getElementById('score');
  const comboEl   = document.getElementById('combo');
  const comboCell = document.getElementById('combo-cell');
  const linesEl   = document.getElementById('lines');
  const tierEl    = document.getElementById('tier-badge');
  const highScoreEl = document.getElementById('high-score');
  const bestDisplay = document.getElementById('best-score-display');
  const startOverlay    = document.getElementById('start-overlay');
  const gameoverOverlay = document.getElementById('gameover-overlay');
  const gameoverText    = document.getElementById('gameover-text');
  const startBtn  = document.getElementById('start-btn');
  const retryBtn  = document.getElementById('retry-btn');
  const pieceTray = document.getElementById('piece-tray');

  // ── Board constants ──
  const COLS = 10;
  const ROWS = 10;
  const CELL = canvas.width / COLS; // 30px

  // ── Tiers (score milestones) ──
  const TIERS = [
    { score: 0,    label: '🔥 Rookie',   color: '#ff6b6b' },
    { score: 200,  label: '⚡ Blaster',  color: '#ffaa00' },
    { score: 600,  label: '💎 Expert',   color: '#00f0ff' },
    { score: 1500, label: '🌟 Master',   color: '#ffd700' },
    { score: 3000, label: '🚀 Legend',   color: '#b44aff' },
    { score: 6000, label: '💥 EXTREME',  color: '#ff4444' },
  ];

  // ── All piece definitions (same as base game + extras) ──
  const PIECE_DEFS = [
    { blocks: [[0,0]], color: '#ffd700', glow: 'rgba(255,215,0,0.4)', name: 'dot', weight: 8 },
    { blocks: [[0,0],[0,1]], color: '#00f0ff', glow: 'rgba(0,240,255,0.4)', name: 'h2', weight: 7 },
    { blocks: [[0,0],[0,1],[0,2]], color: '#00ff88', glow: 'rgba(0,255,136,0.4)', name: 'h3', weight: 7 },
    { blocks: [[0,0],[0,1],[0,2],[0,3]], color: '#00f0ff', glow: 'rgba(0,240,255,0.4)', name: 'h4', weight: 5 },
    { blocks: [[0,0],[0,1],[0,2],[0,3],[0,4]], color: '#4488ff', glow: 'rgba(68,136,255,0.4)', name: 'h5', weight: 3 },
    { blocks: [[0,0],[1,0]], color: '#ff8800', glow: 'rgba(255,136,0,0.4)', name: 'v2', weight: 7 },
    { blocks: [[0,0],[1,0],[2,0]], color: '#b44aff', glow: 'rgba(180,74,255,0.4)', name: 'v3', weight: 7 },
    { blocks: [[0,0],[1,0],[2,0],[3,0]], color: '#ff8800', glow: 'rgba(255,136,0,0.4)', name: 'v4', weight: 5 },
    { blocks: [[0,0],[1,0],[2,0],[3,0],[4,0]], color: '#ff6bcd', glow: 'rgba(255,107,205,0.4)', name: 'v5', weight: 3 },
    { blocks: [[0,0],[0,1],[1,0],[1,1]], color: '#ffd700', glow: 'rgba(255,215,0,0.4)', name: 'sq2', weight: 6 },
    { blocks: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]], color: '#ff4444', glow: 'rgba(255,68,68,0.4)', name: 'sq3', weight: 2 },
    { blocks: [[0,0],[1,0],[2,0],[2,1]], color: '#ff8800', glow: 'rgba(255,136,0,0.4)', name: 'L', weight: 5 },
    { blocks: [[0,1],[1,1],[2,0],[2,1]], color: '#4488ff', glow: 'rgba(68,136,255,0.4)', name: 'rL', weight: 5 },
    { blocks: [[0,0],[0,1],[0,2],[1,1]], color: '#b44aff', glow: 'rgba(180,74,255,0.4)', name: 'T', weight: 5 },
    { blocks: [[0,1],[0,2],[1,0],[1,1]], color: '#00ff88', glow: 'rgba(0,255,136,0.4)', name: 'S', weight: 5 },
    { blocks: [[0,0],[0,1],[1,1],[1,2]], color: '#ff4444', glow: 'rgba(255,68,68,0.4)', name: 'Z', weight: 5 },
    { blocks: [[0,0],[0,1],[1,0]], color: '#ff6b9d', glow: 'rgba(255,107,157,0.4)', name: 'corner', weight: 6 },
    // Extra hard pieces at high score
    { blocks: [[0,0],[0,2],[1,1],[2,0],[2,2]], color: '#ff4444', glow: 'rgba(255,68,68,0.4)', name: 'X', weight: 1 },
    { blocks: [[0,0],[0,1],[1,1],[2,1],[2,2]], color: '#00ff88', glow: 'rgba(0,255,136,0.4)', name: 'bigS', weight: 2 },
    { blocks: [[0,0],[1,0],[1,1],[1,2],[2,2]], color: '#b44aff', glow: 'rgba(180,74,255,0.4)', name: 'bigZ', weight: 2 },
  ];

  // ── Game state ──
  let board = [];
  let score, lines, comboCount, highScore, currentTierIdx;
  let pieces = [];
  let selectedPiece = -1;
  let ghostPos = null;
  let running = false;
  let isPaused = false;
  let kbRow = 4, kbCol = 4;
  let clearEffects = [];
  let starParticles = [];
  let comboResetTimer = null; // tracks consecutive clears

  // Load high score
  highScore = parseInt(localStorage.getItem('extremeBlastHighScore') || '0');
  highScoreEl.textContent = highScore;
  if (highScore > 0) {
    bestDisplay.textContent = `🏆 Your Best: ${highScore.toLocaleString()}`;
  }

  // ── Weighted random piece picker ──
  function buildPool() {
    // At higher scores, reduce easy small pieces, increase hard ones
    const pool = [];
    const difficulty = Math.min(score / 500, 1); // 0..1 scale
    PIECE_DEFS.forEach(p => {
      // Adjust weight: large pieces get more common at high scores
      const sizeBonus = p.blocks.length >= 5 ? difficulty * 3 : 0;
      const adjusted = Math.max(1, p.weight - sizeBonus * 2 + (p.blocks.length >= 4 ? sizeBonus : 0));
      for (let i = 0; i < adjusted; i++) pool.push(p);
    });
    return pool;
  }

  function getRandomPiece() {
    const pool = buildPool();
    const idx = Math.floor(Math.random() * pool.length);
    const def = pool[idx];
    return { ...def, blocks: def.blocks.map(b => [...b]) };
  }

  function refillTray() {
    pieces = [getRandomPiece(), getRandomPiece(), getRandomPiece()];
    selectedPiece = -1;
    ghostPos = null;
    renderTray();
  }

  function renderTray() {
    pieceTray.innerHTML = '';
    pieces.forEach((piece, idx) => {
      if (!piece) {
        const empty = document.createElement('div');
        empty.className = 'tray-slot empty';
        pieceTray.appendChild(empty);
        return;
      }
      const slot = document.createElement('div');
      slot.className = 'tray-slot' + (idx === selectedPiece ? ' selected' : '');
      slot.setAttribute('data-idx', idx);

      const slotCanvas = document.createElement('canvas');
      const maxR = Math.max(...piece.blocks.map(b => b[0])) + 1;
      const maxC = Math.max(...piece.blocks.map(b => b[1])) + 1;
      const cellSize = Math.min(20, 70 / Math.max(maxR, maxC));
      slotCanvas.width  = maxC * cellSize + 4;
      slotCanvas.height = maxR * cellSize + 4;
      const sCtx = slotCanvas.getContext('2d');

      piece.blocks.forEach(([r, c]) => {
        sCtx.save();
        sCtx.shadowColor = piece.color;
        sCtx.shadowBlur  = 4;
        sCtx.fillStyle   = piece.color;
        sCtx.beginPath();
        sCtx.roundRect(c * cellSize + 2, r * cellSize + 2, cellSize - 2, cellSize - 2, 2);
        sCtx.fill();
        sCtx.shadowBlur  = 0;
        sCtx.fillStyle   = 'rgba(255,255,255,0.2)';
        sCtx.fillRect(c * cellSize + 4, r * cellSize + 4, cellSize - 6, 1);
        sCtx.restore();
      });

      slot.appendChild(slotCanvas);

      slot.addEventListener('click', () => {
        if (!running || isPaused) return;
        selectedPiece = idx;
        ghostPos = null;
        renderTray();
        SFX.step();
      });

      slot.draggable = true;
      slot.addEventListener('dragstart', (e) => {
        if (!running || isPaused) return;
        selectedPiece = idx;
        renderTray();
        e.dataTransfer.setData('text/plain', idx.toString());
        SFX.step();
      });

      pieceTray.appendChild(slot);
    });
  }

  // ── Board logic ──
  function createBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  }

  function canPlace(piece, row, col) {
    return piece.blocks.every(([br, bc]) => {
      const r = br + row, c = bc + col;
      return r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === null;
    });
  }

  function placePiece(piece, row, col) {
    piece.blocks.forEach(([br, bc]) => {
      board[br + row][bc + col] = { color: piece.color, glow: piece.glow };
    });
    SFX.eat();
  }

  function clearLines() {
    const rowsToClear = [];
    const colsToClear = [];

    for (let r = 0; r < ROWS; r++) {
      if (board[r].every(c => c !== null)) rowsToClear.push(r);
    }
    for (let c = 0; c < COLS; c++) {
      let full = true;
      for (let r = 0; r < ROWS; r++) {
        if (board[r][c] === null) { full = false; break; }
      }
      if (full) colsToClear.push(c);
    }

    const totalCleared = rowsToClear.length + colsToClear.length;
    if (totalCleared === 0) {
      // No clear → reset combo
      comboCount = 1;
      updateComboUI();
      return 0;
    }

    // Spawn effects
    rowsToClear.forEach(r => {
      for (let c = 0; c < COLS; c++) {
        clearEffects.push({ row: r, col: c, frame: 0, maxFrames: 20 });
        spawnStarBurst(c * CELL + CELL / 2, r * CELL + CELL / 2);
      }
    });
    colsToClear.forEach(c => {
      for (let r = 0; r < ROWS; r++) {
        if (!rowsToClear.includes(r)) {
          clearEffects.push({ row: r, col: c, frame: 0, maxFrames: 20 });
          spawnStarBurst(c * CELL + CELL / 2, r * CELL + CELL / 2);
        }
      }
    });

    // Clear cells after brief flash
    setTimeout(() => {
      rowsToClear.forEach(r => board[r].fill(null));
      colsToClear.forEach(c => {
        for (let r = 0; r < ROWS; r++) board[r][c] = null;
      });
    }, 150);

    // Combo multiplier
    comboCount++;
    const multiplier = Math.min(comboCount, 8);
    updateComboUI();

    // Scoring: base = 10 per cell cleared, × combo × bonus for multi-line
    const cellsCleared =
      rowsToClear.length * COLS +
      colsToClear.length * ROWS -
      rowsToClear.length * colsToClear.length; // subtract double-counted intersections
    const multiBonus = totalCleared >= 3 ? 2 : totalCleared >= 2 ? 1.5 : 1;
    const gained = Math.round(cellsCleared * 10 * multiplier * multiBonus);
    score += gained;
    lines += totalCleared;

    // Update HUD
    scoreEl.textContent = score.toLocaleString();
    linesEl.textContent = lines;
    bumpEl(scoreEl);

    // Update tier
    updateTier();

    // Update best
    if (score > highScore) {
      highScore = score;
      highScoreEl.textContent = highScore.toLocaleString();
      localStorage.setItem('extremeBlastHighScore', highScore);
      bumpEl(highScoreEl);
    }

    // Sound
    if (totalCleared >= 3) SFX.levelUp();
    else SFX.powerup();

    // Reset combo timer
    if (comboResetTimer) clearTimeout(comboResetTimer);
    comboResetTimer = setTimeout(() => {
      comboCount = 1;
      updateComboUI();
    }, 4000); // 4s window for next clear to chain

    return totalCleared;
  }

  function spawnStarBurst(x, y) {
    const colors = ['#ffd700','#ff6bcd','#00f0ff','#00ff88','#ff8800','#fff'];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.5;
      const speed = 2 + Math.random() * 2.5;
      starParticles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 2,
      });
    }
  }

  function canAnyPieceFit() {
    for (let i = 0; i < pieces.length; i++) {
      if (!pieces[i]) continue;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (canPlace(pieces[i], r, c)) return true;
        }
      }
    }
    return false;
  }

  // ── HUD helpers ──
  function bumpEl(el) {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 300);
  }

  function updateComboUI() {
    comboEl.textContent = `x${comboCount}`;
    if (comboCount > 1) {
      comboCell.classList.add('combo');
      comboCell.classList.remove('combo-inactive');
    } else {
      comboCell.classList.remove('combo');
      comboCell.classList.add('combo-inactive');
    }
  }

  function updateTier() {
    let idx = 0;
    for (let i = TIERS.length - 1; i >= 0; i--) {
      if (score >= TIERS[i].score) { idx = i; break; }
    }
    if (idx !== currentTierIdx) {
      currentTierIdx = idx;
      const tier = TIERS[idx];
      tierEl.textContent = tier.label;
      tierEl.style.color = tier.color;
      tierEl.style.borderColor = tier.color;
      // Celebration
      SFX.levelUp();
      for (let i = 0; i < 15; i++) {
        spawnStarBurst(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        );
      }
    }
  }

  // ── Drawing ──
  function drawCell(x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha || 1;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 6;
    ctx.fillStyle   = color;
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, size - 2, size - 2, 3);
    ctx.fill();
    ctx.shadowBlur  = 0;
    ctx.fillStyle   = 'rgba(255,255,255,0.2)';
    ctx.fillRect(x + 3, y + 3, size - 8, 2);
    ctx.fillRect(x + 3, y + 3, 2, size - 8);
    ctx.fillStyle   = 'rgba(0,0,0,0.2)';
    ctx.fillRect(x + 3, y + size - 5, size - 6, 2);
    ctx.fillRect(x + size - 5, y + 3, 2, size - 6);
    ctx.restore();
  }

  function draw() {
    // Background
    ctx.fillStyle = 'rgba(10, 10, 46, 0.97)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.fillStyle   = 'rgba(255,255,255,0.025)';
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth   = 1;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        ctx.beginPath();
        ctx.roundRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4, 3);
        ctx.fill();
        ctx.stroke();
      }
    }

    // Board cells
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) {
          const effect = clearEffects.find(e => e.row === r && e.col === c);
          const alpha  = effect ? (effect.frame % 4 < 2 ? 1 : 0.2) : 1;
          drawCell(c * CELL, r * CELL, CELL, board[r][c].color, alpha);
        }
      }
    }

    // Ghost
    if (ghostPos && selectedPiece >= 0 && pieces[selectedPiece]) {
      const piece = pieces[selectedPiece];
      const valid = canPlace(piece, ghostPos.row, ghostPos.col);
      piece.blocks.forEach(([br, bc]) => {
        const r = br + ghostPos.row, c = bc + ghostPos.col;
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
          ctx.save();
          ctx.globalAlpha   = valid ? 0.4 : 0.15;
          ctx.strokeStyle   = valid ? piece.color : '#ff4444';
          ctx.lineWidth     = 2;
          ctx.shadowColor   = valid ? piece.color : '#ff4444';
          ctx.shadowBlur    = 6;
          ctx.beginPath();
          ctx.roundRect(c * CELL + 2, r * CELL + 2, CELL - 4, CELL - 4, 3);
          ctx.stroke();
          if (valid) {
            ctx.fillStyle   = piece.color;
            ctx.globalAlpha = 0.15;
            ctx.fill();
          }
          ctx.restore();
        }
      });
    }

    // Star particles
    starParticles.forEach(p => {
      ctx.save();
      const progress = p.life / p.maxLife;
      ctx.globalAlpha = 1 - progress;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Paused overlay
    if (isPaused) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle   = '#fff';
      ctx.font        = '36px "Bungee", cursive';
      ctx.textAlign   = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
      ctx.restore();
    }
  }

  // ── Game loop ──
  let animFrame;

  function gameStep() {
    if (!isPaused) {
      clearEffects.forEach(e => e.frame++);
      clearEffects = clearEffects.filter(e => e.frame < e.maxFrames);

      starParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life++;
      });
      starParticles = starParticles.filter(p => p.life < p.maxLife);
    }

    draw();

    if (running) animFrame = requestAnimationFrame(gameStep);
  }

  // ── Interaction ──
  document.addEventListener('keydown', e => {
    if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && running) {
      isPaused = !isPaused;
    }
    if (!running || isPaused) return;
    switch (e.key) {
      case '1': if (pieces[0]) { selectedPiece = 0; renderTray(); SFX.step(); } e.preventDefault(); break;
      case '2': if (pieces[1]) { selectedPiece = 1; renderTray(); SFX.step(); } e.preventDefault(); break;
      case '3': if (pieces[2]) { selectedPiece = 2; renderTray(); SFX.step(); } e.preventDefault(); break;
      case 'ArrowLeft': case 'a': case 'A': kbCol = Math.max(0, kbCol - 1); updateGhost(kbRow, kbCol); SFX.step(); e.preventDefault(); break;
      case 'ArrowRight': case 'd': case 'D': kbCol = Math.min(COLS - 1, kbCol + 1); updateGhost(kbRow, kbCol); SFX.step(); e.preventDefault(); break;
      case 'ArrowUp': case 'w': case 'W': kbRow = Math.max(0, kbRow - 1); updateGhost(kbRow, kbCol); SFX.step(); e.preventDefault(); break;
      case 'ArrowDown': case 's': case 'S': kbRow = Math.min(ROWS - 1, kbRow + 1); updateGhost(kbRow, kbCol); SFX.step(); e.preventDefault(); break;
      case ' ': case 'Enter': tryPlace(); e.preventDefault(); break;
    }
  });

  canvas.addEventListener('dragover', e => {
    e.preventDefault();
    if (isPaused) return;
    const rect = canvas.getBoundingClientRect();
    updateGhost(
      Math.floor(((e.clientY - rect.top) * (canvas.height / rect.height)) / CELL),
      Math.floor(((e.clientX - rect.left) * (canvas.width / rect.width)) / CELL)
    );
  });

  canvas.addEventListener('drop', e => {
    e.preventDefault();
    if (isPaused) return;
    if (ghostPos && selectedPiece >= 0 && pieces[selectedPiece]) tryPlace();
  });

  canvas.addEventListener('mousemove', e => {
    if (selectedPiece < 0 || !running || isPaused) return;
    const rect = canvas.getBoundingClientRect();
    updateGhost(
      Math.floor(((e.clientY - rect.top) * (canvas.height / rect.height)) / CELL),
      Math.floor(((e.clientX - rect.left) * (canvas.width / rect.width)) / CELL)
    );
  });

  canvas.addEventListener('click', e => {
    if (selectedPiece < 0 || !running || isPaused) return;
    const rect = canvas.getBoundingClientRect();
    updateGhost(
      Math.floor(((e.clientY - rect.top) * (canvas.height / rect.height)) / CELL),
      Math.floor(((e.clientX - rect.left) * (canvas.width / rect.width)) / CELL)
    );
    tryPlace();
  });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (selectedPiece < 0 || !running || isPaused) return;
    const touch = e.touches[0];
    const rect  = canvas.getBoundingClientRect();
    updateGhost(
      Math.floor(((touch.clientY - rect.top) * (canvas.height / rect.height)) / CELL),
      Math.floor(((touch.clientX - rect.left) * (canvas.width / rect.width)) / CELL)
    );
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    if (ghostPos && selectedPiece >= 0 && pieces[selectedPiece]) tryPlace();
  });

  function updateGhost(row, col) {
    if (selectedPiece < 0 || !pieces[selectedPiece]) return;
    const piece = pieces[selectedPiece];
    const centerR = Math.floor((Math.max(...piece.blocks.map(b => b[0])) - Math.min(...piece.blocks.map(b => b[0]))) / 2);
    const centerC = Math.floor((Math.max(...piece.blocks.map(b => b[1])) - Math.min(...piece.blocks.map(b => b[1]))) / 2);
    ghostPos = { row: row - centerR, col: col - centerC };
  }

  function tryPlace() {
    if (selectedPiece < 0 || !pieces[selectedPiece] || !ghostPos) return;
    const piece = pieces[selectedPiece];
    if (canPlace(piece, ghostPos.row, ghostPos.col)) {
      placePiece(piece, ghostPos.row, ghostPos.col);
      pieces[selectedPiece] = null;

      clearLines(); // updates score, combo, tier inside

      selectedPiece = -1;
      ghostPos      = null;

      if (pieces.every(p => p === null)) {
        refillTray();
      } else {
        renderTray();
      }

      // Check if stuck
      if (!canAnyPieceFit()) {
        setTimeout(gameOver, 500);
      }
    } else {
      SFX.hit();
      ctx.save();
      ctx.fillStyle = 'rgba(255,0,0,0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  }

  // ── Game flow ──
  function startGame() {
    board         = createBoard();
    score         = 0;
    lines         = 0;
    comboCount    = 1;
    currentTierIdx = -1; // force first-tier update
    clearEffects  = [];
    starParticles = [];
    kbRow = 4; kbCol = 4;

    scoreEl.textContent = '0';
    linesEl.textContent = '0';
    highScoreEl.textContent = highScore.toLocaleString();
    updateComboUI();
    updateTier();

    refillTray();

    startOverlay.classList.add('hidden');
    gameoverOverlay.classList.add('hidden');
    running = true;
    animFrame = requestAnimationFrame(gameStep);
    document.activeElement && document.activeElement.blur();
  }

  function gameOver() {
    running = false;
    cancelAnimationFrame(animFrame);
    if (comboResetTimer) clearTimeout(comboResetTimer);
    SFX.hit();
    setTimeout(() => SFX.gameOver(), 200);

    const isNewBest = score >= highScore;
    if (isNewBest) {
      highScore = score;
      localStorage.setItem('extremeBlastHighScore', highScore);
      highScoreEl.textContent = highScore.toLocaleString();
    }

    gameoverText.innerHTML =
      `Score: <span class="highlight">${score.toLocaleString()}</span> — ` +
      `${lines} lines cleared` +
      `${isNewBest && score > 0 ? ' &nbsp;🏆 <span class="highlight">New Record!</span>' : ''}`;

    gameoverOverlay.classList.remove('hidden');
  }

  // ── Buttons ──
  startBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', startGame);

  const backBtn = document.getElementById('back-arcade-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (window.parent !== window) {
        window.parent.postMessage({ type: 'LEAVE_GAME' }, '*');
      } else {
        window.location.href = '../singleplayer.html';
      }
    });
  }

  // ── Spacebar restart from game over ──
  document.addEventListener('keydown', e => {
    if (e.code === 'Space') {
      const goOverlay = document.getElementById('gameover-overlay');
      if (goOverlay && !goOverlay.classList.contains('hidden')) {
        retryBtn.click();
      }
    }
  });

  // Initial draw
  board = createBoard();
  draw();
})();

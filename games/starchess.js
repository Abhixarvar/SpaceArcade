/* ===== Star Combat Chess — Sci-Fi Engine, Vector Art, Smooth Animations & Online P2P ===== */

(function () {
  'use strict';

  // ---- Canvas & Elements ----
  const canvas = document.getElementById('starchess-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const turnIndicatorEl = document.getElementById('turn-indicator');
  const turnIconEl = document.getElementById('turn-icon');
  const turnTextEl = document.getElementById('turn-text');
  const statusBadgeEl = document.getElementById('status-badge');
  const darkCapturedEl = document.getElementById('dark-captured');
  const lightCapturedEl = document.getElementById('light-captured');
  const moveLogEl = document.getElementById('move-log');
  const moveCountEl = document.getElementById('move-count');
  const boardWrapEl = document.querySelector('.starchess-canvas-wrap');

  // Buttons
  const btnModeAi = document.getElementById('btn-mode-ai');
  const btnModeLocal = document.getElementById('btn-mode-local');
  const btnModeOnline = document.getElementById('btn-mode-online');
  const aiDifficultySelect = document.getElementById('ai-difficulty');
  const btnFlip = document.getElementById('btn-flip');
  const btnUndo = document.getElementById('btn-undo');
  const btnRestart = document.getElementById('btn-restart');
  const difficultyWrap = document.getElementById('difficulty-wrap');

  // Tournament Chess Clock Elements
  const clocksBar = document.getElementById('clocks-bar');
  const clockLightEl = document.getElementById('clock-light');
  const clockDarkEl = document.getElementById('clock-dark');
  const clockLightBox = document.getElementById('clock-light-box');
  const clockDarkBox = document.getElementById('clock-dark-box');

  // Buzzer
  const buzzerWrap = document.getElementById('buzzer-wrap');
  const btnBuzzer = document.getElementById('btn-buzzer');

  // Overlays
  const startOverlay = document.getElementById('start-overlay');
  const startBtn = document.getElementById('start-btn');
  const gameoverOverlay = document.getElementById('gameover-overlay');
  const gameoverTitle = document.getElementById('gameover-title');
  const winnerDisplay = document.getElementById('winner-display');
  const retryBtn = document.getElementById('retry-btn');
  const backArcadeBtn = document.getElementById('back-arcade-btn');
  const promotionOverlay = document.getElementById('promotion-overlay');
  const promoSubtitle = document.getElementById('promotion-subtitle');

  // P2P Online Overlay Elements
  const p2pLobbyOverlay = document.getElementById('p2p-lobby-overlay');
  const p2pCreateNameInput = document.getElementById('p2p-create-name');
  const p2pCreateBtn = document.getElementById('p2p-create-btn');
  const p2pCreateError = document.getElementById('p2p-create-error');
  const p2pJoinNameInput = document.getElementById('p2p-join-name');
  const p2pJoinCodeInput = document.getElementById('p2p-join-code');
  const p2pJoinBtn = document.getElementById('p2p-join-btn');
  const p2pJoinError = document.getElementById('p2p-join-error');
  const p2pWaitingOverlay = document.getElementById('p2p-waiting-overlay');
  const p2pDisplayCode = document.getElementById('p2p-display-code');
  const p2pRoomCodeBox = document.getElementById('p2p-room-code-box');
  const p2pCancelWaitBtn = document.getElementById('p2p-cancel-wait-btn');
  const p2pConnectingOverlay = document.getElementById('p2p-connecting-overlay');
  const p2pConnectingText = document.getElementById('p2p-connecting-text');
  const p2pCancelConnectBtn = document.getElementById('p2p-cancel-connect-btn');
  const p2pDisconnectOverlay = document.getElementById('p2p-disconnect-overlay');
  const p2pBackLobbyBtn = document.getElementById('p2p-back-lobby-btn');

  // Promo icons
  const promoIconQ = document.getElementById('promo-icon-q');
  const promoIconR = document.getElementById('promo-icon-r');
  const promoIconB = document.getElementById('promo-icon-b');
  const promoIconN = document.getElementById('promo-icon-n');

  // ---- Game State ----
  const BOARD_SIZE = 520;
  const GRID_SIZE = 8;
  const TILE_SIZE = BOARD_SIZE / GRID_SIZE; // 65px

  let gameMode = 'ai'; // 'ai', 'local', or 'online'
  let aiLevel = 2; // 1 (Easy), 2 (Medium), 3 (Hard)
  let isFlipped = false; // false: White on bottom, true: Black on bottom
  let isAiThinking = false;
  let gameActive = false;

  let currentTurn = 'w'; // 'w' (Light Side) or 'b' (Dark Side)
  let board = [];
  let selectedSquare = null; // {r, c}
  let validMoves = []; // array of {r, c, special}
  let lastMove = null; // {from: {r,c}, to: {r,c}}
  let moveHistory = []; // Stack for undo & log
  let capturedPieces = { w: [], b: [] }; // Pieces captured BY white / black

  // Castling Rights & En Passant
  let castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
  let enPassantSquare = null; // {r, c}

  // Pending Promotion callback
  let pendingPromotion = null;

  // Smooth Move Animation State
  let moveAnimation = null; // { piece, fromR, fromC, toR, toC, startTime, duration: 220, promo }

  // ---- Online P2P State ----
  let peer = null;
  let conn = null;
  let isHost = false;
  let myColor = 'w'; // 'w' or 'b'
  let myName = '';
  let opponentName = '';
  let roomCode = '';
  let draftMove = null; // { from: {r,c}, to: {r,c}, promo } — the move the player is about to lock in
  let opponentDraft = null; // The draft move preview from opponent
  let moveLockedIn = false; // true after buzzer is pressed

  // Tournament Chess Clocks (in seconds)
  const CLOCK_TIME = 5 * 60; // 5 minutes per player
  let clockWhite = CLOCK_TIME;
  let clockBlack = CLOCK_TIME;
  let clockInterval = null;
  let clockRunning = false;

  // Particle Effects
  let particles = [];

  // Star Wars Piece Names
  const PIECE_NAMES = {
    'wK': 'Yoda/Luke (King)', 'wQ': 'Leia (Queen)', 'wR': 'Falcon (Rook)', 'wB': 'Obi-Wan (Bishop)', 'wN': 'X-Wing (Knight)', 'wP': 'Rebel Droid (Pawn)',
    'bK': 'Vader (King)', 'bQ': 'Sidious (Queen)', 'bR': 'Death Star (Rook)', 'bB': 'Inquisitor (Bishop)', 'bN': 'AT-AT (Knight)', 'bP': 'Stormtrooper (Pawn)'
  };

  // Positional Values for AI (8x8 matrices)
  const PAWN_PST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 27, 27, 10,  5,  5],
    [ 0,  0,  0, 25, 25,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-25,-25, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0]
  ];

  const KNIGHT_PST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ];

  const BISHOP_PST = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ];

  const ROOK_PST = [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
  ];

  const QUEEN_PST = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ];

  const KING_MID_PST = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
  ];

  // ---- Game Initialization ----
  function initGame() {
    board = [
      ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
      ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
      [ null, null, null, null, null, null, null, null],
      [ null, null, null, null, null, null, null, null],
      [ null, null, null, null, null, null, null, null],
      [ null, null, null, null, null, null, null, null],
      ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
      ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
    ];

    currentTurn = 'w';
    selectedSquare = null;
    validMoves = [];
    lastMove = null;
    moveHistory = [];
    capturedPieces = { w: [], b: [] };
    castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
    enPassantSquare = null;
    isAiThinking = false;
    moveAnimation = null;
    gameActive = true;
    draftMove = null;
    opponentDraft = null;
    moveLockedIn = false;

    // Reset clocks
    clockWhite = CLOCK_TIME;
    clockBlack = CLOCK_TIME;
    stopClock();

    if (gameMode === 'online') {
      isFlipped = (myColor === 'b');
      if (clocksBar) clocksBar.classList.remove('hidden');
      if (buzzerWrap) buzzerWrap.classList.remove('hidden');
      updateClockDisplay();
      updateBuzzerState();
      // Start clock for white
      startClock();
    } else {
      if (clocksBar) clocksBar.classList.add('hidden');
      if (buzzerWrap) buzzerWrap.classList.add('hidden');
    }

    updateUndoButtonState();
    updateUI();
    render();
  }

  // ---- Difficulty & Undo Button Controls ----
  function updateUndoButtonState() {
    if (!btnUndo) return;
    if (gameMode === 'online' || (gameMode === 'ai' && aiLevel === 3)) {
      btnUndo.classList.add('disabled');
      const tip = gameMode === 'online' ? '🌐 Undo disabled in Online mode' : '⚔️ Undo disabled on Hard Mode';
      btnUndo.setAttribute('title', tip);
      btnUndo.setAttribute('data-tip', tip);
    } else {
      btnUndo.classList.remove('disabled');
      btnUndo.setAttribute('title', 'Undo last move');
      btnUndo.setAttribute('data-tip', '↩️ Undo last move');
    }
  }

  function showToast(message) {
    if (!boardWrapEl) return;
    const existing = boardWrapEl.querySelector('.starchess-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'starchess-toast';
    toast.textContent = message;
    boardWrapEl.appendChild(toast);

    setTimeout(() => {
      if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
    }, 2500);
  }

  // ---- UI Controls Event Listeners ----
  function clearModeButtons() {
    if (btnModeAi) btnModeAi.classList.remove('active');
    if (btnModeLocal) btnModeLocal.classList.remove('active');
    if (btnModeOnline) btnModeOnline.classList.remove('active');
  }

  if (btnModeAi) btnModeAi.addEventListener('click', () => {
    cleanupP2P();
    gameMode = 'ai';
    clearModeButtons();
    btnModeAi.classList.add('active');
    difficultyWrap.style.display = 'flex';
    updateUndoButtonState();
    initGame();
  });

  if (btnModeLocal) btnModeLocal.addEventListener('click', () => {
    cleanupP2P();
    gameMode = 'local';
    clearModeButtons();
    btnModeLocal.classList.add('active');
    difficultyWrap.style.display = 'none';
    updateUndoButtonState();
    initGame();
  });

  if (btnModeOnline) btnModeOnline.addEventListener('click', () => {
    cleanupP2P();
    clearModeButtons();
    btnModeOnline.classList.add('active');
    difficultyWrap.style.display = 'none';
    startOverlay.classList.add('hidden');
    showP2POverlay(p2pLobbyOverlay);
  });

  aiDifficultySelect.addEventListener('change', (e) => {
    aiLevel = parseInt(e.target.value, 10);
    updateUndoButtonState();
  });

  btnFlip.addEventListener('click', () => {
    if (gameMode === 'online') {
      showToast('🌐 Flip is locked in Online mode.');
      return;
    }
    isFlipped = !isFlipped;
    render();
  });

  btnUndo.addEventListener('click', () => {
    if (!gameActive || isAiThinking || moveAnimation) return;

    if (gameMode === 'online') {
      showToast('🌐 No undo in Online mode!');
      if (window.SFX && window.SFX.hit) window.SFX.hit();
      return;
    }

    if (gameMode === 'ai' && aiLevel === 3) {
      showToast('⚔️ No mercy! Undo is disabled on Hard (Sith Lord) mode.');
      if (window.SFX && window.SFX.hit) window.SFX.hit();
      return;
    }

    undoMove();
  });

  btnRestart.addEventListener('click', () => {
    initGame();
  });

  startBtn.addEventListener('click', () => {
    startOverlay.classList.add('hidden');
    initGame();
  });

  retryBtn.addEventListener('click', () => {
    gameoverOverlay.classList.add('hidden');
    initGame();
  });

  backArcadeBtn.addEventListener('click', () => {
    window.location.href = '../singleplayer.html';
  });

  // ---- Canvas Interaction ----
  canvas.addEventListener('click', (e) => {
    if (!gameActive || isAiThinking || moveAnimation) return;
    if (gameMode === 'ai' && currentTurn === 'b') return; // AI's turn
    if (gameMode === 'online' && currentTurn !== myColor) return; // Not my turn

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    let col = Math.floor(mouseX / TILE_SIZE);
    let row = Math.floor(mouseY / TILE_SIZE);

    if (isFlipped) {
      row = 7 - row;
      col = 7 - col;
    }

    if (row < 0 || row > 7 || col < 0 || col > 7) return;

    handleSquareClick(row, col);
  });

  function handleSquareClick(r, c) {
    const piece = board[r][c];

    // If square is one of the valid target moves for the currently selected piece:
    const targetMove = validMoves.find(m => m.r === r && m.c === c);
    if (selectedSquare && targetMove) {
      if (gameMode === 'online') {
        // In online mode, set draft move but DON'T lock in yet (wait for buzzer)
        handleOnlineDraftMove(selectedSquare, targetMove);
      } else {
        startAnimatedMove(selectedSquare, targetMove);
      }
      return;
    }

    // If clicking on player's own piece:
    if (piece && piece[0] === currentTurn) {
      // In online mode, if a draft move is already set, deselect it
      if (gameMode === 'online' && draftMove) {
        draftMove = null;
        moveLockedIn = false;
        sendP2P({ type: 'DRAFT_CLEAR' });
      }
      selectedSquare = { r, c };
      validMoves = getLegalMovesForSquare(r, c, board, currentTurn, castlingRights, enPassantSquare);
      if (window.SFX && window.SFX.saberHum) window.SFX.saberHum();
    } else {
      selectedSquare = null;
      validMoves = [];
    }

    render();
  }

  // ---- Smooth Animated Move Trigger ----
  function startAnimatedMove(from, to, promotionChoice = null) {
    const piece = board[from.r][from.c];
    const pieceColor = piece[0];
    const pieceType = piece[1];

    // Check for Pawn Promotion requirement
    if (pieceType === 'P' && ((pieceColor === 'w' && to.r === 0) || (pieceColor === 'b' && to.r === 7))) {
      if (!promotionChoice) {
        showPromotionModal(pieceColor, (choice) => {
          startAnimatedMove(from, to, choice);
        });
        return;
      }
    }

    // Start 220ms sliding animation
    const startTime = performance.now();
    moveAnimation = {
      piece,
      fromR: from.r,
      fromC: from.c,
      toR: to.r,
      toC: to.c,
      startTime,
      duration: 220,
      promoChoice: promotionChoice
    };

    function animStep(now) {
      if (!moveAnimation) return;
      const elapsed = now - moveAnimation.startTime;
      const progress = Math.min(1, elapsed / moveAnimation.duration);

      render();

      if (progress < 1) {
        requestAnimationFrame(animStep);
      } else {
        const animCopy = { ...moveAnimation };
        moveAnimation = null;
        completeMoveExecution(animCopy.fromR, animCopy.fromC, animCopy.toR, animCopy.toC, animCopy.promoChoice);
      }
    }

    requestAnimationFrame(animStep);
  }

  // ---- Complete Move Execution (Post-Animation State Update) ----
  function completeMoveExecution(fromR, fromC, toR, toC, promotionChoice = null) {
    const from = { r: fromR, c: fromC };
    const to = { r: toR, c: toC };
    const piece = board[from.r][from.c];
    const targetPiece = board[to.r][to.c];
    const pieceColor = piece[0];
    const pieceType = piece[1];

    // Save snapshot for Undo
    const snapshot = {
      board: board.map(row => [...row]),
      currentTurn,
      castlingRights: { ...castlingRights },
      enPassantSquare: enPassantSquare ? { ...enPassantSquare } : null,
      lastMove: lastMove ? { ...lastMove } : null,
      capturedPieces: {
        w: [...capturedPieces.w],
        b: [...capturedPieces.b]
      },
      logItem: null
    };

    let isCapture = !!targetPiece;
    let isEnPassant = false;
    let isCastle = false;

    // Execute Move on Board
    board[to.r][to.c] = piece;
    board[from.r][from.c] = null;

    // Handle Pawn Promotion
    if (promotionChoice) {
      board[to.r][to.c] = pieceColor + promotionChoice.toUpperCase();
    }

    // Handle En Passant Capture
    if (pieceType === 'P' && enPassantSquare && to.r === enPassantSquare.r && to.c === enPassantSquare.c) {
      isEnPassant = true;
      isCapture = true;
      const capturedPawnRow = pieceColor === 'w' ? to.r + 1 : to.r - 1;
      const capturedPawn = board[capturedPawnRow][to.c];
      capturedPieces[pieceColor].push(capturedPawn);
      board[capturedPawnRow][to.c] = null;
    } else if (targetPiece) {
      capturedPieces[pieceColor].push(targetPiece);
    }

    // Update En Passant Square
    if (pieceType === 'P' && Math.abs(to.r - from.r) === 2) {
      enPassantSquare = { r: (from.r + to.r) / 2, c: from.c };
    } else {
      enPassantSquare = null;
    }

    // Handle Castling Rook Movement
    if (pieceType === 'K' && Math.abs(to.c - from.c) === 2) {
      isCastle = true;
      if (to.c === 6) { // Kingside
        board[from.r][5] = board[from.r][7];
        board[from.r][7] = null;
      } else if (to.c === 2) { // Queenside
        board[from.r][3] = board[from.r][0];
        board[from.r][0] = null;
      }
    }

    // Update Castling Rights
    if (pieceType === 'K') {
      if (pieceColor === 'w') { castlingRights.wK = false; castlingRights.wQ = false; }
      else { castlingRights.bK = false; castlingRights.bQ = false; }
    }
    if (pieceType === 'R') {
      if (from.r === 7 && from.c === 7) castlingRights.wK = false;
      if (from.r === 7 && from.c === 0) castlingRights.wQ = false;
      if (from.r === 0 && from.c === 7) castlingRights.bK = false;
      if (from.r === 0 && from.c === 0) castlingRights.bQ = false;
    }

    lastMove = { from: { ...from }, to: { ...to } };
    selectedSquare = null;
    validMoves = [];

    // SFX & Particles
    if (isCapture) {
      if (window.SFX && window.SFX.saberClash) window.SFX.saberClash();
      createExplosionParticles(to.r, to.c, pieceColor === 'w' ? '#00f0ff' : '#ff3355');
    } else {
      if (window.SFX && window.SFX.saberHum) window.SFX.saberHum();
    }

    // Next Turn
    const nextTurn = currentTurn === 'w' ? 'b' : 'w';
    const isNextInCheck = isKingInCheck(board, nextTurn);
    const hasNextLegalMoves = hasAnyLegalMoves(board, nextTurn, castlingRights, enPassantSquare);

    // Notation for Move Log
    const notation = formatMoveNotation(piece, from, to, isCapture, isCastle, isNextInCheck, !hasNextLegalMoves && isNextInCheck, promotionChoice);
    snapshot.logItem = { turn: currentTurn, notation };
    moveHistory.push(snapshot);

    currentTurn = nextTurn;

    updateUI();
    render();

    // Check Game Over Conditions
    if (!hasNextLegalMoves) {
      gameActive = false;
      stopClock();
      if (isNextInCheck) {
        // Checkmate!
        const victor = snapshot.turn === 'w' ? 'Light Side (Rebel Alliance)' : 'Dark Empire';
        gameoverTitle.textContent = 'Checkmate!';
        winnerDisplay.textContent = `${victor} Victory! ⚔️`;
        if (window.SFX && window.SFX.levelUp) window.SFX.levelUp();
      } else {
        // Stalemate!
        gameoverTitle.textContent = 'Stalemate!';
        winnerDisplay.textContent = 'Galactic Truce — Draw! 🪐';
        if (window.SFX && window.SFX.gameOver) window.SFX.gameOver();
      }
      setTimeout(() => gameoverOverlay.classList.remove('hidden'), 500);
      return;
    }

    if (isNextInCheck) {
      if (window.SFX && window.SFX.checkAlert) window.SFX.checkAlert();
    }

    // Trigger AI turn if in AI mode
    if (gameMode === 'ai' && currentTurn === 'b' && gameActive) {
      isAiThinking = true;
      statusBadgeEl.textContent = 'Imperial AI calculating...';
      setTimeout(makeAiMove, 350);
    }

    // Online mode: update clocks and buzzer state
    if (gameMode === 'online') {
      updateClockDisplay();
      updateBuzzerState();
      draftMove = null;
      opponentDraft = null;
    }
  }

  // ---- AI Engine (Minimax with Alpha-Beta) ----
  function makeAiMove() {
    if (!gameActive || currentTurn !== 'b') return;

    let bestMove = null;

    if (aiLevel === 1) {
      // Padawan: Random or simple capture
      const allMoves = getAllLegalMoves(board, 'b', castlingRights, enPassantSquare);
      if (allMoves.length > 0) {
        const captures = allMoves.filter(m => board[m.to.r][m.to.c] !== null);
        if (captures.length > 0) {
          bestMove = captures[Math.floor(Math.random() * captures.length)];
        } else {
          bestMove = allMoves[Math.floor(Math.random() * allMoves.length)];
        }
      }
    } else if (aiLevel === 2) {
      // Trooper: Minimax depth 2
      bestMove = minimaxRoot(2, 'b');
    } else {
      // Sith Lord: Minimax depth 3 with Alpha-Beta
      bestMove = minimaxRoot(3, 'b');
    }

    isAiThinking = false;

    if (bestMove) {
      startAnimatedMove(bestMove.from, bestMove.to, bestMove.promo);
    }
  }

  function minimaxRoot(depth, color) {
    const moves = getAllLegalMoves(board, color, castlingRights, enPassantSquare);
    if (moves.length === 0) return null;

    // Sort moves to prioritize captures for better pruning
    moves.sort((a, b) => {
      const capA = board[a.to.r][a.to.c] ? 10 : 0;
      const capB = board[b.to.r][b.to.c] ? 10 : 0;
      return capB - capA;
    });

    let bestValue = -999999;
    let bestMove = moves[0];

    for (const move of moves) {
      // Make temporary move
      const undoFn = applyTempMove(move);
      const val = minimax(depth - 1, -999999, 999999, false);
      undoFn();

      if (val > bestValue) {
        bestValue = val;
        bestMove = move;
      }
    }

    return bestMove;
  }

  function minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0) {
      return evaluateBoard(board);
    }

    const color = isMaximizing ? 'b' : 'w';
    const moves = getAllLegalMoves(board, color, castlingRights, enPassantSquare);

    if (moves.length === 0) {
      if (isKingInCheck(board, color)) {
        return isMaximizing ? -100000 + (3 - depth) : 100000 - (3 - depth);
      }
      return 0; // Stalemate
    }

    if (isMaximizing) {
      let maxEval = -999999;
      for (const move of moves) {
        const undoFn = applyTempMove(move);
        const evalVal = minimax(depth - 1, alpha, beta, false);
        undoFn();
        maxEval = Math.max(maxEval, evalVal);
        alpha = Math.max(alpha, evalVal);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = 999999;
      for (const move of moves) {
        const undoFn = applyTempMove(move);
        const evalVal = minimax(depth - 1, alpha, beta, true);
        undoFn();
        minEval = Math.min(minEval, evalVal);
        beta = Math.min(beta, evalVal);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  function applyTempMove(move) {
    const { from, to, promo } = move;
    const piece = board[from.r][from.c];
    const target = board[to.r][to.c];
    const oldEP = enPassantSquare;
    const oldCastle = { ...castlingRights };

    board[to.r][to.c] = promo ? piece[0] + promo.toUpperCase() : piece;
    board[from.r][from.c] = null;

    return function undoTempMove() {
      board[from.r][from.c] = piece;
      board[to.r][to.c] = target;
      enPassantSquare = oldEP;
      castlingRights = oldCastle;
    };
  }

  function evaluateBoard(bd) {
    let score = 0;
    const values = { P: 100, N: 320, B: 330, R: 500, Q: 900, K: 20000 };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = bd[r][c];
        if (!piece) continue;

        const color = piece[0];
        const type = piece[1];
        let val = values[type] || 0;

        // Positional Bonus
        let posVal = 0;
        const pr = color === 'w' ? 7 - r : r; // Flip row for PST evaluation
        if (type === 'P') posVal = PAWN_PST[pr][c];
        else if (type === 'N') posVal = KNIGHT_PST[pr][c];
        else if (type === 'B') posVal = BISHOP_PST[pr][c];
        else if (type === 'R') posVal = ROOK_PST[pr][c];
        else if (type === 'Q') posVal = QUEEN_PST[pr][c];
        else if (type === 'K') posVal = KING_MID_PST[pr][c];

        val += posVal;

        if (color === 'b') score += val; // Dark Side (+ score)
        else score -= val; // Light Side (- score)
      }
    }
    return score;
  }

  // ---- Undo Functionality ----
  function undoMove() {
    if (moveHistory.length === 0) return;

    // In AI mode, undo twice (AI move + player move) if available
    let stepsToUndo = (gameMode === 'ai' && moveHistory.length >= 2) ? 2 : 1;

    for (let i = 0; i < stepsToUndo; i++) {
      if (moveHistory.length === 0) break;
      const last = moveHistory.pop();
      board = last.board;
      currentTurn = last.currentTurn;
      castlingRights = last.castlingRights;
      enPassantSquare = last.enPassantSquare;
      lastMove = last.lastMove;
      capturedPieces = last.capturedPieces;
    }

    selectedSquare = null;
    validMoves = [];
    moveAnimation = null;
    gameActive = true;
    updateUI();
    render();
  }

  // ---- Move Generation & Chess Rules ----
  function getLegalMovesForSquare(r, c, bd, color, castleRights, epSq) {
    const piece = bd[r][c];
    if (!piece || piece[0] !== color) return [];

    const pseudoMoves = getPseudoMoves(r, c, bd, color, castleRights, epSq);
    const legalMoves = [];

    for (const m of pseudoMoves) {
      // Test if move leaves King in check
      const tempPiece = bd[m.r][m.c];
      bd[m.r][m.c] = piece;
      bd[r][c] = null;

      // Handle En Passant temp removal
      let epCaptured = null;
      let epCapRow = -1;
      if (piece[1] === 'P' && epSq && m.r === epSq.r && m.c === epSq.c) {
        epCapRow = color === 'w' ? m.r + 1 : m.r - 1;
        epCaptured = bd[epCapRow][m.c];
        bd[epCapRow][m.c] = null;
      }

      if (!isKingInCheck(bd, color)) {
        legalMoves.push(m);
      }

      // Revert temp move
      bd[r][c] = piece;
      bd[m.r][m.c] = tempPiece;
      if (epCaptured !== null) {
        bd[epCapRow][m.c] = epCaptured;
      }
    }

    return legalMoves;
  }

  function getAllLegalMoves(bd, color, castleRights, epSq) {
    const all = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (bd[r][c] && bd[r][c][0] === color) {
          const sqMoves = getLegalMovesForSquare(r, c, bd, color, castleRights, epSq);
          for (const m of sqMoves) {
            // If pawn promotion, add choices
            if (bd[r][c][1] === 'P' && ((color === 'w' && m.r === 0) || (color === 'b' && m.r === 7))) {
              ['q', 'r', 'b', 'n'].forEach(promo => {
                all.push({ from: { r, c }, to: { r: m.r, c: m.c }, promo });
              });
            } else {
              all.push({ from: { r, c }, to: { r: m.r, c: m.c } });
            }
          }
        }
      }
    }
    return all;
  }

  function getPseudoMoves(r, c, bd, color, castleRights, epSq) {
    const moves = [];
    const piece = bd[r][c];
    const type = piece[1];
    const dir = color === 'w' ? -1 : 1;

    if (type === 'P') {
      // 1-step forward
      const f1R = r + dir;
      if (f1R >= 0 && f1R < 8 && !bd[f1R][c]) {
        moves.push({ r: f1R, c });
        // 2-steps forward from starting rank
        const startRank = color === 'w' ? 6 : 1;
        const f2R = r + dir * 2;
        if (r === startRank && !bd[f2R][c]) {
          moves.push({ r: f2R, c });
        }
      }
      // Diagonal Captures
      [-1, 1].forEach(dc => {
        const tc = c + dc;
        if (tc >= 0 && tc < 8 && f1R >= 0 && f1R < 8) {
          const target = bd[f1R][tc];
          if (target && target[0] !== color) {
            moves.push({ r: f1R, c: tc });
          }
          // En Passant
          if (epSq && epSq.r === f1R && epSq.c === tc) {
            moves.push({ r: f1R, c: tc, special: 'ep' });
          }
        }
      });
    } else if (type === 'N') {
      const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      for (const [dr, dc] of offsets) {
        const tr = r + dr, tc = c + dc;
        if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
          if (!bd[tr][tc] || bd[tr][tc][0] !== color) moves.push({ r: tr, c: tc });
        }
      }
    } else if (type === 'B' || type === 'R' || type === 'Q') {
      const dirs = [];
      if (type === 'B' || type === 'Q') dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      if (type === 'R' || type === 'Q') dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);

      for (const [dr, dc] of dirs) {
        let tr = r + dr, tc = c + dc;
        while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
          if (!bd[tr][tc]) {
            moves.push({ r: tr, c: tc });
          } else {
            if (bd[tr][tc][0] !== color) moves.push({ r: tr, c: tc });
            break;
          }
          tr += dr; tc += dc;
        }
      }
    } else if (type === 'K') {
      const dirs = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
      for (const [dr, dc] of dirs) {
        const tr = r + dr, tc = c + dc;
        if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
          if (!bd[tr][tc] || bd[tr][tc][0] !== color) moves.push({ r: tr, c: tc });
        }
      }
      // Castling
      if (!isKingInCheck(bd, color)) {
        if (color === 'w') {
          if (castleRights.wK && !bd[7][5] && !bd[7][6] && isSquareSafe(bd, 7, 5, color) && isSquareSafe(bd, 7, 6, color)) {
            moves.push({ r: 7, c: 6, special: 'castle' });
          }
          if (castleRights.wQ && !bd[7][1] && !bd[7][2] && !bd[7][3] && isSquareSafe(bd, 7, 2, color) && isSquareSafe(bd, 7, 3, color)) {
            moves.push({ r: 7, c: 2, special: 'castle' });
          }
        } else {
          if (castleRights.bK && !bd[0][5] && !bd[0][6] && isSquareSafe(bd, 0, 5, color) && isSquareSafe(bd, 0, 6, color)) {
            moves.push({ r: 0, c: 6, special: 'castle' });
          }
          if (castleRights.bQ && !bd[0][1] && !bd[0][2] && !bd[0][3] && isSquareSafe(bd, 0, 2, color) && isSquareSafe(bd, 0, 3, color)) {
            moves.push({ r: 0, c: 2, special: 'castle' });
          }
        }
      }
    }

    return moves;
  }

  function isKingInCheck(bd, color) {
    let kR = -1, kC = -1;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (bd[r][c] === color + 'K') { kR = r; kC = c; break; }
      }
      if (kR !== -1) break;
    }
    if (kR === -1) return false;
    return !isSquareSafe(bd, kR, kC, color);
  }

  function isSquareSafe(bd, r, c, color) {
    const oppColor = color === 'w' ? 'b' : 'w';
    const oppPawnDir = oppColor === 'w' ? -1 : 1;

    // Pawn attacks
    for (const dc of [-1, 1]) {
      const pr = r - oppPawnDir;
      const pc = c + dc;
      if (pr >= 0 && pr < 8 && pc >= 0 && pc < 8) {
        if (bd[pr][pc] === oppColor + 'P') return false;
      }
    }

    // Knight attacks
    const nOffsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
    for (const [dr, dc] of nOffsets) {
      const tr = r + dr, tc = c + dc;
      if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
        if (bd[tr][tc] === oppColor + 'N') return false;
      }
    }

    // Bishop / Queen diagonals
    for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]]) {
      let tr = r + dr, tc = c + dc;
      while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
        const p = bd[tr][tc];
        if (p) {
          if (p === oppColor + 'B' || p === oppColor + 'Q') return false;
          break;
        }
        tr += dr; tc += dc;
      }
    }

    // Rook / Queen straights
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
      let tr = r + dr, tc = c + dc;
      while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
        const p = bd[tr][tc];
        if (p) {
          if (p === oppColor + 'R' || p === oppColor + 'Q') return false;
          break;
        }
        tr += dr; tc += dc;
      }
    }

    // King attacks
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
      const tr = r + dr, tc = c + dc;
      if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
        if (bd[tr][tc] === oppColor + 'K') return false;
      }
    }

    return true;
  }

  function hasAnyLegalMoves(bd, color, castleRights, epSq) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (bd[r][c] && bd[r][c][0] === color) {
          if (getLegalMovesForSquare(r, c, bd, color, castleRights, epSq).length > 0) return true;
        }
      }
    }
    return false;
  }

  // ---- Promotion Modal Handler ----
  function showPromotionModal(color, callback) {
    pendingPromotion = callback;
    promotionOverlay.classList.remove('hidden');
    promoSubtitle.textContent = color === 'w' ? 'Rebel unit promotion:' : 'Imperial unit promotion:';

    const buttons = promotionOverlay.querySelectorAll('.promo-btn');
    buttons.forEach(btn => {
      btn.onclick = () => {
        const choice = btn.getAttribute('data-promo');
        promotionOverlay.classList.add('hidden');
        if (pendingPromotion) pendingPromotion(choice);
      };
    });
  }

  // ---- High-Quality Vector Chess Piece Art Renderer (Matching Reference Image) ----
  function drawStylizedVectorPiece(piece, cx, cy, size) {
    const color = piece[0]; // 'w' or 'b'
    const type = piece[1]; // P, N, B, R, Q, K
    const isDark = color === 'b';
    const s = size * 0.72; // scale

    ctx.save();
    ctx.translate(cx, cy);

    // Dynamic Color Palette (matching reference image gradient & shading)
    let fillGrad, outlineColor, shadowColor, highlightColor;

    if (isDark) {
      // Dark / Purple Set
      fillGrad = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
      fillGrad.addColorStop(0, '#583f99');
      fillGrad.addColorStop(0.5, '#3b296b');
      fillGrad.addColorStop(1, '#231845');

      outlineColor = '#1a1033';
      shadowColor = 'rgba(180, 75, 255, 0.4)';
      highlightColor = '#a685e8';
    } else {
      // White / Light Set
      fillGrad = ctx.createLinearGradient(0, -s / 2, 0, s / 2);
      fillGrad.addColorStop(0, '#ffffff');
      fillGrad.addColorStop(0.6, '#ede7fb');
      fillGrad.addColorStop(1, '#d5cbfa');

      outlineColor = '#705c9e';
      shadowColor = 'rgba(0, 240, 255, 0.4)';
      highlightColor = '#ffffff';
    }

    ctx.shadowColor = shadowColor;
    ctx.shadowBlur = 10;

    ctx.fillStyle = fillGrad;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();

    // Piece Paths normalized around (0, 0)
    switch (type) {
      case 'P': // PAWN - Spherical dome head, conical body, base
        ctx.arc(0, -s * 0.22, s * 0.16, 0, Math.PI * 2); // Head
        ctx.fill(); ctx.stroke(); ctx.beginPath();
        // Collar band
        ctx.roundRect(-s * 0.16, -s * 0.04, s * 0.32, s * 0.08, 3);
        ctx.fill(); ctx.stroke(); ctx.beginPath();
        // Body & Base
        ctx.moveTo(-s * 0.13, -s * 0.04);
        ctx.quadraticCurveTo(-s * 0.22, s * 0.22, -s * 0.28, s * 0.36);
        ctx.lineTo(s * 0.28, s * 0.36);
        ctx.quadraticCurveTo(s * 0.22, s * 0.22, s * 0.13, -s * 0.04);
        ctx.closePath();
        break;

      case 'R': // ROOK - Castle battlement header, column, base
        // Battlements
        ctx.moveTo(-s * 0.26, -s * 0.38);
        ctx.lineTo(-s * 0.26, -s * 0.22);
        ctx.lineTo(-s * 0.16, -s * 0.22);
        ctx.lineTo(-s * 0.16, -s * 0.30);
        ctx.lineTo(-s * 0.06, -s * 0.30);
        ctx.lineTo(-s * 0.06, -s * 0.38);
        ctx.lineTo(s * 0.06, -s * 0.38);
        ctx.lineTo(s * 0.06, -s * 0.30);
        ctx.lineTo(s * 0.16, -s * 0.30);
        ctx.lineTo(s * 0.16, -s * 0.22);
        ctx.lineTo(s * 0.26, -s * 0.22);
        ctx.lineTo(s * 0.26, -s * 0.38);
        ctx.closePath();
        ctx.fill(); ctx.stroke(); ctx.beginPath();
        // Column & Base
        ctx.moveTo(-s * 0.20, -s * 0.22);
        ctx.lineTo(-s * 0.24, s * 0.36);
        ctx.lineTo(s * 0.24, s * 0.36);
        ctx.lineTo(s * 0.20, -s * 0.22);
        ctx.closePath();
        break;

      case 'N': // KNIGHT - Curved horse head facing left
        ctx.moveTo(s * 0.22, s * 0.36);
        ctx.lineTo(-s * 0.26, s * 0.36);
        ctx.lineTo(-s * 0.22, s * 0.24);
        ctx.quadraticCurveTo(-s * 0.32, s * 0.08, -s * 0.30, -s * 0.08); // Snout
        ctx.lineTo(-s * 0.12, -s * 0.06); // Jaw
        ctx.quadraticCurveTo(-s * 0.18, -s * 0.24, -s * 0.14, -s * 0.38); // Ear/top
        ctx.quadraticCurveTo(s * 0.15, -s * 0.40, s * 0.25, -s * 0.18); // Mane back
        ctx.quadraticCurveTo(s * 0.28, s * 0.12, s * 0.22, s * 0.36);
        ctx.closePath();
        break;

      case 'B': // BISHOP - Teardrop oval head with diagonal slit & top finial
        ctx.arc(0, -s * 0.42, s * 0.06, 0, Math.PI * 2); // Finial ball
        ctx.fill(); ctx.stroke(); ctx.beginPath();
        // Egg head
        ctx.ellipse(0, -s * 0.18, s * 0.18, s * 0.22, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke(); ctx.beginPath();
        // Collar & Base
        ctx.roundRect(-s * 0.18, 0, s * 0.36, s * 0.08, 3);
        ctx.fill(); ctx.stroke(); ctx.beginPath();
        ctx.moveTo(-s * 0.14, s * 0.08);
        ctx.lineTo(-s * 0.26, s * 0.36);
        ctx.lineTo(s * 0.26, s * 0.36);
        ctx.lineTo(s * 0.14, s * 0.08);
        ctx.closePath();
        break;

      case 'Q': // QUEEN - Coronet crown points, hourglass body, collar
        // Crown points
        ctx.moveTo(-s * 0.28, -s * 0.34);
        ctx.lineTo(-s * 0.20, -s * 0.18);
        ctx.lineTo(-s * 0.10, -s * 0.38);
        ctx.lineTo(0, -s * 0.18);
        ctx.lineTo(s * 0.10, -s * 0.38);
        ctx.lineTo(s * 0.20, -s * 0.18);
        ctx.lineTo(s * 0.28, -s * 0.34);
        ctx.lineTo(s * 0.22, -s * 0.08);
        ctx.lineTo(-s * 0.22, -s * 0.08);
        ctx.closePath();
        ctx.fill(); ctx.stroke(); ctx.beginPath();
        // Collar & Body
        ctx.roundRect(-s * 0.20, -s * 0.08, s * 0.40, s * 0.08, 3);
        ctx.fill(); ctx.stroke(); ctx.beginPath();
        ctx.moveTo(-s * 0.15, 0);
        ctx.lineTo(-s * 0.27, s * 0.36);
        ctx.lineTo(s * 0.27, s * 0.36);
        ctx.lineTo(s * 0.15, 0);
        ctx.closePath();
        break;

      case 'K': // KING - Cross top finial, crowned cap, majestic body
        // Cross Finial
        ctx.rect(-s * 0.04, -s * 0.44, s * 0.08, s * 0.14);
        ctx.rect(-s * 0.09, -s * 0.40, s * 0.18, s * 0.06);
        ctx.fill(); ctx.stroke(); ctx.beginPath();
        // Crown dome
        ctx.arc(0, -s * 0.18, s * 0.20, Math.PI, 0);
        ctx.lineTo(s * 0.22, -s * 0.08);
        ctx.lineTo(-s * 0.22, -s * 0.08);
        ctx.closePath();
        ctx.fill(); ctx.stroke(); ctx.beginPath();
        // Collar & Base
        ctx.roundRect(-s * 0.22, -s * 0.08, s * 0.44, s * 0.08, 3);
        ctx.fill(); ctx.stroke(); ctx.beginPath();
        ctx.moveTo(-s * 0.16, 0);
        ctx.lineTo(-s * 0.28, s * 0.36);
        ctx.lineTo(s * 0.28, s * 0.36);
        ctx.lineTo(s * 0.16, 0);
        ctx.closePath();
        break;
    }

    ctx.fill();
    ctx.stroke();

    // Base Pedestal Foot Ring (for all pieces)
    ctx.beginPath();
    ctx.roundRect(-s * 0.32, s * 0.36, s * 0.64, s * 0.10, 4);
    ctx.fill();
    ctx.stroke();

    // Interior Highlight Curve (Vector Shading as in reference image)
    ctx.beginPath();
    ctx.strokeStyle = highlightColor;
    ctx.lineWidth = 1.6;
    ctx.globalAlpha = 0.55;
    ctx.moveTo(-s * 0.10, -s * 0.25);
    ctx.quadraticCurveTo(-s * 0.18, 0, -s * 0.20, s * 0.30);
    ctx.stroke();

    ctx.restore();
  }

  // Particle Explosions on Capture
  function createExplosionParticles(r, c, color) {
    const renderR = isFlipped ? 7 - r : r;
    const renderC = isFlipped ? 7 - c : c;
    const cx = renderC * TILE_SIZE + TILE_SIZE / 2;
    const cy = renderR * TILE_SIZE + TILE_SIZE / 2;

    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 3,
        alpha: 1,
        color
      });
    }
  }

  function updateAndDrawParticles() {
    if (particles.length === 0) return;

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;

      if (p.alpha <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    if (particles.length > 0) requestAnimationFrame(render);
  }

  // Easing curve for smooth sliding moves
  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  // ---- Visual Renderer (HTML5 Canvas) ----
  function render() {
    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);

    // 1. Draw Sci-Fi Board Tiles
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const renderR = isFlipped ? 7 - r : r;
        const renderC = isFlipped ? 7 - c : c;
        const isLight = (r + c) % 2 === 0;

        const x = renderC * TILE_SIZE;
        const y = renderR * TILE_SIZE;

        ctx.fillStyle = isLight ? '#16223d' : '#0a1022';
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      }
    }

    // 2. Highlight Last Move
    if (lastMove) {
      const fromR = isFlipped ? 7 - lastMove.from.r : lastMove.from.r;
      const fromC = isFlipped ? 7 - lastMove.from.c : lastMove.from.c;
      const toR = isFlipped ? 7 - lastMove.to.r : lastMove.to.r;
      const toC = isFlipped ? 7 - lastMove.to.c : lastMove.to.c;

      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fillRect(fromC * TILE_SIZE, fromR * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      ctx.fillRect(toC * TILE_SIZE, toR * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    // 3. Highlight Selected Square
    if (selectedSquare) {
      const selR = isFlipped ? 7 - selectedSquare.r : selectedSquare.r;
      const selC = isFlipped ? 7 - selectedSquare.c : selectedSquare.c;
      const x = selC * TILE_SIZE;
      const y = selR * TILE_SIZE;

      ctx.fillStyle = 'rgba(255, 230, 0, 0.25)';
      ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = '#ffe600';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }

    // 4. Highlight Valid Move Targets
    for (const m of validMoves) {
      const targetR = isFlipped ? 7 - m.r : m.r;
      const targetC = isFlipped ? 7 - m.c : m.c;
      const x = targetC * TILE_SIZE + TILE_SIZE / 2;
      const y = targetR * TILE_SIZE + TILE_SIZE / 2;

      ctx.save();
      if (board[m.r][m.c]) {
        // Capture move target ring
        ctx.strokeStyle = '#ff3355';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(x, y, TILE_SIZE * 0.42, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Move target dot
        ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, TILE_SIZE * 0.16, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 5. Highlight King in Check
    const inCheckColor = isKingInCheck(board, currentTurn) ? currentTurn : null;
    if (inCheckColor) {
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c] === inCheckColor + 'K') {
            const checkR = isFlipped ? 7 - r : r;
            const checkC = isFlipped ? 7 - c : c;
            ctx.fillStyle = 'rgba(255, 0, 50, 0.4)';
            ctx.fillRect(checkC * TILE_SIZE, checkR * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#ff0033';
            ctx.lineWidth = 4;
            ctx.strokeRect(checkC * TILE_SIZE + 2, checkR * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          }
        }
      }
    }

    // 6. Draw Board Coordinates
    drawCoordinates();

    // 6.5 Draft Move Indicators (Online Mode)
    if (gameMode === 'online') {
      // My draft move (green highlight from → to)
      if (draftMove) {
        const dfR = isFlipped ? 7 - draftMove.from.r : draftMove.from.r;
        const dfC = isFlipped ? 7 - draftMove.from.c : draftMove.from.c;
        const dtR = isFlipped ? 7 - draftMove.to.r : draftMove.to.r;
        const dtC = isFlipped ? 7 - draftMove.to.c : draftMove.to.c;

        ctx.fillStyle = 'rgba(0, 255, 120, 0.2)';
        ctx.fillRect(dfC * TILE_SIZE, dfR * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.fillRect(dtC * TILE_SIZE, dtR * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = '#00ff78';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(dtC * TILE_SIZE + 2, dtR * TILE_SIZE + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.setLineDash([]);
      }

      // Opponent's draft move (orange highlight — so the player can see what they're considering)
      if (opponentDraft) {
        const ofR = isFlipped ? 7 - opponentDraft.from.r : opponentDraft.from.r;
        const ofC = isFlipped ? 7 - opponentDraft.from.c : opponentDraft.from.c;
        const otR = isFlipped ? 7 - opponentDraft.to.r : opponentDraft.to.r;
        const otC = isFlipped ? 7 - opponentDraft.to.c : opponentDraft.to.c;

        ctx.fillStyle = 'rgba(255, 165, 0, 0.15)';
        ctx.fillRect(ofC * TILE_SIZE, ofR * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        ctx.fillRect(otC * TILE_SIZE, otR * TILE_SIZE, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = 'rgba(255, 165, 0, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(otC * TILE_SIZE + 3, otR * TILE_SIZE + 3, TILE_SIZE - 6, TILE_SIZE - 6);
        ctx.setLineDash([]);
      }
    }

    // 7. Draw Static Board Pieces
    let animMovingPiece = null;

    if (moveAnimation) {
      const now = performance.now();
      const progress = Math.min(1, (now - moveAnimation.startTime) / moveAnimation.duration);
      const ease = easeOutCubic(progress);

      const fR = isFlipped ? 7 - moveAnimation.fromR : moveAnimation.fromR;
      const fC = isFlipped ? 7 - moveAnimation.fromC : moveAnimation.fromC;
      const tR = isFlipped ? 7 - moveAnimation.toR : moveAnimation.toR;
      const tC = isFlipped ? 7 - moveAnimation.toC : moveAnimation.toC;

      const currentRenderR = fR + (tR - fR) * ease;
      const currentRenderC = fC + (tC - fC) * ease;

      animMovingPiece = {
        piece: moveAnimation.piece,
        x: currentRenderC * TILE_SIZE + TILE_SIZE / 2,
        y: currentRenderR * TILE_SIZE + TILE_SIZE / 2
      };
    }

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        // Skip drawing piece at 'from' or 'to' position if it's currently sliding in animation
        if (moveAnimation && ((r === moveAnimation.fromR && c === moveAnimation.fromC) || (r === moveAnimation.toR && c === moveAnimation.toC))) {
          continue;
        }

        const piece = board[r][c];
        if (piece) {
          const renderR = isFlipped ? 7 - r : r;
          const renderC = isFlipped ? 7 - c : c;
          const cx = renderC * TILE_SIZE + TILE_SIZE / 2;
          const cy = renderR * TILE_SIZE + TILE_SIZE / 2;
          drawStylizedVectorPiece(piece, cx, cy, TILE_SIZE);
        }
      }
    }

    // 8. Draw Animated Sliding Piece on Top
    if (animMovingPiece) {
      drawStylizedVectorPiece(animMovingPiece.piece, animMovingPiece.x, animMovingPiece.y, TILE_SIZE * 1.08);
    }

    // 9. Update Particles
    updateAndDrawParticles();
  }

  function drawCoordinates() {
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    for (let i = 0; i < 8; i++) {
      const fileLabel = isFlipped ? files[7 - i] : files[i];
      const rankLabel = isFlipped ? (i + 1).toString() : (8 - i).toString();

      // Bottom files
      ctx.fillText(fileLabel, i * TILE_SIZE + TILE_SIZE - 12, BOARD_SIZE - 4);
      // Left ranks
      ctx.fillText(rankLabel, 4, i * TILE_SIZE + 12);
    }
  }

  // ---- UI Formatters & Log Updating ----
  function updateUI() {
    if (currentTurn === 'w') {
      turnIndicatorEl.className = 'turn-indicator light-turn';
      turnIconEl.textContent = '🟢';
      turnTextEl.textContent = 'Light Side (White Set)';
    } else {
      turnIndicatorEl.className = 'turn-indicator dark-turn';
      turnIconEl.textContent = '🔴';
      turnTextEl.textContent = 'Dark Side (Purple Set)';
    }

    const inCheckColor = isKingInCheck(board, currentTurn);
    if (inCheckColor) {
      statusBadgeEl.className = 'status-badge in-check';
      statusBadgeEl.textContent = currentTurn === 'w' ? '⚠️ King in Danger!' : '⚠️ Dark King in Danger!';
    } else {
      statusBadgeEl.className = 'status-badge';
      statusBadgeEl.textContent = 'Tactical Phase';
    }

    darkCapturedEl.innerHTML = capturedPieces.w.length > 0
      ? capturedPieces.w.map(p => `<span class="captured-piece-icon" title="${PIECE_NAMES[p]}">${p[1]}</span>`).join('')
      : '<span style="color: #666; font-size: 0.75rem;">None</span>';

    lightCapturedEl.innerHTML = capturedPieces.b.length > 0
      ? capturedPieces.b.map(p => `<span class="captured-piece-icon" title="${PIECE_NAMES[p]}">${p[1]}</span>`).join('')
      : '<span style="color: #666; font-size: 0.75rem;">None</span>';

    moveCountEl.textContent = `Turn ${Math.floor(moveHistory.length / 2) + 1}`;
    renderMoveLog();
  }

  function renderMoveLog() {
    let html = `
      <div class="move-row" style="color: #777;">
        <span class="move-num">#</span>
        <span>Light Side</span>
        <span>Dark Side</span>
      </div>
    `;

    for (let i = 0; i < moveHistory.length; i += 2) {
      const turnNum = Math.floor(i / 2) + 1;
      const wLog = moveHistory[i] ? moveHistory[i].logItem.notation : '';
      const bLog = moveHistory[i + 1] ? moveHistory[i + 1].logItem.notation : '';

      html += `
        <div class="move-row">
          <span class="move-num">${turnNum}.</span>
          <span class="move-white">${wLog}</span>
          <span class="move-black">${bLog}</span>
        </div>
      `;
    }

    moveLogEl.innerHTML = html;
    moveLogEl.scrollTop = moveLogEl.scrollHeight;
  }

  function formatMoveNotation(piece, from, to, isCap, isCastle, isCheck, isMate, promoChoice) {
    if (isCastle) return to.c === 6 ? 'O-O' : 'O-O-O';

    const files = ['a','b','c','d','e','f','g','h'];
    const pChar = piece[1] === 'P' ? '' : piece[1];
    const capChar = isCap ? 'x' : '';
    const fromFile = piece[1] === 'P' && isCap ? files[from.c] : '';
    const toSq = files[to.c] + (8 - to.r);
    const promoStr = promoChoice ? '=' + promoChoice.toUpperCase() : '';
    const checkStr = isMate ? '#' : (isCheck ? '+' : '');

    return `${pChar}${fromFile}${capChar}${toSq}${promoStr}${checkStr}`;
  }

  // ===== ONLINE P2P FUNCTIONS =====

  // ---- P2P Overlay Helpers ----
  function hideAllP2POverlays() {
    [p2pLobbyOverlay, p2pWaitingOverlay, p2pConnectingOverlay, p2pDisconnectOverlay].forEach(el => {
      if (el) el.classList.add('hidden');
    });
  }

  function showP2POverlay(overlay) {
    hideAllP2POverlays();
    if (overlay) overlay.classList.remove('hidden');
  }

  function generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  function sendP2P(msg) {
    if (conn && conn.open) {
      try { conn.send(msg); } catch (e) { /* ignore */ }
    }
  }

  function cleanupP2P() {
    stopClock();
    if (conn) { try { conn.close(); } catch (e) {} conn = null; }
    if (peer) { try { peer.destroy(); } catch (e) {} peer = null; }
    hideAllP2POverlays();
    draftMove = null;
    opponentDraft = null;
    moveLockedIn = false;
  }

  // ---- Online Draft Move Handling ----
  function handleOnlineDraftMove(from, to) {
    // Apply draft move visually (preview) but don't commit to game state yet
    const piece = board[from.r][from.c];
    const pieceColor = piece[0];
    const pieceType = piece[1];

    // Check for pawn promotion
    let promoChoice = null;
    if (pieceType === 'P' && ((pieceColor === 'w' && to.r === 0) || (pieceColor === 'b' && to.r === 7))) {
      showPromotionModal(pieceColor, (choice) => {
        finalizeDraft(from, to, choice);
      });
      return;
    }

    finalizeDraft(from, to, null);
  }

  function finalizeDraft(from, to, promo) {
    draftMove = { from: { r: from.r, c: from.c }, to: { r: to.r, c: to.c }, promo };
    moveLockedIn = false;

    // Send draft preview to opponent
    sendP2P({ type: 'DRAFT_MOVE', from: draftMove.from, to: draftMove.to, promo: draftMove.promo });

    // Show draft move indicator on board
    selectedSquare = null;
    validMoves = [];
    updateBuzzerState();
    render();
  }

  function updateBuzzerState() {
    if (!btnBuzzer) return;
    if (gameMode !== 'online') return;

    if (draftMove && currentTurn === myColor && !moveLockedIn) {
      btnBuzzer.classList.remove('disabled');
    } else {
      btnBuzzer.classList.add('disabled');
    }
  }

  function lockInMove() {
    if (!draftMove || moveLockedIn || !gameActive) return;
    if (gameMode !== 'online' || currentTurn !== myColor) return;

    moveLockedIn = true;

    // Play buzzer SFX
    if (window.SFX && window.SFX.buzzerSound) window.SFX.buzzerSound();

    // Send lock-in to opponent
    sendP2P({ type: 'LOCK_MOVE', from: draftMove.from, to: draftMove.to, promo: draftMove.promo });

    // Execute the move with animation
    const from = { r: draftMove.from.r, c: draftMove.from.c };
    const to = { r: draftMove.to.r, c: draftMove.to.c };
    const promo = draftMove.promo;
    draftMove = null;
    opponentDraft = null;

    startAnimatedMove(from, to, promo);
    updateBuzzerState();
  }

  // ---- Buzzer Button & Spacebar ----
  if (btnBuzzer) {
    btnBuzzer.addEventListener('click', () => {
      lockInMove();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && gameMode === 'online' && draftMove && !moveLockedIn) {
      e.preventDefault();
      lockInMove();
    }
  });

  // ---- Tournament Chess Clocks ----
  function startClock() {
    stopClock();
    clockRunning = true;
    clockInterval = setInterval(() => {
      if (!gameActive || !clockRunning) { stopClock(); return; }

      if (currentTurn === 'w') {
        clockWhite = Math.max(0, clockWhite - 1);
      } else {
        clockBlack = Math.max(0, clockBlack - 1);
      }

      updateClockDisplay();

      // Low time warning tick
      const activeTime = currentTurn === 'w' ? clockWhite : clockBlack;
      if (activeTime <= 30 && activeTime > 0) {
        if (window.SFX && window.SFX.clockTick) window.SFX.clockTick();
      }

      // Time out forfeit
      if (activeTime <= 0) {
        stopClock();
        gameActive = false;
        const winner = currentTurn === 'w' ? 'Dark Side (Empire)' : 'Light Side (Rebel Alliance)';
        gameoverTitle.textContent = 'Time Out! ⏰';
        winnerDisplay.textContent = `${winner} wins on time!`;
        if (window.SFX && window.SFX.gameOver) window.SFX.gameOver();
        setTimeout(() => gameoverOverlay.classList.remove('hidden'), 500);
        sendP2P({ type: 'TIMEOUT', loser: currentTurn });
      }
    }, 1000);
  }

  function stopClock() {
    clockRunning = false;
    if (clockInterval) { clearInterval(clockInterval); clockInterval = null; }
  }

  function updateClockDisplay() {
    if (!clockLightEl || !clockDarkEl) return;

    clockLightEl.textContent = formatClockTime(clockWhite);
    clockDarkEl.textContent = formatClockTime(clockBlack);

    // Active player highlight
    if (clockLightBox) {
      clockLightBox.classList.toggle('active-clock', currentTurn === 'w' && gameActive);
      clockLightBox.classList.toggle('time-low', clockWhite <= 30);
    }
    if (clockDarkBox) {
      clockDarkBox.classList.toggle('active-clock', currentTurn === 'b' && gameActive);
      clockDarkBox.classList.toggle('time-low', clockBlack <= 30);
    }
  }

  function formatClockTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  // ---- P2P Connection Logic (PeerJS) ----
  function createP2PRoom(name) {
    if (typeof Peer === 'undefined') {
      if (p2pCreateError) p2pCreateError.textContent = 'PeerJS not loaded. Check internet.';
      return;
    }

    myName = name;
    isHost = true;
    myColor = 'w';
    roomCode = generateRoomCode();

    showP2POverlay(p2pWaitingOverlay);
    if (p2pDisplayCode) p2pDisplayCode.textContent = roomCode;

    peer = new Peer('schess-' + roomCode, { debug: 0 });

    peer.on('open', () => {
      if (p2pDisplayCode) p2pDisplayCode.textContent = roomCode;
    });

    peer.on('connection', (dataConn) => {
      conn = dataConn;
      setupP2PConnection();
    });

    peer.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        peer.destroy();
        roomCode = generateRoomCode();
        peer = new Peer('schess-' + roomCode, { debug: 0 });
        if (p2pDisplayCode) p2pDisplayCode.textContent = roomCode;
        peer.on('open', () => { if (p2pDisplayCode) p2pDisplayCode.textContent = roomCode; });
        peer.on('connection', (dataConn) => { conn = dataConn; setupP2PConnection(); });
        peer.on('error', () => {
          hideAllP2POverlays();
          showP2POverlay(p2pLobbyOverlay);
          if (p2pCreateError) p2pCreateError.textContent = 'Connection error. Try again.';
        });
      } else {
        console.error('PeerJS error:', err);
      }
    });
  }

  function joinP2PRoom(name, code) {
    if (typeof Peer === 'undefined') {
      if (p2pJoinError) p2pJoinError.textContent = 'PeerJS not loaded. Check internet.';
      return;
    }

    myName = name;
    isHost = false;
    myColor = 'b';
    roomCode = code.toUpperCase();

    showP2POverlay(p2pConnectingOverlay);
    if (p2pConnectingText) p2pConnectingText.textContent = 'Connecting to match...';

    peer = new Peer(undefined, { debug: 0 });

    peer.on('open', () => {
      conn = peer.connect('schess-' + roomCode, { reliable: true });

      conn.on('open', () => {
        setupP2PConnection();
      });

      conn.on('error', () => {
        hideAllP2POverlays();
        showP2POverlay(p2pLobbyOverlay);
        if (p2pJoinError) p2pJoinError.textContent = 'Could not connect. Check code.';
        cleanupP2P();
      });
    });

    peer.on('error', () => {
      hideAllP2POverlays();
      showP2POverlay(p2pLobbyOverlay);
      if (p2pJoinError) p2pJoinError.textContent = 'Room not found. Check code.';
      cleanupP2P();
    });

    // Timeout
    setTimeout(() => {
      if (!conn || !conn.open) {
        hideAllP2POverlays();
        showP2POverlay(p2pLobbyOverlay);
        if (p2pJoinError) p2pJoinError.textContent = 'Connection timed out.';
        cleanupP2P();
      }
    }, 10000);
  }

  function setupP2PConnection() {
    conn.on('open', () => {
      conn.send({ type: 'HELLO', name: myName });
    });

    if (conn.open) {
      conn.send({ type: 'HELLO', name: myName });
    }

    conn.on('data', (data) => {
      handleP2PMessage(data);
    });

    conn.on('close', () => {
      if (gameActive || gameMode === 'online') {
        gameActive = false;
        stopClock();
        hideAllP2POverlays();
        if (p2pDisconnectOverlay) p2pDisconnectOverlay.classList.remove('hidden');
      }
    });

    conn.on('error', () => {
      gameActive = false;
      stopClock();
      hideAllP2POverlays();
      if (p2pDisconnectOverlay) p2pDisconnectOverlay.classList.remove('hidden');
    });
  }

  function handleP2PMessage(data) {
    if (!data || !data.type) return;

    switch (data.type) {
      case 'HELLO':
        opponentName = data.name || 'Opponent';
        // Start the game
        gameMode = 'online';
        clearModeButtons();
        if (btnModeOnline) btnModeOnline.classList.add('active');
        difficultyWrap.style.display = 'none';
        hideAllP2POverlays();
        startOverlay.classList.add('hidden');
        gameoverOverlay.classList.add('hidden');
        updateUndoButtonState();
        initGame();
        showToast(`⚔️ ${opponentName} has joined! Game on!`);
        if (window.SFX && window.SFX.levelUp) window.SFX.levelUp();
        break;

      case 'DRAFT_MOVE':
        // Show opponent's draft move on board (preview indicator)
        opponentDraft = { from: data.from, to: data.to, promo: data.promo };
        render();
        break;

      case 'DRAFT_CLEAR':
        opponentDraft = null;
        render();
        break;

      case 'LOCK_MOVE':
        // Opponent locked in their move — execute it
        opponentDraft = null;
        const from = { r: data.from.r, c: data.from.c };
        const to = { r: data.to.r, c: data.to.c };
        startAnimatedMove(from, to, data.promo);
        if (window.SFX && window.SFX.buzzerSound) window.SFX.buzzerSound();
        break;

      case 'TIMEOUT':
        // Opponent timed out
        stopClock();
        gameActive = false;
        const winner = data.loser === 'w' ? 'Dark Side (Empire)' : 'Light Side (Rebel Alliance)';
        gameoverTitle.textContent = 'Time Out! ⏰';
        winnerDisplay.textContent = `${winner} wins on time!`;
        if (window.SFX && window.SFX.levelUp) window.SFX.levelUp();
        setTimeout(() => gameoverOverlay.classList.remove('hidden'), 500);
        break;

      case 'CLOCK_SYNC':
        // Sync clock from host
        if (!isHost) {
          clockWhite = data.clockWhite;
          clockBlack = data.clockBlack;
          updateClockDisplay();
        }
        break;
    }
  }

  // ---- P2P Lobby Event Listeners ----
  if (p2pCreateBtn) {
    p2pCreateBtn.addEventListener('click', () => {
      const name = p2pCreateNameInput ? p2pCreateNameInput.value.trim() : '';
      if (!name) { if (p2pCreateError) p2pCreateError.textContent = 'Enter your name!'; return; }
      if (p2pCreateError) p2pCreateError.textContent = '';
      createP2PRoom(name);
    });
  }

  if (p2pJoinBtn) {
    p2pJoinBtn.addEventListener('click', () => {
      const name = p2pJoinNameInput ? p2pJoinNameInput.value.trim() : '';
      const code = p2pJoinCodeInput ? p2pJoinCodeInput.value.trim().toUpperCase() : '';
      if (!name) { if (p2pJoinError) p2pJoinError.textContent = 'Enter your name!'; return; }
      if (!code || code.length < 4) { if (p2pJoinError) p2pJoinError.textContent = 'Enter a valid room code!'; return; }
      if (p2pJoinError) p2pJoinError.textContent = '';
      joinP2PRoom(name, code);
    });
  }

  if (p2pCancelWaitBtn) {
    p2pCancelWaitBtn.addEventListener('click', () => {
      cleanupP2P();
      showP2POverlay(p2pLobbyOverlay);
    });
  }

  if (p2pCancelConnectBtn) {
    p2pCancelConnectBtn.addEventListener('click', () => {
      cleanupP2P();
      showP2POverlay(p2pLobbyOverlay);
    });
  }

  if (p2pBackLobbyBtn) {
    p2pBackLobbyBtn.addEventListener('click', () => {
      cleanupP2P();
      showP2POverlay(p2pLobbyOverlay);
    });
  }

  if (p2pRoomCodeBox) {
    p2pRoomCodeBox.addEventListener('click', () => {
      if (navigator.clipboard && roomCode) {
        navigator.clipboard.writeText(roomCode).then(() => {
          showToast('📋 Room code copied!');
        });
      }
    });
  }

  // ---- Clock Sync (Host sends clock every 5 seconds) ----
  setInterval(() => {
    if (gameMode === 'online' && isHost && gameActive && conn && conn.open) {
      sendP2P({ type: 'CLOCK_SYNC', clockWhite, clockBlack });
    }
  }, 5000);

  // ---- Auto-join from Party Lounge URL params ----
  function checkURLParams() {
    const params = new URLSearchParams(window.location.search);
    const role = params.get('role');
    const room = params.get('room');
    const name = params.get('name') || 'Player';

    if (role && room) {
      startOverlay.classList.add('hidden');
      if (role === 'host') {
        myName = name;
        isHost = true;
        myColor = 'w';
        roomCode = room;
        gameMode = 'online';
        clearModeButtons();
        if (btnModeOnline) btnModeOnline.classList.add('active');
        difficultyWrap.style.display = 'none';

        showP2POverlay(p2pWaitingOverlay);
        if (p2pDisplayCode) p2pDisplayCode.textContent = roomCode;

        if (typeof Peer !== 'undefined') {
          peer = new Peer('schess-' + roomCode, { debug: 0 });
          peer.on('open', () => {
            if (p2pDisplayCode) p2pDisplayCode.textContent = roomCode;
          });
          peer.on('connection', (dataConn) => {
            conn = dataConn;
            setupP2PConnection();
          });
          peer.on('error', (err) => {
            console.error('PeerJS error:', err);
          });
        }
      } else {
        joinP2PRoom(name, room);
      }
    }
  }

  // Start on load
  checkURLParams();
  if (!new URLSearchParams(window.location.search).get('role')) {
    initGame();
  }

})();

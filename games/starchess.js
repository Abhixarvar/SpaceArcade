/* ===== Star Combat Chess — Sci-Fi Chess Engine & Renderer ===== */

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

  // Buttons
  const btnModeAi = document.getElementById('btn-mode-ai');
  const btnModeLocal = document.getElementById('btn-mode-local');
  const aiDifficultySelect = document.getElementById('ai-difficulty');
  const btnFlip = document.getElementById('btn-flip');
  const btnUndo = document.getElementById('btn-undo');
  const btnRestart = document.getElementById('btn-restart');
  const difficultyWrap = document.getElementById('difficulty-wrap');

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

  // Promo icons
  const promoIconQ = document.getElementById('promo-icon-q');
  const promoIconR = document.getElementById('promo-icon-r');
  const promoIconB = document.getElementById('promo-icon-b');
  const promoIconN = document.getElementById('promo-icon-n');

  // ---- Game State ----
  const BOARD_SIZE = 520;
  const GRID_SIZE = 8;
  const TILE_SIZE = BOARD_SIZE / GRID_SIZE; // 65px

  let gameMode = 'ai'; // 'ai' or 'local'
  let aiLevel = 2; // 1, 2, or 3
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

  // Particle Effects
  let particles = [];

  // Star Wars Piece Symbols & Mapping
  // w = White (Light Side: Rebels), b = Black (Dark Side: Empire)
  // P=Pawn, N=Knight, B=Bishop, R=Rook, Q=Queen, K=King
  const PIECE_NAMES = {
    'wK': 'Yoda/Luke (King)', 'wQ': 'Leia (Queen)', 'wR': 'Falcon (Rook)', 'wB': 'Obi-Wan (Bishop)', 'wN': 'X-Wing (Knight)', 'wP': 'Rebel Droid (Pawn)',
    'bK': 'Vader (King)', 'bQ': 'Sidious (Queen)', 'bR': 'Death Star (Rook)', 'bB': 'Inquisitor (Bishop)', 'bN': 'AT-AT (Knight)', 'bP': 'Stormtrooper (Pawn)'
  };

  const PIECE_SYMBOLS = {
    'wK': '👑', 'wQ': '👸', 'wR': '🚀', 'wB': '🧙‍♂️', 'wN': '✈️', 'wP': '🤖',
    'bK': '👑', 'bQ': '⚡', 'bR': '🌌', 'bB': '🎯', 'bN': '🛸', 'bP': '🪖'
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
    gameActive = true;

    updateUI();
    render();
  }

  // ---- UI Controls Event Listeners ----
  btnModeAi.addEventListener('click', () => {
    gameMode = 'ai';
    btnModeAi.classList.add('active');
    btnModeLocal.classList.remove('active');
    difficultyWrap.style.display = 'flex';
    initGame();
  });

  btnModeLocal.addEventListener('click', () => {
    gameMode = 'local';
    btnModeLocal.classList.add('active');
    btnModeAi.classList.remove('active');
    difficultyWrap.style.display = 'none';
    initGame();
  });

  aiDifficultySelect.addEventListener('change', (e) => {
    aiLevel = parseInt(e.target.value, 10);
  });

  btnFlip.addEventListener('click', () => {
    isFlipped = !isFlipped;
    render();
  });

  btnUndo.addEventListener('click', () => {
    if (!gameActive || isAiThinking) return;
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
    if (!gameActive || isAiThinking) return;
    if (gameMode === 'ai' && currentTurn === 'b') return; // AI's turn

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
      executeMove(selectedSquare, targetMove);
      return;
    }

    // If clicking on player's own piece:
    if (piece && piece[0] === currentTurn) {
      selectedSquare = { r, c };
      validMoves = getLegalMovesForSquare(r, c, board, currentTurn, castlingRights, enPassantSquare);
      if (window.SFX && window.SFX.saberHum) window.SFX.saberHum();
    } else {
      selectedSquare = null;
      validMoves = [];
    }

    render();
  }

  // ---- Move Execution ----
  function executeMove(from, to, promotionChoice = null) {
    const piece = board[from.r][from.c];
    const targetPiece = board[to.r][to.c];
    const pieceColor = piece[0];
    const pieceType = piece[1];

    // Check for Pawn Promotion requirement
    if (pieceType === 'P' && ((pieceColor === 'w' && to.r === 0) || (pieceColor === 'b' && to.r === 7))) {
      if (!promotionChoice) {
        showPromotionModal(pieceColor, (choice) => {
          executeMove(from, to, choice);
        });
        return;
      }
    }

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
      setTimeout(() => gameoverOverlay.classList.remove('hidden'), 600);
      return;
    }

    if (isNextInCheck) {
      if (window.SFX && window.SFX.checkAlert) window.SFX.checkAlert();
    }

    // Trigger AI turn if in AI mode
    if (gameMode === 'ai' && currentTurn === 'b' && gameActive) {
      isAiThinking = true;
      statusBadgeEl.textContent = 'Imperial AI calculating...';
      setTimeout(makeAiMove, 400);
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
      executeMove(bestMove.from, bestMove.to, bestMove.promo);
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
          tr += dr;
          tc += dc;
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
    // Find King location
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
    promoSubtitle.textContent = color === 'w' ? 'Rebel Droid evolving:' : 'Imperial Trooper advancing:';
    
    promoIconQ.textContent = color === 'w' ? '👸' : '⚡';
    promoIconR.textContent = color === 'w' ? '🚀' : '🌌';
    promoIconB.textContent = color === 'w' ? '🧙‍♂️' : '🎯';
    promoIconN.textContent = color === 'w' ? '✈️' : '🛸';

    const buttons = promotionOverlay.querySelectorAll('.promo-btn');
    buttons.forEach(btn => {
      btn.onclick = () => {
        const choice = btn.getAttribute('data-promo');
        promotionOverlay.classList.add('hidden');
        if (pendingPromotion) pendingPromotion(choice);
      };
    });
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

        // Tile grid border line
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

    // 6. Draw Pieces & Coordinates
    drawCoordinates();

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          const renderR = isFlipped ? 7 - r : r;
          const renderC = isFlipped ? 7 - c : c;
          drawStarWarsPiece(piece, renderC * TILE_SIZE, renderR * TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // 7. Update Particles
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

  // Draw Star Wars Themed Vector Graphic Pieces
  function drawStarWarsPiece(piece, x, y, size) {
    const cx = x + size / 2;
    const cy = y + size / 2;
    const color = piece[0]; // 'w' or 'b'
    const type = piece[1]; // P, N, B, R, Q, K
    const isDark = color === 'b';

    ctx.save();

    // Glow aura
    ctx.shadowColor = isDark ? '#ff0033' : '#00f0ff';
    ctx.shadowBlur = 12;

    // Draw Piece Icon / Symbol
    const symbol = PIECE_SYMBOLS[piece] || '♟️';
    ctx.font = `${Math.floor(size * 0.52)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Base Circle background badge
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2);
    ctx.fillStyle = isDark
      ? 'radial-gradient(circle, #2a050c, #100205)'
      : 'radial-gradient(circle, #052035, #020d18)';
    ctx.fillStyle = isDark ? '#1e050a' : '#051b2c';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = isDark ? '#ff3355' : '#00f0ff';
    ctx.stroke();

    // Custom Lightsaber Accents
    if (type === 'K') {
      // King Lightsaber Blade
      ctx.strokeStyle = isDark ? '#ff0033' : '#00ff66';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy + 12);
      ctx.lineTo(cx + 16, cy - 16);
      ctx.stroke();
    } else if (type === 'Q') {
      // Queen Force Lightning / Lightsaber
      ctx.strokeStyle = isDark ? '#aa00ff' : '#00f0ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Emoji/Icon Text
    ctx.fillStyle = isDark ? '#ffffff' : '#ffffff';
    ctx.fillText(symbol, cx, cy + 1);

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

  // ---- UI Formatters & Log Updating ----
  function updateUI() {
    // Turn Indicator
    if (currentTurn === 'w') {
      turnIndicatorEl.className = 'turn-indicator light-turn';
      turnIconEl.textContent = '🟢';
      turnTextEl.textContent = 'Light Side (Rebels)';
    } else {
      turnIndicatorEl.className = 'turn-indicator dark-turn';
      turnIconEl.textContent = '🔴';
      turnTextEl.textContent = 'Dark Empire (Sith)';
    }

    // Status Badge
    const inCheckColor = isKingInCheck(board, currentTurn);
    if (inCheckColor) {
      statusBadgeEl.className = 'status-badge in-check';
      statusBadgeEl.textContent = currentTurn === 'w' ? '⚠️ Master Yoda in Danger!' : '⚠️ Darth Vader in Danger!';
    } else {
      statusBadgeEl.className = 'status-badge';
      statusBadgeEl.textContent = 'Tactical Phase';
    }

    // Captured Units
    darkCapturedEl.innerHTML = capturedPieces.w.length > 0
      ? capturedPieces.w.map(p => `<span class="captured-piece-icon" title="${PIECE_NAMES[p]}">${PIECE_SYMBOLS[p]}</span>`).join('')
      : '<span style="color: #666; font-size: 0.75rem;">None</span>';

    lightCapturedEl.innerHTML = capturedPieces.b.length > 0
      ? capturedPieces.b.map(p => `<span class="captured-piece-icon" title="${PIECE_NAMES[p]}">${PIECE_SYMBOLS[p]}</span>`).join('')
      : '<span style="color: #666; font-size: 0.75rem;">None</span>';

    // Move Log Table
    moveCountEl.textContent = `Turn ${Math.floor(moveHistory.length / 2) + 1}`;
    renderMoveLog();
  }

  function renderMoveLog() {
    let html = `
      <div class="move-row" style="color: #777;">
        <span class="move-num">#</span>
        <span>Light (Rebel)</span>
        <span>Dark (Empire)</span>
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

  // Start on load
  initGame();

})();

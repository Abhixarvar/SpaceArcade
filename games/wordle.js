import { playSound } from '../js/audio.js';

// Strict 5-letter Word Dictionary (Over 100 space & general words)
const WORDS = [
  "ALIEN", "COMET", "ORBIT", "SPACE", "STARS", "LASER", "MOONS", "ASTRO", "EARTH", "VENUS",
  "PLUTO", "SOLAR", "LUNAR", "ROVER", "PROBE", "RADAR", "BLACK", "LIGHT", "SPEED", "BLAST",
  "PILOT", "FLEET", "CRAFT", "STONE", "APPLE", "BREAD", "CHAIR", "DANCE", "EAGLE", "FLAME",
  "GHOST", "HEART", "IGLOO", "JUICE", "KNIFE", "LEMON", "MAGIC", "NIGHT", "OCEAN", "PIZZA",
  "QUEEN", "RIVER", "SNAKE", "TRAIN", "UNCLE", "VOICE", "WATER", "XENON", "YACHT", "ZEBRA",
  "BRAVE", "CLEAN", "DRIVE", "EMPTY", "FRESH", "GRAND", "HAPPY", "IDEAL", "JOLLY", "KINKY",
  "LUCKY", "NOBLE", "PROUD", "QUIET", "RIGHT", "SMART", "TOUGH", "VALID", "YOUNG", "ZESTY",
  "BRICK", "CLOCK", "DREAM", "FRAME", "GLASS", "HOUSE", "IMAGE", "LOGIC", "MUSIC", "NOVEL",
  "PAPER", "RADIO", "SUGAR", "TABLE", "VIDEO", "WHEEL", "YOUTH", "ALARM", "BLAME", "CRASH",
  "DOUBT", "FAULT", "GUESS", "HURRY", "ISSUE", "JUDGE", "KNOCK", "LAUGH", "MATCH", "NEEDS",
  "OFFER", "PRICE", "REPLY", "SMILE", "TRUST", "VALUE", "WORRY", "YIELD", "BEAST", "FORCE",
  "POWER", "FLARE", "GIANT", "MILKY", "PHASE", "QUARK", "TITAN", "WIDER", "GLYPH", "ACTOR",
  "ACUTE", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER", "AGAIN", "AGENT", "AGREE", "AHEAD",
  "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW", "ALONE", "ALONG", "ALTER", "AMONG", "ANGER",
  "ANGLE", "ANGRY", "APART", "APPLY", "ARENA", "ARGUE", "ARISE", "ARRAY", "ASIDE", "ASSET",
  "AUDIO", "AUDIT", "AVOID", "AWARD", "AWARE"
].filter(w => w.length === 5);

// Game State
let secretWord = "";
let currentAttempt = 0;
let currentLetterPosition = 0;
let grid = [];
let opponentGrid = [];
const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;
let isGameOver = false;

// Multiplayer State
let isMultiplayer = false;
let peer = null;
let conn = null;
let isHost = false;
let myName = 'Player 1';
let opponentName = 'Player 2';
let roomCode = '';
let myRematchVote = false;
let opponentRematchVote = false;

// DOM Elements
const gridContainer = document.getElementById('wordle-grid');
const opponentGridContainer = document.getElementById('opponent-grid');
const keyboardContainer = document.getElementById('wordle-keyboard');
const messageContainer = document.getElementById('message-container');

// Overlays
const startOverlay = document.getElementById('start-overlay');
const gameoverOverlay = document.getElementById('gameover-overlay');
const lobbyOverlay = document.getElementById('lobby-overlay');
const waitingOverlay = document.getElementById('waiting-overlay');
const connectingOverlay = document.getElementById('connecting-overlay');
const countdownOverlay = document.getElementById('countdown-overlay');
const disconnectOverlay = document.getElementById('disconnect-overlay');

// Text & Buttons
const secretWordDisplay = document.getElementById('secret-word-display');
const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const backArcadeBtn = document.getElementById('back-arcade-btn');
const gameoverTitle = document.getElementById('gameover-title');
const gameoverText = document.getElementById('gameover-text');
const rematchStatus = document.getElementById('rematch-status');

// HUD Names
const hudNameLeft = document.getElementById('hud-name-left');
const hudNameRight = document.getElementById('hud-name-right');
const opponentBoardWrap = document.getElementById('opponent-board-wrap');

// Multiplayer Lobby Elements
const createBtn = document.getElementById('create-btn');
const joinBtn = document.getElementById('join-btn');
const createNameInput = document.getElementById('create-name');
const joinNameInput = document.getElementById('join-name');
const joinCodeInput = document.getElementById('join-code');
const displayCode = document.getElementById('display-code');
const createError = document.getElementById('create-error');
const joinError = document.getElementById('join-error');
const cancelWaitBtn = document.getElementById('cancel-wait-btn');
const cancelConnectBtn = document.getElementById('cancel-connect-btn');
const backLobbyBtn = document.getElementById('back-lobby-btn');
const countdownNum = document.getElementById('countdown-num');

// --- Helper Functions ---
function hideAllOverlays() {
  [startOverlay, gameoverOverlay, lobbyOverlay, waitingOverlay, connectingOverlay, countdownOverlay, disconnectOverlay].forEach(el => {
    if(el) el.classList.add('hidden');
  });
}

function showOverlay(overlay) {
  hideAllOverlays();
  if (overlay) overlay.classList.remove('hidden');
}

function showMessage(msg, duration = 2000) {
  messageContainer.textContent = msg;
  messageContainer.classList.remove('hidden');
  setTimeout(() => {
    messageContainer.classList.add('hidden');
  }, duration);
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// --- Networking (PeerJS) ---
function createRoom() {
  const name = createNameInput.value.trim().toUpperCase() || 'HOST';
  myName = name;
  isHost = true;
  isMultiplayer = true;
  roomCode = generateRoomCode();

  hideAllOverlays();
  showOverlay(waitingOverlay);
  displayCode.textContent = roomCode;

  peer = new Peer('wrdl-' + roomCode, { debug: 0 });

  peer.on('open', () => {
    displayCode.textContent = roomCode;
  });

  peer.on('connection', dataConn => {
    conn = dataConn;
    setupConnection();
  });

  peer.on('error', err => {
    console.error('PeerJS error:', err);
    if (err.type === 'unavailable-id') {
      peer.destroy();
      roomCode = generateRoomCode();
      peer = new Peer('wrdl-' + roomCode, { debug: 0 });
      peer.on('open', () => { displayCode.textContent = roomCode; });
      peer.on('connection', dataConn => { conn = dataConn; setupConnection(); });
      peer.on('error', () => {
        showOverlay(lobbyOverlay);
        createError.textContent = 'Connection error. Try again.';
      });
    } else {
      showOverlay(lobbyOverlay);
      createError.textContent = 'Failed to create room.';
    }
  });
}

function joinRoom() {
  const name = joinNameInput.value.trim().toUpperCase() || 'GUEST';
  const code = joinCodeInput.value.trim().toUpperCase();
  if (!code || code.length < 4) { joinError.textContent = 'Enter a valid room code!'; return; }
  
  myName = name;
  isHost = false;
  isMultiplayer = true;
  roomCode = code;

  hideAllOverlays();
  showOverlay(connectingOverlay);

  peer = new Peer(undefined, { debug: 0 });

  peer.on('open', () => {
    conn = peer.connect('wrdl-' + roomCode, { reliable: true });

    conn.on('open', () => {
      setupConnection();
    });

    conn.on('error', () => {
      showOverlay(lobbyOverlay);
      joinError.textContent = 'Could not connect. Check the code.';
      cleanupPeer();
    });
  });

  peer.on('error', err => {
    console.error('PeerJS error:', err);
    showOverlay(lobbyOverlay);
    joinError.textContent = 'Room not found. Check the code.';
    cleanupPeer();
  });
}

function setupConnection() {
  conn.on('open', () => {
    conn.send({ type: 'hello', name: myName });
  });

  if (conn.open) {
    conn.send({ type: 'hello', name: myName });
  }

  conn.on('data', data => {
    handleMessage(data);
  });

  conn.on('close', () => {
    handleDisconnect();
  });

  conn.on('error', () => {
    handleDisconnect();
  });
}

function handleDisconnect() {
  isGameOver = true;
  hideAllOverlays();
  showOverlay(disconnectOverlay);
  cleanupPeer();
}

function cleanupPeer() {
  if (conn) { try { conn.close(); } catch (e) { } conn = null; }
  if (peer) { try { peer.destroy(); } catch (e) { } peer = null; }
  isMultiplayer = false;
}

function send(data) {
  if (conn && conn.open) {
    conn.send(data);
  }
}

function handleMessage(data) {
  switch (data.type) {
    case 'hello':
      opponentName = data.name;
      if (isHost) {
        conn.send({ type: 'names', host: myName, guest: opponentName });
        startCountdown();
      }
      break;

    case 'names':
      hudNameLeft.textContent = data.host;
      hudNameRight.textContent = data.guest;
      hudNameRight.style.display = 'block';
      opponentBoardWrap.style.display = 'flex';
      break;

    case 'start-game':
      if (!isHost) {
        secretWord = data.word;
        startCountdown();
      }
      break;

    case 'countdown':
      countdownNum.textContent = data.num;
      countdownNum.style.animation = 'none';
      void countdownNum.offsetWidth;
      countdownNum.style.animation = '';
      break;

    case 'guess':
      // Opponent made a guess, update their mini grid
      updateOpponentGrid(data.row, data.colors);
      break;

    case 'gameover':
      isGameOver = true;
      showGameOver(data.winner, data.word);
      break;
      
    case 'rematch':
      opponentRematchVote = data.vote;
      if (data.vote) {
        rematchStatus.textContent = opponentName + ' wants to play again!';
        if (myRematchVote && opponentRematchVote) {
          if (isHost) startCountdown();
        }
      }
      break;
  }
}

function startCountdown() {
  hideAllOverlays();
  showOverlay(countdownOverlay);
  
  if (isHost) {
    const validWords = WORDS.filter(w => w.length === 5);
    secretWord = validWords[Math.floor(Math.random() * validWords.length)];
    send({ type: 'start-game', word: secretWord });
    hudNameLeft.textContent = myName;
    hudNameRight.textContent = opponentName;
    hudNameRight.style.display = 'block';
    opponentBoardWrap.style.display = 'flex';
  }

  // Reset Game UI
  currentAttempt = 0;
  currentLetterPosition = 0;
  isGameOver = false;
  myRematchVote = false;
  opponentRematchVote = false;
  rematchStatus.textContent = '';
  initGrid();
  initOpponentGrid();
  initKeyboard();

  let count = 3;
  countdownNum.textContent = count;

  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownNum.textContent = count;
      countdownNum.style.animation = 'none';
      void countdownNum.offsetWidth;
      countdownNum.style.animation = '';
      if (isHost) send({ type: 'countdown', num: count });
    } else if (count === 0) {
      countdownNum.textContent = 'GO!';
      countdownNum.style.animation = 'none';
      void countdownNum.offsetWidth;
      countdownNum.style.animation = '';
      if (isHost) send({ type: 'countdown', num: 'GO!' });
    } else {
      clearInterval(interval);
      hideAllOverlays();
    }
  }, 800);
}

// --- Game Logic ---

function initGrid() {
  gridContainer.innerHTML = '';
  grid = [];
  for (let r = 0; r < MAX_ATTEMPTS; r++) {
    const row = document.createElement('div');
    row.className = 'wordle-row';
    const rowTiles = [];
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement('div');
      tile.className = 'wordle-tile';
      row.appendChild(tile);
      rowTiles.push(tile);
    }
    gridContainer.appendChild(row);
    grid.push(rowTiles);
  }
}

function initOpponentGrid() {
  opponentGridContainer.innerHTML = '';
  opponentGrid = [];
  for (let r = 0; r < MAX_ATTEMPTS; r++) {
    const row = document.createElement('div');
    row.className = 'wordle-row';
    const rowTiles = [];
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement('div');
      tile.className = 'wordle-tile';
      row.appendChild(tile);
      rowTiles.push(tile);
    }
    opponentGridContainer.appendChild(row);
    opponentGrid.push(rowTiles);
  }
}

function initKeyboard() {
  keyboardContainer.innerHTML = '';
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DEL']
  ];

  rows.forEach(row => {
    const rowEl = document.createElement('div');
    rowEl.className = 'keyboard-row';
    row.forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'key';
      btn.textContent = key;
      btn.dataset.key = key;
      if (key === 'ENTER' || key === 'DEL') {
        btn.classList.add('large');
      }
      btn.addEventListener('click', () => handleKey(key));
      rowEl.appendChild(btn);
    });
    keyboardContainer.appendChild(rowEl);
  });
}

let isCheckingWord = false;

async function isValidWord(word) {
  if (WORDS.includes(word)) return true;
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
    return res.ok;
  } catch (e) {
    // If API is down, just allow the word so we don't break the game
    return true;
  }
}

async function handleKey(key) {
  if (isGameOver || (!isMultiplayer && startOverlay.classList.contains('hidden') === false) || isCheckingWord) return;

  if (key === 'DEL' || key === 'BACKSPACE') {
    if (currentLetterPosition > 0) {
      currentLetterPosition--;
      const tile = grid[currentAttempt][currentLetterPosition];
      tile.textContent = '';
      tile.classList.remove('filled');
      playSound('blip');
    }
  } else if (key === 'ENTER') {
    if (currentLetterPosition === WORD_LENGTH) {
      isCheckingWord = true;
      const guess = grid[currentAttempt].map(t => t.textContent).join('');
      const valid = await isValidWord(guess);
      
      if (valid) {
        checkWord();
      } else {
        showMessage("Not in word list");
        shakeRow();
      }
      isCheckingWord = false;
    } else {
      showMessage("Not enough letters");
      shakeRow();
    }
  } else {
    if (currentLetterPosition < WORD_LENGTH && /^[A-Z]$/.test(key)) {
      const tile = grid[currentAttempt][currentLetterPosition];
      tile.textContent = key;
      tile.classList.add('filled');
      currentLetterPosition++;
      playSound('blip');
    }
  }
}

function shakeRow() {
  const row = gridContainer.children[currentAttempt];
  row.classList.remove('shake');
  void row.offsetWidth;
  row.classList.add('shake');
  playSound('hurt');
}

function checkWord() {
  const guessTiles = grid[currentAttempt];
  const guess = guessTiles.map(t => t.textContent).join('');
  
  let secretLetters = secretWord.split('');
  let guessLetters = guess.split('');
  let tileColors = new Array(WORD_LENGTH).fill('grey');

  // First pass: find greens
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === secretLetters[i]) {
      tileColors[i] = 'green';
      secretLetters[i] = null; 
      guessLetters[i] = null;
    }
  }

  // Second pass: find yellows
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] !== null && secretLetters.includes(guessLetters[i])) {
      tileColors[i] = 'yellow';
      secretLetters[secretLetters.indexOf(guessLetters[i])] = null; 
    }
  }

  // Send guess to opponent if multiplayer
  if (isMultiplayer) {
    send({ type: 'guess', row: currentAttempt, colors: tileColors });
  }

  // Apply colors and animate
  guessTiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add(tileColors[index]);
      updateKeyboard(guess[index], tileColors[index]);
      playSound('blip');
    }, index * 200);
  });

  setTimeout(() => {
    if (guess === secretWord) {
      if (isMultiplayer) {
        send({ type: 'gameover', winner: myName, word: secretWord });
      }
      showGameOver(myName, secretWord);
    } else {
      currentAttempt++;
      currentLetterPosition = 0;
      if (currentAttempt === MAX_ATTEMPTS) {
        if (isMultiplayer) {
          send({ type: 'guess', row: currentAttempt - 1, colors: tileColors }); // Final send
          // If both fail, or one fails, we don't end game immediately unless it's a single player loss
          // For simplicity in MP, if you run out of guesses, you lose. Opponent keeps playing or wins if they also ran out.
          send({ type: 'gameover', winner: opponentName, word: secretWord });
          showGameOver(opponentName, secretWord);
        } else {
          showGameOver('none', secretWord);
        }
      }
    }
  }, WORD_LENGTH * 200 + 100);
}

function updateOpponentGrid(rowIdx, colors) {
  if (rowIdx < MAX_ATTEMPTS && opponentGrid[rowIdx]) {
    colors.forEach((color, i) => {
      setTimeout(() => {
        opponentGrid[rowIdx][i].classList.add(color, 'filled');
      }, i * 200);
    });
  }
}

function updateKeyboard(letter, color) {
  const keyBtn = document.querySelector(`.key[data-key="${letter}"]`);
  if (!keyBtn) return;
  if (color === 'green') {
    keyBtn.classList.remove('yellow', 'grey');
    keyBtn.classList.add('green');
  } else if (color === 'yellow' && !keyBtn.classList.contains('green')) {
    keyBtn.classList.remove('grey');
    keyBtn.classList.add('yellow');
  } else if (color === 'grey' && !keyBtn.classList.contains('green') && !keyBtn.classList.contains('yellow')) {
    keyBtn.classList.add('grey');
  }
}

function showGameOver(winnerName, word) {
  isGameOver = true;
  hideAllOverlays();
  
  if (isMultiplayer) {
    if (winnerName === myName) {
      playSound('powerup');
      gameoverTitle.textContent = "🏆 Victory!";
      gameoverTitle.style.color = "#00ff88";
      gameoverText.innerHTML = `You guessed the word <span class="highlight">${word}</span> before ${opponentName}!`;
    } else {
      playSound('hurt');
      gameoverTitle.textContent = "💀 Defeat";
      gameoverTitle.style.color = "#ff4444";
      gameoverText.innerHTML = `${opponentName} won! The word was <span class="highlight">${word}</span>.`;
    }
    retryBtn.textContent = "Play Again";
    rematchStatus.textContent = "";
  } else {
    if (winnerName !== 'none') {
      playSound('powerup');
      gameoverTitle.textContent = "Mission Accomplished!";
      gameoverTitle.style.color = "#00ff88";
      gameoverText.innerHTML = `Awesome! You guessed <span class="highlight">${word}</span> in ${currentAttempt + 1} tries.`;
    } else {
      playSound('hurt');
      gameoverTitle.textContent = "Mission Failed";
      gameoverTitle.style.color = "#ff4444";
      gameoverText.innerHTML = `The word was: <span class="highlight">${word}</span>`;
    }
    retryBtn.textContent = "Play Again";
  }

  showOverlay(gameoverOverlay);
}

function handleRematch() {
  if (isMultiplayer) {
    myRematchVote = true;
    retryBtn.textContent = 'Waiting…';
    send({ type: 'rematch', vote: true });
    rematchStatus.textContent = 'Waiting for ' + opponentName + '…';

    if (myRematchVote && opponentRematchVote) {
      if (isHost) startCountdown();
    }
  } else {
    startSingleplayerGame();
  }
}

function startSingleplayerGame() {
  const validWords = WORDS.filter(w => w.length === 5);
  secretWord = validWords[Math.floor(Math.random() * validWords.length)];
  currentAttempt = 0;
  currentLetterPosition = 0;
  isGameOver = false;
  isMultiplayer = false;
  
  hideAllOverlays();
  hudNameLeft.textContent = 'Player 1';
  hudNameRight.style.display = 'none';
  opponentBoardWrap.style.display = 'none';
  
  initGrid();
  initKeyboard();
}

// --- Event Listeners ---
startBtn.addEventListener('click', () => {
  playSound('start');
  startSingleplayerGame();
});

retryBtn.addEventListener('click', () => {
  playSound('start');
  handleRematch();
});

backArcadeBtn.addEventListener('click', () => {
  playSound('blip');
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'LEAVE_GAME' }, '*');
  } else {
    window.location.href = '../singleplayer.html';
  }
});

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const key = e.key.toUpperCase();
  if (key === 'ENTER' || key === 'BACKSPACE' || /^[A-Z]$/.test(key)) {
    handleKey(key);
  }
});

// Multiplayer Lobby Events
createBtn.addEventListener('click', () => {
  playSound('blip');
  createRoom();
});
joinBtn.addEventListener('click', () => {
  playSound('blip');
  joinRoom();
});
cancelWaitBtn.addEventListener('click', () => {
  playSound('blip');
  cleanupPeer();
  showOverlay(lobbyOverlay);
});
cancelConnectBtn.addEventListener('click', () => {
  playSound('blip');
  cleanupPeer();
  showOverlay(lobbyOverlay);
});
backLobbyBtn.addEventListener('click', () => {
  playSound('blip');
  cleanupPeer();
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'LEAVE_GAME' }, '*');
  } else {
    showOverlay(lobbyOverlay);
  }
});

const backPartyBtn = document.getElementById('back-party-btn');
if (backPartyBtn) {
  backPartyBtn.addEventListener('click', (e) => {
    playSound('blip');
    cleanupPeer();
    if (window.parent !== window) {
      e.preventDefault();
      window.parent.postMessage({ type: 'LEAVE_GAME' }, '*');
    }
  });
}

document.getElementById('room-code-box').addEventListener('click', () => {
  navigator.clipboard.writeText(roomCode).then(() => {
    const hint = document.querySelector('.copy-hint');
    if (hint) {
      hint.textContent = 'Copied!';
      setTimeout(() => { hint.textContent = 'Click to copy'; }, 1500);
    }
  }).catch(() => { });
});

// --- Auto-connect from Global Lobby (party.html) ---
const urlParams = new URLSearchParams(window.location.search);
const roleParam = urlParams.get('role');
const roomParam = urlParams.get('room');
const nameParam = urlParams.get('name');

if (roleParam && roomParam) {
  roomCode = roomParam.toUpperCase();
  hideAllOverlays();
  
  if (roleParam === 'host') {
    isHost = true;
    isMultiplayer = true;
    myName = nameParam ? decodeURIComponent(nameParam) : 'P1';
    showOverlay(waitingOverlay);
    displayCode.textContent = roomCode;
    peer = new Peer('wrdl-' + roomCode, { debug: 0 });
    peer.on('open', () => { displayCode.textContent = roomCode; });
    peer.on('connection', dataConn => { conn = dataConn; setupConnection(); });
  } else {
    isHost = false;
    isMultiplayer = true;
    myName = nameParam ? decodeURIComponent(nameParam) : 'P2';
    showOverlay(connectingOverlay);
    peer = new Peer(undefined, { debug: 0 });
    peer.on('open', () => {
      conn = peer.connect('wrdl-' + roomCode, { reliable: true });
      conn.on('open', () => { setupConnection(); });
    });
  }
} else if (urlParams.has('mp')) {
  // If ?mp=true is provided but no role/room, open the Wordle lobby
  showOverlay(lobbyOverlay);
} else {
  // Setup Initial State (Single Player Menu)
  initGrid();
  initKeyboard();
  showOverlay(startOverlay);
}

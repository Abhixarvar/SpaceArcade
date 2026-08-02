/**
 * Space Arcade — Console Mode Engine (Desktop Host)
 * PeerJS WebRTC Connection Host, QR Code Pairing Generator,
 * Remote Navigation & Game Iframe Dispatcher.
 */

(function () {
  'use strict';

  // State Variables
  let peer = null;
  let activeConn = null;
  let roomCode = '';
  let focusedIndex = 0;
  let isGameActive = false;

  // DOM Elements
  const statusPill = document.getElementById('status-pill');
  const statusText = document.getElementById('status-text');
  const roomCodeDisplay = document.getElementById('room-code-display');
  const qrBox = document.getElementById('qrcode');
  const gameCards = Array.from(document.querySelectorAll('.console-game-card'));
  const viewportOverlay = document.getElementById('viewport-overlay');
  const viewportTitle = document.getElementById('viewport-title');
  const gameIframe = document.getElementById('game-iframe');
  const exitGameBtn = document.getElementById('exit-game-btn');

  // Helper: Generate Random Room Code
  function generateRoomCode() {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'SA-' + code;
  }

  // Initialize Host Peer
  function initHostPeer() {
    roomCode = generateRoomCode();
    const peerId = 'space-console-' + roomCode;
    
    if (roomCodeDisplay) {
      roomCodeDisplay.textContent = 'ROOM: ' + roomCode;
    }

    // Build Controller URL for QR Code
    const loc = window.location;
    const controllerUrl = `${loc.protocol}//${loc.host}${loc.pathname.replace('console.html', '')}controller.html?room=${roomCode}`;

    // Render QR Code
    if (qrBox && typeof QRCode !== 'undefined') {
      qrBox.innerHTML = '';
      new QRCode(qrBox, {
        text: controllerUrl,
        width: 180,
        height: 180,
        colorDark: '#070314',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    // Connect to PeerJS Server
    peer = new Peer(peerId);

    peer.on('open', (id) => {
      console.log('Console host active with Peer ID:', id);
    });

    peer.on('connection', (conn) => {
      activeConn = conn;
      console.log('Phone Controller connected!');

      if (statusPill && statusText) {
        statusPill.classList.add('connected');
        statusText.textContent = '🟢 PHONE CONNECTED';
      }

      conn.on('data', (data) => {
        handleIncomingInput(data);
      });

      conn.on('close', () => {
        if (statusPill && statusText) {
          statusPill.classList.remove('connected');
          statusText.textContent = 'WAITING FOR PHONE...';
        }
      });
    });

    peer.on('error', (err) => {
      console.warn('PeerJS Error:', err);
    });
  }

  // Handle incoming remote gamepad inputs
  function handleIncomingInput(data) {
    if (!data || !data.type) return;

    if (data.type === 'keydown' || data.type === 'keyup') {
      const key = data.key;
      const code = data.code || key;

      if (!isGameActive) {
        // Menu Navigation Mode
        if (data.type === 'keydown') {
          handleMenuNavigation(key);
        }
      } else {
        // Game Viewport Mode: Dispatch keyboard event into iframe
        dispatchKeyToIframe(data.type, key, code);

        // Allow MENU / ESCAPE / B button to exit game back to Console Hub
        if (data.type === 'keydown' && (key === 'Escape' || key === 'b')) {
          closeGameViewport();
        }
      }
    }
  }

  // Menu Navigation Focus Controller
  function handleMenuNavigation(key) {
    if (gameCards.length === 0) return;

    const cols = 3; // Approx grid columns
    let prevIndex = focusedIndex;

    if (key === 'ArrowRight') {
      focusedIndex = (focusedIndex + 1) % gameCards.length;
    } else if (key === 'ArrowLeft') {
      focusedIndex = (focusedIndex - 1 + gameCards.length) % gameCards.length;
    } else if (key === 'ArrowDown') {
      if (focusedIndex + cols < gameCards.length) focusedIndex += cols;
    } else if (key === 'ArrowUp') {
      if (focusedIndex - cols >= 0) focusedIndex -= cols;
    } else if (key === ' ' || key === 'Enter' || key === 'a' || key === 'w') {
      // Launch selected game
      launchSelectedGame(gameCards[focusedIndex]);
      return;
    }

    if (prevIndex !== focusedIndex) {
      updateFocusUI();
    }
  }

  function updateFocusUI() {
    gameCards.forEach((card, idx) => {
      if (idx === focusedIndex) {
        card.classList.add('focused');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        card.classList.remove('focused');
      }
    });
  }

  // Launch Game Viewport
  function launchSelectedGame(card) {
    if (!card) return;
    const url = card.getAttribute('data-url');
    const title = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Space Mission';

    if (!url) return;

    isGameActive = true;
    viewportTitle.textContent = title;
    gameIframe.src = url;
    viewportOverlay.classList.remove('hidden');

    // Inform Phone Controller of Active Game Skin
    if (activeConn && activeConn.open) {
      activeConn.send({ type: 'set_layout', gameId: card.getAttribute('data-game') });
    }
  }

  // Close Game Viewport
  function closeGameViewport() {
    isGameActive = false;
    viewportOverlay.classList.add('hidden');
    gameIframe.src = 'about:blank';

    // Reset Phone Controller to Menu Layout
    if (activeConn && activeConn.open) {
      activeConn.send({ type: 'set_layout', gameId: 'menu' });
    }
  }

  // Dispatch key synthetic event into iframe
  function dispatchKeyToIframe(type, key, code) {
    try {
      const event = new KeyboardEvent(type, {
        key: key,
        code: code,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);

      if (gameIframe && gameIframe.contentWindow && gameIframe.contentWindow.document) {
        gameIframe.contentWindow.document.dispatchEvent(event);
      }
    } catch (err) {
      console.warn('Iframe event dispatch warning:', err);
    }
  }

  // Bind Desktop Card Clicks
  gameCards.forEach((card, index) => {
    card.addEventListener('click', () => {
      focusedIndex = index;
      updateFocusUI();
      launchSelectedGame(card);
    });
  });

  if (exitGameBtn) {
    exitGameBtn.addEventListener('click', closeGameViewport);
  }

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    initHostPeer();
    updateFocusUI();
  });

})();

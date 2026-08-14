/**
 * Space Arcade — PlayStation 5 Astral Console Engine (Desktop Host)
 * PeerJS WebRTC Connection Host, QR Code Pairing Generator,
 * PS5 Dashboard Carousel, Boot Animation Transition & Remote Dispatcher.
 */

(function () {
  'use strict';

  // State Variables
  let peer = null;
  let activeConn = null;
  let roomCode = '';
  let focusedIndex = 0;
  let isGameActive = false;
  let isConsoleUnlocked = false;

  // DOM Elements
  const pairingScreen = document.getElementById('pairing-screen');
  const bootOverlay = document.getElementById('boot-overlay');
  const bootStatusText = document.getElementById('boot-status-text');
  const ps5Dashboard = document.getElementById('ps5-dashboard');

  const roomCodeDisplay = document.getElementById('room-code-display');
  const qrBox = document.getElementById('qrcode');

  const heroBackdrop = document.getElementById('hero-backdrop');
  const heroCategory = document.getElementById('hero-category');
  const heroTitle = document.getElementById('hero-title');
  const heroDesc = document.getElementById('hero-desc');

  const psCarousel = document.getElementById('ps-carousel');
  const psTiles = Array.from(document.querySelectorAll('.ps-tile'));

  const viewportOverlay = document.getElementById('viewport-overlay');
  const viewportTitle = document.getElementById('viewport-title');
  const gameIframe = document.getElementById('game-iframe');
  const exitGameBtn = document.getElementById('exit-game-btn');
  const liveClock = document.getElementById('live-clock');

  // Live Clock Updater
  function updateLiveClock() {
    if (!liveClock) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    liveClock.textContent = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  }

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

    // Build Controller URL for QR Code (bulletproof for Vercel cleanUrls & localhost)
    const loc = window.location;
    const basePath = loc.pathname.substring(0, loc.pathname.lastIndexOf('/') + 1);
    const controllerUrl = `${loc.origin}${basePath}controller.html?room=${roomCode}`;

    // Render QR Code
    if (qrBox && typeof QRCode !== 'undefined') {
      qrBox.innerHTML = '';
      new QRCode(qrBox, {
        text: controllerUrl,
        width: 188,
        height: 188,
        colorDark: '#070314',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    }

    // Connect to PeerJS Server
    peer = new Peer(peerId);

    peer.on('open', (id) => {
      console.log('Astral Console host active with Peer ID:', id);
    });

    peer.on('connection', (conn) => {
      activeConn = conn;
      console.log('Phone Controller connected!');

      conn.on('open', () => {
        triggerConsoleBootTransition();
      });

      conn.on('data', (data) => {
        handleIncomingInput(data);
      });

      conn.on('close', () => {
        console.log('Phone Controller disconnected');
      });
    });

    peer.on('error', (err) => {
      console.warn('PeerJS Error:', err);
    });
  }

  // Console Connecting Boot Transition Effect
  function triggerConsoleBootTransition() {
    if (isConsoleUnlocked) return;
    isConsoleUnlocked = true;

    // Show boot animation overlay
    if (bootOverlay) {
      bootOverlay.classList.add('active');
    }

    // Play boot SFX if available
    if (window.SFX && typeof window.SFX.levelUp === 'function') {
      try { window.SFX.levelUp(); } catch (e) {}
    }

    setTimeout(() => {
      if (bootStatusText) bootStatusText.textContent = '⚡ ASTRAL CONSOLE READY!';
    }, 600);

    setTimeout(() => {
      // Hide pairing screen
      if (pairingScreen) pairingScreen.classList.add('hidden');
      
      // Reveal PS5 Astral Dashboard
      if (ps5Dashboard) ps5Dashboard.classList.add('visible');
      
      // Fade out boot overlay
      if (bootOverlay) bootOverlay.classList.remove('active');

      updateFocusUI();
    }, 1300);
  }

  // Handle incoming remote gamepad inputs
  function handleIncomingInput(data) {
    if (!data || !data.type) return;

    if (data.type === 'keydown' || data.type === 'keyup') {
      const key = data.key;
      const code = data.code || key;

      if (!isGameActive) {
        // PS5 Dashboard Navigation Mode
        if (data.type === 'keydown') {
          handleDashboardNavigation(key);
        }
      } else {
        // Allow MENU / ESCAPE / B button to exit game back to Console Hub
        if (data.type === 'keydown' && (key === 'Escape' || key === 'b' || key === 'B')) {
          closeGameViewport();
          return;
        }

        // If Button A / Space / Enter is pressed, check if a restart or start overlay button can be clicked
        if (data.type === 'keydown' && (key === ' ' || key === 'Enter' || key === 'a' || key === 'A' || key === 'w')) {
          const handled = handleActionKeyInIframe();
          if (handled) return;
        }

        // Game Viewport Mode: Dispatch keyboard event into iframe
        dispatchKeyToIframe(data.type, key, code);
      }
    }
  }

  // Handle Button A / Action key clicks inside iframe (Restart / Play Again when Game Over)
  function handleActionKeyInIframe() {
    try {
      const iframeDoc = gameIframe.contentWindow ? gameIframe.contentWindow.document : null;
      if (!iframeDoc) return false;

      // Only handle action keys if a Game Over or Victory overlay is currently VISIBLE
      const activeOverlay = iframeDoc.querySelector('#gameover-overlay:not(.hidden), #victory-overlay:not(.hidden), #level-overlay:not(.hidden)');
      
      if (activeOverlay) {
        const actionBtn = activeOverlay.querySelector('#retry-btn, #restart-btn, #play-again-btn, #rematch-btn, #next-btn, .btn-primary');
        if (actionBtn) {
          actionBtn.click();
          activeOverlay.classList.add('hidden');
          activeOverlay.style.display = 'none';
          return true;
        }
      }
    } catch (err) {
      console.warn('Action key iframe handling warning:', err);
    }
    return false;
  }

  // PS5 Dashboard Carousel Navigation
  function handleDashboardNavigation(key) {
    if (psTiles.length === 0) return;

    let prevIndex = focusedIndex;

    if (key === 'ArrowRight' || key === 'd' || key === 'D') {
      focusedIndex = (focusedIndex + 1) % psTiles.length;
    } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
      focusedIndex = (focusedIndex - 1 + psTiles.length) % psTiles.length;
    } else if (key === ' ' || key === 'Enter' || key === 'w' || key === 'W') {
      // Launch selected game
      launchSelectedGame(psTiles[focusedIndex]);
      return;
    }

    if (prevIndex !== focusedIndex) {
      updateFocusUI();
    }
  }

  function updateFocusUI() {
    psTiles.forEach((tile, idx) => {
      if (idx === focusedIndex) {
        tile.classList.add('focused');
        tile.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        // Update Dynamic Hero Banner Content
        const title = tile.getAttribute('data-title') || 'Space Mission';
        const cat = tile.getAttribute('data-cat') || 'SINGLEPLAYER MISSION';
        const desc = tile.getAttribute('data-desc') || 'Retro space arcade mission.';
        const bg = tile.getAttribute('data-bg') || '';

        if (heroTitle) heroTitle.textContent = title;
        if (heroCategory) heroCategory.textContent = cat;
        if (heroDesc) heroDesc.textContent = desc;

        // Dynamically shift hero backdrop atmosphere
        if (heroBackdrop && bg) {
          heroBackdrop.style.background = bg;
        }
      } else {
        tile.classList.remove('focused');
      }
    });
  }

  // Launch Game Viewport
  function launchSelectedGame(tile) {
    if (!tile) return;
    const rawUrl = tile.getAttribute('data-url');
    const title = tile.getAttribute('data-title') || 'Space Mission';

    if (!rawUrl) return;

    isGameActive = true;
    viewportTitle.textContent = title;
    
    // Append console=1 & autostart=1 to bypass start screen & hide UFO
    const separator = rawUrl.includes('?') ? '&' : '?';
    const targetUrl = `${rawUrl}${separator}console=1&autostart=1`;
    gameIframe.src = targetUrl;
    viewportOverlay.classList.remove('hidden');

    // Auto-trigger start button inside iframe to immediately start gameplay
    gameIframe.onload = () => {
      try {
        if (gameIframe.contentWindow) {
          gameIframe.contentWindow.focus();
        }

        const autoTrigger = () => {
          const iframeDoc = gameIframe.contentWindow ? gameIframe.contentWindow.document : null;
          if (!iframeDoc) return;

          const startBtn = iframeDoc.querySelector('#start-btn, #begin-btn, #start-mission, [data-start], .btn-primary');
          const startOverlay = iframeDoc.querySelector('#start-overlay, .start-overlay');
          
          if (startBtn) {
            startBtn.click();
          }
          if (startOverlay) {
            startOverlay.classList.add('hidden');
            startOverlay.style.display = 'none';
          }
        };

        for (let delay of [50, 150, 300, 500, 800, 1200, 1800, 2500]) {
          setTimeout(autoTrigger, delay);
        }
      } catch (err) {
        console.warn('Iframe auto-start trigger error:', err);
      }
    };

    // Inform Phone Controller of Active Game Skin
    if (activeConn && activeConn.open) {
      activeConn.send({ type: 'set_layout', gameId: tile.getAttribute('data-game') });
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
      if (gameIframe && gameIframe.contentWindow && gameIframe.contentWindow.document) {
        const event = new KeyboardEvent(type, {
          key: key,
          code: code,
          bubbles: true,
          cancelable: true
        });
        gameIframe.contentWindow.document.dispatchEvent(event);
      }
    } catch (err) {
      console.warn('Iframe event dispatch warning:', err);
    }
  }

  // Bind Desktop Tile Clicks & Keyboard Fallback
  psTiles.forEach((tile, index) => {
    tile.addEventListener('click', () => {
      focusedIndex = index;
      updateFocusUI();
      launchSelectedGame(tile);
    });
  });

  if (exitGameBtn) {
    exitGameBtn.addEventListener('click', closeGameViewport);
  }

  // Allow keyboard arrows testing on desktop
  document.addEventListener('keydown', (e) => {
    if (!isConsoleUnlocked && (e.key === 'c' || e.key === 'C')) {
      // Secret key 'c' to unlock console on desktop testing
      triggerConsoleBootTransition();
    } else if (isConsoleUnlocked && !isGameActive) {
      if (['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D', ' ', 'Enter'].includes(e.key)) {
        handleDashboardNavigation(e.key);
      }
    }
  });

  // Initialize on load
  document.addEventListener('DOMContentLoaded', () => {
    initHostPeer();
    updateLiveClock();
    setInterval(updateLiveClock, 1000);
  });

})();

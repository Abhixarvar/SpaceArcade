/**
 * Space Arcade — Mobile Smartphone Gamepad Engine
 * Low-Latency WebRTC Data Connection to Desktop Console,
 * Haptic Vibration Feedback & Touch Event Dispatcher.
 */

(function () {
  'use strict';

  let peer = null;
  let conn = null;
  const pairOverlay = document.getElementById('pair-overlay');
  const roomInput = document.getElementById('room-input');
  const connectBtn = document.getElementById('connect-btn');
  const connBadge = document.getElementById('conn-badge');

  // Parse Room Parameter from URL
  function getRoomFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('room');
  }

  // Connect to Desktop Host
  function connectToConsole(roomCode) {
    if (!roomCode) return;
    
    // Normalize room code format (e.g. SA-8942 or 8942)
    let formattedCode = roomCode.toUpperCase().trim();
    if (!formattedCode.startsWith('SA-')) {
      formattedCode = 'SA-' + formattedCode;
    }

    const hostPeerId = 'space-console-' + formattedCode;

    if (connBadge) {
      connBadge.textContent = 'PAIRING...';
    }

    // Initialize Mobile Peer
    peer = new Peer();

    peer.on('open', (id) => {
      console.log('Mobile controller active with ID:', id);

      conn = peer.connect(hostPeerId, { reliable: true });

      conn.on('open', () => {
        console.log('Successfully connected to Desktop Console!');
        if (connBadge) {
          connBadge.classList.add('connected');
          connBadge.textContent = 'CONNECTED 🟢';
        }
        if (pairOverlay) {
          pairOverlay.classList.add('hidden');
        }
        
        // Haptic feedback on connection success
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
      });

      conn.on('data', (data) => {
        if (data && data.type === 'set_layout') {
          console.log('Console layout sync:', data.gameId);
        }
      });

      conn.on('close', () => {
        if (connBadge) {
          connBadge.classList.remove('connected');
          connBadge.textContent = 'DISCONNECTED 🔴';
        }
      });

      conn.on('error', (err) => {
        console.warn('Connection error:', err);
        if (connBadge) {
          connBadge.textContent = 'ERROR ⚠️';
        }
      });
    });

    peer.on('error', (err) => {
      console.warn('Mobile Peer error:', err);
      if (connBadge) {
        connBadge.textContent = 'FAILED TO PAIR';
      }
    });
  }

  // Bind Touch Events on Gamepad Buttons
  function initTouchControls() {
    const buttons = document.querySelectorAll('[data-key]');

    buttons.forEach((btn) => {
      const key = btn.getAttribute('data-key');

      const handlePress = (e) => {
        if (e.cancelable) e.preventDefault();
        btn.classList.add('active');

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(12);

        // Send KeyDown packet
        if (conn && conn.open) {
          conn.send({
            type: 'keydown',
            key: key,
            code: key === ' ' ? 'Space' : key
          });
        }
      };

      const handleRelease = (e) => {
        if (e.cancelable) e.preventDefault();
        btn.classList.remove('active');

        // Send KeyUp packet
        if (conn && conn.open) {
          conn.send({
            type: 'keyup',
            key: key,
            code: key === ' ' ? 'Space' : key
          });
        }
      };

      // Touch Events
      btn.addEventListener('touchstart', handlePress, { passive: false });
      btn.addEventListener('touchend', handleRelease, { passive: false });
      btn.addEventListener('touchcancel', handleRelease, { passive: false });

      // Mouse Events for Desktop testing
      btn.addEventListener('mousedown', handlePress);
      btn.addEventListener('mouseup', handleRelease);
      btn.addEventListener('mouseleave', handleRelease);
    });
  }

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initTouchControls();

    const roomParam = getRoomFromUrl();
    if (roomParam) {
      connectToConsole(roomParam);
    } else {
      if (pairOverlay) pairOverlay.classList.remove('hidden');
    }

    if (connectBtn && roomInput) {
      connectBtn.addEventListener('click', () => {
        const code = roomInput.value.trim();
        if (code) {
          connectToConsole(code);
        }
      });
    }
  });

})();

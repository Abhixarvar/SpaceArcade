/**
 * Space Arcade — Universal Game Fullscreen Engine
 * Provides seamless, high-performance fullscreen toggling for all retro games,
 * complete with floating arcade HUD controls, UFO menu integration, keyboard shortcuts (F / Shift+F / Alt+Enter),
 * and automatic viewport optimization across devices.
 */

(function () {
  'use strict';

  if (window.ArcadeFullscreen) return;

  // Check if browser is currently in fullscreen
  function isFullscreen() {
    const doc = document;
    return !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement ||
      doc.body.classList.contains('arcade-fullscreen')
    );
  }

  // Toggle fullscreen mode
  function toggleFullscreen(targetElement) {
    const doc = document;
    const isFs = isFullscreen();

    if (!isFs) {
      const el = targetElement || doc.documentElement;
      const request =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;

      if (request) {
        request.call(el).catch(err => {
          console.warn('Native requestFullscreen denied or failed, activating CSS fullscreen fallback:', err);
          setFullscreenUIState(true);
          // If running inside an iframe, request parent to toggle fullscreen
          if (window.parent && window.parent !== window) {
            try {
              window.parent.postMessage({ type: 'TOGGLE_FULLSCREEN', requested: true }, '*');
            } catch (e) {}
          }
        });
      } else {
        // Fallback for browsers without standard Fullscreen API
        setFullscreenUIState(true);
        if (window.parent && window.parent !== window) {
          try {
            window.parent.postMessage({ type: 'TOGGLE_FULLSCREEN', requested: true }, '*');
          } catch (e) {}
        }
      }
    } else {
      const exit =
        doc.exitFullscreen ||
        doc.webkitExitFullscreen ||
        doc.mozCancelFullScreen ||
        doc.msExitFullscreen;

      if (exit && (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement)) {
        exit.call(doc).catch(err => {
          console.warn('Exit fullscreen failed, removing CSS fallback:', err);
          setFullscreenUIState(false);
        });
      } else {
        setFullscreenUIState(false);
      }

      if (window.parent && window.parent !== window) {
        try {
          window.parent.postMessage({ type: 'TOGGLE_FULLSCREEN', requested: false }, '*');
        } catch (e) {}
      }
    }
  }

  // Synchronize UI elements, classes, and sound effects
  function setFullscreenUIState(active) {
    const doc = document;
    doc.documentElement.classList.toggle('arcade-fullscreen', active);
    doc.documentElement.classList.toggle('is-fullscreen', active);
    doc.body.classList.toggle('arcade-fullscreen', active);
    doc.body.classList.toggle('is-fullscreen', active);

    const btn = doc.getElementById('arcade-fullscreen-btn');
    if (btn) {
      btn.classList.toggle('active-fs', active);
      const enterIcon = btn.querySelector('.fs-icon-enter');
      const exitIcon = btn.querySelector('.fs-icon-exit');
      const label = btn.querySelector('.fs-btn-label');
      const badge = btn.querySelector('.fs-btn-badge');

      if (enterIcon) enterIcon.style.display = active ? 'none' : 'inline-flex';
      if (exitIcon) exitIcon.style.display = active ? 'inline-flex' : 'none';
      if (label) label.textContent = active ? 'EXIT FS' : 'FULLSCREEN';
      if (badge) badge.textContent = active ? 'ESC' : 'F';
      btn.setAttribute('data-tip', active ? 'Exit Fullscreen (Esc or F)' : 'Toggle Fullscreen (F)');
      btn.setAttribute('aria-label', active ? 'Exit Fullscreen' : 'Enter Fullscreen');
    }

    // Update Console mode button if present
    const consoleBtn = doc.getElementById('console-fs-btn');
    if (consoleBtn) {
      consoleBtn.innerHTML = active ? '🗗 Windowed' : '⛶ Fullscreen';
      consoleBtn.setAttribute('title', active ? 'Exit Fullscreen (Esc or F)' : 'Toggle Fullscreen (F)');
    }

    // Update UFO saucer dropdown menu text if present
    const ufoTitle = doc.getElementById('ufo-fs-title');
    const ufoDesc = doc.getElementById('ufo-fs-desc');
    if (ufoTitle) ufoTitle.textContent = active ? 'Exit Fullscreen' : 'Fullscreen';
    if (ufoDesc) ufoDesc.textContent = active ? 'Return to window [Esc / F]' : 'Toggle full screen [F]';

    // Play retro arcade audio
    if (window.SFX) {
      try {
        if (active && typeof window.SFX.powerup === 'function') {
          window.SFX.powerup();
        } else if (!active && typeof window.SFX.click === 'function') {
          window.SFX.click();
        }
      } catch (e) {}
    }

    // Dispatch custom event for games that want to handle resizing
    window.dispatchEvent(new CustomEvent('arcadeFullscreenChange', { detail: { isFullscreen: active } }));
  }

  // Inject styles for the floating fullscreen button and fallback styles
  function injectFullscreenStyles() {
    if (document.getElementById('arcade-fullscreen-style')) return;
    const style = document.createElement('style');
    style.id = 'arcade-fullscreen-style';
    style.textContent = `
      /* Floating Arcade Fullscreen Trigger Button */
      #arcade-fullscreen-btn {
        position: fixed;
        top: 16px;
        right: 16px;
        z-index: 999999;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(11, 6, 32, 0.88);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1.5px solid rgba(0, 240, 255, 0.5);
        border-radius: 20px;
        padding: 6px 14px;
        color: #00f0ff;
        font-family: var(--font-funky, 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 1px;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6), 0 0 12px rgba(0, 240, 255, 0.25);
        transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        user-select: none;
        outline: none;
        pointer-events: auto;
      }

      #arcade-fullscreen-btn:hover {
        border-color: #00f0ff;
        background: rgba(0, 240, 255, 0.18);
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.8), 0 0 22px rgba(0, 240, 255, 0.6);
        transform: translateY(-2px) scale(1.05);
        color: #ffffff;
      }

      #arcade-fullscreen-btn:active {
        transform: translateY(1px) scale(0.98);
      }

      #arcade-fullscreen-btn.active-fs {
        border-color: rgba(255, 0, 127, 0.75);
        color: #ff007f;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.6), 0 0 16px rgba(255, 0, 127, 0.45);
      }

      #arcade-fullscreen-btn.active-fs:hover {
        border-color: #ff007f;
        background: rgba(255, 0, 127, 0.18);
        box-shadow: 0 6px 22px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 0, 127, 0.7);
        color: #ffffff;
      }

      .fs-icon-enter,
      .fs-icon-exit {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease;
      }

      #arcade-fullscreen-btn:hover .fs-icon-enter,
      #arcade-fullscreen-btn:hover .fs-icon-exit {
        transform: scale(1.15);
      }

      .fs-btn-badge {
        background: rgba(0, 240, 255, 0.15);
        border: 1px solid rgba(0, 240, 255, 0.4);
        border-radius: 5px;
        padding: 1px 6px;
        font-size: 0.62rem;
        font-family: monospace, sans-serif;
        color: #00f0ff;
        transition: all 0.2s ease;
      }

      #arcade-fullscreen-btn.active-fs .fs-btn-badge {
        background: rgba(255, 0, 127, 0.15);
        border-color: rgba(255, 0, 127, 0.5);
        color: #ff007f;
      }

      #arcade-fullscreen-btn:hover .fs-btn-badge {
        border-color: #ffffff;
        color: #ffffff;
        background: rgba(255, 255, 255, 0.2);
      }

      /* Compact mode for small mobile screens */
      @media (max-width: 640px) {
        #arcade-fullscreen-btn {
          width: 38px;
          height: 38px;
          padding: 0;
          justify-content: center;
          border-radius: 50%;
        }
        #arcade-fullscreen-btn .fs-btn-label,
        #arcade-fullscreen-btn .fs-btn-badge {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Create & mount the floating button
  function mountFullscreenButton() {
    if (document.getElementById('arcade-fullscreen-btn')) return;

    // Check if we are on a game page
    const path = window.location.pathname.toLowerCase();
    const isGamePage =
      path.includes('/games/') ||
      !!document.querySelector('.game-page, canvas#game-canvas, #starchess-canvas, #wordle-grid, .starchess-container');

    if (!isGamePage) return;

    injectFullscreenStyles();

    const btn = document.createElement('button');
    btn.id = 'arcade-fullscreen-btn';
    btn.className = 'arcade-fullscreen-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Toggle Fullscreen');
    btn.setAttribute('data-tip', 'Toggle Fullscreen (F)');

    btn.innerHTML = `
      <span class="fs-icon-enter">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>
      </span>
      <span class="fs-icon-exit" style="display:none;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M14 4v6m0 0h6m-6 0L21 3M4 10h6m0 0V4m0 6L3 3"/>
        </svg>
      </span>
      <span class="fs-btn-label">FULLSCREEN</span>
      <span class="fs-btn-badge">F</span>
    `;

    // Click handler
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFullscreen();
    });

    // Hover audio
    btn.addEventListener('mouseenter', () => {
      if (window.SFX && typeof window.SFX.pop === 'function') {
        try { window.SFX.pop(); } catch (err) {}
      }
    });

    document.body.appendChild(btn);

    // Sync current state
    if (isFullscreen()) {
      setFullscreenUIState(true);
    }
  }

  // Setup keyboard shortcuts
  function initKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // Don't capture when Ctrl or Meta (Command) is pressed (allow browser Ctrl+F / Cmd+F)
      if (e.ctrlKey || e.metaKey) return;

      const target = e.target;
      const isInput = target && (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      );

      // Universal Shortcuts: Alt + Enter OR Shift + F
      if ((e.altKey && e.key === 'Enter') || (e.shiftKey && (e.key === 'F' || e.key === 'f'))) {
        if (!isInput) {
          e.preventDefault();
          toggleFullscreen();
          return;
        }
      }

      // Standalone F key (press F to toggle fullscreen)
      if (e.key === 'f' || e.key === 'F') {
        if (isInput) return;

        // Wordle uses letters A-Z for typing word guesses; don't trigger fullscreen on F during Wordle
        const isWordle =
          window.location.pathname.toLowerCase().includes('wordle') ||
          !!document.getElementById('wordle-grid');
        if (isWordle) return;

        e.preventDefault();
        toggleFullscreen();
      }
    });
  }

  // Setup browser native fullscreen change listeners
  function initNativeChangeListeners() {
    const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'];
    events.forEach(evt => {
      document.addEventListener(evt, () => {
        const isFs = !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement ||
          document.msFullscreenElement
        );
        setFullscreenUIState(isFs);
      });
    });

    // Cross-window messaging (for iframes in party lounge or console mode)
    window.addEventListener('message', (e) => {
      if (e.data && e.data.type === 'TOGGLE_FULLSCREEN') {
        toggleFullscreen();
      }
    });
  }

  // Initialize Fullscreen Manager
  function initFullscreenManager() {
    mountFullscreenButton();
    initKeyboardListeners();
    initNativeChangeListeners();
  }

  // Expose global API
  window.ArcadeFullscreen = {
    toggle: toggleFullscreen,
    isFullscreen: isFullscreen,
    setFullscreenUIState: setFullscreenUIState,
    init: initFullscreenManager
  };

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFullscreenManager);
  } else {
    initFullscreenManager();
  }
})();

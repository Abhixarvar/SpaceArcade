/**
 * Space Arcade - UFO Global Navigation Menu
 * Injects a floating UFO navigation menu to the top left of every page.
 */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Create the container
    const container = document.createElement('div');
    container.id = 'ufo-nav-container';

    // Figure out correct path prefix based on current location
    // Since some files are in /games/ and some are in /, we need to resolve relative paths
    const isGamePage = window.location.pathname.includes('/games/');
    const prefix = isGamePage ? '../' : '';

    container.innerHTML = `
      <div class="ufo-btn" title="Navigation Menu">
        <div class="ufo-dome"></div>
        <div class="ufo-body">
          <div class="ufo-light"></div>
          <div class="ufo-light"></div>
          <div class="ufo-light"></div>
          <div class="ufo-light"></div>
        </div>
        <div class="ufo-beam"></div>
      </div>

      <div class="ufo-menu">
        <a href="${prefix}index.html" class="ufo-menu-item">
          <span class="icon">🏠</span> Home
        </a>
        <a href="${prefix}singleplayer.html" class="ufo-menu-item">
          <span class="icon">🕹️</span> Singleplayer
        </a>
        <a href="${prefix}party.html" class="ufo-menu-item">
          <span class="icon">🍻</span> Party Lounge
        </a>
        <button class="ufo-menu-item ufo-mute-btn" id="ufo-mute-btn">
          <span class="icon" id="ufo-mute-icon">🔊</span> <span id="ufo-mute-text">Mute Sound</span>
        </button>
      </div>
    `;

    document.body.appendChild(container);

    const ufoBtn = container.querySelector('.ufo-btn');
    const ufoMenu = container.querySelector('.ufo-menu');
    const muteBtn = container.querySelector('#ufo-mute-btn');
    const muteIcon = container.querySelector('#ufo-mute-icon');
    const muteText = container.querySelector('#ufo-mute-text');

    // 2. Toggle Menu
    ufoBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      container.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (container.classList.contains('open') && !container.contains(e.target)) {
        container.classList.remove('open');
      }
    });

    // 3. Mute Logic
    let isMuted = false;

    // Helper to update mute UI
    const updateMuteUI = (muted) => {
      isMuted = muted;
      muteIcon.textContent = isMuted ? '🔇' : '🔊';
      muteText.textContent = isMuted ? 'Unmute Sound' : 'Mute Sound';
    };

    // Check initial volume state
    if (window.SFX && window.SFX.getVolume() === 0) {
      updateMuteUI(true);
    }

    muteBtn.addEventListener('click', () => {
      // If there is a lightsaber volume control on the page, use it to stay in sync!
      const hiltBtn = document.querySelector('.hilt-btn');
      if (hiltBtn) {
        hiltBtn.click();
        
        // Wait a tick to read the new volume from SFX
        setTimeout(() => {
          if (window.SFX) {
            updateMuteUI(window.SFX.getVolume() === 0);
          }
        }, 10);
      } else {
        // Fallback if no lightsaber (e.g. index.html)
        if (window.SFX) {
          if (isMuted) {
            // Unmute to 50%
            window.SFX.setVolume(0.5);
            updateMuteUI(false);
          } else {
            // Mute
            window.SFX.setVolume(0);
            updateMuteUI(true);
          }
        }
      }
    });
  });

})();

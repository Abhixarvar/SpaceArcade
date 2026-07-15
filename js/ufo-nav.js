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
        <div class="ufo-menu-item ufo-volume-container" title="Adjust Volume">
          <span class="icon" id="ufo-mute-icon" style="cursor: pointer;">🔊</span>
          <input type="range" id="ufo-volume-slider" min="0" max="1" step="0.01" value="0.5">
        </div>
      </div>
    `;

    document.body.appendChild(container);

    const ufoBtn = container.querySelector('.ufo-btn');
    const ufoMenu = container.querySelector('.ufo-menu');
    const volumeSlider = container.querySelector('#ufo-volume-slider');
    const muteIcon = container.querySelector('#ufo-mute-icon');

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

    // Prevent closing menu when interacting with the slider
    volumeSlider.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // 3. Volume Logic
    const updateVolumeUI = (vol) => {
      volumeSlider.value = vol;
      if (vol == 0) {
        muteIcon.textContent = '🔇';
      } else if (vol < 0.5) {
        muteIcon.textContent = '🔉';
      } else {
        muteIcon.textContent = '🔊';
      }
    };

    // Check initial volume state
    if (window.SFX) {
      updateVolumeUI(window.SFX.getVolume());
    }

    volumeSlider.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      if (window.SFX) {
        window.SFX.setVolume(vol);
      }
      updateVolumeUI(vol);
    });

    let lastVol = 0.5;
    muteIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      let currentVol = parseFloat(volumeSlider.value);
      if (currentVol > 0) {
        lastVol = currentVol;
        updateVolumeUI(0);
        if (window.SFX) window.SFX.setVolume(0);
      } else {
        updateVolumeUI(lastVol || 0.5);
        if (window.SFX) window.SFX.setVolume(lastVol || 0.5);
      }
    });

    // Start BGM on first interaction
    const startBGM = () => {
      if (window.SFX && volumeSlider.value > 0) {
        window.SFX.startBGM();
      }
      document.removeEventListener('click', startBGM);
      document.removeEventListener('keydown', startBGM);
    };
    document.addEventListener('click', startBGM);
    document.addEventListener('keydown', startBGM);

  });

})();

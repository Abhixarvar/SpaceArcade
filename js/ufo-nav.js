/**
 * Space Arcade - UFO Global Navigation Menu
 * Injects a floating UFO navigation menu to the top left of every page.
 */

(function() {
  'use strict';

  function initUFONav() {
    // 1. Create the container
    const container = document.createElement('div');
    container.id = 'ufo-nav-container';

    // Figure out correct path prefix based on current location
    const isGamePage = window.location.pathname.includes('/games/');
    const prefix = isGamePage ? '../' : '';
    
    // Check if current page is the Home Page (index.html or root)
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === '/' || 
                       window.location.pathname.endsWith('/');

    const menuHTML = isHomePage 
      ? `
        <a href="${prefix}party.html" class="ufo-menu-item">
          <span class="icon">🍻</span> Party Lounge
        </a>
        <div class="ufo-menu-item ufo-volume-container" title="Adjust Volume">
          <span class="icon" id="ufo-mute-icon" style="cursor: pointer;">🔊</span>
          <input type="range" id="ufo-volume-slider" min="0" max="1" step="0.01" value="0.5">
        </div>
      `
      : `
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
      `;

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
        ${menuHTML}
      </div>
    `;

    document.body.appendChild(container);

    // DIAGNOSTIC: Force inline styles so UFO is always visible regardless of CSS loading
    container.style.cssText = 'position: fixed !important; top: 20px !important; left: 20px !important; z-index: 9000 !important; display: flex !important; flex-direction: column !important; align-items: flex-start !important;';
    
    // DIAGNOSTIC: Style the UFO body so it's visible even without external CSS
    const ufoBtnInner = container.querySelector('.ufo-btn');
    if (ufoBtnInner) {
      ufoBtnInner.style.cssText = 'position: relative; width: 80px; height: 60px; cursor: pointer;';
    }
    const ufoBodyInner = container.querySelector('.ufo-body');
    if (ufoBodyInner) {
      ufoBodyInner.style.cssText = 'position: absolute; top: 25px; left: 0; width: 80px; height: 20px; background: linear-gradient(to bottom, #bdc3c7, #7f8c8d); border-radius: 40px; display: flex; justify-content: space-evenly; align-items: center; box-shadow: 0 5px 15px rgba(0,0,0,0.5);';
    }
    const ufoDomeInner = container.querySelector('.ufo-dome');
    if (ufoDomeInner) {
      ufoDomeInner.style.cssText = 'position: absolute; top: 5px; left: 20px; width: 40px; height: 25px; background: rgba(0,255,255,0.4); border-radius: 40px 40px 0 0; box-shadow: 0 0 15px rgba(0,255,255,0.5); border: 1px solid rgba(0,255,255,0.8);';
    }

    const ufoBtn = container.querySelector('.ufo-btn');
    const ufoMenu = container.querySelector('.ufo-menu');
    const volumeSlider = container.querySelector('#ufo-volume-slider');
    const muteIcon = container.querySelector('#ufo-mute-icon');

    // Diagnostic logging
    console.log('[UFO-NAV] Container appended:', !!document.getElementById('ufo-nav-container'));
    console.log('[UFO-NAV] Container rect:', JSON.stringify(container.getBoundingClientRect()));
    console.log('[UFO-NAV] computed display:', window.getComputedStyle(container).display);
    console.log('[UFO-NAV] computed visibility:', window.getComputedStyle(container).visibility);
    console.log('[UFO-NAV] computed opacity:', window.getComputedStyle(container).opacity);
    console.log('[UFO-NAV] computed z-index:', window.getComputedStyle(container).zIndex);
    console.log('[UFO-NAV] isHomePage:', isHomePage, '| pathname:', window.location.pathname);

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

  } // end initUFONav

  // If DOM is already ready (script is at the bottom of body), call immediately
  // Otherwise wait for the event
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUFONav);
  } else {
    initUFONav();
  }

})();

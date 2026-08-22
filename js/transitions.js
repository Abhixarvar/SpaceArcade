/**
 * Space Arcade — UFO Flying Page Transitions & Loading Screen
 * Features a retro-futuristic UFO saucer flying across the screen during page load & transitions.
 */

(function () {
  'use strict';

  // Helper to create & inject the UFO overlay DOM element if not already present
  function ensureUFOLoader() {
    let loader = document.getElementById('ufo-page-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'ufo-page-loader';
      loader.className = 'ufo-loader-overlay';
      loader.innerHTML = `
        <div class="ufo-space-bg">
          <div class="ufo-speed-lines"></div>
          <div class="ufo-stars-field"></div>
        </div>
        <div class="ufo-flight-track">
          <div class="ufo-ship-container">
            <div class="ufo-tractor-beam"></div>
            <div class="ufo-plasma-trail"></div>
            <svg class="ufo-svg-ship" viewBox="0 0 160 90" width="150" height="84">
              <defs>
                <linearGradient id="ufoDomeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#70ffff" stop-opacity="0.95" />
                  <stop offset="45%" stop-color="#00f0ff" stop-opacity="0.8" />
                  <stop offset="100%" stop-color="#0284c7" stop-opacity="0.65" />
                </linearGradient>
                <linearGradient id="ufoBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#e2e8f0" />
                  <stop offset="30%" stop-color="#64748b" />
                  <stop offset="70%" stop-color="#1e293b" />
                  <stop offset="100%" stop-color="#0f172a" />
                </linearGradient>
                <linearGradient id="ufoRimGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stop-color="#ff007f" />
                  <stop offset="25%" stop-color="#00f0ff" stop-opacity="0.9" />
                  <stop offset="50%" stop-color="#00ff88" />
                  <stop offset="75%" stop-color="#ffea00" stop-opacity="0.9" />
                  <stop offset="100%" stop-color="#ff007f" />
                </linearGradient>
              </defs>
              <!-- Glass Dome -->
              <path d="M 48 42 A 32 26 0 0 1 112 42 Z" fill="url(#ufoDomeGrad)" stroke="#00f0ff" stroke-width="1.5" />
              <!-- Alien Pilot -->
              <text x="80" y="37" font-size="19" text-anchor="middle" dominant-baseline="middle">👽</text>
              <!-- Saucer Main Disk -->
              <ellipse cx="80" cy="48" rx="72" ry="18" fill="url(#ufoBodyGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
              <!-- Neon Pulsing Rim -->
              <ellipse cx="80" cy="52" rx="70" ry="8" fill="none" stroke="url(#ufoRimGrad)" stroke-width="2.5" />
              <!-- Saucer LED Lights -->
              <circle class="ufo-led-dot led-1" cx="28" cy="53" r="3.5" fill="#ff007f" />
              <circle class="ufo-led-dot led-2" cx="50" cy="57" r="3.5" fill="#00f0ff" />
              <circle class="ufo-led-dot led-3" cx="80" cy="59" r="4" fill="#00ff88" />
              <circle class="ufo-led-dot led-4" cx="110" cy="57" r="3.5" fill="#ffea00" />
              <circle class="ufo-led-dot led-5" cx="132" cy="53" r="3.5" fill="#a855f7" />
              <!-- Bottom Emitter -->
              <polygon points="70,62 90,62 84,68 76,68" fill="#00f0ff" />
            </svg>
          </div>
        </div>
        <div class="ufo-status-box">
          <div class="ufo-status-badge">🛸 UFO TELEPORT</div>
          <div class="ufo-status-text" id="ufo-loader-text">WARPING TO MISSION...</div>
          <div class="ufo-progress-bar"><div class="ufo-progress-fill"></div></div>
        </div>
      `;
      document.body.appendChild(loader);
    }
    return loader;
  }

  // Global functions to show/hide the UFO loader screen
  window.showUFOLoader = function (statusText = 'WARPING TO MISSION...') {
    const loader = ensureUFOLoader();
    const textEl = document.getElementById('ufo-loader-text');
    if (textEl) textEl.textContent = statusText;
    loader.classList.add('active');
  };

  window.hideUFOLoader = function () {
    const loader = document.getElementById('ufo-page-loader');
    if (loader) {
      loader.classList.remove('active');
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    ensureUFOLoader();

    // 1. Identify the main content wrappers to animate
    const mainContent = document.querySelector('.page-content') 
      || document.querySelector('.game-page') 
      || document.querySelector('.discord-lounge') 
      || document.body;
      
    if (mainContent !== document.body) {
      mainContent.classList.add('page-transition-element');
    }

    // 2. Intercept internal link clicks for the UFO flight departure animation
    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href');

      // Skip external links, anchors, javascript:, etc.
      if (!href) return;
      if (href.startsWith('#')) return;
      if (href.startsWith('javascript:')) return;
      if (link.target === '_blank') return;
      if (link.hasAttribute('download')) return;

      // Skip if it's an external URL
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
      } catch {
        return;
      }

      // Prevent default navigation
      e.preventDefault();

      // Determine appropriate status text for the destination
      let statusText = 'WARPING TO MISSION...';
      if (href.includes('party.html')) statusText = 'ENTERING PARTY LOUNGE...';
      else if (href.includes('console.html')) statusText = 'BOOTING CONSOLE MODE...';
      else if (href.includes('offline.html')) statusText = 'LOADING LOCAL 2-PLAYER...';
      else if (href.includes('singleplayer.html')) statusText = 'LOADING SINGLEPLAYER...';
      else if (href.includes('games/')) statusText = 'LAUNCHING GAME MISSION...';

      // Trigger UFO Flying Loading Screen
      window.showUFOLoader(statusText);
      document.body.classList.add('page-departing');
      
      // Navigate after the UFO flies across (550ms)
      setTimeout(() => {
        window.location.href = href;
      }, 550);
    });

    // 3. Handle Arrival Animation (fly UFO brief burst & reveal)
    function handleArrival() {
      // Brief UFO entrance pass on initial load
      window.showUFOLoader('ENTERING SPACE ARCADE...');
      
      setTimeout(() => {
        window.hideUFOLoader();
        document.body.classList.remove('page-arriving');
        document.body.classList.remove('page-departing');
      }, 600);
    }

    // Also handle bfcache (Back-Forward Cache) hits for Safari/mobile
    window.addEventListener('pageshow', (e) => {
      window.hideUFOLoader();
      document.body.classList.remove('page-departing');
      document.body.classList.remove('page-arriving');
    });

    // Trigger arrival animation on initial load
    handleArrival();
  });

})();


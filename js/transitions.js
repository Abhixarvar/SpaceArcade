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
            <svg class="ufo-svg-ship" viewBox="0 0 160 90" width="120" height="68">
              <!-- Saucer Main Disk -->
              <ellipse cx="80" cy="48" rx="64" ry="16" fill="#16202c" stroke="#38bdf8" stroke-width="1.5" />
              <!-- Glass Dome -->
              <path d="M 52 44 A 28 22 0 0 1 108 44 Z" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5" />
              <!-- LED Indicators -->
              <circle cx="36" cy="50" r="3" fill="#38bdf8" />
              <circle cx="58" cy="54" r="3" fill="#38bdf8" />
              <circle cx="80" cy="56" r="3.5" fill="#34d399" />
              <circle cx="102" cy="54" r="3" fill="#38bdf8" />
              <circle cx="124" cy="50" r="3" fill="#38bdf8" />
            </svg>
          </div>
        </div>
        <div class="ufo-status-box">
          <div class="ufo-status-badge">SYS_DISPATCH</div>
          <div class="ufo-status-text" id="ufo-loader-text">INITIALIZING CORE...</div>
          <div class="ufo-progress-bar"><div class="ufo-progress-fill"></div></div>
        </div>
      `;
      document.body.appendChild(loader);
    }
    return loader;
  }

  // Global functions to show/hide the UFO loader screen
  window.showUFOLoader = function (statusText = 'INITIALIZING CORE...') {
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
      let statusText = 'INITIALIZING MODULE...';
      if (href.includes('party.html')) statusText = 'CONNECTING PARTY LOUNGE...';
      else if (href.includes('console.html')) statusText = 'INITIALIZING CONSOLE MODE...';
      else if (href.includes('offline.html')) statusText = 'INITIALIZING LOCAL 2-PLAYER...';
      else if (href.includes('singleplayer.html')) statusText = 'INITIALIZING SINGLEPLAYER...';
      else if (href.includes('games/')) statusText = 'INITIALIZING RETRO CORE...';

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


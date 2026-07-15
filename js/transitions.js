/**
 * Space Arcade — Page Transitions
 * Adds warp-speed overlay animation for regular links
 * and iOS-style app open animation for game cards.
 */

(function () {
  'use strict';

  // --- Create the warp transition overlay DOM ---
  const overlay = document.createElement('div');
  overlay.className = 'hyperspace-overlay';
  overlay.innerHTML = `
    <div class="warp-lines"></div>
    <div class="warp-flash"></div>
  `;
  document.body.appendChild(overlay);

  // Generate warp streaks
  const warpLines = overlay.querySelector('.warp-lines');
  const STREAK_COUNT = 60;
  for (let i = 0; i < STREAK_COUNT; i++) {
    const streak = document.createElement('div');
    streak.className = 'warp-streak';
    // Random angle from center, random delay
    const angle = Math.random() * 360;
    const delay = Math.random() * 0.3;
    const length = 40 + Math.random() * 60; // percent
    streak.style.setProperty('--angle', `${angle}deg`);
    streak.style.setProperty('--delay', `${delay}s`);
    streak.style.setProperty('--length', `${length}%`);
    streak.style.setProperty('--hue', `${170 + Math.random() * 40}`); // cyan-ish range
    warpLines.appendChild(streak);
  }

  // --- Create the app open transition overlay DOM ---
  const appOverlay = document.createElement('div');
  appOverlay.className = 'app-open-overlay';
  document.body.appendChild(appOverlay);

  // --- Intercept internal link clicks ---
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

    const isGameCard = link.closest('.game-card');

    if (isGameCard) {
      // Trigger app open transition
      const rect = isGameCard.getBoundingClientRect();
      
      // Set initial position and size for the overlay
      appOverlay.style.setProperty('--start-x', `${rect.left}px`);
      appOverlay.style.setProperty('--start-y', `${rect.top}px`);
      appOverlay.style.setProperty('--start-w', `${rect.width}px`);
      appOverlay.style.setProperty('--start-h', `${rect.height}px`);
      
      appOverlay.classList.add('active');
      sessionStorage.setItem('lastTransition', 'app-open');

      // Navigate after the animation plays
      setTimeout(() => {
        window.location.href = href;
      }, 450); // Slightly faster for app open feel
    } else {
      // Trigger the warp transition
      overlay.classList.add('active');
      sessionStorage.setItem('lastTransition', 'warp');

      // Navigate after the animation plays
      setTimeout(() => {
        window.location.href = href;
      }, 600);
    }
  });

  // --- On page load: play the arrival (reverse) animation ---
  function handleArrival() {
    const lastTransition = sessionStorage.getItem('lastTransition');
    
    if (lastTransition === 'app-open') {
      document.body.classList.add('app-open-arrival');
      setTimeout(() => {
        document.body.classList.remove('app-open-arrival');
      }, 600);
    } else {
      // Ensure overlay is active on back/forward cache hits
      overlay.classList.add('arriving');
      overlay.classList.remove('active');
      appOverlay.classList.remove('active');

      // Remove the arriving class after animation completes
      setTimeout(() => {
        overlay.classList.remove('arriving');
      }, 700);
    }
    
    // Clear transition type after handling
    sessionStorage.removeItem('lastTransition');
  }

  window.addEventListener('pageshow', handleArrival);

  // Also trigger arrival animation on initial load
  handleArrival();

})();

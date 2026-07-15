/**
 * Space Arcade — Page Transitions
 * Replaces old warp animations with a modern, clean iOS-style 
 * minimizing and expanding (zoom in/out) effect.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Identify the main content wrappers to animate
    const mainContent = document.querySelector('.page-content') 
      || document.querySelector('.game-page') 
      || document.querySelector('.discord-lounge') 
      || document.body;
      
    if (mainContent !== document.body) {
      mainContent.classList.add('page-transition-element');
    }

    // 2. Intercept internal link clicks for the departure animation
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

      // Trigger departing animation (shrink down and fade out)
      document.body.classList.add('page-departing');
      
      // Navigate after the animation plays (400ms to match CSS)
      setTimeout(() => {
        window.location.href = href;
      }, 400);
    });

    // 3. Handle Arrival Animation
    function handleArrival() {
      // If we just loaded the page, start it slightly zoomed in and faded out
      document.body.classList.add('page-arriving');
      
      // Force a reflow so the browser registers the initial arriving state
      void document.body.offsetWidth;
      
      // Remove the class to trigger the CSS transition to normal scale(1) and opacity(1)
      requestAnimationFrame(() => {
        document.body.classList.remove('page-arriving');
        document.body.classList.remove('page-departing');
      });
    }

    // Also handle bfcache (Back-Forward Cache) hits for Safari/mobile
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        document.body.classList.remove('page-departing');
        document.body.classList.remove('page-arriving');
      }
    });

    // Trigger arrival animation on initial load
    handleArrival();
  });

})();

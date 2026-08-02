/**
 * Space Arcade — Sleek Aesthetic Navigation Module
 * Injects a futuristic floating navigation button & glassmorphism dropdown menu.
 */

(function () {
  'use strict';

  function initArcadeNav() {
    if (document.getElementById('arcade-nav-container')) return;

    // Check if current page is in a subfolder (e.g., /games/)
    const path = window.location.pathname;
    const isGamePage = path.includes('/games/');
    const prefix = isGamePage ? '../' : '';

    // Normalize path to detect current page name
    let pageName = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    if (pageName === '') pageName = 'index.html';

    const links = [
      {
        href: `${prefix}index.html`,
        key: 'index.html',
        icon: '🏠',
        title: 'Home Hub',
        desc: 'Main arcade portal'
      },
      {
        href: `${prefix}singleplayer.html`,
        key: 'singleplayer.html',
        icon: '🕹️',
        title: 'Singleplayer',
        desc: 'Solo retro games'
      },
      {
        href: `${prefix}party.html`,
        key: 'party.html',
        icon: '🍻',
        title: 'Party Lounge',
        desc: 'Real-time multiplayer'
      },
      {
        href: `${prefix}offline.html`,
        key: 'offline.html',
        icon: '👫',
        title: 'Local Play',
        desc: 'Pass & play games'
      }
    ];

    // Create container
    const container = document.createElement('div');
    container.id = 'arcade-nav-container';
    container.className = 'arcade-nav-container';

    // Create toggle button
    const navBtn = document.createElement('button');
    navBtn.className = 'arcade-nav-btn';
    navBtn.setAttribute('aria-label', 'Toggle Navigation');
    navBtn.innerHTML = `
      <span class="arcade-nav-icon">🚀</span>
      <span>Menu</span>
      <span class="arcade-nav-arrow">▼</span>
    `;

    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'arcade-nav-dropdown';

    links.forEach(link => {
      const item = document.createElement('a');
      item.href = link.href;
      item.className = 'arcade-nav-item';
      
      if (pageName === link.key) {
        item.classList.add('active');
      }

      item.innerHTML = `
        <span class="arcade-nav-item-icon">${link.icon}</span>
        <div class="arcade-nav-item-content">
          <span class="arcade-nav-item-title">${link.title}</span>
          <span class="arcade-nav-item-desc">${link.desc}</span>
        </div>
      `;

      dropdown.appendChild(item);
    });

    container.appendChild(navBtn);
    container.appendChild(dropdown);
    document.body.appendChild(container);

    // Toggle menu state
    function toggleMenu(e) {
      if (e) e.stopPropagation();
      const isOpen = container.classList.toggle('open');
      navBtn.classList.toggle('open', isOpen);
    }

    function closeMenu() {
      container.classList.remove('open');
      navBtn.classList.remove('open');
    }

    navBtn.addEventListener('click', toggleMenu);

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (container.classList.contains('open') && !container.contains(e.target)) {
        closeMenu();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && container.classList.contains('open')) {
        closeMenu();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initArcadeNav);
  } else {
    initArcadeNav();
  }
})();

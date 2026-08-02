/**
 * Space Arcade — Sleek Aesthetic Navigation Module
 * Injects a futuristic floating navigation button & glassmorphism dropdown menu.
 */

(function () {
  'use strict';

  function injectNavStyles() {
    if (document.getElementById('arcade-nav-style')) return;
    const style = document.createElement('style');
    style.id = 'arcade-nav-style';
    style.textContent = `
      #arcade-nav-container {
        position: fixed !important;
        top: 16px !important;
        left: 16px !important;
        z-index: 999999 !important;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        pointer-events: auto !important;
        display: block !important;
      }

      .arcade-nav-btn {
        display: flex !important;
        align-items: center !important;
        gap: 8px !important;
        padding: 8px 16px !important;
        background: rgba(10, 5, 28, 0.88) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        border: 1px solid rgba(0, 240, 255, 0.4) !important;
        border-radius: 30px !important;
        color: #ffffff !important;
        font-size: 0.82rem !important;
        font-weight: 700 !important;
        letter-spacing: 1.2px !important;
        text-transform: uppercase !important;
        cursor: pointer !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 15px rgba(0, 240, 255, 0.2) !important;
        transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
        user-select: none !important;
        outline: none !important;
        line-height: 1 !important;
      }

      .arcade-nav-btn:hover {
        background: rgba(18, 10, 48, 0.96) !important;
        border-color: rgba(0, 240, 255, 0.9) !important;
        box-shadow: 0 6px 25px rgba(0, 0, 0, 0.6), 0 0 22px rgba(0, 240, 255, 0.4) !important;
        transform: translateY(-1px) scale(1.03) !important;
      }

      .arcade-nav-btn:active {
        transform: translateY(0) scale(0.98) !important;
      }

      .arcade-nav-btn.open {
        border-color: #ff007f !important;
        box-shadow: 0 0 22px rgba(255, 0, 127, 0.5) !important;
      }

      .arcade-nav-icon {
        font-size: 1.05rem !important;
        display: inline-block !important;
        transition: transform 0.3s ease !important;
      }

      .arcade-nav-btn:hover .arcade-nav-icon {
        transform: rotate(-12deg) scale(1.15) !important;
      }

      .arcade-nav-arrow {
        font-size: 0.65rem !important;
        opacity: 0.75 !important;
        transition: transform 0.3s ease !important;
        margin-left: 2px !important;
      }

      .arcade-nav-btn.open .arcade-nav-arrow {
        transform: rotate(180deg) !important;
      }

      /* Dropdown Menu */
      .arcade-nav-dropdown {
        position: absolute !important;
        top: calc(100% + 10px) !important;
        left: 0 !important;
        width: 240px !important;
        background: rgba(11, 6, 32, 0.94) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border: 1px solid rgba(0, 240, 255, 0.3) !important;
        border-radius: 16px !important;
        padding: 8px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 4px !important;
        box-shadow: 0 10px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(0, 240, 255, 0.2) !important;
        
        opacity: 0 !important;
        visibility: hidden !important;
        transform: translateY(-12px) scale(0.95) !important;
        transform-origin: top left !important;
        transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), visibility 0.25s !important;
        pointer-events: none !important;
      }

      #arcade-nav-container.open .arcade-nav-dropdown {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(0) scale(1) !important;
        pointer-events: auto !important;
      }

      /* Nav Item */
      .arcade-nav-item {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        padding: 10px 12px !important;
        border-radius: 12px !important;
        color: rgba(255, 255, 255, 0.88) !important;
        text-decoration: none !important;
        background: transparent !important;
        border: 1px solid transparent !important;
        transition: all 0.2s ease !important;
      }

      .arcade-nav-item:hover {
        background: rgba(0, 240, 255, 0.1) !important;
        border-color: rgba(0, 240, 255, 0.35) !important;
        color: #ffffff !important;
        transform: translateX(4px) !important;
      }

      .arcade-nav-item.active {
        background: rgba(255, 0, 127, 0.15) !important;
        border-color: rgba(255, 0, 127, 0.45) !important;
        color: #ffffff !important;
      }

      .arcade-nav-item-icon {
        font-size: 1.3rem !important;
        width: 32px !important;
        height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: rgba(255, 255, 255, 0.06) !important;
        border-radius: 8px !important;
        flex-shrink: 0 !important;
        transition: transform 0.2s ease !important;
      }

      .arcade-nav-item:hover .arcade-nav-item-icon {
        transform: scale(1.1) !important;
        background: rgba(0, 240, 255, 0.18) !important;
      }

      .arcade-nav-item-content {
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
        overflow: hidden !important;
      }

      .arcade-nav-item-title {
        font-size: 0.82rem !important;
        font-weight: 700 !important;
        letter-spacing: 0.5px !important;
        text-transform: uppercase !important;
        line-height: 1.2 !important;
      }

      .arcade-nav-item-desc {
        font-size: 0.68rem !important;
        color: rgba(255, 255, 255, 0.55) !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .arcade-nav-item:hover .arcade-nav-item-desc {
        color: rgba(0, 240, 255, 0.9) !important;
      }
    `;
    document.head.appendChild(style);
  }

  function initArcadeNav() {
    if (document.getElementById('arcade-nav-container')) return;

    injectNavStyles();

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

    // Apply bulletproof inline styles to container
    Object.assign(container.style, {
      position: 'fixed',
      top: '16px',
      left: '16px',
      zIndex: '999999',
      display: 'block',
      pointerEvents: 'auto'
    });

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

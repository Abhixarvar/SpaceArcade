/**
 * Space Arcade — UFO Saucer Aesthetic Navigation Module
 * Injects a floating retro UFO spaceship button & glassmorphism dropdown menu.
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
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
      }

      /* UFO Saucer Trigger Button */
      .ufo-trigger {
        position: relative !important;
        width: 84px !important;
        height: 68px !important;
        cursor: pointer !important;
        user-select: none !important;
        outline: none !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: flex-start !important;
        animation: ufoHoverFloat 3.5s ease-in-out infinite !important;
        transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      }

      @keyframes ufoHoverFloat {
        0%, 100% { transform: translateY(0) rotate(-1.5deg); }
        50% { transform: translateY(-7px) rotate(1.5deg); }
      }

      .ufo-trigger:hover {
        transform: scale(1.08) translateY(-2px) !important;
      }

      /* Translucent Glass Dome */
      .ufo-dome {
        width: 38px !important;
        height: 22px !important;
        background: rgba(0, 240, 255, 0.45) !important;
        border-radius: 38px 38px 0 0 !important;
        border: 1.5px solid rgba(0, 240, 255, 0.9) !important;
        border-bottom: none !important;
        box-shadow: inset 0 4px 8px rgba(255, 255, 255, 0.6), 0 0 14px rgba(0, 240, 255, 0.7) !important;
        position: relative !important;
        z-index: 2 !important;
      }

      /* Metallic Saucer Body */
      .ufo-body {
        width: 80px !important;
        height: 20px !important;
        background: linear-gradient(180deg, #e2e8f0 0%, #64748b 100%) !important;
        border-radius: 40px !important;
        border: 1px solid rgba(255, 255, 255, 0.7) !important;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.8), 0 0 12px rgba(0, 240, 255, 0.3) !important;
        display: flex !important;
        justify-content: space-evenly !important;
        align-items: center !important;
        position: relative !important;
        z-index: 3 !important;
        margin-top: -2px !important;
      }

      /* LED Lights */
      .ufo-light {
        width: 7px !important;
        height: 7px !important;
        border-radius: 50% !important;
        background: #ff0055 !important;
        box-shadow: 0 0 8px #ff0055 !important;
        animation: ufoLightPulse 1.2s infinite alternate !important;
      }
      .ufo-light:nth-child(2) { background: #00f0ff !important; box-shadow: 0 0 8px #00f0ff !important; animation-delay: 0.3s !important; }
      .ufo-light:nth-child(3) { background: #ffea00 !important; box-shadow: 0 0 8px #ffea00 !important; animation-delay: 0.6s !important; }
      .ufo-light:nth-child(4) { background: #00ff88 !important; box-shadow: 0 0 8px #00ff88 !important; animation-delay: 0.9s !important; }

      @keyframes ufoLightPulse {
        from { opacity: 0.4; transform: scale(0.8); }
        to { opacity: 1; transform: scale(1.1); }
      }

      /* Light Beam Rays emanating under UFO */
      .ufo-beam {
        position: absolute !important;
        top: 36px !important;
        width: 56px !important;
        height: 22px !important;
        background: linear-gradient(180deg, rgba(0, 240, 255, 0.5) 0%, rgba(0, 240, 255, 0) 100%) !important;
        clip-path: polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%) !important;
        opacity: 0.35 !important;
        transition: all 0.3s ease !important;
        z-index: 1 !important;
        pointer-events: none !important;
      }

      .ufo-trigger:hover .ufo-beam,
      #arcade-nav-container.open .ufo-beam {
        opacity: 0.9 !important;
        height: 32px !important;
        background: linear-gradient(180deg, rgba(0, 240, 255, 0.85) 0%, rgba(255, 0, 127, 0.3) 100%) !important;
      }

      /* Menu Badge Pill */
      .ufo-pill-badge {
        font-size: 0.62rem !important;
        font-weight: 800 !important;
        letter-spacing: 1.2px !important;
        color: #00f0ff !important;
        background: rgba(10, 5, 28, 0.9) !important;
        border: 1px solid rgba(0, 240, 255, 0.5) !important;
        border-radius: 10px !important;
        padding: 2px 8px !important;
        text-transform: uppercase !important;
        margin-top: 14px !important;
        z-index: 4 !important;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.3) !important;
        transition: all 0.2s ease !important;
      }

      .ufo-trigger:hover .ufo-pill-badge,
      #arcade-nav-container.open .ufo-pill-badge {
        color: #ffffff !important;
        border-color: #ff007f !important;
        background: rgba(255, 0, 127, 0.85) !important;
        box-shadow: 0 0 14px rgba(255, 0, 127, 0.6) !important;
      }

      /* Dropdown Menu */
      .arcade-nav-dropdown {
        position: absolute !important;
        top: calc(100% + 4px) !important;
        left: 0 !important;
        width: 240px !important;
        background: rgba(11, 6, 32, 0.95) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border: 1px solid rgba(0, 240, 255, 0.35) !important;
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
    const path = window.location.pathname;
    if (window.self !== window.top || path.includes('console') || window.location.search.includes('console') || window.location.search.includes('autostart=1')) return;

    injectNavStyles();

    // Check if current page is in a subfolder (e.g., /games/)
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
        href: `${prefix}console.html`,
        key: 'console.html',
        icon: '📱',
        title: 'Console Mode',
        desc: 'Phone as Controller'
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      pointerEvents: 'auto'
    });

    // Create UFO Saucer Trigger
    const ufoTrigger = document.createElement('div');
    ufoTrigger.className = 'ufo-trigger';
    ufoTrigger.setAttribute('title', 'Navigation Menu');
    ufoTrigger.setAttribute('role', 'button');
    ufoTrigger.setAttribute('tabindex', '0');
    ufoTrigger.innerHTML = `
      <div class="ufo-dome"></div>
      <div class="ufo-body">
        <div class="ufo-light"></div>
        <div class="ufo-light"></div>
        <div class="ufo-light"></div>
        <div class="ufo-light"></div>
      </div>
      <div class="ufo-beam"></div>
      <div class="ufo-pill-badge">MENU ▾</div>
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

    container.appendChild(ufoTrigger);
    container.appendChild(dropdown);
    document.body.appendChild(container);

    // Toggle menu state
    function toggleMenu(e) {
      if (e) e.stopPropagation();
      const isOpen = container.classList.toggle('open');
      ufoTrigger.classList.toggle('open', isOpen);
    }

    function closeMenu() {
      container.classList.remove('open');
      ufoTrigger.classList.remove('open');
    }

    ufoTrigger.addEventListener('click', toggleMenu);
    ufoTrigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMenu(e);
      }
    });

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

  function initTagFilter() {
    const filterChips = document.querySelectorAll('.filter-chip');
    const gameCards = document.querySelectorAll('.game-card');

    if (!filterChips.length || !gameCards.length) return;

    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const filter = chip.getAttribute('data-filter') || 'all';

        // Update active chip
        filterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        if (window.SFX && typeof window.SFX.step === 'function') {
          try { window.SFX.step(); } catch(e) {}
        }

        // Filter cards
        gameCards.forEach(card => {
          const tagsStr = card.getAttribute('data-tags') || '';
          const cardTags = tagsStr.split(',').map(t => t.trim().toLowerCase());

          if (filter === 'all' || cardTags.includes(filter.toLowerCase())) {
            card.classList.remove('filtered-out');
          } else {
            card.classList.add('filtered-out');
          }
        });
      });
    });
  }

  function init() {
    initArcadeNav();
    initTagFilter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


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
      },
      {
        href: 'https://github.com/Abhixarvar/SpaceArcade/issues/new',
        external: true,
        icon: '🐛',
        title: 'Report Problem',
        desc: 'Submit GitHub issue'
      },
      {
        href: 'https://github.com/Abhixarvar/SpaceArcade',
        external: true,
        icon: '⭐',
        title: 'GitHub Repo',
        desc: 'Open source repository'
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
      
      if (link.external) {
        item.target = '_blank';
        item.rel = 'noopener noreferrer';
      }

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
    const searchInput = document.getElementById('game-search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');

    if (!gameCards.length) return;

    let activeFilter = 'all';
    let searchQuery = '';

    function applyFilters() {
      gameCards.forEach(card => {
        const title = (card.querySelector('.thumb-title')?.textContent || '').toLowerCase();
        const desc = (card.getAttribute('data-desc') || '').toLowerCase();
        const tagsStr = (card.getAttribute('data-tags') || '').toLowerCase();
        const cardTags = tagsStr.split(',').map(t => t.trim());

        const matchesTag = activeFilter === 'all' || cardTags.includes(activeFilter.toLowerCase());
        const matchesQuery = !searchQuery || title.includes(searchQuery) || desc.includes(searchQuery) || tagsStr.includes(searchQuery);

        if (matchesTag && matchesQuery) {
          card.classList.remove('filtered-out');
        } else {
          card.classList.add('filtered-out');
        }
      });
    }

    if (filterChips.length) {
      filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
          activeFilter = chip.getAttribute('data-filter') || 'all';
          filterChips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');

          if (window.SFX && typeof window.SFX.step === 'function') {
            try { window.SFX.step(); } catch(e) {}
          }

          applyFilters();
        });
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target.value || '').trim().toLowerCase();
        if (searchClearBtn) {
          searchClearBtn.style.display = searchQuery ? 'flex' : 'none';
        }
        applyFilters();
      });

      if (searchClearBtn) {
        searchClearBtn.addEventListener('click', () => {
          searchInput.value = '';
          searchQuery = '';
          searchClearBtn.style.display = 'none';
          applyFilters();
          searchInput.focus();
        });
      }
    }
  }

  function initGameInfoModals() {
    const infoBtns = document.querySelectorAll('.game-info-btn');
    if (!infoBtns.length) return;

    // Create backdrop and modal container if not already present
    let backdrop = document.querySelector('.game-info-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'game-info-modal-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.innerHTML = `
        <div class="game-info-modal" role="dialog" aria-modal="true">
          <button class="game-info-modal-close" aria-label="Close modal">&times;</button>
          <div class="game-info-modal-header">
            <div class="game-info-modal-icon">🎮</div>
            <h2 class="game-info-modal-title">Game Title</h2>
          </div>
          <div class="game-info-modal-tags"></div>
          <div class="game-info-modal-desc"></div>
          <div class="game-info-modal-actions">
            <button class="game-info-modal-btn game-info-modal-btn--close" type="button">Close</button>
            <a href="#" class="game-info-modal-btn game-info-modal-btn--launch">Launch Mission</a>
          </div>
        </div>
      `;
      document.body.appendChild(backdrop);
    }

    const modalTitle = backdrop.querySelector('.game-info-modal-title');
    const modalIcon = backdrop.querySelector('.game-info-modal-icon');
    const modalTags = backdrop.querySelector('.game-info-modal-tags');
    const modalDesc = backdrop.querySelector('.game-info-modal-desc');
    const launchBtn = backdrop.querySelector('.game-info-modal-btn--launch');
    const closeBtns = backdrop.querySelectorAll('.game-info-modal-close, .game-info-modal-btn--close');

    function closeModal() {
      backdrop.classList.remove('open');
      backdrop.setAttribute('aria-hidden', 'true');
      if (window.SFX && typeof window.SFX.step === 'function') {
        try { window.SFX.step(); } catch(e) {}
      }
    }

    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) {
        closeModal();
      }
    });

    infoBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const card = btn.closest('.game-card');
        if (!card) return;

        const title = card.querySelector('.thumb-title')?.textContent || 'Game';
        const desc = card.getAttribute('data-desc') || 'No description available.';
        const href = card.getAttribute('href') || '#';
        const tagsContainer = card.querySelector('.card-tags');

        // Extract leading emoji icon from description if present, default 🎮
        const match = desc.match(/^(\p{Extended_Pictographic})/u);
        const iconEmoji = match ? match[1] : '🎮';
        const cleanDesc = desc.replace(/^(\p{Extended_Pictographic})\s*/u, '');

        modalTitle.textContent = title;
        modalIcon.textContent = iconEmoji;
        modalDesc.textContent = cleanDesc || desc;
        launchBtn.setAttribute('href', href);

        if (tagsContainer) {
          modalTags.innerHTML = tagsContainer.innerHTML;
        } else {
          modalTags.innerHTML = '';
        }

        backdrop.classList.add('open');
        backdrop.setAttribute('aria-hidden', 'false');

        if (window.SFX && typeof window.SFX.powerup === 'function') {
          try { window.SFX.powerup(); } catch(err) {}
        } else if (window.SFX && typeof window.SFX.step === 'function') {
          try { window.SFX.step(); } catch(err) {}
        }
      });
    });
  }

  function injectArcadeFooter() {
    if (document.querySelector('.arcade-footer')) return;
    const targetParent = document.querySelector('.page-content') || document.querySelector('.game-page') || document.querySelector('.discord-lounge') || document.body;

    const footer = document.createElement('footer');
    footer.className = 'arcade-footer';
    footer.innerHTML = `
      <div class="arcade-footer-links">
        <a href="https://github.com/Abhixarvar/SpaceArcade" target="_blank" rel="noopener noreferrer" class="btn-github-repo" data-tip="⭐ View open source code on GitHub!">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="vertical-align: text-bottom;"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub Repository
        </a>
        <a href="https://github.com/Abhixarvar/SpaceArcade/issues/new" target="_blank" rel="noopener noreferrer" class="btn-github-report" data-tip="🐛 Found a bug? Report it directly on GitHub!">
          🐛 Report Problem
        </a>
      </div>
      <div>
        <span>Git Repository:</span>
        <a href="https://github.com/Abhixarvar/SpaceArcade" target="_blank" rel="noopener noreferrer" class="repo-address-tag">https://github.com/Abhixarvar/SpaceArcade</a>
      </div>
    `;
    targetParent.appendChild(footer);
  }

  function initEcoModeToggle() {
    const ecoBtn = document.getElementById('eco-toggle-btn');
    const soundBtn = document.getElementById('sound-toggle-btn');

    // Auto-detect low performance
    const isEcoDefault = localStorage.getItem('spaceArcadeEcoMode') === 'true' ||
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

    if (isEcoDefault) {
      document.body.classList.add('eco-mode');
    }

    if (ecoBtn) {
      const updateEcoBtn = () => {
        const active = document.body.classList.contains('eco-mode');
        ecoBtn.classList.toggle('active', active);
        ecoBtn.innerHTML = active ? '🍃 Power Saver' : '⚡ Turbo Mode';
      };
      updateEcoBtn();

      ecoBtn.addEventListener('click', () => {
        const isEco = document.body.classList.toggle('eco-mode');
        localStorage.setItem('spaceArcadeEcoMode', isEco ? 'true' : 'false');
        updateEcoBtn();
        if (window.SFX && typeof window.SFX.click === 'function') {
          try { window.SFX.click(); } catch(e) {}
        }
        window.dispatchEvent(new CustomEvent('ecoModeChange'));
      });
    }

    if (soundBtn) {
      const updateSoundBtn = () => {
        const muted = window.SFX && typeof window.SFX.isMuted === 'function' ? window.SFX.isMuted() : false;
        soundBtn.classList.toggle('muted', muted);
        soundBtn.innerHTML = muted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
      };
      updateSoundBtn();

      soundBtn.addEventListener('click', () => {
        if (window.SFX && typeof window.SFX.toggleMute === 'function') {
          window.SFX.toggleMute();
          updateSoundBtn();
          if (!window.SFX.isMuted()) {
            try { window.SFX.pop(); } catch(e) {}
          }
        }
      });
    }
  }

  function initKidAudioInteractions() {
    // Add hover audio listeners for game cards and buttons
    const cards = document.querySelectorAll('.game-card, .mode-badge-btn, .filter-chip, .promo-banner-link');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        if (window.SFX) {
          if (typeof window.SFX.pop === 'function') {
            try { window.SFX.pop(); } catch(e) {}
          } else if (typeof window.SFX.step === 'function') {
            try { window.SFX.step(); } catch(e) {}
          }
        }
      });
    });

    // Play click sound on launch buttons
    const playBtns = document.querySelectorAll('.card-play-btn, .game-card');
    playBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (e.target.closest('.game-info-btn')) return;
        if (window.SFX && typeof window.SFX.powerup === 'function') {
          try { window.SFX.powerup(); } catch(err) {}
        }
      });
    });
  }

  function init() {
    initArcadeNav();
    initTagFilter();
    initGameInfoModals();
    initEcoModeToggle();
    initKidAudioInteractions();
    injectArcadeFooter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();


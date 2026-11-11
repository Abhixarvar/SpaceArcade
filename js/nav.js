/**
 * Space Arcade — UFO Saucer Aesthetic Navigation Module
 * Injects a floating retro UFO spaceship button & glassmorphism dropdown menu.
 */

import './fullscreen.js';

(function () {
  'use strict';

  function injectNavStyles() {
    if (document.getElementById('arcade-nav-style')) return;
    const style = document.createElement('style');
    style.id = 'arcade-nav-style';
    style.textContent = `
      #arcade-nav-container {
        position: fixed;
        top: 16px;
        left: 16px;
        z-index: 999999 !important;
        font-family: 'JetBrains Mono', 'Outfit', monospace, sans-serif !important;
        pointer-events: auto !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      #ufo-container #arcade-nav-container {
        position: relative !important;
        top: auto !important;
        left: auto !important;
        z-index: 999999 !important;
      }

      /* Technical System Menu Button */
      .ufo-trigger {
        position: relative !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        padding: 6px 12px !important;
        background: #141a23 !important;
        border: 1px solid #263242 !important;
        border-radius: 4px !important;
        color: #94a3b8 !important;
        font-family: inherit !important;
        font-size: 0.75rem !important;
        font-weight: 700 !important;
        letter-spacing: 0.8px !important;
        text-transform: uppercase !important;
        cursor: pointer !important;
        user-select: none !important;
        outline: none !important;
        transition: all 0.15s ease !important;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4) !important;
      }

      .ufo-trigger:hover,
      #arcade-nav-container.open .ufo-trigger {
        background: #1c2430 !important;
        border-color: #38bdf8 !important;
        color: #38bdf8 !important;
      }

      /* Dropdown Menu */
      .arcade-nav-dropdown {
        position: absolute !important;
        top: calc(100% + 6px) !important;
        left: 0 !important;
        width: 230px !important;
        background: #0e131a !important;
        border: 1px solid #263242 !important;
        border-radius: 6px !important;
        padding: 6px !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 2px !important;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7) !important;
        
        opacity: 0 !important;
        visibility: hidden !important;
        transform: translateY(-6px) !important;
        transform-origin: top left !important;
        transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s !important;
        pointer-events: none !important;
      }

      #arcade-nav-container.open .arcade-nav-dropdown {
        opacity: 1 !important;
        visibility: visible !important;
        transform: translateY(0) !important;
        pointer-events: auto !important;
      }

      /* Nav Item */
      .arcade-nav-item {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        padding: 7px 10px !important;
        border-radius: 4px !important;
        color: #94a3b8 !important;
        text-decoration: none !important;
        background: transparent !important;
        border: 1px solid transparent !important;
        transition: all 0.15s ease !important;
      }

      .arcade-nav-item:hover {
        background: #16202c !important;
        border-color: #26384c !important;
        color: #f0f6fc !important;
        transform: none !important;
      }

      .arcade-nav-item.active {
        background: #162436 !important;
        border-color: #38bdf8 !important;
        color: #38bdf8 !important;
      }

      .arcade-nav-item-icon {
        width: 26px !important;
        height: 26px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        background: #141a23 !important;
        border: 1px solid #202b3a !important;
        border-radius: 4px !important;
        flex-shrink: 0 !important;
        color: inherit !important;
      }

      .arcade-nav-item:hover .arcade-nav-item-icon {
        border-color: #38bdf8 !important;
        color: #38bdf8 !important;
        background: #1c2635 !important;
      }

      .arcade-nav-item-content {
        display: flex !important;
        flex-direction: column !important;
        gap: 1px !important;
        overflow: hidden !important;
      }

      .arcade-nav-item-title {
        font-size: 0.78rem !important;
        font-weight: 700 !important;
        letter-spacing: 0.5px !important;
        text-transform: uppercase !important;
        line-height: 1.2 !important;
      }

      .arcade-nav-item-desc {
        font-size: 0.65rem !important;
        color: #64748b !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      .arcade-nav-item:hover .arcade-nav-item-desc {
        color: #94a3b8 !important;
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
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
        title: 'Home Hub',
        desc: 'Main arcade portal'
      },
      {
        href: `${prefix}singleplayer.html`,
        key: 'singleplayer.html',
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"></circle><path d="M20 21a8 8 0 1 0-16 0"></path></svg>',
        title: 'Singleplayer',
        desc: 'Solo retro cores'
      },
      {
        href: `${prefix}party.html`,
        key: 'party.html',
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        title: 'Party Lounge',
        desc: 'Real-time multiplayer'
      },
      {
        href: `${prefix}console.html`,
        key: 'console.html',
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="6"></rect><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line></svg>',
        title: 'Console Mode',
        desc: 'Phone as Controller'
      },
      {
        href: `${prefix}offline.html`,
        key: 'offline.html',
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="12" y1="3" x2="12" y2="17"></line><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
        title: 'Local Play',
        desc: 'Pass & play 2-player'
      },
      {
        action: 'fullscreen',
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>',
        title: 'Fullscreen',
        desc: 'Toggle full screen [F]'
      },
      {
        href: 'https://github.com/Abhixarvar/SpaceArcade/issues/new',
        external: true,
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
        title: 'Report Problem',
        desc: 'Submit GitHub issue'
      },
      {
        href: 'https://github.com/Abhixarvar/SpaceArcade',
        external: true,
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>',
        title: 'GitHub Repo',
        desc: 'Open source repository'
      }
    ];

    // Create container
    const container = document.createElement('div');
    container.id = 'arcade-nav-container';
    container.className = 'arcade-nav-container';

    // Apply inline styles to container
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
    const ufoContainer = document.getElementById('ufo-container');
    if (ufoContainer) {
      Object.assign(container.style, {
        position: 'relative',
        top: 'auto',
        left: 'auto'
      });
    }

    // Create System Menu Trigger
    const ufoTrigger = document.createElement('div');
    ufoTrigger.className = 'ufo-trigger';
    ufoTrigger.setAttribute('title', 'Navigation Menu');
    ufoTrigger.setAttribute('role', 'button');
    ufoTrigger.setAttribute('tabindex', '0');
    ufoTrigger.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      <span>MENU</span>
    `;

    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'arcade-nav-dropdown';

    links.forEach(link => {
      if (link.action === 'fullscreen') {
        const item = document.createElement('div');
        item.className = 'arcade-nav-item arcade-nav-fs-item';
        item.style.cursor = 'pointer';
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.innerHTML = `
          <span class="arcade-nav-item-icon">${link.icon}</span>
          <div class="arcade-nav-item-content">
            <span class="arcade-nav-item-title" id="ufo-fs-title">${link.title}</span>
            <span class="arcade-nav-item-desc" id="ufo-fs-desc">${link.desc}</span>
          </div>
        `;
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          closeMenu();
          if (window.ArcadeFullscreen) {
            window.ArcadeFullscreen.toggle();
          }
        });
        dropdown.appendChild(item);
        return;
      }

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
    
    if (ufoContainer) {
      ufoContainer.appendChild(container);
    } else {
      document.body.appendChild(container);
    }

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
        ecoBtn.innerHTML = active 
          ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> <span>Eco Mode</span>' 
          : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg> <span>Turbo Mode</span>';
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
        soundBtn.innerHTML = muted 
          ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg> <span>Sound: OFF</span>' 
          : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg> <span>Sound: ON</span>';
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

  function initStickyBanner() {
    const banner = document.getElementById('sticky-banner');
    if (!banner) return;
    
    let inactivityTimer;
    
    function resetTimer() {
      banner.classList.remove('hidden');
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (window.scrollY > 50) {
          banner.classList.add('hidden');
        }
      }, 3000);
    }
    
    window.addEventListener('scroll', resetTimer, { passive: true });
    window.addEventListener('mousemove', resetTimer, { passive: true });
    window.addEventListener('keydown', resetTimer, { passive: true });
    banner.addEventListener('mouseenter', () => { clearTimeout(inactivityTimer); banner.classList.remove('hidden'); });
    banner.addEventListener('mouseleave', resetTimer);
    
    resetTimer();
  }

  function init() {
    initArcadeNav();
    initStickyBanner();
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


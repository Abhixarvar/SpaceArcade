/* ===== Animated Starfield (Low-End Optimized) ===== */
(function () {
  const container = document.getElementById('starfield');
  if (!container) return;

  const isLowPower = () => {
    const ecoSaved = localStorage.getItem('spaceArcadeEcoMode') === 'true';
    const lowCores = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return ecoSaved || lowCores || reducedMotion;
  };

  let timer = null;

  function renderStars() {
    container.innerHTML = '';
    const STAR_COUNT = isLowPower() ? 20 : 45;

    // Create twinkling stars
    for (let i = 0; i < STAR_COUNT; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 2.5 + 0.5;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const duration = Math.random() * 4 + 2;
      const delay = Math.random() * 4;
      const minOp = Math.random() * 0.3 + 0.1;
      const maxOp = Math.random() * 0.5 + 0.5;

      star.style.width = size + 'px';
      star.style.height = size + 'px';
      star.style.left = x + '%';
      star.style.top = y + '%';
      star.style.willChange = 'opacity';
      star.style.transform = 'translateZ(0)';
      star.style.setProperty('--duration', duration + 's');
      star.style.setProperty('--min-opacity', minOp);
      star.style.setProperty('--max-opacity', maxOp);
      star.style.animationDelay = delay + 's';

      if (size > 2) {
        const colors = ['#00f0ff', '#b44aff', '#ff6b9d', '#ffd700'];
        star.style.background = colors[Math.floor(Math.random() * colors.length)];
      }

      container.appendChild(star);
    }
  }

  // Shooting stars (disabled on low power / eco mode)
  function createShootingStar() {
    if (document.hidden || isLowPower()) return;
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = Math.random() * 60 + '%';
    star.style.top = Math.random() * 40 + '%';
    
    const rotation = 30 + Math.random() * 20;
    star.style.setProperty('--rot', `${rotation}deg`);

    const colors = ['#00f0ff', '#b44aff', '#ff6b9d', '#ffd700', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    star.style.setProperty('--color', color);

    container.appendChild(star);
    setTimeout(() => star.remove(), 1500);
  }

  function scheduleShootingStar() {
    if (timer) clearTimeout(timer);
    const delay = Math.random() * 5000 + 4000;
    timer = setTimeout(() => {
      createShootingStar();
      scheduleShootingStar();
    }, delay);
  }

  renderStars();
  scheduleShootingStar();

  // Listen for Eco Mode changes
  window.addEventListener('ecoModeChange', () => {
    renderStars();
  });
})();

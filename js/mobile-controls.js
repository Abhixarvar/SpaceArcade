document.addEventListener('DOMContentLoaded', () => {
  // Only inject if not already present
  if (document.getElementById('mobile-controls-container')) return;

  // Create the container
  const container = document.createElement('div');
  container.id = 'mobile-controls-container';

  container.innerHTML = `
    <div class="mc-dpad">
      <div class="mc-btn mc-dpad-up" data-key="ArrowUp">↑</div>
      <div class="mc-btn mc-dpad-left" data-key="ArrowLeft">←</div>
      <div class="mc-btn mc-dpad-right" data-key="ArrowRight">→</div>
      <div class="mc-btn mc-dpad-down" data-key="ArrowDown">↓</div>
    </div>
    <div class="mc-action-buttons">
      <div class="mc-btn mc-action-btn mc-action-b" data-key="c">B</div>
      <div class="mc-btn mc-action-btn mc-action-a" data-key=" ">A</div>
    </div>
  `;

  document.body.appendChild(container);

  // Helper to dispatch keyboard events
  const dispatchKey = (type, key) => {
    const event = new KeyboardEvent(type, {
      key: key,
      code: key === ' ' ? 'Space' : key,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  };

  // Bind events to buttons
  const buttons = container.querySelectorAll('.mc-btn');

  buttons.forEach(btn => {
    const key = btn.getAttribute('data-key');

    const handlePress = (e) => {
      e.preventDefault(); // Prevent default touch actions (scrolling/zooming)
      if (!btn.classList.contains('active')) {
        btn.classList.add('active');
        dispatchKey('keydown', key);
      }
    };

    const handleRelease = (e) => {
      e.preventDefault();
      if (btn.classList.contains('active')) {
        btn.classList.remove('active');
        dispatchKey('keyup', key);
      }
    };

    // Touch events
    btn.addEventListener('touchstart', handlePress, { passive: false });
    btn.addEventListener('touchend', handleRelease, { passive: false });
    btn.addEventListener('touchcancel', handleRelease, { passive: false });

    // Mouse events (for testing on desktop)
    btn.addEventListener('mousedown', handlePress);
    btn.addEventListener('mouseup', handleRelease);
    btn.addEventListener('mouseleave', handleRelease);
  });
});

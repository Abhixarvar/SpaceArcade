/* ===== Space Arcade — Retro Audio Engine ===== */
/* Web Audio API synth — no external files needed */

// Safety no-op shim — overwritten by actual engine below
if (!window.SFX) {
  const noop = () => {};
  window.SFX = { shoot:noop, eat:noop, powerup:noop, explode:noop, hit:noop, gameOver:noop, levelUp:noop, ghostEat:noop, step:noop, startBGM:noop, stopBGM:noop, createParty:noop, joinParty:noop, setVolume:noop, getVolume:()=>0.5 };
}

window.SFX = (function () {
  let ctx = null;
  let masterGain = null;
  let currentVol = parseFloat(localStorage.getItem('spaceArcadeVolume') || '0.5');

  function ensure() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = currentVol;
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // Utility: quick oscillator + gain envelope
  function tone(freq, type, duration, volume, rampEnd) {
    const c = ensure();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (rampEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(rampEnd, 20), c.currentTime + duration);
    }
    gain.gain.setValueAtTime(Math.min(volume || 0.15, 0.3), c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain).connect(masterGain);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  }

  // Utility: noise burst
  function noise(duration, volume) {
    const c = ensure();
    const bufferSize = c.sampleRate * duration;
    const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const src = c.createBufferSource();
    src.buffer = buffer;
    const gain = c.createGain();
    gain.gain.setValueAtTime(Math.min(volume || 0.12, 0.25), c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    // Bandpass for crunch
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;
    src.connect(filter).connect(gain).connect(masterGain);
    src.start();
  }

  return {
    setVolume(val) {
      currentVol = Math.max(0, Math.min(1, val));
      localStorage.setItem('spaceArcadeVolume', currentVol.toString());
      if (masterGain && ctx) {
        masterGain.gain.setTargetAtTime(currentVol, ctx.currentTime, 0.1);
      }
    },

    getVolume() {
      return currentVol;
    },

    startBGM() {},
    stopBGM() {},

    /** Chime for creating a party - triumphant ascending multi-note synth chime */
    createParty() {
      tone(523.25, 'sine', 0.12, 0.2); // C5
      setTimeout(() => tone(659.25, 'sine', 0.12, 0.2), 90); // E5
      setTimeout(() => tone(783.99, 'sine', 0.12, 0.2), 180); // G5
      setTimeout(() => tone(1046.50, 'triangle', 0.25, 0.25), 270); // C6
    },

    /** Chime for joining a party - upbeat two/three-stage party join chime */
    joinParty() {
      tone(587.33, 'triangle', 0.1, 0.18); // D5
      setTimeout(() => tone(783.99, 'sine', 0.1, 0.2), 80); // G5
      setTimeout(() => tone(1046.50, 'sine', 0.2, 0.22), 160); // C6
    },

    /** Laser / shoot */
    shoot() { tone(880, 'square', 0.08, 0.1, 440); },
    /** Small hit / eat / collect dot */
    eat() { tone(600, 'sine', 0.06, 0.1, 900); },
    /** Power pellet / power-up pickup */
    powerup() {
      tone(440, 'square', 0.08, 0.12);
      setTimeout(() => tone(660, 'square', 0.08, 0.12), 60);
      setTimeout(() => tone(880, 'square', 0.12, 0.12), 120);
    },
    /** Explosion / enemy destroyed */
    explode() {
      noise(0.2, 0.15);
      tone(200, 'sawtooth', 0.15, 0.1, 40);
    },
    /** Player hit / lose life */
    hit() {
      noise(0.15, 0.12);
      tone(300, 'square', 0.2, 0.12, 80);
    },
    /** Game over */
    gameOver() {
      tone(440, 'square', 0.15, 0.1, 200);
      setTimeout(() => tone(330, 'square', 0.15, 0.1, 150), 150);
      setTimeout(() => tone(220, 'square', 0.3, 0.1, 80), 300);
    },
    /** Level up / wave clear */
    levelUp() {
      tone(523, 'square', 0.1, 0.12);
      setTimeout(() => tone(659, 'square', 0.1, 0.12), 100);
      setTimeout(() => tone(784, 'square', 0.1, 0.12), 200);
      setTimeout(() => tone(1047, 'square', 0.18, 0.12), 300);
    },
    /** Ghost eaten in pacman */
    ghostEat() {
      tone(300, 'square', 0.06, 0.1, 800);
      setTimeout(() => tone(600, 'square', 0.1, 0.12), 60);
    },
    /** Move / step (very subtle) */
    step() { tone(200, 'sine', 0.03, 0.04, 250); },
    /** Kid-friendly bubbly pop sound for hover/chips */
    pop() { tone(480, 'sine', 0.05, 0.06, 720); },
    /** Satisfying arcade button tap click */
    click() {
      tone(620, 'triangle', 0.04, 0.08, 380);
    },
    /** Whoosh transition effect */
    whoosh() {
      tone(300, 'sine', 0.1, 0.08, 900);
    },
    /** Toggle mute state */
    toggleMute() {
      const isMuted = this.getVolume() === 0;
      this.setVolume(isMuted ? 0.5 : 0);
      return !isMuted;
    },
    isMuted() {
      return currentVol === 0;
    }
  };
})();



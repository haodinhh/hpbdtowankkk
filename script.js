/* =============================================
   Birthday Website - JavaScript
   ============================================= */

(function () {
  'use strict';

  // ===== DOM Elements =====
  const screen1 = document.getElementById('screen1');
  const screen2 = document.getElementById('screen2');
  const giftsSection = document.getElementById('giftsSection');
  const pinDisplay = document.getElementById('pinDisplay');
  const enterBtn = document.getElementById('enterBtn');
  const numpad = document.getElementById('numpad');
  const bgMusic = document.getElementById('bgMusic');

  // PIN state
  const CORRECT_PIN = '2805';
  let currentPin = '';
  const MAX_LEN = 4;

  // ===== SCREEN 1 - NUMPAD LOGIC =====

  /**
   * Update the visual pin dots based on currentPin
   */
  function updatePinDisplay() {
    for (let i = 0; i < MAX_LEN; i++) {
      const dot = document.getElementById('dot' + i);
      if (i < currentPin.length) {
        dot.classList.add('pin-dot--filled');
      } else {
        dot.classList.remove('pin-dot--filled');
      }
    }
  }

  /**
   * Add a digit to the pin
   */
  function addDigit(digit) {
    if (currentPin.length >= MAX_LEN) return;
    currentPin += digit;
    updatePinDisplay();
  }

  /**
   * Clear the pin
   */
  function clearPin() {
    currentPin = '';
    updatePinDisplay();
  }

  /**
   * Shake the pin display for wrong password
   */
  function shakePin() {
    pinDisplay.classList.add('pin-display--shake');
    // Change dot border to red briefly
    const dots = pinDisplay.querySelectorAll('.pin-dot');
    dots.forEach(dot => {
      dot.style.borderColor = '#e53935';
      dot.style.background = 'rgba(229, 57, 53, 0.08)';
    });
    setTimeout(() => {
      pinDisplay.classList.remove('pin-display--shake');
      dots.forEach(dot => {
        dot.style.borderColor = '';
        dot.style.background = '';
      });
      clearPin();
    }, 600);
  }

  /**
   * Check pin and transition to Screen 2
   */
  function checkPin() {
    if (currentPin.length !== MAX_LEN) return;

    if (currentPin === CORRECT_PIN) {
      // Success! Transition to Corgi Screen
      screen1.style.opacity = '0';
      screen1.style.transition = 'opacity 0.6s ease';

      setTimeout(() => {
        screen1.classList.remove('screen--active');

        const corgiScreen = document.getElementById('corgiScreen');
        if (corgiScreen) {
          corgiScreen.classList.add('screen--active', 'screen--fade-in');
        }

        // Play music if not explicitly muted by user
        if (!isMuted) {
          fadeInMusic(1000);
        }

        // Start confetti
        startConfetti();
      }, 600);
    } else {
      shakePin();
    }
  }

  // Numpad button clicks
  numpad.addEventListener('click', function (e) {
    const btn = e.target.closest('.numpad__btn');
    if (!btn) return;

    const value = btn.dataset.value;

    // Only accept digits (ignore * and #)
    if (/^[0-9]$/.test(value)) {
      addDigit(value);
    } else if (value === '*') {
      // * = Clear / Backspace
      clearPin();
    } else if (value === '#') {
      // # = Delete last digit
      currentPin = currentPin.slice(0, -1);
      updatePinDisplay();
    }
  });

  // Enter button
  enterBtn.addEventListener('click', checkPin);

  // Keyboard support
  document.addEventListener('keydown', function (e) {
    // Only handle when Screen 1 is visible
    if (!screen1.classList.contains('screen--active')) return;

    if (/^[0-9]$/.test(e.key)) {
      addDigit(e.key);
    } else if (e.key === 'Backspace') {
      currentPin = currentPin.slice(0, -1);
      updatePinDisplay();
    } else if (e.key === 'Enter') {
      checkPin();
    } else if (e.key === 'Escape') {
      clearPin();
    }
  });

  // Corgi Screen click transition to Screen 2 (Gift selection)
  const corgiScreen = document.getElementById('corgiScreen');
  if (corgiScreen) {
    corgiScreen.addEventListener('click', function () {
      corgiScreen.style.opacity = '0';
      corgiScreen.style.transition = 'opacity 0.6s ease';

      setTimeout(() => {
        corgiScreen.classList.remove('screen--active');
        corgiScreen.style.opacity = '';
        corgiScreen.style.transition = '';

        screen2.classList.add('screen--active', 'screen--fade-in');
      }, 600);
    });
  }

  // ===== MUSIC =====
  const musicToggle = document.getElementById('musicToggle');
  const musicIconPath = document.getElementById('musicIconPath');

  const TARGET_VOLUME = 0.03; // 3% volume
  let fadeInterval = null;
  let isMuted = true;

  // SVG Paths
  const SVG_PLAYING = "M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z";
  const SVG_MUTED = "M4.27 3L3 4.27l9 9v.28c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-1.18l5.46 5.46 1.27-1.27L4.27 3zM14 7h4V3h-6v1.18l2 2V7z";

  function fadeInMusic(duration = 1500) {
    if (!bgMusic) return;
    clearInterval(fadeInterval);

    if (bgMusic.paused) {
      bgMusic.volume = 0;
      bgMusic.play().then(() => {
        updateMusicButton(false);
      }).catch(() => {
        // Autoplay blocked: wait for first interaction to fade in
        const startOnInteraction = () => {
          if (!isMuted) {
            fadeInMusic(duration);
          }
          document.removeEventListener('click', startOnInteraction);
          document.removeEventListener('keydown', startOnInteraction);
          document.removeEventListener('touchstart', startOnInteraction);
        };
        document.addEventListener('click', startOnInteraction);
        document.addEventListener('keydown', startOnInteraction);
        document.addEventListener('touchstart', startOnInteraction);
      });
    }

    let currentVolume = bgMusic.volume;
    const step = TARGET_VOLUME / (duration / 50);

    fadeInterval = setInterval(() => {
      currentVolume += step;
      if (currentVolume >= TARGET_VOLUME) {
        bgMusic.volume = TARGET_VOLUME;
        clearInterval(fadeInterval);
      } else {
        bgMusic.volume = currentVolume;
      }
    }, 50);
  }

  function fadeOutMusic(duration = 1000) {
    if (!bgMusic || bgMusic.paused) return;
    clearInterval(fadeInterval);

    let currentVolume = bgMusic.volume;
    const step = currentVolume / (duration / 50);

    fadeInterval = setInterval(() => {
      currentVolume -= step;
      if (currentVolume <= 0) {
        bgMusic.volume = 0;
        bgMusic.pause();
        updateMusicButton(true);
        clearInterval(fadeInterval);
      } else {
        bgMusic.volume = currentVolume;
      }
    }, 50);
  }

  function updateMusicButton(mutedState) {
    isMuted = mutedState;
    if (isMuted) {
      musicToggle.classList.add('muted');
      musicIconPath.setAttribute('d', SVG_MUTED);
    } else {
      musicToggle.classList.remove('muted');
      musicIconPath.setAttribute('d', SVG_PLAYING);
    }
  }

  function toggleMusic() {
    if (bgMusic.paused) {
      fadeInMusic(1000);
    } else {
      fadeOutMusic(1000);
    }
  }

  if (musicToggle) {
    musicToggle.addEventListener('click', toggleMusic);
  }

  // ===== SCREEN 2 - GIFT SELECTION (INLINE VIEWS) =====

  const giftBoxes = document.querySelectorAll('.gift-box');

  /**
   * Show a gift view and hide the gifts selection
   */
  function showGiftView(giftId) {
    const giftView = document.getElementById('giftView' + giftId);
    if (!giftView) return;

    // Hide the gift selection section
    giftsSection.style.opacity = '0';
    giftsSection.style.transition = 'opacity 0.4s ease';

    setTimeout(() => {
      giftsSection.style.display = 'none';
      // Show the gift view
      giftView.classList.add('gift-view--active');
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  }

  /**
   * Hide a gift view and show the gifts selection
   */
  function hideGiftView(giftViewId) {
    const giftView = document.getElementById(giftViewId);
    if (!giftView) return;

    // Add class to animate gift view sliding up and out
    giftView.classList.add('gift-view--hide-up');

    setTimeout(() => {
      // Reset view state
      giftView.classList.remove('gift-view--active', 'gift-view--hide-up');

      // Show selection section with a slide-up entry effect
      giftsSection.style.display = '';
      giftsSection.style.opacity = '1';
      giftsSection.style.transition = '';
      giftsSection.classList.add('gifts-section--reveal');

      // Clean up the animation class
      setTimeout(() => {
        giftsSection.classList.remove('gifts-section--reveal');
      }, 600);

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 550); // Matches the 0.55s exit animation duration
  }

  // Gift box clicks
  giftBoxes.forEach(function (box) {
    box.addEventListener('click', function () {
      const giftId = box.dataset.gift;
      showGiftView(giftId);
    });
  });

  // Back buttons
  document.querySelectorAll('.gift-view__back').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const giftViewId = btn.dataset.back;
      hideGiftView(giftViewId);
    });
  });

  // Escape key to go back
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.gift-view--active').forEach(function (view) {
        hideGiftView(view.id);
      });
    }
  });

  // ===== CONFETTI EFFECT =====

  function startConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      '#ff6b9d', '#ffa751', '#c471ed', '#12c2e9',
      '#f48fb1', '#ffeb3b', '#e91e63', '#ff5722',
      '#9c27b0', '#4caf50', '#2196f3', '#ffd700'
    ];

    const confettiPieces = [];
    const TOTAL = 120;

    for (let i = 0; i < TOTAL; i++) {
      confettiPieces.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 10 + 5,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        speedX: (Math.random() - 0.5) * 3,
        speedY: Math.random() * 3 + 2,
        opacity: Math.random() * 0.5 + 0.5
      });
    }

    let frame = 0;
    const maxFrames = 400; // Stop after ~6-7 seconds

    function animate() {
      frame++;
      if (frame > maxFrames) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      confettiPieces.forEach(function (p) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        // Fade out near the end
        if (frame > maxFrames - 60) {
          p.opacity -= 0.01;
          if (p.opacity < 0) p.opacity = 0;
        }

        // Reset if goes off screen
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      requestAnimationFrame(animate);
    }

    animate();

    // Handle resize
    window.addEventListener('resize', function () {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // ===== BACKGROUND CONFETTI (GENTLE & CONTINUOUS) =====
  function initBackgroundConfetti() {
    const canvas = document.getElementById('bgConfettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = [
      '#ffb3c6', // Pastel Pink
      '#ffe5ec', // Super light pink
      '#ffc6ff', // Light purple
      '#e8e0ff', // Soft lavender
      '#bdf0ff', // Pale blue
      '#c1fba4', // Soft green
      '#ffd6a5', // Soft orange
      '#fdffb6'  // Soft yellow
    ];

    const particles = [];
    const TOTAL_PARTICLES = 140; // Increased amount for richer look

    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 2, // Slow rotation
        speedX: (Math.random() - 0.5) * 0.8, // Tiny drift
        speedY: Math.random() * 0.8 + 0.6, // Very slow falling speed (0.6 to 1.4)
        oscillationSpeed: Math.random() * 0.02 + 0.01,
        oscillationRange: Math.random() * 15 + 5,
        angle: Math.random() * Math.PI * 2
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.angle += p.oscillationSpeed;
        const xOffset = Math.sin(p.angle) * p.oscillationRange * 0.05;
        p.x += p.speedX + xOffset;
        p.rotation += p.rotSpeed;

        // Reset if it goes off bottom
        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
          p.speedY = Math.random() * 0.8 + 0.6;
        }
        // Wrap around sides
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  }

  // Initialize background confetti
  initBackgroundConfetti();
})();

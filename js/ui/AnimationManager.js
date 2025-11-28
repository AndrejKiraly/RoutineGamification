/**
 * AnimationManager
 * Handles all UI animations (XP gains, level ups, achievements)
 */

export class AnimationManager {
  constructor() {
    this.animationQueue = [];
    this.isAnimating = false;
  }

  /**
   * Show XP gain animation
   */
  showXPGain(xp, skillType, element) {
    const xpElement = document.createElement('div');
    xpElement.className = 'xp-gain-animation';
    xpElement.textContent = `+${xp} XP`;

    // Position near the clicked element
    const rect = element.getBoundingClientRect();
    xpElement.style.left = `${rect.left + rect.width / 2}px`;
    xpElement.style.top = `${rect.top}px`;

    document.body.appendChild(xpElement);

    // Remove after animation
    setTimeout(() => {
      xpElement.remove();
    }, 2000);
  }

  /**
   * Show level up modal
   */
  showLevelUp(skillName, newLevel, modalManager) {
    // Create flash effect
    const flash = document.createElement('div');
    flash.className = 'level-up-flash';
    document.body.appendChild(flash);

    setTimeout(() => {
      flash.remove();
    }, 1000);

    // Show modal
    const content = `
      <div class="text-center level-up-modal">
        <div class="display-1 mb-4">${newLevel}</div>
        <h2 class="mb-3">Level Up!</h2>
        <p class="lead">${skillName} reached level ${newLevel}</p>
      </div>
    `;

    modalManager.show('Level Up!', content);
  }

  /**
   * Show achievement unlock notification
   */
  showAchievementUnlock(achievement, modalManager) {
    const content = `
      <div class="text-center achievement-unlock">
        <div class="achievement-icon mb-4">${achievement.icon}</div>
        <h3 class="mb-3">${achievement.name}</h3>
        <p class="text-muted">${achievement.description}</p>
      </div>
    `;

    modalManager.show('Achievement Unlocked!', content);
  }

  /**
   * Animate progress bar
   */
  animateProgressBar(progressBar, fromPercent, toPercent, duration = 500) {
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentPercent = fromPercent + (toPercent - fromPercent) * progress;
      progressBar.style.width = `${currentPercent}%`;
      progressBar.setAttribute('aria-valuenow', currentPercent);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Pulse element animation
   */
  pulseElement(element) {
    element.classList.add('pulse');
    setTimeout(() => {
      element.classList.remove('pulse');
    }, 1000);
  }

  /**
   * Shake element animation (for errors)
   */
  shakeElement(element) {
    element.style.animation = 'shake 0.5s';
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  }

  /**
   * Bounce element animation
   */
  bounceElement(element) {
    element.classList.add('bounce');
    setTimeout(() => {
      element.classList.remove('bounce');
    }, 1000);
  }

  /**
   * Fade in element
   */
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms`;

    setTimeout(() => {
      element.style.opacity = '1';
    }, 10);
  }

  /**
   * Fade out element
   */
  fadeOut(element, duration = 300) {
    element.style.opacity = '1';
    element.style.transition = `opacity ${duration}ms`;

    element.style.opacity = '0';

    return new Promise(resolve => {
      setTimeout(() => {
        element.style.display = 'none';
        resolve();
      }, duration);
    });
  }

  /**
   * Slide in from bottom
   */
  slideInUp(element, duration = 500) {
    element.style.transform = 'translateY(100px)';
    element.style.opacity = '0';
    element.style.transition = `transform ${duration}ms, opacity ${duration}ms`;

    setTimeout(() => {
      element.style.transform = 'translateY(0)';
      element.style.opacity = '1';
    }, 10);
  }

  /**
   * Show confetti effect for major achievements
   */
  showConfetti() {
    // Simple confetti effect using emoji
    const emojis = ['🎉', '✨', '⭐', '🌟', '💫'];

    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        confetti.style.position = 'fixed';
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = '-50px';
        confetti.style.fontSize = '2rem';
        confetti.style.pointerEvents = 'none';
        confetti.style.zIndex = '10000';
        confetti.style.animation = `floatUp 3s ease-out forwards`;

        document.body.appendChild(confetti);

        setTimeout(() => {
          confetti.remove();
        }, 3000);
      }, i * 50);
    }
  }

  /**
   * Glow effect for streak indicators
   */
  addGlowEffect(element) {
    element.classList.add('glow-on-hover');
  }

  /**
   * Remove glow effect
   */
  removeGlowEffect(element) {
    element.classList.remove('glow-on-hover');
  }
}

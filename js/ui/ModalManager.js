/**
 * ModalManager
 * Manages Bootstrap modals for various UI interactions
 */

export class ModalManager {
  constructor() {
    this.currentModal = null;
    this.modalElement = null;
    this.initializeModal();
  }

  /**
   * Initialize the dynamic modal element
   */
  initializeModal() {
    // Create modal HTML if it doesn't exist
    if (!document.getElementById('dynamic-modal')) {
      const modalHTML = `
        <div class="modal fade" id="dynamic-modal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="dynamic-modal-title"></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body" id="dynamic-modal-body"></div>
              <div class="modal-footer" id="dynamic-modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    this.modalElement = document.getElementById('dynamic-modal');
  }

  /**
   * Show a modal with custom content
   */
  show(title, bodyContent, footerContent = null) {
    const titleElement = document.getElementById('dynamic-modal-title');
    const bodyElement = document.getElementById('dynamic-modal-body');
    const footerElement = document.getElementById('dynamic-modal-footer');

    titleElement.textContent = title;
    bodyElement.innerHTML = bodyContent;

    if (footerContent) {
      footerElement.innerHTML = footerContent;
    } else {
      footerElement.innerHTML = '<button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>';
    }

    // Show the modal using Bootstrap
    if (window.bootstrap) {
      this.currentModal = new bootstrap.Modal(this.modalElement);
      this.currentModal.show();
    }
  }

  /**
   * Hide the current modal
   */
  hide() {
    if (this.currentModal) {
      this.currentModal.hide();
    }
  }

  /**
   * Show stats modal
   */
  showStats(user, achievementManager) {
    const achievements = achievementManager.getUnlockedAchievements();
    const unlockPercentage = achievementManager.getUnlockPercentage();
    const totalLevel = user.getTotalLevel();
    const avgLevel = user.getAverageLevel();

    const bodyContent = `
      <div class="stats-grid">
        <div class="stat-card card">
          <div class="card-body text-center">
            <div class="stat-value">${user.stats.totalRoutinesCompleted}</div>
            <div class="stat-label">Routines Completed</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="card-body text-center">
            <div class="stat-value">${user.stats.totalTasksCompleted}</div>
            <div class="stat-label">Tasks Completed</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="card-body text-center">
            <div class="stat-value">${user.stats.totalXPEarned.toLocaleString()}</div>
            <div class="stat-label">Total XP Earned</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="card-body text-center">
            <div class="stat-value">${user.streak.longest} 🔥</div>
            <div class="stat-label">Longest Streak</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="card-body text-center">
            <div class="stat-value">${totalLevel}</div>
            <div class="stat-label">Total Levels</div>
          </div>
        </div>
        <div class="stat-card card">
          <div class="card-body text-center">
            <div class="stat-value">${achievements.length}</div>
            <div class="stat-label">Achievements (${unlockPercentage}%)</div>
          </div>
        </div>
      </div>

      <div class="mt-4">
        <h6>Recent Achievements</h6>
        <div class="list-group">
          ${achievements.slice(-5).reverse().map(a => `
            <div class="list-group-item d-flex align-items-center gap-3">
              <span style="font-size: 2rem;">${a.icon}</span>
              <div>
                <strong>${a.name}</strong>
                <p class="mb-0 text-muted small">${a.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.show('Your Stats', bodyContent);
  }

  /**
   * Show achievements modal
   */
  showAchievements(achievementManager) {
    const categories = achievementManager.getAchievementsByCategory();

    const bodyContent = `
      <div class="achievement-list">
        ${Object.entries(categories).map(([category, achievements]) => {
          if (achievements.length === 0) return '';
          return `
            <div class="mb-4">
              <h6 class="text-capitalize">${category} Achievements</h6>
              <div class="list-group">
                ${achievements.map(a => `
                  <div class="list-group-item d-flex align-items-center gap-3 ${a.isUnlocked() ? '' : 'opacity-50'}">
                    <span style="font-size: 2rem;">${a.icon}</span>
                    <div class="flex-grow-1">
                      <strong>${a.name}</strong>
                      <p class="mb-0 text-muted small">${a.description}</p>
                    </div>
                    ${a.isUnlocked() ? '<span class="badge bg-success">Unlocked</span>' : '<span class="badge bg-secondary">Locked</span>'}
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.show('Achievements', bodyContent);
  }

  /**
   * Show skill details modal
   */
  showSkillDetails(skill) {
    const bodyContent = `
      <div class="text-center mb-4">
        <div style="font-size: 4rem;">${skill.icon}</div>
        <h3>${skill.name}</h3>
        <p class="text-muted">${skill.getTier()}</p>
      </div>

      <div class="mb-3">
        <div class="d-flex justify-content-between mb-2">
          <span>Level ${skill.level}</span>
          <span>${skill.currentXP} / ${skill.getXPForNextLevel()} XP</span>
        </div>
        <div class="progress" style="height: 1.5rem;">
          <div class="progress-bar" style="width: ${skill.getProgressPercentage()}%"></div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="card">
          <div class="card-body text-center">
            <div class="stat-value">${skill.totalXP.toLocaleString()}</div>
            <div class="stat-label">Total XP</div>
          </div>
        </div>
        <div class="card">
          <div class="card-body text-center">
            <div class="stat-value">${skill.prestige}</div>
            <div class="stat-label">Prestige</div>
          </div>
        </div>
      </div>

      ${skill.prestige > 0 ? `
        <div class="alert alert-info mt-3">
          <strong>Prestige Bonus:</strong> +${(skill.getPrestigeMultiplier() - 1) * 100}% XP
        </div>
      ` : ''}

      ${skill.level >= 100 ? `
        <div class="alert alert-success mt-3">
          <strong>Master Level!</strong> Ready to prestige and earn permanent XP bonus.
        </div>
      ` : ''}
    `;

    const footer = skill.level >= 100 ? `
      <button type="button" class="btn btn-warning" onclick="app.prestigeSkill('${skill.type}')">
        Prestige (Reset to Level 1, +5% XP)
      </button>
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
    ` : null;

    this.show(`${skill.name} Details`, bodyContent, footer);
  }

  /**
   * Show confirmation dialog
   */
  showConfirm(title, message, onConfirm) {
    const bodyContent = `<p>${message}</p>`;
    const footerContent = `
      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
      <button type="button" class="btn btn-primary" id="confirm-btn">Confirm</button>
    `;

    this.show(title, bodyContent, footerContent);

    // Add event listener for confirm button
    setTimeout(() => {
      document.getElementById('confirm-btn')?.addEventListener('click', () => {
        onConfirm();
        this.hide();
      });
    }, 100);
  }
}

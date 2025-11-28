/**
 * UIRenderer
 * Renders all UI components
 */

export class UIRenderer {
  constructor() {
    this.containers = {
      profile: document.getElementById('profile-sidebar'),
      routines: document.getElementById('routine-content')
    };
  }

  /**
   * Render user profile sidebar
   */
  renderProfile(user) {
    if (!this.containers.profile) return;

    const streakBonus = user.getStreakBonus();
    const streakTier = user.getStreakTierName();

    this.containers.profile.innerHTML = `
      <div class="card profile-card">
        <div class="card-body">
          <div class="d-flex align-items-center mb-4">
            <div class="avatar me-3">👤</div>
            <div>
              <h5 class="mb-0">${user.username}</h5>
              <small class="text-muted">Level ${user.getAverageLevel()}</small>
            </div>
          </div>

          ${user.streak.current > 0 ? `
            <div class="streak-info mb-4 text-center">
              <div class="mb-2">
                <span class="badge bg-gradient streak-fire">
                  🔥 ${user.streak.current} Day Streak
                </span>
              </div>
              ${streakTier ? `
                <small class="text-muted">${streakTier} (+${(streakBonus * 100).toFixed(0)}% XP)</small>
              ` : ''}
            </div>
          ` : ''}

          <div class="skills-section">
            <h6 class="mb-3">Skills</h6>
            ${Object.values(user.skills).map(skill => this.renderSkillBar(skill)).join('')}
          </div>

          <div class="mt-4 text-center">
            <small class="text-muted">Total XP: ${user.stats.totalXPEarned.toLocaleString()}</small>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render a single skill bar
   */
  renderSkillBar(skill) {
    const progress = skill.getProgressPercentage();

    return `
      <div class="skill-bar ${skill.type}" onclick="app.showSkillDetails('${skill.type}')">
        <div class="d-flex justify-content-between align-items-center">
          <span>
            ${skill.icon} ${skill.name}
            ${skill.prestige > 0 ? `<span class="prestige-stars">${'⭐'.repeat(Math.min(skill.prestige, 5))}</span>` : ''}
          </span>
          <small>Lv ${skill.level}</small>
        </div>
        <div class="progress">
          <div class="progress-bar"
               role="progressbar"
               style="width: ${progress}%"
               aria-valuenow="${progress}"
               aria-valuemin="0"
               aria-valuemax="100">
          </div>
        </div>
        <small>${skill.currentXP} / ${skill.getXPForNextLevel()} XP</small>
      </div>
    `;
  }

  /**
   * Render routines list
   */
  renderRoutines(routines, routineManager, user) {
    if (!this.containers.routines) return;

    this.containers.routines.innerHTML = `
      <div class="routines-container">
        ${routines.map(routine => this.renderRoutine(routine, routineManager, user)).join('')}
      </div>
    `;
  }

  /**
   * Render a single routine
   */
  renderRoutine(routine, routineManager, user) {
    const session = routineManager.getSession(routine.id);
    const progress = session.getProgress(routine);

    return `
      <div class="card routine-card mb-4" id="routine-${routine.id}">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div>
            <span class="me-2">${routine.icon}</span>
            <strong>${routine.name}</strong>
          </div>
          <div class="d-flex align-items-center gap-2">
            ${session.status === 'completed' ? '<span class="badge bg-success">✓ Completed</span>' : ''}
            ${session.status === 'in_progress' ? '<span class="badge bg-info">In Progress</span>' : ''}
            <small class="text-muted">${routine.startTime} - ${routine.getEndTime()} (${routine.totalDuration} min)</small>
          </div>
        </div>
        <div class="card-body">
          <p class="text-muted">${routine.description}</p>

          ${this.renderTimeline(routine, session)}

          ${routine.sections.map((section, index) => this.renderSection(section, routine.id, session, index)).join('')}

          ${this.renderRoutineProgress(progress, routine, session)}
        </div>
      </div>
    `;
  }

  /**
   * Render timeline
   */
  renderTimeline(routine, session) {
    return `
      <div class="timeline-header">
        <div class="timeline-bar">
          <div class="d-flex justify-content-between text-muted small mb-2">
            <span>${routine.startTime}</span>
            <span>${routine.getEndTime()}</span>
          </div>
          <div class="timeline-line"></div>
        </div>
      </div>
    `;
  }

  /**
   * Render routine section
   */
  renderSection(section, routineId, session, index) {
    const allCompleted = section.items.every(item => session.isItemCompleted(item.id));

    return `
      <div class="section-card card mb-3">
        <div class="card-header cursor-pointer"
             data-bs-toggle="collapse"
             data-bs-target="#section-${routineId}-${section.id}">
          <span class="status-badge">${allCompleted ? '✅' : '⭕'}</span>
          ${section.name}
          <span class="text-muted ms-2">(${section.timeRange})</span>
        </div>
        <div id="section-${routineId}-${section.id}" class="collapse ${index === 0 ? 'show' : ''}">
          <div class="card-body p-0">
            ${section.items.map(item => this.renderRoutineItem(item, routineId, session)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render routine item (checkbox)
   */
  renderRoutineItem(item, routineId, session) {
    const isCompleted = session.isItemCompleted(item.id);

    return `
      <div class="routine-item ${isCompleted ? 'completed' : ''}" data-item-id="${item.id}">
        <div class="d-flex align-items-start">
          <input type="checkbox"
                 class="form-check-input me-3"
                 id="item-${routineId}-${item.id}"
                 ${isCompleted ? 'checked' : ''}
                 onchange="app.toggleItem('${routineId}', '${item.id}', this)">
          <label class="form-check-label" for="item-${routineId}-${item.id}">
            <div>
              <strong>${item.description}</strong>
              ${item.duration ? `<span class="text-muted ms-2">(${item.duration} min)</span>` : ''}
            </div>
            ${item.skillRewards ? `
              <div class="rewards mt-2">
                ${Object.entries(item.skillRewards).map(([skill, xp]) => `
                  <span class="badge bg-secondary">+${xp} ${skill} XP</span>
                `).join('')}
              </div>
            ` : ''}
            ${item.notes ? `<div class="notes">${item.notes}</div>` : ''}
          </label>
        </div>
      </div>
    `;
  }

  /**
   * Render routine progress footer
   */
  renderRoutineProgress(progress, routine, session) {
    return `
      <div class="routine-footer">
        <div class="progress" style="height: 2rem;">
          <div class="progress-bar progress-bar-animated"
               role="progressbar"
               style="width: ${progress.percentage}%"
               aria-valuenow="${progress.percentage}"
               aria-valuemin="0"
               aria-valuemax="100">
            ${progress.percentage}%
          </div>
        </div>
        <p class="text-center mt-2 text-muted">
          ${progress.completed} / ${progress.total} tasks completed
        </p>
        ${session.status === 'completed' ? `
          <div class="text-center mt-3">
            <span class="badge bg-success p-3" style="font-size: 1.2rem;">
              🎉 Routine Completed! +${Object.values(session.xpEarned).reduce((a, b) => a + b, 0)} Total XP
            </span>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Update skill bar animation
   */
  updateSkillBar(skillType, skill, animationManager) {
    const skillBar = document.querySelector(`.skill-bar.${skillType}`);
    if (!skillBar) return;

    const progressBar = skillBar.querySelector('.progress-bar');
    const levelText = skillBar.querySelector('small:last-child');
    const xpText = skillBar.querySelector('small:last-child');

    // Animate progress bar
    const newProgress = skill.getProgressPercentage();
    animationManager.animateProgressBar(progressBar, parseInt(progressBar.style.width), newProgress);

    // Update text
    levelText.textContent = `Lv ${skill.level}`;
    xpText.textContent = `${skill.currentXP} / ${skill.getXPForNextLevel()} XP`;
  }

  /**
   * Update routine progress
   */
  updateRoutineProgress(routineId, progress) {
    const routineCard = document.getElementById(`routine-${routineId}`);
    if (!routineCard) return;

    const progressBar = routineCard.querySelector('.routine-footer .progress-bar');
    const progressText = routineCard.querySelector('.routine-footer p');

    if (progressBar) {
      progressBar.style.width = `${progress.percentage}%`;
      progressBar.setAttribute('aria-valuenow', progress.percentage);
      progressBar.textContent = `${progress.percentage}%`;
    }

    if (progressText) {
      progressText.textContent = `${progress.completed} / ${progress.total} tasks completed`;
    }
  }
}

/**
 * Main App Controller
 * Ties all components together
 */

import { User } from './models/User.js';
import { StorageManager } from './managers/StorageManager.js';
import { ThemeManager } from './managers/ThemeManager.js';
import { RoutineManager } from './managers/RoutineManager.js';
import { AchievementManager } from './managers/AchievementManager.js';
import { UIRenderer } from './ui/UIRenderer.js';
import { ModalManager } from './ui/ModalManager.js';
import { AnimationManager } from './ui/AnimationManager.js';

class App {
  constructor() {
    this.user = null;
    this.storageManager = new StorageManager();
    this.themeManager = new ThemeManager();
    this.routineManager = new RoutineManager(this.storageManager);
    this.achievementManager = new AchievementManager();
    this.uiRenderer = new UIRenderer();
    this.modalManager = new ModalManager();
    this.animationManager = new AnimationManager();

    this.routines = [];
    this.autosaveInterval = null;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('Initializing RUTINA...');

      // Initialize theme
      this.themeManager.init();

      // Load user data
      await this.loadUser();

      // Load routines
      await this.loadRoutines();

      // Render initial UI
      this.renderUI();

      // Setup event listeners
      this.setupEventListeners();

      // Start autosave
      this.startAutosave();

      console.log('RUTINA initialized successfully!');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
    }
  }

  /**
   * Load or create user
   */
  async loadUser() {
    const savedData = await this.storageManager.load();

    if (savedData) {
      this.user = User.fromJSON(savedData);
      this.achievementManager.restoreUnlocked(this.user.stats.achievements);
      console.log('User loaded from storage');
    } else {
      this.user = new User('Hunter');
      await this.saveUser();
      console.log('New user created');
    }
  }

  /**
   * Load all routines
   */
  async loadRoutines() {
    try {
      const routinePaths = [
        'routines/morning.json',
        'routines/evening.json'
      ];

      this.routines = await this.routineManager.loadRoutines(routinePaths);
      console.log(`Loaded ${this.routines.length} routines`);
    } catch (error) {
      console.error('Failed to load routines:', error);
      throw error;
    }
  }

  /**
   * Render all UI
   */
  renderUI() {
    this.uiRenderer.renderProfile(this.user);
    this.uiRenderer.renderRoutines(this.routines, this.routineManager, this.user);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.themeManager.toggle();
      });
    }

    // Stats button
    const statsButton = document.getElementById('stats-button');
    if (statsButton) {
      statsButton.addEventListener('click', () => {
        this.showStats();
      });
    }

    // Achievements button
    const achievementsButton = document.getElementById('achievements-button');
    if (achievementsButton) {
      achievementsButton.addEventListener('click', () => {
        this.showAchievements();
      });
    }
  }

  /**
   * Toggle routine item completion
   */
  toggleItem(routineId, itemId, checkbox) {
    try {
      if (checkbox.checked) {
        // Complete item
        const result = this.routineManager.completeItem(routineId, itemId, this.user);

        // Show XP gain animations
        if (result.xpResults && result.xpResults.length > 0) {
          for (const xpResult of result.xpResults) {
            if (xpResult.xpGained > 0) {
              this.animationManager.showXPGain(xpResult.xpGained, xpResult.skill, checkbox);

              // Check for level up
              if (xpResult.leveledUp) {
                const skill = this.user.skills[xpResult.skill];
                this.animationManager.showLevelUp(skill.name, xpResult.newLevel, this.modalManager);
              }

              // Update skill bar
              this.uiRenderer.updateSkillBar(xpResult.skill, this.user.skills[xpResult.skill], this.animationManager);
            }
          }
        }

        // Update progress
        const progress = this.routineManager.getProgress(routineId);
        this.uiRenderer.updateRoutineProgress(routineId, progress);

        // Check if routine completed
        if (result.isRoutineComplete) {
          this.onRoutineComplete(routineId);
        }

        // Check achievements
        this.checkAchievements();

      } else {
        // Uncomplete item
        this.routineManager.uncompleteItem(routineId, itemId);

        // Update progress
        const progress = this.routineManager.getProgress(routineId);
        this.uiRenderer.updateRoutineProgress(routineId, progress);
      }

      // Save data
      this.saveUser();

    } catch (error) {
      console.error('Error toggling item:', error);
      checkbox.checked = !checkbox.checked; // Revert checkbox
    }
  }

  /**
   * Handle routine completion
   */
  onRoutineComplete(routineId) {
    console.log(`Routine ${routineId} completed!`);
    this.animationManager.showConfetti();

    // Re-render to show completion badge
    this.renderUI();
  }

  /**
   * Check for newly unlocked achievements
   */
  checkAchievements() {
    const newAchievements = this.achievementManager.checkAchievements(this.user);

    for (const achievement of newAchievements) {
      this.animationManager.showAchievementUnlock(achievement, this.modalManager);
    }

    if (newAchievements.length > 0) {
      this.saveUser();
    }
  }

  /**
   * Show skill details modal
   */
  showSkillDetails(skillType) {
    const skill = this.user.skills[skillType];
    if (skill) {
      this.modalManager.showSkillDetails(skill);
    }
  }

  /**
   * Prestige a skill
   */
  prestigeSkill(skillType) {
    const skill = this.user.skills[skillType];

    if (skill.level < 100) {
      alert('Must be level 100 to prestige!');
      return;
    }

    this.modalManager.showConfirm(
      'Prestige Skill',
      `Are you sure you want to prestige ${skill.name}? You will reset to level 1 but gain +5% permanent XP bonus.`,
      () => {
        const result = skill.prestige();
        this.animationManager.showConfetti();
        this.renderUI();
        this.saveUser();

        setTimeout(() => {
          alert(`Congratulations! ${skill.name} prestiged to level ${result.prestigeLevel}!\nNew XP multiplier: ${(result.multiplier * 100).toFixed(0)}%`);
        }, 500);
      }
    );
  }

  /**
   * Show stats modal
   */
  showStats() {
    this.modalManager.showStats(this.user, this.achievementManager);
  }

  /**
   * Show achievements modal
   */
  showAchievements() {
    this.modalManager.showAchievements(this.achievementManager);
  }

  /**
   * Save user data
   */
  async saveUser() {
    try {
      // Collect all active sessions
      const sessions = [];
      for (const routine of this.routines) {
        const session = this.routineManager.getSession(routine.id);
        sessions.push({ routineId: routine.id, session });
      }

      await this.storageManager.save(this.user, sessions);
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  /**
   * Start autosave timer
   */
  startAutosave(intervalMs = 30000) {
    if (this.autosaveInterval) {
      clearInterval(this.autosaveInterval);
    }

    this.autosaveInterval = setInterval(() => {
      this.saveUser();
      console.log('Autosaved');
    }, intervalMs);
  }

  /**
   * Show error message
   */
  showError(message) {
    this.modalManager.show('Error', `<p class="text-danger">${message}</p>`);
  }

  /**
   * Export user data as JSON
   */
  exportData() {
    const data = this.storageManager.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rutina-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Import user data from JSON
   */
  importData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        this.storageManager.importData(data);
        location.reload();
      } catch (error) {
        this.showError('Invalid backup file');
      }
    };
    reader.readAsText(file);
  }
}

// Initialize app when DOM is ready
const app = new App();

document.addEventListener('DOMContentLoaded', () => {
  app.init();
});

// Expose app to window for onclick handlers
window.app = app;

export default app;

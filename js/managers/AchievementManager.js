/**
 * AchievementManager
 * Handles achievement unlocking and tracking
 */

import { Achievement, ACHIEVEMENTS } from '../models/Achievement.js';

export class AchievementManager {
  constructor() {
    this.achievements = new Map();
    this.initializeAchievements();
  }

  /**
   * Initialize all achievements
   */
  initializeAchievements() {
    for (const data of ACHIEVEMENTS) {
      const achievement = new Achievement(
        data.id,
        data.name,
        data.description,
        data.icon,
        data.condition
      );
      this.achievements.set(data.id, achievement);
    }
  }

  /**
   * Check all achievements and unlock newly achieved ones
   * @returns {Array} - Array of newly unlocked achievements
   */
  checkAchievements(user) {
    const newlyUnlocked = [];

    for (const achievement of this.achievements.values()) {
      // Skip if already unlocked
      if (achievement.isUnlocked()) continue;

      // Check condition
      if (achievement.condition(user)) {
        achievement.unlock();
        user.unlockAchievement(achievement.id);
        newlyUnlocked.push(achievement);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Get achievement by ID
   */
  getAchievement(achievementId) {
    return this.achievements.get(achievementId);
  }

  /**
   * Get all achievements
   */
  getAllAchievements() {
    return Array.from(this.achievements.values());
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements() {
    return this.getAllAchievements().filter(a => a.isUnlocked());
  }

  /**
   * Get locked achievements
   */
  getLockedAchievements() {
    return this.getAllAchievements().filter(a => !a.isUnlocked());
  }

  /**
   * Get unlock percentage
   */
  getUnlockPercentage() {
    const total = this.achievements.size;
    const unlocked = this.getUnlockedAchievements().length;
    return Math.floor((unlocked / total) * 100);
  }

  /**
   * Restore unlocked achievements from user data
   */
  restoreUnlocked(unlockedIds) {
    for (const id of unlockedIds) {
      const achievement = this.achievements.get(id);
      if (achievement && !achievement.isUnlocked()) {
        achievement.unlock();
      }
    }
  }

  /**
   * Get achievements by category
   */
  getAchievementsByCategory() {
    const categories = {
      streak: [],
      routine: [],
      skill: [],
      xp: [],
      task: [],
      prestige: [],
      other: []
    };

    for (const achievement of this.achievements.values()) {
      if (achievement.id.startsWith('streak-')) {
        categories.streak.push(achievement);
      } else if (achievement.id.startsWith('routine-')) {
        categories.routine.push(achievement);
      } else if (achievement.id.includes('skill') || achievement.id.includes('prestige')) {
        categories.skill.push(achievement);
      } else if (achievement.id.startsWith('xp-')) {
        categories.xp.push(achievement);
      } else if (achievement.id.startsWith('tasks-')) {
        categories.task.push(achievement);
      } else {
        categories.other.push(achievement);
      }
    }

    return categories;
  }
}

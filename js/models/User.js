/**
 * User Class
 * Represents the player with skills, stats, and progression
 */

import { Skill } from './Skill.js';

export class User {
  constructor(username = 'Hunter') {
    this.username = username;
    this.createdAt = new Date().toISOString();
    this.lastActive = new Date().toISOString();

    // Initialize all 6 skills
    this.skills = {
      physical: new Skill('Physical', '💪', 'physical'),
      mental: new Skill('Mental', '🧠', 'mental'),
      discipline: new Skill('Discipline', '🎯', 'discipline'),
      productivity: new Skill('Productivity', '⚡', 'productivity'),
      logic: new Skill('Logic', '🧩', 'logic'),
      coding: new Skill('Coding', '💻', 'coding')
    };

    // Streak tracking
    this.streak = {
      current: 0,
      longest: 0,
      lastCompleted: null
    };

    // Stats
    this.stats = {
      totalRoutinesCompleted: 0,
      totalTasksCompleted: 0,
      totalXPEarned: 0,
      achievements: []
    };
  }

  /**
   * Streak bonus tiers
   */
  static STREAK_BONUSES = [
    { days: 5, bonus: 0.05, name: '5 Day Streak' },
    { days: 7, bonus: 0.10, name: '7 Day Streak' },
    { days: 15, bonus: 0.15, name: '2 Week Streak' },
    { days: 25, bonus: 0.20, name: '25 Day Streak' },
    { days: 50, bonus: 0.30, name: '50 Day Streak' },
    { days: 100, bonus: 0.50, name: '100 Day Streak' }
  ];

  /**
   * Get current streak bonus multiplier
   */
  getStreakBonus() {
    let bonus = 0;
    for (const tier of User.STREAK_BONUSES) {
      if (this.streak.current >= tier.days) {
        bonus = tier.bonus;
      }
    }
    return bonus;
  }

  /**
   * Get active streak tier name
   */
  getStreakTierName() {
    for (let i = User.STREAK_BONUSES.length - 1; i >= 0; i--) {
      if (this.streak.current >= User.STREAK_BONUSES[i].days) {
        return User.STREAK_BONUSES[i].name;
      }
    }
    return null;
  }

  /**
   * Update streak based on routine completion
   */
  updateStreak() {
    const today = new Date().toDateString();
    const lastCompleted = this.streak.lastCompleted
      ? new Date(this.streak.lastCompleted).toDateString()
      : null;

    // First completion or continuing streak
    if (!lastCompleted) {
      this.streak.current = 1;
    } else if (lastCompleted !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastCompleted === yesterdayStr) {
        // Continuing streak
        this.streak.current++;
      } else {
        // Streak broken
        this.streak.current = 1;
      }
    }
    // If already completed today, don't change streak

    this.streak.lastCompleted = new Date().toISOString();

    // Update longest streak
    if (this.streak.current > this.streak.longest) {
      this.streak.longest = this.streak.current;
    }

    return this.streak.current;
  }

  /**
   * Add XP to specific skill
   * @param {string} skillType - Type of skill (physical, mental, etc.)
   * @param {number} xp - Amount of XP to add
   */
  addSkillXP(skillType, xp) {
    if (!this.skills[skillType]) {
      console.warn(`Skill type "${skillType}" not found`);
      return null;
    }

    const streakBonus = this.getStreakBonus();
    const result = this.skills[skillType].addXP(xp, streakBonus);

    this.stats.totalXPEarned += result.xpGained;
    this.lastActive = new Date().toISOString();

    return {
      skill: skillType,
      ...result,
      streakBonus: streakBonus
    };
  }

  /**
   * Add XP from routine item rewards
   * @param {object} skillRewards - Object with skill types and XP amounts
   * @returns {array} - Array of skill level up results
   */
  addRoutineRewards(skillRewards) {
    const results = [];

    for (const [skillType, xp] of Object.entries(skillRewards)) {
      const result = this.addSkillXP(skillType, xp);
      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Complete a routine task
   */
  completeTask() {
    this.stats.totalTasksCompleted++;
    this.lastActive = new Date().toISOString();
  }

  /**
   * Complete an entire routine
   */
  completeRoutine() {
    this.stats.totalRoutinesCompleted++;
    this.updateStreak();
    this.lastActive = new Date().toISOString();
  }

  /**
   * Unlock an achievement
   */
  unlockAchievement(achievementId) {
    if (!this.stats.achievements.includes(achievementId)) {
      this.stats.achievements.push(achievementId);
      return true;
    }
    return false;
  }

  /**
   * Get total level across all skills
   */
  getTotalLevel() {
    return Object.values(this.skills).reduce((sum, skill) => sum + skill.level, 0);
  }

  /**
   * Get average skill level
   */
  getAverageLevel() {
    const totalLevels = this.getTotalLevel();
    return Math.floor(totalLevels / Object.keys(this.skills).length);
  }

  /**
   * Serialize user data
   */
  toJSON() {
    return {
      username: this.username,
      createdAt: this.createdAt,
      lastActive: this.lastActive,
      skills: Object.fromEntries(
        Object.entries(this.skills).map(([key, skill]) => [key, skill.toJSON()])
      ),
      streak: this.streak,
      stats: this.stats
    };
  }

  /**
   * Create User from saved data
   */
  static fromJSON(data) {
    const user = new User(data.username);
    user.createdAt = data.createdAt;
    user.lastActive = data.lastActive;

    // Restore skills
    for (const [key, skillData] of Object.entries(data.skills)) {
      user.skills[key] = Skill.fromJSON(skillData);
    }

    user.streak = data.streak || { current: 0, longest: 0, lastCompleted: null };
    user.stats = data.stats || {
      totalRoutinesCompleted: 0,
      totalTasksCompleted: 0,
      totalXPEarned: 0,
      achievements: []
    };

    return user;
  }
}

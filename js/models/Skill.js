/**
 * Skill Class
 * Represents a player skill with leveling, prestige, and XP tracking
 */

export class Skill {
  constructor(name, icon, type) {
    this.name = name;
    this.icon = icon;
    this.type = type;
    this.level = 1;
    this.currentXP = 0;
    this.totalXP = 0;
    this.prestige = 0;
  }

  /**
   * Level Tier System
   */
  static LEVEL_TIERS = {
    BEGINNER: { min: 1, max: 10, name: 'Beginner' },
    NOVICE: { min: 11, max: 25, name: 'Novice' },
    INTERMEDIATE: { min: 26, max: 50, name: 'Intermediate' },
    ADVANCED: { min: 51, max: 75, name: 'Advanced' },
    EXPERT: { min: 76, max: 99, name: 'Expert' },
    MASTER: { min: 100, max: 100, name: 'Master' }
  };

  /**
   * Get current tier based on level
   */
  getTier() {
    for (const [key, tier] of Object.entries(Skill.LEVEL_TIERS)) {
      if (this.level >= tier.min && this.level <= tier.max) {
        return tier.name;
      }
    }
    return 'Beginner';
  }

  /**
   * Calculate XP required for next level
   * Formula: baseXP * level^1.5
   */
  getXPForNextLevel() {
    if (this.level >= 100) return 0; // Max level
    const baseXP = 100;
    return Math.floor(baseXP * Math.pow(this.level, 1.5));
  }

  /**
   * Get prestige XP multiplier
   * +5% per prestige level
   */
  getPrestigeMultiplier() {
    return 1 + (this.prestige * 0.05);
  }

  /**
   * Add XP with prestige multiplier
   * @param {number} xp - Raw XP to add
   * @param {number} streakBonus - Streak bonus percentage (0-1)
   * @returns {object} - { leveledUp: boolean, newLevel: number }
   */
  addXP(xp, streakBonus = 0) {
    const prestigeMultiplier = this.getPrestigeMultiplier();
    const totalMultiplier = prestigeMultiplier * (1 + streakBonus);
    const adjustedXP = Math.floor(xp * totalMultiplier);

    this.currentXP += adjustedXP;
    this.totalXP += adjustedXP;

    let leveledUp = false;
    let newLevel = this.level;

    // Check for level ups
    while (this.currentXP >= this.getXPForNextLevel() && this.level < 100) {
      this.currentXP -= this.getXPForNextLevel();
      this.level++;
      leveledUp = true;
      newLevel = this.level;
    }

    return { leveledUp, newLevel, xpGained: adjustedXP };
  }

  /**
   * Prestige the skill (reset to level 1, increase prestige)
   */
  prestige() {
    if (this.level < 100) {
      throw new Error('Must be level 100 to prestige');
    }

    this.level = 1;
    this.currentXP = 0;
    this.prestige++;

    return {
      prestigeLevel: this.prestige,
      multiplier: this.getPrestigeMultiplier()
    };
  }

  /**
   * Get progress percentage to next level
   */
  getProgressPercentage() {
    if (this.level >= 100) return 100;
    const xpNeeded = this.getXPForNextLevel();
    return Math.floor((this.currentXP / xpNeeded) * 100);
  }

  /**
   * Get skill data for serialization
   */
  toJSON() {
    return {
      name: this.name,
      icon: this.icon,
      type: this.type,
      level: this.level,
      currentXP: this.currentXP,
      totalXP: this.totalXP,
      prestige: this.prestige,
      tier: this.getTier(),
      progressPercentage: this.getProgressPercentage(),
      xpForNextLevel: this.getXPForNextLevel()
    };
  }

  /**
   * Create Skill from saved data
   */
  static fromJSON(data) {
    const skill = new Skill(data.name, data.icon, data.type);
    skill.level = data.level || 1;
    skill.currentXP = data.currentXP || 0;
    skill.totalXP = data.totalXP || 0;
    skill.prestige = data.prestige || 0;
    return skill;
  }
}

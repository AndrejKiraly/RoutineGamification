/**
 * Achievement Class
 * Defines achievements and tracks unlock conditions
 */

export class Achievement {
  constructor(id, name, description, icon, condition) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.condition = condition; // Function that checks if achievement is unlocked
    this.unlockedAt = null;
  }

  /**
   * Check if achievement is unlocked
   */
  isUnlocked() {
    return this.unlockedAt !== null;
  }

  /**
   * Unlock the achievement
   */
  unlock() {
    if (!this.isUnlocked()) {
      this.unlockedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  /**
   * Serialize achievement data
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      icon: this.icon,
      unlockedAt: this.unlockedAt
    };
  }
}

/**
 * Predefined Achievements
 */
export const ACHIEVEMENTS = [
  // First Steps
  {
    id: 'first-routine',
    name: 'First Steps',
    description: 'Complete your first routine',
    icon: '🎯',
    condition: (user) => user.stats.totalRoutinesCompleted >= 1
  },
  {
    id: 'first-task',
    name: 'Getting Started',
    description: 'Complete your first task',
    icon: '✅',
    condition: (user) => user.stats.totalTasksCompleted >= 1
  },

  // Streak Achievements
  {
    id: 'streak-5',
    name: 'Consistent',
    description: 'Maintain a 5-day streak',
    icon: '🔥',
    condition: (user) => user.streak.current >= 5
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🔥',
    condition: (user) => user.streak.current >= 7
  },
  {
    id: 'streak-15',
    name: 'Two Weeks Strong',
    description: 'Maintain a 15-day streak',
    icon: '🔥🔥',
    condition: (user) => user.streak.current >= 15
  },
  {
    id: 'streak-25',
    name: 'Dedicated',
    description: 'Maintain a 25-day streak',
    icon: '🔥🔥',
    condition: (user) => user.streak.current >= 25
  },
  {
    id: 'streak-100',
    name: 'Unstoppable',
    description: 'Maintain a 100-day streak',
    icon: '🔥🔥🔥',
    condition: (user) => user.streak.current >= 100
  },
  {
    id: 'streak-1000',
    name: 'Legend',
    description: 'Maintain a 1000-day streak',
    icon: '🔥🔥🔥🔥🔥',
    condition: (user) => user.streak.current >= 1000
  },

  // Routine Completions
  {
    id: 'routine-10',
    name: 'Building Habits',
    description: 'Complete 10 routines',
    icon: '📈',
    condition: (user) => user.stats.totalRoutinesCompleted >= 10
  },
  {
    id: 'routine-25',
    name: 'Habit Master',
    description: 'Complete 25 routines',
    icon: '📈',
    condition: (user) => user.stats.totalRoutinesCompleted >= 25
  },
  {
    id: 'routine-50',
    name: 'Routine Expert',
    description: 'Complete 50 routines',
    icon: '🏆',
    condition: (user) => user.stats.totalRoutinesCompleted >= 50
  },
  {
    id: 'routine-100',
    name: 'Century',
    description: 'Complete 100 routines',
    icon: '🏆',
    condition: (user) => user.stats.totalRoutinesCompleted >= 100
  },

  // Skill Level Achievements
  {
    id: 'skill-level-10',
    name: 'Novice',
    description: 'Reach level 10 in any skill',
    icon: '⭐',
    condition: (user) => Object.values(user.skills).some(s => s.level >= 10)
  },
  {
    id: 'skill-level-25',
    name: 'Skilled',
    description: 'Reach level 25 in any skill',
    icon: '⭐⭐',
    condition: (user) => Object.values(user.skills).some(s => s.level >= 25)
  },
  {
    id: 'skill-level-50',
    name: 'Advanced',
    description: 'Reach level 50 in any skill',
    icon: '⭐⭐⭐',
    condition: (user) => Object.values(user.skills).some(s => s.level >= 50)
  },
  {
    id: 'skill-level-75',
    name: 'Expert',
    description: 'Reach level 75 in any skill',
    icon: '🌟',
    condition: (user) => Object.values(user.skills).some(s => s.level >= 75)
  },
  {
    id: 'skill-level-100',
    name: 'Mastery',
    description: 'Reach level 100 in any skill',
    icon: '💎',
    condition: (user) => Object.values(user.skills).some(s => s.level >= 100)
  },

  // All Skills
  {
    id: 'all-skills-10',
    name: 'Well Rounded',
    description: 'Reach level 10 in all skills',
    icon: '🎯',
    condition: (user) => Object.values(user.skills).every(s => s.level >= 10)
  },
  {
    id: 'all-skills-25',
    name: 'Balanced',
    description: 'Reach level 25 in all skills',
    icon: '⚖️',
    condition: (user) => Object.values(user.skills).every(s => s.level >= 25)
  },
  {
    id: 'all-skills-50',
    name: 'Renaissance',
    description: 'Reach level 50 in all skills',
    icon: '👑',
    condition: (user) => Object.values(user.skills).every(s => s.level >= 50)
  },

  // Prestige
  {
    id: 'first-prestige',
    name: 'New Game+',
    description: 'Prestige a skill for the first time',
    icon: '🌠',
    condition: (user) => Object.values(user.skills).some(s => s.prestige >= 1)
  },
  {
    id: 'prestige-5',
    name: 'Eternal Student',
    description: 'Reach prestige 5 in any skill',
    icon: '♾️',
    condition: (user) => Object.values(user.skills).some(s => s.prestige >= 5)
  },

  // XP Milestones
  {
    id: 'xp-1000',
    name: 'XP Collector',
    description: 'Earn 1,000 total XP',
    icon: '💫',
    condition: (user) => user.stats.totalXPEarned >= 1000
  },
  {
    id: 'xp-10000',
    name: 'XP Hoarder',
    description: 'Earn 10,000 total XP',
    icon: '✨',
    condition: (user) => user.stats.totalXPEarned >= 10000
  },
  {
    id: 'xp-50000',
    name: 'XP Master',
    description: 'Earn 50,000 total XP',
    icon: '🌟',
    condition: (user) => user.stats.totalXPEarned >= 50000
  },

  // Tasks
  {
    id: 'tasks-100',
    name: 'Task Warrior',
    description: 'Complete 100 tasks',
    icon: '⚔️',
    condition: (user) => user.stats.totalTasksCompleted >= 100
  },
  {
    id: 'tasks-500',
    name: 'Task Champion',
    description: 'Complete 500 tasks',
    icon: '🏅',
    condition: (user) => user.stats.totalTasksCompleted >= 500
  },
  {
    id: 'tasks-1000',
    name: 'Task Legend',
    description: 'Complete 1,000 tasks',
    icon: '👑',
    condition: (user) => user.stats.totalTasksCompleted >= 1000
  }
];
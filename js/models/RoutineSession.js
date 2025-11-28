/**
 * RoutineSession Class
 * Tracks completion state of a routine instance
 */

export class RoutineSession {
  constructor(routine, date = null) {
    this.routineId = routine.id;
    this.date = date || new Date().toISOString();
    this.startedAt = null;
    this.completedAt = null;
    this.status = 'not_started'; // not_started, in_progress, completed

    // Track which items are completed
    this.completedItems = new Set();

    // Track XP earned in this session
    this.xpEarned = {};
  }

  /**
   * Start the routine session
   */
  start() {
    if (this.status === 'not_started') {
      this.startedAt = new Date().toISOString();
      this.status = 'in_progress';
    }
  }

  /**
   * Mark an item as completed
   */
  completeItem(itemId, skillRewards) {
    if (!this.completedItems.has(itemId)) {
      this.completedItems.add(itemId);

      // Track XP earned
      if (skillRewards) {
        for (const [skill, xp] of Object.entries(skillRewards)) {
          this.xpEarned[skill] = (this.xpEarned[skill] || 0) + xp;
        }
      }

      // Auto-start session if first item
      if (this.status === 'not_started') {
        this.start();
      }
    }
  }

  /**
   * Mark an item as incomplete
   */
  uncompleteItem(itemId, skillRewards) {
    if (this.completedItems.has(itemId)) {
      this.completedItems.delete(itemId);

      // Subtract XP
      if (skillRewards) {
        for (const [skill, xp] of Object.entries(skillRewards)) {
          this.xpEarned[skill] = (this.xpEarned[skill] || 0) - xp;
          if (this.xpEarned[skill] <= 0) {
            delete this.xpEarned[skill];
          }
        }
      }
    }
  }

  /**
   * Check if item is completed
   */
  isItemCompleted(itemId) {
    return this.completedItems.has(itemId);
  }

  /**
   * Get completion progress
   */
  getProgress(routine) {
    const totalItems = routine.getTotalItemCount();
    const completedCount = this.completedItems.size;
    return {
      completed: completedCount,
      total: totalItems,
      percentage: totalItems > 0 ? Math.floor((completedCount / totalItems) * 100) : 0
    };
  }

  /**
   * Check if routine is fully completed
   */
  isComplete(routine) {
    const totalItems = routine.getTotalItemCount();
    return this.completedItems.size === totalItems;
  }

  /**
   * Complete the entire routine
   */
  complete() {
    if (this.status !== 'completed') {
      this.completedAt = new Date().toISOString();
      this.status = 'completed';
    }
  }

  /**
   * Get session duration in minutes
   */
  getDuration() {
    if (!this.startedAt) return 0;

    const endTime = this.completedAt ? new Date(this.completedAt) : new Date();
    const startTime = new Date(this.startedAt);
    const durationMs = endTime - startTime;
    return Math.floor(durationMs / 1000 / 60); // Convert to minutes
  }

  /**
   * Reset the session
   */
  reset() {
    this.startedAt = null;
    this.completedAt = null;
    this.status = 'not_started';
    this.completedItems.clear();
    this.xpEarned = {};
  }

  /**
   * Serialize session data
   */
  toJSON() {
    return {
      routineId: this.routineId,
      date: this.date,
      startedAt: this.startedAt,
      completedAt: this.completedAt,
      status: this.status,
      completedItems: Array.from(this.completedItems),
      xpEarned: this.xpEarned
    };
  }

  /**
   * Create RoutineSession from saved data
   */
  static fromJSON(data, routine) {
    const session = new RoutineSession(routine, data.date);
    session.startedAt = data.startedAt;
    session.completedAt = data.completedAt;
    session.status = data.status || 'not_started';
    session.completedItems = new Set(data.completedItems || []);
    session.xpEarned = data.xpEarned || {};
    return session;
  }
}

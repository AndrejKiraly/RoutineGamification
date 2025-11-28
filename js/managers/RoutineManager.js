/**
 * RoutineManager
 * Manages routines and their sessions
 */

import { Routine } from '../models/Routine.js';
import { RoutineSession } from '../models/RoutineSession.js';

export class RoutineManager {
  constructor(storageManager) {
    this.storageManager = storageManager;
    this.routines = new Map();
    this.sessions = new Map();
  }

  /**
   * Load a routine from JSON file
   */
  async loadRoutine(filepath) {
    try {
      const routine = await Routine.loadFromFile(filepath);
      this.routines.set(routine.id, routine);
      return routine;
    } catch (error) {
      console.error(`Failed to load routine from ${filepath}:`, error);
      throw error;
    }
  }

  /**
   * Load multiple routines
   */
  async loadRoutines(filepaths) {
    const promises = filepaths.map(path => this.loadRoutine(path));
    return Promise.all(promises);
  }

  /**
   * Get routine by ID
   */
  getRoutine(routineId) {
    return this.routines.get(routineId);
  }

  /**
   * Get all loaded routines
   */
  getAllRoutines() {
    return Array.from(this.routines.values());
  }

  /**
   * Get or create session for a routine
   */
  getSession(routineId, date = null) {
    const routine = this.getRoutine(routineId);
    if (!routine) {
      throw new Error(`Routine ${routineId} not found`);
    }

    const dateStr = date ? new Date(date).toDateString() : new Date().toDateString();
    const sessionKey = `${routineId}_${dateStr}`;

    // Check if session exists in memory
    if (this.sessions.has(sessionKey)) {
      return this.sessions.get(sessionKey);
    }

    // Try to load from storage
    const savedSession = this.storageManager.loadSessionLocal(routineId, date);
    if (savedSession) {
      const session = RoutineSession.fromJSON(savedSession, routine);
      this.sessions.set(sessionKey, session);
      return session;
    }

    // Create new session
    const newSession = new RoutineSession(routine, date);
    this.sessions.set(sessionKey, newSession);
    return newSession;
  }

  /**
   * Save session to storage
   */
  saveSession(routineId, session) {
    const dateStr = new Date(session.date).toDateString();
    const sessionKey = `${routineId}_${dateStr}`;
    this.sessions.set(sessionKey, session);
    this.storageManager.saveSessionLocal(routineId, session);
  }

  /**
   * Complete an item in a routine session
   */
  completeItem(routineId, itemId, user) {
    const routine = this.getRoutine(routineId);
    const session = this.getSession(routineId);
    const item = routine.getItem(itemId);

    if (!item) {
      console.error(`Item ${itemId} not found in routine ${routineId}`);
      return null;
    }

    // Mark item as completed
    session.completeItem(itemId, item.skillRewards);

    // Award XP to user
    const xpResults = user.addRoutineRewards(item.skillRewards || {});

    // Complete task stat
    user.completeTask();

    // Check if routine is complete
    if (session.isComplete(routine)) {
      session.complete();
      user.completeRoutine();
    }

    // Save session
    this.saveSession(routineId, session);

    return {
      item,
      xpResults,
      session,
      isRoutineComplete: session.isComplete(routine)
    };
  }

  /**
   * Uncomplete an item in a routine session
   */
  uncompleteItem(routineId, itemId) {
    const routine = this.getRoutine(routineId);
    const session = this.getSession(routineId);
    const item = routine.getItem(itemId);

    if (!item) {
      console.error(`Item ${itemId} not found in routine ${routineId}`);
      return null;
    }

    // Mark item as uncompleted
    session.uncompleteItem(itemId, item.skillRewards);

    // Save session
    this.saveSession(routineId, session);

    return {
      item,
      session
    };
  }

  /**
   * Get progress for a routine session
   */
  getProgress(routineId, date = null) {
    const routine = this.getRoutine(routineId);
    const session = this.getSession(routineId, date);
    return session.getProgress(routine);
  }

  /**
   * Reset a routine session
   */
  resetSession(routineId, date = null) {
    const session = this.getSession(routineId, date);
    session.reset();
    this.saveSession(routineId, session);
    return session;
  }

  /**
   * Get completion history for a routine
   */
  getCompletionHistory(routineId, days = 7) {
    const history = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const session = this.getSession(routineId, date);
      const routine = this.getRoutine(routineId);

      history.push({
        date: date.toDateString(),
        completed: session.status === 'completed',
        progress: session.getProgress(routine)
      });
    }

    return history.reverse();
  }
}

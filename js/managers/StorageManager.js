/**
 * StorageManager
 * Handles data persistence using LocalStorage and Firebase
 */

export class StorageManager {
  constructor() {
    this.storageKey = 'rutina_user_data';
    this.sessionKey = 'rutina_sessions';
    this.firebaseEnabled = false;
    this.db = null;
    this.auth = null;
  }

  /**
   * Initialize Firebase (optional)
   */
  async initializeFirebase(firebaseConfig) {
    try {
      // Import Firebase SDK dynamically
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const { getAuth } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
      const { getFirestore } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const app = initializeApp(firebaseConfig);
      this.auth = getAuth(app);
      this.db = getFirestore(app);
      this.firebaseEnabled = true;

      console.log('Firebase initialized successfully');
      return true;
    } catch (error) {
      console.warn('Firebase initialization failed, using LocalStorage only:', error);
      this.firebaseEnabled = false;
      return false;
    }
  }

  /**
   * Save user data to LocalStorage
   */
  saveUserLocal(user) {
    try {
      const data = user.toJSON();
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving user to LocalStorage:', error);
      return false;
    }
  }

  /**
   * Load user data from LocalStorage
   */
  loadUserLocal() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading user from LocalStorage:', error);
      return null;
    }
  }

  /**
   * Save session data to LocalStorage
   */
  saveSessionLocal(routineId, session) {
    try {
      const sessions = this.loadAllSessionsLocal();
      const today = new Date().toDateString();
      const key = `${routineId}_${today}`;
      sessions[key] = session.toJSON();
      localStorage.setItem(this.sessionKey, JSON.stringify(sessions));
      return true;
    } catch (error) {
      console.error('Error saving session to LocalStorage:', error);
      return false;
    }
  }

  /**
   * Load session data from LocalStorage
   */
  loadSessionLocal(routineId, date = null) {
    try {
      const sessions = this.loadAllSessionsLocal();
      const dateStr = date ? new Date(date).toDateString() : new Date().toDateString();
      const key = `${routineId}_${dateStr}`;
      return sessions[key] || null;
    } catch (error) {
      console.error('Error loading session from LocalStorage:', error);
      return null;
    }
  }

  /**
   * Load all sessions from LocalStorage
   */
  loadAllSessionsLocal() {
    try {
      const data = localStorage.getItem(this.sessionKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error loading sessions from LocalStorage:', error);
      return {};
    }
  }

  /**
   * Clear all LocalStorage data
   */
  clearLocal() {
    try {
      localStorage.removeItem(this.storageKey);
      localStorage.removeItem(this.sessionKey);
      return true;
    } catch (error) {
      console.error('Error clearing LocalStorage:', error);
      return false;
    }
  }

  /**
   * Save user data to Firebase (if enabled and authenticated)
   */
  async saveUserFirebase(user) {
    if (!this.firebaseEnabled || !this.auth?.currentUser) {
      return false;
    }

    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const userRef = doc(this.db, 'users', this.auth.currentUser.uid);
      await setDoc(userRef, user.toJSON());
      return true;
    } catch (error) {
      console.error('Error saving user to Firebase:', error);
      return false;
    }
  }

  /**
   * Load user data from Firebase (if enabled and authenticated)
   */
  async loadUserFirebase() {
    if (!this.firebaseEnabled || !this.auth?.currentUser) {
      return null;
    }

    try {
      const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const userRef = doc(this.db, 'users', this.auth.currentUser.uid);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error('Error loading user from Firebase:', error);
      return null;
    }
  }

  /**
   * Save session to Firebase
   */
  async saveSessionFirebase(routineId, session) {
    if (!this.firebaseEnabled || !this.auth?.currentUser) {
      return false;
    }

    try {
      const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
      const userId = this.auth.currentUser.uid;
      const today = new Date().toDateString();
      const sessionRef = doc(this.db, `users/${userId}/sessions/${routineId}_${today}`);
      await setDoc(sessionRef, session.toJSON());
      return true;
    } catch (error) {
      console.error('Error saving session to Firebase:', error);
      return false;
    }
  }

  /**
   * Auto-save with both LocalStorage and Firebase
   */
  async save(user, sessions = []) {
    // Always save to LocalStorage
    this.saveUserLocal(user);

    for (const { routineId, session } of sessions) {
      this.saveSessionLocal(routineId, session);
    }

    // Try Firebase if enabled
    if (this.firebaseEnabled && this.auth?.currentUser) {
      await this.saveUserFirebase(user);
      for (const { routineId, session } of sessions) {
        await this.saveSessionFirebase(routineId, session);
      }
    }
  }

  /**
   * Load data (prefer Firebase, fallback to LocalStorage)
   */
  async load() {
    // Try Firebase first if enabled
    if (this.firebaseEnabled && this.auth?.currentUser) {
      const firebaseData = await this.loadUserFirebase();
      if (firebaseData) {
        return firebaseData;
      }
    }

    // Fallback to LocalStorage
    return this.loadUserLocal();
  }

  /**
   * Export all data as JSON
   */
  exportData() {
    return {
      user: this.loadUserLocal(),
      sessions: this.loadAllSessionsLocal(),
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import data from JSON
   */
  importData(data) {
    try {
      if (data.user) {
        localStorage.setItem(this.storageKey, JSON.stringify(data.user));
      }
      if (data.sessions) {
        localStorage.setItem(this.sessionKey, JSON.stringify(data.sessions));
      }
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

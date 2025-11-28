/**
 * ThemeManager
 * Handles dark/light theme switching
 */

export class ThemeManager {
  constructor() {
    this.currentTheme = 'dark'; // Default theme
    this.storageKey = 'rutina_theme';
  }

  /**
   * Initialize theme from localStorage
   */
  init() {
    const savedTheme = localStorage.getItem(this.storageKey);
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Check user's system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.storageKey)) {
        // Only auto-switch if user hasn't manually set a preference
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);

    // Update theme toggle button icon
    this.updateToggleButton();
  }

  /**
   * Toggle between dark and light theme
   */
  toggle() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
    return newTheme;
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.currentTheme;
  }

  /**
   * Update theme toggle button UI
   */
  updateToggleButton() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (toggleBtn) {
      toggleBtn.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
      toggleBtn.setAttribute('aria-label',
        this.currentTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  /**
   * Check if dark mode is active
   */
  isDarkMode() {
    return this.currentTheme === 'dark';
  }
}

/**
 * Routine Class
 * Represents a daily routine loaded from JSON
 */

export class Routine {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.type = data.type;
    this.icon = data.icon;
    this.startTime = data.startTime;
    this.totalDuration = data.totalDuration;
    this.skillRewards = data.skillRewards || {};
    this.sections = data.sections || [];
  }

  /**
   * Get all items from all sections as flat array
   */
  getAllItems() {
    const items = [];
    for (const section of this.sections) {
      for (const item of section.items) {
        items.push({
          ...item,
          sectionId: section.id,
          sectionName: section.name
        });
      }
    }
    return items;
  }

  /**
   * Get total number of items
   */
  getTotalItemCount() {
    return this.getAllItems().length;
  }

  /**
   * Get total possible XP from routine
   */
  getTotalXP() {
    const xpTotals = {};
    const items = this.getAllItems();

    for (const item of items) {
      if (item.skillRewards) {
        for (const [skill, xp] of Object.entries(item.skillRewards)) {
          xpTotals[skill] = (xpTotals[skill] || 0) + xp;
        }
      }
    }

    return xpTotals;
  }

  /**
   * Get end time based on start time and duration
   */
  getEndTime() {
    if (!this.startTime) return null;

    const [hours, minutes] = this.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + this.totalDuration;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;

    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }

  /**
   * Get section by ID
   */
  getSection(sectionId) {
    return this.sections.find(s => s.id === sectionId);
  }

  /**
   * Get item by ID
   */
  getItem(itemId) {
    for (const section of this.sections) {
      const item = section.items.find(i => i.id === itemId);
      if (item) {
        return {
          ...item,
          sectionId: section.id,
          sectionName: section.name
        };
      }
    }
    return null;
  }

  /**
   * Serialize routine data
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      icon: this.icon,
      startTime: this.startTime,
      totalDuration: this.totalDuration,
      skillRewards: this.skillRewards,
      sections: this.sections
    };
  }

  /**
   * Load routine from JSON file
   */
  static async loadFromFile(filepath) {
    try {
      const response = await fetch(filepath);
      if (!response.ok) {
        throw new Error(`Failed to load routine: ${response.statusText}`);
      }
      const data = await response.json();
      return new Routine(data);
    } catch (error) {
      console.error('Error loading routine:', error);
      throw error;
    }
  }
}

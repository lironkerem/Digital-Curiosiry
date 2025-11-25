// js/core/AppState.js

export default class AppState {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.activeTab = 'dashboard';
    this.data = this.loadAppData();
  }

  loadAppData() {
    const data = localStorage.getItem('pc_appdata');
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse app data');
      }
    }
    
    return {
      energyEntries: [],
      gratitudeEntries: [],
      tarotReadings: [],
      meditationHistory: [],
      favorites: [],
      achievements: [],
      streaks: { current: 0, longest: 0, lastActive: null },
      stats: { totalSessions: 0, totalMeditations: 0, totalReadings: 0 }
    };
  }

  saveAppData() {
    try {
      localStorage.setItem('pc_appdata', JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save app data:', e);
    }
  }

  updateStreak() {
    const today = new Date().toDateString();
    const lastActive = this.data.streaks.lastActive;

    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActive === yesterday.toDateString()) {
        this.data.streaks.current++;
      } else {
        this.data.streaks.current = 1;
      }

      this.data.streaks.lastActive = today;

      if (this.data.streaks.current > this.data.streaks.longest) {
        this.data.streaks.longest = this.data.streaks.current;
      }

      this.saveAppData();
    }
  }

  getStats() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyMeditations = (this.data.meditationHistory || []).filter(m => {
      return new Date(m.timestamp) >= weekAgo;
    }).length;
    
    const recentEnergy = (this.data.energyEntries || []).slice(0, 7);
    const avgEnergy = recentEnergy.length > 0
      ? Math.round(recentEnergy.reduce((sum, e) => sum + (e.energy || 0), 0) / recentEnergy.length)
      : 0;
    
    return {
      currentStreak: this.data.streaks?.current || 0,
      longestStreak: this.data.streaks?.longest || 0,
      weeklyMeditations: weeklyMeditations,
      avgEnergy: avgEnergy,
      totalGratitudes: (this.data.gratitudeEntries || []).length,
      achievements: (this.data.achievements || []).length
    };
  }

  getTodayEntries(type) {
    const today = new Date().toDateString();
    const entriesKey = `${type}Entries`;
    
    if (!this.data[entriesKey]) return [];
    
    return this.data[entriesKey].filter(entry => {
      const entryDate = new Date(entry.date || entry.timestamp).toDateString();
      return entryDate === today;
    });
  }

  addEntry(type, entry) {
    const key = `${type}Entries`;
    if (!this.data[key]) this.data[key] = [];
    
    this.data[key].unshift({
      ...entry,
      timestamp: new Date().toISOString()
    });
    
    this.saveAppData();
    this.updateStreak();
    
    // PATCH 1: Trigger gamification events
    if (window.app && window.app.gamification) {
      this.triggerGamificationForEntry(type, entry);
    }
  }

  // PATCH 1: NEW METHOD - Trigger Gamification
  triggerGamificationForEntry(type, entry) {
    const gam = window.app.gamification;
    
    switch(type) {
      case 'energy':
        gam.addXP(20, 'Energy Check-in');
        gam.progressQuest('daily', 'energy_checkin', 1);
        gam.updateStreak();
        break;
        
      case 'gratitude':
        const gratitudeCount = entry.entries?.length || 1;
        gam.addXP(30 * gratitudeCount, 'Gratitude Journal');
        gam.progressQuest('daily', 'gratitude_1', gratitudeCount);
        gam.updateAlignment(2 * gratitudeCount);
        gam.updateStreak();
        break;
        
      case 'meditation':
        const duration = entry.duration || 10;
        gam.addXP(duration * 5, 'Meditation');
        gam.progressQuest('daily', 'meditate_10', duration);
        gam.progressQuest('weekly', 'meditate_5', 1);
        gam.updateEnergy(10);
        gam.updateStreak();
        
        // Update chakra if specified
        if (entry.chakra) {
          gam.updateChakra(entry.chakra, 5);
        }
        break;
        
      case 'tarot':
        gam.addXP(25, 'Tarot Reading');
        gam.updateAlignment(3);
        gam.updateStreak();
        break;
        
      case 'flip':
        gam.addXP(40, 'Flip The Script');
        gam.updateAlignment(5);
        gam.updateStreak();
        break;
        
      case 'journal':
        gam.addXP(35, 'Journal Entry');
        gam.progressQuest('daily', 'journal_1', 1);
        gam.updateStreak();
        break;
        
      default:
        gam.addXP(10, 'Activity');
        gam.updateStreak();
    }
  }
}
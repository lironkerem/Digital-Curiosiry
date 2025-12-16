// =========================================================
//  GamificationEngine.js 
// =========================================================
export class GamificationEngine {
  constructor(app) {
    this.app = app;
    this.listeners = {};
    this.state = this.loadState() || this.defaultState();
  }

  /* ---------------------------------------------------------
     DEFAULT STATE
  --------------------------------------------------------- */
  defaultState() {
    return {
      xp: 0,
      level: 1,
      karma: 0,
      streak: { current: 0 },
      completedSessions: { daily: 0, weekly: 0 },
      achievements: [],
      badges: [],
      unlockedFeatures: [],
      quests: { daily: [], weekly: [], monthly: [] },
      logs: [],
      totalWellnessRuns: 0,
      totalTarotSpreads: 0,
      totalJournalEntries: 0,
      totalHappinessViews: 0,
      settings: {
        xpPerAction: 10,
        xpPerLevel: 100,
        streakResetDays: 1,
        synergyBonus: 10
      }
    };
  }

  /* ---------------------------------------------------------
     CLOUD + LOCAL PERSISTENCE (auto-drops old keys)
  --------------------------------------------------------- */
  saveState() {
    localStorage.setItem('gamificationState', JSON.stringify(this.state));
    if (this.app?.state) {
      this.app.state.data = { ...this.app.state.data, ...this.state };
      this.app.state.saveAppData();   // Supabase sync
    }
  }

  loadState() {
    try {
      if (this.app?.state?.data && this.app.state.data.xp !== undefined) {
        // cloud load – strip any legacy keys we no longer use
        const cloud = this.app.state.data;
        if (cloud.streak?.best) delete cloud.streak.best;
        if (cloud.streak?.lastCheckIn) delete cloud.streak.lastCheckIn;
        if (cloud.energyLevel) delete cloud.energyLevel;
        if (cloud.alignmentScore) delete cloud.alignmentScore;
        if (cloud.chakraProgress) delete cloud.chakraProgress;
        if (cloud.totalPracticeMinutes) delete cloud.totalPracticeMinutes;
        return { ...this.defaultState(), ...cloud };
      }
      const local = JSON.parse(localStorage.getItem('gamificationState'));
      return local || null;
    } catch {
      return null;
    }
  }

  /* ---------------------------------------------------------
     LIFETIME COUNTERS
  --------------------------------------------------------- */
  incrementWellnessRuns() {
    this.state.totalWellnessRuns += 1;
    this.saveState();
    this.emit('wellnessRunCompleted', this.state.totalWellnessRuns);
  }
  incrementTarotSpreads() {
    this.state.totalTarotSpreads += 1;
    this.saveState();
    this.emit('tarotSpreadCompleted', this.state.totalTarotSpreads);
  }
  incrementJournalEntries() {
    this.state.totalJournalEntries += 1;
    this.saveState();
    this.emit('journalEntrySaved', this.state.totalJournalEntries);
  }
  incrementHappinessViews() {
    this.state.totalHappinessViews += 1;
    this.saveState();
    this.emit('happinessViewAdded', this.state.totalHappinessViews);
  }

  /* ---------------------------------------------------------
     EVENT BUS
  --------------------------------------------------------- */
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  /* ---------------------------------------------------------
     XP / KARMA / LEVEL
  --------------------------------------------------------- */
  addXP(amount, source = 'general') {
    let final = amount;
    if (this.hasActiveXPBoost()) final = amount * 2;
    this.state.xp += final;
    this.logAction('xp', { amount: final, source, boosted: final !== amount });
    this.emit('xpGained', { amount: final, source });
    this.checkLevelUp();
    this.saveState();
  }
  addKarma(amount, source = 'general') {
    this.state.karma += amount;
    this.logAction('karma', { amount, source });
    this.emit('karmaGained', { amount, source });
    this.saveState();
  }
  hasActiveXPBoost() {
    try {
      const boosts = JSON.parse(localStorage.getItem('karma_active_boosts')) || [];
      const now = Date.now();
      return boosts.some(b => b.id === 'xp_boost' && b.expiresAt > now);
    } catch {
      return false;
    }
  }
  calculateLevel() {
    const ladder = [
      { level: 1, title: 'Seeker', xp: 0 },
      { level: 2, title: 'Practitioner', xp: 800 },
      { level: 3, title: 'Adept', xp: 2000 },
      { level: 4, title: 'Healer', xp: 4200 },
      { level: 5, title: 'Master', xp: 7000 },
      { level: 6, title: 'Sage', xp: 12000 },
      { level: 7, title: 'Enlightened', xp: 30000 },
      { level: 8, title: 'Buddha', xp: 60000 },
      { level: 9, title: 'Light', xp: 180000 },
      { level: 10, title: 'Emptiness', xp: 450000 }
    ];
    let i = ladder.length - 1;
    while (i > 0 && this.state.xp < ladder[i].xp) i--;
    const cur = ladder[i], next = ladder[i + 1] || ladder[i];
    const prog = next.xp === cur.xp ? 100 : ((this.state.xp - cur.xp) / (next.xp - cur.xp)) * 100;
    return {
      level: cur.level,
      title: cur.title,
      progress: Math.round(prog),
      pointsToNext: Math.max(0, next.xp - this.state.xp)
    };
  }
  checkLevelUp() {
    const prev = this.state.level;
    const { level, title } = this.calculateLevel();
    if (level > prev) {
      this.state.level = level;
      this.emit('levelUp', { level, title });
      this.grantAchievement({
        id: `level_${level}`,
        name: `Reached Level ${level}: ${title}`,
        xp: 50,
        inspirational: `You are evolving into ${title}!`
      });
    }
  }

  /* ---------------------------------------------------------
     STREAK
  --------------------------------------------------------- */
  updateStreak() {
    const today = new Date().toDateString();
    if (this.state.streak.lastCheckIn === today) return;
    const last = this.state.streak.lastCheckIn ? new Date(this.state.streak.lastCheckIn) : null;
    const diff = last ? (new Date(today) - last) / (1000 * 60 * 60 * 24) : null;
    if (!last || diff > this.state.settings.streakResetDays) {
      this.state.streak.current = 1;
    } else {
      this.state.streak.current += 1;
    }
    this.state.streak.lastCheckIn = today;
    this.emit('streakUpdated', { current: this.state.streak.current });
    this.saveState();
  }

  /* ---------------------------------------------------------
     ACHIEVEMENTS / BADGES / UNLOCKS
  --------------------------------------------------------- */
  grantAchievement(ach) {
    if (this.state.achievements.find(a => a.id === ach.id)) return;
    this.state.achievements.push({ ...ach, unlocked: true, date: new Date().toISOString() });
    this.emit('achievementUnlocked', ach);
    if (ach.xp) this.addXP(ach.xp, 'achievement');
    if (ach.inspirational) this.emit('inspirationalMessage', ach.inspirational);
    this.saveState();
  }
  grantBadge(badge) {
    if (this.state.badges.find(b => b.id === badge.id)) return;
    this.state.badges.push({ ...badge, unlocked: true, date: new Date().toISOString() });
    this.emit('badgeUnlocked', badge);
    this.saveState();
  }
  unlockFeature(featureId) {
    if (this.state.unlockedFeatures.includes(featureId)) return;
    this.state.unlockedFeatures.push(featureId);
    this.emit('featureUnlocked', featureId);
    this.saveState();
  }

  /* ---------------------------------------------------------
     QUESTS (daily / weekly / monthly)
  --------------------------------------------------------- */
  progressEnergyCheckin(timeOfDay) {
    const quest = this.state.quests.daily.find(q => q.id === 'energy_checkin');
    if (!quest || quest.completed) return;
    if (!quest.subProgress) quest.subProgress = { day: false, night: false };
    const key = timeOfDay === 'day' ? 'day' : timeOfDay === 'night' ? 'night' : null;
    if (!key || quest.subProgress[key]) return;
    quest.subProgress[key] = true;
    quest.progress += 1;
    this.addXP(10, 'Energy Check-in (' + key + ')');
    this.state.karma += 1;
    this.emit('questProgress', quest);
    if (quest.progress >= quest.target) {
      quest.completed = true;
      this.addXP(10, 'Energy Check-in Bonus (Both Complete)');
      this.state.karma += 2;
      if (quest.inspirational) this.emit('inspirationalMessage', quest.inspirational);
      this.emit('questCompleted', quest);
      if (this.state.quests.daily.every(q => q.completed)) {
        this.addXP(50, 'Daily Quest Streak Bonus');
        this.emit('dailyQuestsComplete', null);
      }
    }
    this.saveState();
  }

  progressQuest(questType, questId, increment = 1) {
    const quest = this.state.quests[questType]?.find(q => q.id === questId);
    if (!quest || quest.completed) return;
    quest.progress = Math.min(quest.target, quest.progress + increment);
    if (quest.progress >= quest.target) {
      quest.completed = true;
      this.addXP(quest.xpReward || 50, `Quest: ${quest.name}`);
      if (quest.karmaReward) this.state.karma += quest.karmaReward;
      if (quest.badge) this.grantBadge(quest.badge);
      if (quest.inspirational) this.emit('inspirationalMessage', quest.inspirational);
      this.emit('questCompleted', quest);
      if (questType === 'daily' && this.state.quests.daily.every(q => q.completed)) {
        this.addXP(50, 'Daily Quest Streak Bonus');
        this.emit('dailyQuestsComplete', null);
      }
    } else {
      this.emit('questProgress', quest);
    }
    this.saveState();
  }

  completeQuest(questType, questId) {
    const quest = this.state.quests[questType]?.find(q => q.id === questId);
    if (!quest) return;
    this.progressQuest(questType, questId, quest.target - quest.progress);
  }

  completeChakraQuest(questType, questId, chakraName, increment = 1) {
    this.progressQuest(questType, questId, increment);
  }

  resetDailyQuests() { this._resetQuests('daily'); }
  resetWeeklyQuests() { this._resetQuests('weekly'); }
  resetMonthlyQuests() { this._resetQuests('monthly'); }

  _resetQuests(type) {
    this.state.quests[type]?.forEach(q => {
      q.progress = 0; q.completed = false;
      if (q.id === 'energy_checkin') q.subProgress = { day: false, night: false };
    });
    this.emit('questsReset', type);
    this.saveState();
  }

  /* ---------------------------------------------------------
     LOGGING & FULL STATUS
  --------------------------------------------------------- */
  logAction(type, details = {}) {
    this.state.logs.push({ timestamp: new Date().toISOString(), type, details });
    this.saveState();
  }

  getStatusSummary() {
    return {
      xp: this.state.xp,
      level: this.state.level,
      pointsToNext: this.calculateLevel().pointsToNext,
      levelTitle: this.calculateLevel().title,
      karma: this.state.karma,
      streak: this.state.streak,
      achievements: this.state.achievements,
      badges: this.state.badges,
      unlockedFeatures: this.state.unlockedFeatures,
      quests: this.state.quests,
      logs: this.state.logs,
      totalWellnessRuns: this.state.totalWellnessRuns,
      totalTarotSpreads: this.state.totalTarotSpreads,
      totalJournalEntries: this.state.totalJournalEntries,
      totalHappinessViews: this.state.totalHappinessViews
    };
  }

  reset() {
    localStorage.removeItem('gamificationState');
    this.state = this.defaultState();
    this.emit('reset', null);
  }
}

export default GamificationEngine;
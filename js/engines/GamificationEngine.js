// ============================================
// GamificationEngine.js – UPDATED: SEASONAL → MONTHLY QUESTS
// ============================================
export class GamificationEngine {
  constructor(app) {
    this.app = app;
    this.listeners = {};
    this.state = this.loadState() || this.defaultState();
  }

  // ============================================
  // DEFAULT STATE – 6 DAILY, 6 WEEKLY, 6 MONTHLY QUESTS
  // ============================================
  defaultState() {
    return {
      xp: 0,
      level: 1,
      karma: 0,
      streak: { current: 0, best: 0, lastCheckIn: null },
      energyLevel: 100,
      alignmentScore: 100,
      totalPracticeMinutes: 0,
      completedSessions: { daily: 0, weekly: 0 },
      achievements: [],
      badges: [],
      unlockedFeatures: [],
      chakraProgress: {
        root: 0, sacral: 0, solar: 0, heart: 0,
        throat: 0, thirdEye: 0, crown: 0
      },
      quests: {
        daily: [
          {
            id: 'gratitude_entry',
            name: 'Daily Gratitude Practice',
            progress: 0, target: 1, completed: false, xpReward: 20, karmaReward: 2,
            icon: '❤️', tab: 'gratitude',
            inspirational: 'Gratitude transforms what we have into enough.'
          },
          {
            id: 'journal_entry',
            name: 'Daily Journaling',
            progress: 0, target: 1, completed: false, xpReward: 10, karmaReward: 1,
            icon: '📔', tab: 'journal',
            inspirational: 'Writing is the mirror of the soul.'
          },
          {
            id: 'tarot_spread',
            name: 'Daily Tarot Spread',
            progress: 0, target: 1, completed: false, xpReward: 20, karmaReward: 2,
            icon: '🃏', tab: 'tarot',
            inspirational: 'The cards reveal what the heart already knows.'
          },
          {
            id: 'meditation_session',
            name: 'Daily Meditation',
            progress: 0, target: 1, completed: false, xpReward: 30, karmaReward: 2,
            icon: '🧘', tab: 'meditations',
            inspirational: 'Stillness is where creation begins.'
          },
          {
            id: 'energy_checkin',
            name: 'Daily Energy Check-in',
            progress: 0, target: 2, completed: false, xpReward: 30, karmaReward: 4,
            icon: '⚡', tab: 'energy',
            subProgress: { day: false, night: false },
            inspirational: 'Balance your energy, transform your life.'
          },
          {
            id: 'daily_booster',
            name: 'Daily Affirmations/Boosters',
            progress: 0, target: 5, completed: false, xpReward: 10, karmaReward: 1,
            icon: '✨', tab: 'happiness',
            inspirational: 'Small moments of joy create lasting happiness.'
          }
        ],
        weekly: [
          {
            id: 'gratitude_streak_7',
            name: 'A Gratitude Streak',
            progress: 0, target: 7, completed: false, xpReward: 200, karmaReward: 20,
            icon: '💖', badge: { id: 'gratitude_master', name: 'Gratitude Master' },
            inspirational: 'A grateful heart attracts miracles.'
          },
          {
            id: 'journal_5',
            name: 'Journal Writer',
            progress: 0, target: 5, completed: false, xpReward: 250, karmaReward: 20,
            icon: '📝', badge: { id: 'journaling_devotee', name: 'Journaling Devotee' },
            inspirational: 'Through writing, you discover your truth.'
          },
          {
            id: 'energy_7',
            name: 'Weekly Energy Check-ins',
            progress: 0, target: 7, completed: false, xpReward: 150, karmaReward: 10,
            icon: '⚡', badge: { id: 'energy_master', name: 'Energy Master' },
            inspirational: 'Self-awareness is the first step to transformation.'
          },
          {
            id: 'happiness_boosters_20',
            name: 'Happy and Motivated Week',
            progress: 0, target: 20, completed: false, xpReward: 150, karmaReward: 10,
            icon: '🎨', badge: { id: 'joy_cultivator', name: 'Joy Cultivator' },
            inspirational: 'Happiness is a practice, and you are mastering it.'
          },
          {
            id: 'tarot_4_days',
            name: 'Tarot Lover',
            progress: 0, target: 4, completed: false, xpReward: 200, karmaReward: 20,
            icon: '🔮', badge: { id: 'tarot_reader', name: 'Tarot Reader' },
            inspirational: 'The cards mirror the wisdom already within you.'
          },
          {
            id: 'meditate_3',
            name: 'Meditating Adept',
            progress: 0, target: 3, completed: false, xpReward: 250, karmaReward: 20,
            icon: '🌟', badge: { id: 'weekly_meditator', name: 'Weekly Meditator' },
            inspirational: 'Consistency grows wisdom.'
          }
        ],
        monthly: [
          {
            id: 'monthly_energy_28',
            name: 'Monthly Energy Check-ins',
            progress: 0, target: 28, completed: false, xpReward: 300, karmaReward: 30,
            icon: '⚡', badge: { id: 'energy_tracker_monthly', name: 'Monthly Energy Tracker' },
            inspirational: 'Track your energy, master your month.'
          },
          {
            id: 'monthly_tarot_15',
            name: 'Tarot Enthusiast',
            progress: 0, target: 15, completed: false, xpReward: 300, karmaReward: 30,
            icon: '🔮', badge: { id: 'tarot_enthusiast', name: 'Tarot Enthusiast' },
            inspirational: 'The cards guide your monthly journey.'
          },
          {
            id: 'monthly_gratitude_28',
            name: 'Gratitude Master',
            progress: 0, target: 28, completed: false, xpReward: 200, karmaReward: 20,
            icon: '💖', badge: { id: 'gratitude_master_monthly', name: 'Monthly Gratitude Master' },
            inspirational: 'Gratitude turns the whole month golden.'
          },
          {
            id: 'monthly_journal_20',
            name: 'A Journalist',
            progress: 0, target: 20, completed: false, xpReward: 200, karmaReward: 20,
            icon: '📝', badge: { id: 'monthly_journalist', name: 'Monthly Journalist' },
            inspirational: 'Your story unfolds one page at a time.'
          },
          {
            id: 'monthly_happiness_100',
            name: 'Super Good Month',
            progress: 0, target: 100, completed: false, xpReward: 200, karmaReward: 20,
            icon: '🎨', badge: { id: 'super_good_month', name: 'Super Good Month' },
            inspirational: 'A hundred small joys make one big transformation.'
          },
          {
            id: 'monthly_meditation_15',
            name: 'Meditating Healer',
            progress: 0, target: 15, completed: false, xpReward: 300, karmaReward: 20,
            icon: '🌟', badge: { id: 'meditating_healer_monthly', name: 'Monthly Meditating Healer' },
            inspirational: 'Fifteen moments of stillness, a month of clarity.'
          }
        ]
      },
      logs: [],
      settings: {
        xpPerAction: 10,
        xpPerLevel: 100,
        streakResetDays: 1,
        synergyBonus: 10
      }
    };
  }

  /* -------------------------------------------------------------
   * STATE PERSISTENCE
   * ----------------------------------------------------------- */
  saveState() {
    localStorage.setItem('gamificationState', JSON.stringify(this.state));
  }
  loadState() {
    try { return JSON.parse(localStorage.getItem('gamificationState')); }
    catch { return null; }
  }

  /* -------------------------------------------------------------
   * EVENT SYSTEM
   * ----------------------------------------------------------- */
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  emit(event, data) {
    (this.listeners[event] || []).forEach(cb => cb(data));
  }

  /* -------------------------------------------------------------
   * XP & LEVEL
   * ----------------------------------------------------------- */
  addXP(amount, source = 'general') {
    let final = amount;
    if (this.hasActiveXPBoost()) {
      final = amount * 2;
      this.emit('xpBoosted', { original: amount, boosted: final });
    }
    this.state.xp += final;
    this.logAction('xp', { amount: final, source, boosted: final !== amount });
    this.emit('xpGained', { amount: final, source });
    this.checkLevelUp();
    this.saveState();
  }
  hasActiveXPBoost() {
    try {
      const boosts = JSON.parse(localStorage.getItem('karma_active_boosts')) || [];
      const now = Date.now();
      return boosts.some(b => b.id === 'xp_boost' && b.expiresAt > now);
    } catch { return false; }
  }
  calculateLevel() {
    const ladder = [
      { level: 1, title: 'Seeker', xp: 0 },
      { level: 2, title: 'Practitioner', xp: 300 },
      { level: 3, title: 'Adept', xp: 800 },
      { level: 4, title: 'Healer', xp: 1600 },
      { level: 5, title: 'Master', xp: 3200 },
      { level: 6, title: 'Sage', xp: 6500 },
      { level: 7, title: 'Enlightened', xp: 20000 },
      { level: 8, title: 'Buddha', xp: 50000 },
      { level: 9, title: 'Light', xp: 150000 },
      { level: 10, title: 'Emptiness', xp: 400000 }
    ];
    let i = ladder.length - 1;
    while (i > 0 && this.state.xp < ladder[i].xp) i--;
    const cur = ladder[i], next = ladder[i + 1] || ladder[i];
    const prog = next.xp === cur.xp ? 100 : Math.min(100, ((this.state.xp - cur.xp) / (next.xp - cur.xp)) * 100);
    return {
      level: cur.level, title: cur.title,
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

  /* -------------------------------------------------------------
   * STREAK
   * ----------------------------------------------------------- */
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
    if (this.state.streak.current > this.state.streak.best) this.state.streak.best = this.state.streak.current;
    this.state.streak.lastCheckIn = today;
    this.emit('streakUpdated', { current: this.state.streak.current, best: this.state.streak.best });
    this.saveState();
  }

  /* -------------------------------------------------------------
   * ACHIEVEMENTS / BADGES / UNLOCKS
   * ----------------------------------------------------------- */
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

  /* -------------------------------------------------------------
   * CHAKRA & ENERGY & ALIGNMENT
   * ----------------------------------------------------------- */
  updateChakra(name, amt) {
    if (!this.state.chakraProgress.hasOwnProperty(name)) return;
    this.state.chakraProgress[name] = Math.min(100, this.state.chakraProgress[name] + amt);
    if (this.state.chakraProgress[name] >= 100) {
      this.grantBadge({ id: `chakra_${name}`, name: `${name} Mastery`, xp: 50 });
      this.emit('inspirationalMessage', `Your ${name} chakra is fully awakened!`);
    }
    this.emit('chakraUpdated', { chakra: name, value: this.state.chakraProgress[name] });
    this.saveState();
  }
  updateEnergy(amt) {
    this.state.energyLevel = Math.min(100, Math.max(0, this.state.energyLevel + amt));
    this.emit('energyUpdated', this.state.energyLevel);
    this.saveState();
  }
  updateAlignment(amt) {
    this.state.alignmentScore = Math.min(100, Math.max(0, this.state.alignmentScore + amt));
    this.emit('alignmentUpdated', this.state.alignmentScore);
    this.saveState();
  }

  /* -------------------------------------------------------------
   * SPECIAL: DAILY ENERGY CHECK-IN (DAY / NIGHT)
   * ----------------------------------------------------------- */
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

  /* -------------------------------------------------------------
   * GENERIC QUEST PROGRESS
   * ----------------------------------------------------------- */
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
    this.updateChakra(chakraName, increment);
  }

  /* -------------------------------------------------------------
   * RESET HELPERS
   * ----------------------------------------------------------- */
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

  /* -------------------------------------------------------------
   * LOGGING & STATUS
   * ----------------------------------------------------------- */
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
      energyLevel: this.state.energyLevel,
      alignmentScore: this.state.alignmentScore,
      achievements: this.state.achievements,
      badges: this.state.badges,
      unlockedFeatures: this.state.unlockedFeatures,
      chakraProgress: this.state.chakraProgress,
      quests: this.state.quests,
      logs: this.state.logs
    };
  }

  /* -------------------------------------------------------------
   * FULL RESET
   * ----------------------------------------------------------- */
  reset() {
    localStorage.removeItem('gamificationState');
    this.state = this.defaultState();
    this.emit('reset', null);
  }
}

export default GamificationEngine;
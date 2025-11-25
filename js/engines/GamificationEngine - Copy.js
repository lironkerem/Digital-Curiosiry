// ============================================
// GamificationEngine.js - UPDATED WITH NEW 6 WEEKLY QUESTS
// ============================================
export class GamificationEngine {
  constructor(app) {
    this.app = app;
    this.listeners = {};
    this.state = this.loadState() || this.defaultState();
  }

  // ============================================
  // RESTRUCTURED DEFAULT STATE - 6 DAILY, 6 WEEKLY, 6 SEASONAL QUESTS
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
        root: 0,
        sacral: 0,
        solar: 0,
        heart: 0,
        throat: 0,
        thirdEye: 0,
        crown: 0
      },
      quests: {
        daily: [
          { 
            id: 'gratitude_entry', 
            name: 'Daily Gratitude Practice', 
            progress: 0, 
            target: 1, 
            completed: false, 
            xpReward: 20, 
            karmaReward: 2, 
            icon: '❤️',
            tab: 'gratitude',
            inspirational: 'Gratitude transforms what we have into enough.' 
          },
          { 
            id: 'journal_entry', 
            name: 'Daily Journaling', 
            progress: 0, 
            target: 1, 
            completed: false, 
            xpReward: 10, 
            karmaReward: 1, 
            icon: '📔',
            tab: 'journal',
            inspirational: 'Writing is the mirror of the soul.' 
          },
          { 
            id: 'tarot_spread', 
            name: 'Daily Tarot Spread', 
            progress: 0, 
            target: 1, 
            completed: false, 
            xpReward: 20, 
            karmaReward: 2, 
            icon: '🃏',
            tab: 'tarot',
            inspirational: 'The cards reveal what the heart already knows.' 
          },
          { 
            id: 'meditation_session', 
            name: 'Daily Meditation', 
            progress: 0, 
            target: 1, 
            completed: false, 
            xpReward: 30, 
            karmaReward: 2, 
            icon: '🧘',
            tab: 'meditations',
            inspirational: 'Stillness is where creation begins.' 
          },
          { 
            id: 'energy_checkin', 
            name: 'Daily Energy Check-in', 
            progress: 0, 
            target: 2,
            completed: false, 
            xpReward: 30,
            karmaReward: 4,
            icon: '⚡',
            tab: 'energy',
            subProgress: { day: false, night: false },
            inspirational: 'Balance your energy, transform your life.' 
          },
          { 
            id: 'daily_booster', 
            name: 'Daily Affirmations/Boosters', 
            progress: 0, 
            target: 5, 
            completed: false, 
            xpReward: 10, 
            karmaReward: 1, 
            icon: '✨',
            tab: 'happiness',
            inspirational: 'Small moments of joy create lasting happiness.' 
          }
        ],
        weekly: [
          { 
            id: 'gratitude_streak_7', 
            name: 'A Gratitude Streak', 
            progress: 0, 
            target: 7, 
            completed: false, 
            xpReward: 200,
            karmaReward: 20,
            icon: '💖',
            badge: { id: 'gratitude_master', name: 'Gratitude Master' }, 
            inspirational: 'A grateful heart attracts miracles.' 
          },
          { 
            id: 'journal_5', 
            name: 'Journal Writer', 
            progress: 0, 
            target: 5, 
            completed: false, 
            xpReward: 250,
            karmaReward: 20,
            icon: '📝',
            badge: { id: 'journaling_devotee', name: 'Journaling Devotee' }, 
            inspirational: 'Through writing, you discover your truth.' 
          },
          { 
            id: 'energy_7', 
            name: 'Weekly Energy Check-ins', 
            progress: 0, 
            target: 7, 
            completed: false, 
            xpReward: 150,
            karmaReward: 10,
            icon: '⚡',
            badge: { id: 'energy_master', name: 'Energy Master' }, 
            inspirational: 'Self-awareness is the first step to transformation.' 
          },
          { 
            id: 'happiness_boosters_20', 
            name: 'Happy and Motivated Week', 
            progress: 0, 
            target: 20, 
            completed: false, 
            xpReward: 150,
            karmaReward: 10,
            icon: '🎨',
            badge: { id: 'joy_cultivator', name: 'Joy Cultivator' }, 
            inspirational: 'Happiness is a practice, and you are mastering it.' 
          },
          { 
            id: 'tarot_4_days', 
            name: 'Tarot Lover', 
            progress: 0, 
            target: 4, 
            completed: false, 
            xpReward: 200,
            karmaReward: 20,
            icon: '🔮',
            badge: { id: 'tarot_reader', name: 'Tarot Reader' }, 
            inspirational: 'The cards mirror the wisdom already within you.' 
          },
          { 
            id: 'meditate_3', 
            name: 'Meditating Adept', 
            progress: 0, 
            target: 3, 
            completed: false, 
            xpReward: 250,
            karmaReward: 20,
            icon: '🌟',
            badge: { id: 'weekly_meditator', name: 'Weekly Meditator' }, 
            inspirational: 'Consistency grows wisdom.' 
          }
        ],
        seasonal: [
          { 
            id: 'full_moon', 
            name: 'Full Moon Practice Series', 
            progress: 0, 
            target: 3, 
            completed: false, 
            xpReward: 400, 
            icon: '🌕',
            badge: { id: 'full_moon_master', name: 'Full Moon Master' }, 
            inspirational: 'Align with the cycles of nature.' 
          },
          { 
            id: 'new_year_transformation', 
            name: 'Complete 30 Practices', 
            progress: 0, 
            target: 30, 
            completed: false, 
            xpReward: 1000, 
            icon: '🎯',
            badge: { id: 'transformation_champion', name: 'Transformation Champion' }, 
            inspirational: 'You are becoming who you were always meant to be.' 
          },
          { 
            id: 'shadow_work_journey', 
            name: 'Shadow Work Journey', 
            progress: 0, 
            target: 5, 
            completed: false, 
            xpReward: 500, 
            icon: '🔮',
            badge: { id: 'shadow_warrior', name: 'Shadow Warrior' }, 
            inspirational: 'In darkness, we find our hidden light.' 
          },
          { 
            id: 'flip_script_master', 
            name: 'Flip The Script Master', 
            progress: 0, 
            target: 10, 
            completed: false, 
            xpReward: 450, 
            icon: '💫',
            badge: { id: 'mindset_alchemist', name: 'Mindset Alchemist' }, 
            inspirational: 'You have the power to rewrite your story.' 
          },
          { 
            id: 'level_up_achievement', 
            name: 'Level Up Achievement', 
            progress: 0, 
            target: 500, 
            completed: false, 
            xpReward: 600, 
            icon: '🌟',
            badge: { id: 'ascended_seeker', name: 'Ascended Seeker' }, 
            inspirational: 'Your dedication has unlocked new dimensions of growth.' 
          },
          { 
            id: 'chakra_balance', 
            name: 'Practice 3 Different Chakras', 
            progress: 0, 
            target: 3, 
            completed: false, 
            xpReward: 350, 
            icon: '🌈',
            badge: { id: 'chakra_balancer', name: 'Chakra Balancer' }, 
            inspirational: 'Balance brings harmony to all aspects of life.' 
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

  // -----------------------------
  // STATE PERSISTENCE
  // -----------------------------
  saveState() {
    localStorage.setItem('gamificationState', JSON.stringify(this.state));
  }

  loadState() {
    try {
      return JSON.parse(localStorage.getItem('gamificationState'));
    } catch {
      return null;
    }
  }

  // -----------------------------
  // EVENT SYSTEM
  // -----------------------------
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }

  // -----------------------------
  // XP & LEVEL
  // -----------------------------
  addXP(amount, source = 'general') {
    let finalAmount = amount;
    
    if (this.hasActiveXPBoost()) {
      finalAmount = amount * 2;
      this.emit('xpBoosted', { original: amount, boosted: finalAmount });
    }
    
    this.state.xp += finalAmount;
    this.logAction('xp', { amount: finalAmount, source, boosted: finalAmount !== amount });
    this.emit('xpGained', { amount: finalAmount, source });
    this.checkLevelUp();
    this.saveState();
  }

  hasActiveXPBoost() {
    try {
      const boosts = JSON.parse(localStorage.getItem('karma_active_boosts')) || [];
      const now = Date.now();
      return boosts.some(boost => boost.id === 'xp_boost' && boost.expiresAt > now);
    } catch {
      return false;
    }
  }

  calculateLevel() {
    const ladder = [
      { level: 1, title: 'Seeker',       xp: 0 },
      { level: 2, title: 'Practitioner', xp: 300 },
      { level: 3, title: 'Adept',        xp: 800 },
      { level: 4, title: 'Healer',       xp: 1600 },
      { level: 5, title: 'Master',       xp: 3200 },
      { level: 6, title: 'Sage',         xp: 6500 },
      { level: 7, title: 'Enlightened',  xp: 20000 },
      { level: 8, title: 'Buddha',       xp: 50000 },
      { level: 9, title: 'Light',        xp: 150000 },
      { level: 10, title: 'Emptiness',        xp: 400000 }
    ];

    let i = ladder.length - 1;
    while (i > 0 && this.state.xp < ladder[i].xp) i--;
    const current = ladder[i];
    const next    = ladder[i + 1] || ladder[i];

    const progress = next.xp === current.xp
          ? 100
          : Math.min(100, ((this.state.xp - current.xp) / (next.xp - current.xp)) * 100);

    return {
      level: current.level,
      title: current.title,
      progress: Math.round(progress),
      pointsToNext: Math.max(0, next.xp - this.state.xp)
    };
  }

  checkLevelUp() {
    const prevLevel = this.state.level;
    const { level, title } = this.calculateLevel();
    if (level > prevLevel) {
      this.state.level = level;
      this.emit('levelUp', { level, title });
      this.grantAchievement({ id: `level_${level}`, name: `Reached Level ${level}: ${title}`, xp: 50, inspirational: `You are evolving into ${title}!` });
    }
  }

  getLevelTitle(level) {
    const ladder = [
      'Seeker', 'Practitioner', 'Adept', 'Healer',
      'Master', 'Sage', 'Enlightened', 'Buddha', 'Light', 'Emptiness'
    ];
    return ladder[Math.min(level - 1, ladder.length - 1)];
  }

  // -----------------------------
  // STREAK MANAGEMENT
  // -----------------------------
  updateStreak() {
    const today = new Date().toDateString();
    if (this.state.streak.lastCheckIn === today) return;

    const lastCheck = this.state.streak.lastCheckIn ? new Date(this.state.streak.lastCheckIn) : null;
    const diffDays = lastCheck ? (new Date(today) - lastCheck) / (1000 * 60 * 60 * 24) : null;

    if (!lastCheck || diffDays > this.state.settings.streakResetDays) {
      this.state.streak.current = 1;
    } else {
      this.state.streak.current += 1;
    }

    if (this.state.streak.current > this.state.streak.best) this.state.streak.best = this.state.streak.current;

    this.state.streak.lastCheckIn = today;
    this.emit('streakUpdated', { current: this.state.streak.current, best: this.state.streak.best });
    this.saveState();
  }

  // -----------------------------
  // ACHIEVEMENTS & BADGES
  // -----------------------------
  grantAchievement(achievement) {
    if (this.state.achievements.find(a => a.id === achievement.id)) return;
    this.state.achievements.push({ ...achievement, unlocked: true, date: new Date().toISOString() });
    this.emit('achievementUnlocked', achievement);
    if (achievement.xp) this.addXP(achievement.xp, 'achievement');
    if (achievement.inspirational) this.emit('inspirationalMessage', achievement.inspirational);
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

  // -----------------------------
  // CHAKRA & ENERGY
  // -----------------------------
  updateChakra(chakraName, amount) {
    if (!this.state.chakraProgress.hasOwnProperty(chakraName)) return;
    this.state.chakraProgress[chakraName] = Math.min(100, this.state.chakraProgress[chakraName] + amount);
    if (this.state.chakraProgress[chakraName] >= 100) {
      this.grantBadge({ id: `chakra_${chakraName}`, name: `${chakraName} Mastery`, xp: 50 });
      this.emit('inspirationalMessage', `Your ${chakraName} chakra is fully awakened!`);
    }
    this.emit('chakraUpdated', { chakra: chakraName, value: this.state.chakraProgress[chakraName] });
    this.saveState();
  }

  updateEnergy(amount) {
    this.state.energyLevel = Math.min(100, Math.max(0, this.state.energyLevel + amount));
    this.emit('energyUpdated', this.state.energyLevel);
    this.saveState();
  }

  updateAlignment(amount) {
    this.state.alignmentScore = Math.min(100, Math.max(0, this.state.alignmentScore + amount));
    this.emit('alignmentUpdated', this.state.alignmentScore);
    this.saveState();
  }

  // ============================================
  // SPECIAL: ENERGY CHECK-IN QUEST (Day/Night tracking)
  // ============================================
  progressEnergyCheckin(timeOfDay) {
    const quest = this.state.quests.daily.find(q => q.id === 'energy_checkin');
    if (!quest || quest.completed) return;

    if (!quest.subProgress) {
      quest.subProgress = { day: false, night: false };
    }

    if (timeOfDay === 'day' && !quest.subProgress.day) {
      quest.subProgress.day = true;
      quest.progress += 1;
      this.addXP(10, 'Energy Check-in (Day)');
      this.state.karma += 1;
      this.emit('questProgress', quest);
    } else if (timeOfDay === 'night' && !quest.subProgress.night) {
      quest.subProgress.night = true;
      quest.progress += 1;
      this.addXP(10, 'Energy Check-in (Night)');
      this.state.karma += 1;
      this.emit('questProgress', quest);
    }

    if (quest.subProgress.day && quest.subProgress.night && !quest.completed) {
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

  // -----------------------------
  // QUESTS / CHALLENGES (Standard)
  // -----------------------------
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

  resetDailyQuests() { this._resetQuests('daily'); }
  resetWeeklyQuests() { this._resetQuests('weekly'); }
  resetSeasonalQuests() { this._resetQuests('seasonal'); }

  _resetQuests(type) {
    this.state.quests[type]?.forEach(q => { 
      q.progress = 0; 
      q.completed = false;
      if (q.id === 'energy_checkin') {
        q.subProgress = { day: false, night: false };
      }
    });
    this.emit('questsReset', type);
    this.saveState();
  }

  // -----------------------------
  // LOGGING
  // -----------------------------
  logAction(type, details = {}) {
    this.state.logs.push({ timestamp: new Date().toISOString(), type, details });
    this.saveState();
  }

  // -----------------------------
  // STATUS SUMMARY
  // -----------------------------
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

  // -----------------------------
  // RESET / CLEAR
  // -----------------------------
  reset() {
    localStorage.removeItem('gamificationState');
    this.state = this.defaultState();
    this.emit('reset', null);
  }
}

export default GamificationEngine;
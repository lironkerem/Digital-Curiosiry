// DashboardManager.js – PATCHED 2025-11-25 (equal-width tabs, Sunday reset, bigger font)
export default class DashboardManager {
  constructor(app) {
    this.app = app;
    this.currentQuote = null;
    this.dailyTarotCard = null;
    this.dailyAffirmation = null;
    this.happinessBoosters = [];
    this.currentBoosterIndex = null;
    this.boostersLoaded = false;
    this.CARD_BACK_URL = 'https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/Tarot%20Cards%20images/CardBacks.jpg';
    this.flippedCards = new Set();
    this.loadHappinessBoosters();
    this.setupQuestListeners();
    // live-update every 1 s
    this.countdownInterval = setInterval(() => this.updateCountdownDisplays(), 1000);
  }

  /* -------------------------------------------------------------
   *  Countdown helpers
   * ----------------------------------------------------------- */
  _getNextResetTimes() {
    const now = new Date();
    // Daily = next midnight
    const daily = new Date(now);
    daily.setDate(daily.getDate() + 1);
    daily.setHours(0, 0, 0, 0);
    // Weekly = next Sunday 00:00 (week starts Sunday)
    const weekly = new Date(now);
    weekly.setDate(now.getDate() + (7 - now.getDay()) % 7);
    weekly.setHours(0, 0, 0, 0);
    if (weekly <= now) weekly.setDate(weekly.getDate() + 7);
    // Monthly = 1st of next month 00:00
    const monthly = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
    return { daily, weekly, monthly };
  }

  _formatCountdown(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const parts = [];
    if (d) parts.push(String(d).padStart(2, '0') + 'd');
    parts.push(String(h).padStart(2, '0') + 'h');
    parts.push(String(m).padStart(2, '0') + 'm');
    parts.push(String(s).padStart(2, '0') + 's');
    return parts.join(' ');
  }

  updateCountdownDisplays() {
    if (!this.app.gamification) return;
    const resets = this._getNextResetTimes();
    const now = new Date();
    ['daily', 'weekly', 'monthly'].forEach(type => {
      const el = document.getElementById(`countdown-${type}`);
      if (el) el.textContent = this._formatCountdown(resets[type] - now);
    });
  }

  setupQuestListeners() {
    if (this.app.gamification) {
      this.app.gamification.on('questCompleted', (quest) => {
        this.app.showToast(`✅ Quest Complete: ${quest.name}! +${quest.xpReward} XP`, 'success');
        if (quest.inspirational) {
          setTimeout(() => {
            this.app.showToast(`💫 ${quest.inspirational}`, 'info');
          }, 1500);
        }
        this.render();
      });
      this.app.gamification.on('questProgress', (quest) => {
        this.render();
      });
      this.app.gamification.on('dailyQuestsComplete', () => {
        this.app.showToast('🌟 All Daily Quests Complete! +50 Bonus XP 🌟', 'success');
      });
      this.checkDailyReset();
    }
  }

  checkDailyReset() {
    const today = new Date().toDateString();
    const lastReset = localStorage.getItem('last_quest_reset');
    if (lastReset !== today) {
      this.app.gamification.resetDailyQuests();
      localStorage.setItem('last_quest_reset', today);
    }
  }

  async loadHappinessBoosters() {
    try {
      const response = await fetch('./js/data/happiness-boosters.json');
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      const data = await response.json();
      if (!data.boosters || !Array.isArray(data.boosters)) throw new Error('Invalid data structure');
      this.happinessBoosters = data.boosters;
      this.boostersLoaded = true;
      const dashboard = document.getElementById('dashboard-tab');
      if (dashboard && !dashboard.classList.contains('hidden')) this.render();
    } catch (error) {
      this.happinessBoosters = [
        { id: 1, title: '5-Minute Dance Party', emoji: '💃', description: 'Put on your favorite song and move!', duration: '5 min', category: 'Movement' },
        { id: 2, title: 'Gratitude Snapshot', emoji: '📸', description: 'Notice 3 beautiful things around you', duration: '3 min', category: 'Gratitude' },
        { id: 3, title: 'Power Pose', emoji: '🦸', description: 'Stand like a superhero for 2 minutes', duration: '2 min', category: 'Confidence' }
      ];
      this.boostersLoaded = true;
    }
  }

  getRandomBooster() {
    if (!this.boostersLoaded || !this.happinessBoosters || this.happinessBoosters.length === 0) {
      return { id: 0, title: 'Loading Boosters...', emoji: '⏳', description: 'Please wait...', duration: '...', category: 'Loading' };
    }
    const index = Math.floor(Math.random() * this.happinessBoosters.length);
    this.currentBoosterIndex = index;
    return this.happinessBoosters[index];
  }

  renderGamificationWidget() {
    if (!this.app.gamification) return '';
    const status = this.app.gamification.getStatusSummary();
    const levelInfo = this.app.gamification.calculateLevel();
    const stats = this.app.state.getStats();
    const NEUMORPHIC_STYLE = `background: #e0e5ec; padding: 20px 10px; border-radius: 15px; box-shadow: inset 4px 4px 8px #b8bec5, inset -4px -4px 8px #ffffff; text-align: center; transition: all 0.2s ease-in-out; cursor: default;`;
    const statItems = [
      { value: status.karma, label: 'Karma', emoji: '✨' },
      { value: status.streak.current, label: 'Streak', emoji: '🔥' },
      { value: stats.weeklyMeditations, label: 'Practices', emoji: '🧘' },
      { value: stats.totalGratitudes, label: 'Gratitudes', emoji: '❤️' },
      { value: status.achievements.length, label: 'Achievements', emoji: '🏆' },
      { value: status.badges.length, label: 'Badges', emoji: '🎖️' }
    ];
    const cardOpen = `<div class="neuro-card mb-6" style="padding: 8px 16px 10px;">`;

    return `
      ${cardOpen}
        <h2 class="text-lg font-bold mb-2 text-center" style="color: var(--neuro-text);">🎮 Spiritual Progress</h2>
        <div class="mb-2 text-center">
          <h3 class="text-xl font-bold" style="color: var(--neuro-accent);">You are ${levelInfo.title === 'an' || levelInfo.title.match(/^[aeiou]/i) ? 'an' : 'a'} ${levelInfo.title} (Level ${levelInfo.level})</h3>
          <p class="text-xs mb-1" style="color: var(--neuro-text-light);">${status.xp} XP</p>
          <div class="progress-bar"><div class="progress-fill" style="width: ${levelInfo.progress}%;"></div></div>
          <div class="text-xs mt-1" style="color: var(--neuro-text-light);">${levelInfo.pointsToNext} to next</div>
        </div>
        <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
          ${statItems.map(item => `
            <div class="neuro-stat-neumorphic" style="${NEUMORPHIC_STYLE}">
              <div class="text-sm font-bold" style="color: var(--neuro-accent);">${item.value}</div>
              <div class="text-xs" style="color: var(--neuro-text-light);">${item.emoji} ${item.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  getDailyTarotCard() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('daily_tarot_card');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.date === today) return data.card;
      } catch {}
    }
    const engine = new TarotEngine(this.app);
    const fullDeck = engine.buildFullDeck();
    const shuffled = engine.shuffleDeck(fullDeck);
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const cardData = shuffled[dayOfYear % 78];
    const card = {
      name: engine.getTarotCardName(cardData.number, cardData.suit),
      meaning: engine.getTarotCardMeaning(cardData.number, cardData.suit),
      image: engine.getTarotCardImage(cardData.number, cardData.suit),
      date: today
    };
    localStorage.setItem('daily_tarot_card', JSON.stringify({ card, date: today }));
    return card;
  }

  getDailyAffirmation() {
    if (window.affirmations && window.affirmations.general_positive_affirmations) {
      const general = window.affirmations.general_positive_affirmations;
      const today = new Date();
      const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
      const affirmation = general[dayOfYear % general.length];
      return typeof affirmation === 'string' ? affirmation : affirmation.text;
    }
    return "I am worthy of love and belonging exactly as I am.";
  }

  flipDailyCard(cardType) {
    const flipElement = document.getElementById(`${cardType}-flip`);
    if (flipElement) {
      const isCurrentlyFlipped = flipElement.classList.contains('flipped');
      if (cardType === 'booster' && !isCurrentlyFlipped) {
        const newBooster = this.getRandomBooster();
        const boosterBox = flipElement.querySelector('.daily-card-booster-box');
        if (boosterBox) {
          boosterBox.innerHTML = `<div class="text-6xl mb-4">${newBooster.emoji}</div><h4 class="text-2xl font-bold mb-3" style="color: white;">${newBooster.title}</h4><p class="mb-3" style="color: rgba(255,255,255,0.9); font-size: 1rem; line-height: 1.5;">${newBooster.description}</p><p class="text-sm" style="color: rgba(255,255,255,0.7);">${newBooster.duration} • ${newBooster.category}</p>`;
        }
      }
      flipElement.classList.toggle('flipped');
      if (flipElement.classList.contains('flipped')) {
        const messages = { tarot: '✨ Tarot card revealed!', affirmation: '💫 Affirmation revealed!', booster: '😊 Booster revealed!' };
        this.app.showToast(messages[cardType] || 'Card revealed!', 'success');
      }
    }
  }

  refreshQuote() {
    if (window.QuotesData) {
      this.currentQuote = window.QuotesData.getRandomQuote();
      const quoteText = document.getElementById('quote-text');
      quoteText.style.opacity = '0';
      quoteText.textContent = `"${this.currentQuote.text}"`;
      document.getElementById('quote-author').textContent = `— ${this.currentQuote.author}`;
      setTimeout(() => {
        quoteText.style.transition = 'opacity 0.5s ease';
        quoteText.style.opacity = '1';
      }, 100);
    }
  }

  render() {
    const dashboard = document.getElementById('dashboard-tab');
    const dailyCard = this.getDailyTarotCard();
    const dailyAffirmation = this.getDailyAffirmation();
    const dailyBooster = this.getRandomBooster();
    const status = this.app.gamification
      ? this.app.gamification.getStatusSummary()
      : { quests: { daily: [], weekly: [], monthly: [] }, achievements: [], badges: [], xp: 0, karma: 0, streak: { current: 0 } };
    this.currentQuote = window.QuotesData
      ? window.QuotesData.getQuoteOfTheDay()
      : { text: 'What you think, you become. What you feel, you attract. What you imagine, you create.', author: 'Buddha' };
    dashboard.innerHTML = `
      <div class="min-h-screen p-6" style="background: #e0e5ec;">
        <div class="max-w-7xl mx-auto">
          <div class="mb-6">
            <h1 class="text-4xl font-bold mb-2" style="color: var(--neuro-text);">Welcome back, ${this.app.state.currentUser?.name || 'Seeker'}!</h1>
            <p style="color: var(--neuro-text-light);">Your spiritual journey continues...</p>
          </div>
          ${this.renderGamificationWidget()}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            ${this.renderDailyCard('tarot', dailyCard, 'Daily Tarot Card', this.CARD_BACK_URL)}
            ${this.renderAffirmationCard(dailyAffirmation)}
            ${this.renderBoosterCard(dailyBooster)}
          </div>
          ${this.renderQuestHub(status)}
          ${status.achievements.length > 0 ? this.renderRecentAchievements(status) : ''}
          <div class="neuro-card mb-8" style="padding: 40px; background: #e0e5ec;">
            <div class="text-center max-w-3xl mx-auto">
              <h3 class="text-sm uppercase tracking-wider mb-4" style="color: var(--neuro-text-light); font-weight: 600;">Quote of the Day</h3>
              <p class="text-2xl font-light italic mb-6" style="color: var(--neuro-text); line-height: 1.6;" id="quote-text">"${this.currentQuote.text}"</p>
              <p class="text-lg mb-6" style="color: var(--neuro-accent);" id="quote-author">— ${this.currentQuote.author}</p>
              <button onclick="window.app.dashboard.refreshQuote()" class="btn btn-secondary" style="padding: 10px 24px;">🔄 Refresh Quote</button>
            </div>
          </div>
        </div>
      </div>
      ${this.renderStyles()}
    `;
    this.attachEventListeners();
  }

  renderQuestHub(status) {
    const dailyCompleted = status.quests?.daily?.filter(q => q.completed).length || 0;
    const dailyTotal = status.quests?.daily?.length || 0;
    const weeklyCompleted = status.quests?.weekly?.filter(q => q.completed).length || 0;
    const weeklyTotal = status.quests?.weekly?.length || 0;
    const monthlyCompleted = status.quests?.monthly?.filter(q => q.completed).length || 0;
    const monthlyTotal = status.quests?.monthly?.length || 0;

    return `
      <div class="neuro-card mb-8" style="padding: 40px; background: #e0e5ec;">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-bold" style="color: var(--neuro-text);">🎯 Quest Hub</h3>
        </div>
        <div class="quest-tabs" style="display: flex; gap: 10px; margin-bottom: 30px; border-bottom: 2px solid #c8d1db; padding-bottom: 10px;">
          <button class="quest-tab-btn active" data-quest-tab="daily" onclick="window.app.dashboard.switchQuestTab('daily')">
            📋 Daily <span class="quest-count">(${dailyCompleted}/${dailyTotal})</span>
            <span id="countdown-daily" class="countdown-badge"></span>
          </button>
          <button class="quest-tab-btn" data-quest-tab="weekly" onclick="window.app.dashboard.switchQuestTab('weekly')">
            🌟 Weekly <span class="quest-count">(${weeklyCompleted}/${weeklyTotal})</span>
            <span id="countdown-weekly" class="countdown-badge"></span>
          </button>
          <button class="quest-tab-btn" data-quest-tab="monthly" onclick="window.app.dashboard.switchQuestTab('monthly')">
            ✨ Monthly <span class="quest-count">(${monthlyCompleted}/${monthlyTotal})</span>
            <span id="countdown-monthly" class="countdown-badge"></span>
          </button>
        </div>

        <!-- Daily -->
        <div class="quest-tab-content active" id="quest-content-daily">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${status.quests.daily.map(quest => this.renderQuestCard(quest, 'daily')).join('')}
          </div>
          ${dailyCompleted === dailyTotal && dailyTotal > 0
            ? `<div class="mt-6 p-4 text-center" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); border-radius: 12px;">
                 <p class="text-xl font-bold" style="color: white;">🌟 All Daily Quests Complete! +50 Bonus XP 🌟</p>
               </div>`
            : ''}
        </div>

        <!-- Weekly -->
        <div class="quest-tab-content" id="quest-content-weekly" style="display: none;">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${status.quests.weekly.map(quest => this.renderQuestCard(quest, 'weekly')).join('')}
          </div>
          ${weeklyCompleted === weeklyTotal && weeklyTotal > 0
            ? `<div class="mt-6 p-4 text-center" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px;">
                 <p class="text-xl font-bold" style="color: white;">⭐ All Weekly Quests Complete! Amazing! ⭐</p>
               </div>`
            : ''}
        </div>

        <!-- Monthly -->
        <div class="quest-tab-content" id="quest-content-monthly" style="display: none;">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${status.quests.monthly.map(quest => this.renderQuestCard(quest, 'monthly')).join('')}
          </div>
          ${monthlyCompleted === monthlyTotal && monthlyTotal > 0
            ? `<div class="mt-6 p-4 text-center" style="background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%); border-radius: 12px;">
                 <p class="text-xl font-bold" style="color: white;">🎉 All Monthly Quests Complete! Legendary! 🎉</p>
               </div>`
            : ''}
        </div>
      </div>
    `;
  }

  switchQuestTab(tabName) {
    const tabButtons = document.querySelectorAll('.quest-tab-btn');
    tabButtons.forEach(btn => {
      if (btn.dataset.questTab === tabName) btn.classList.add('active');
      else btn.classList.remove('active');
    });
    const tabContents = document.querySelectorAll('.quest-tab-content');
    tabContents.forEach(content => {
      if (content.id === `quest-content-${tabName}`) {
        content.style.display = 'block';
        content.classList.add('active');
      } else {
        content.style.display = 'none';
        content.classList.remove('active');
      }
    });
  }

  renderQuestCard(quest, questType = 'daily') {
    let progressPercent, progressText;
    if (quest.id === 'energy_checkin') {
      const dayDone = quest.subProgress?.day || false;
      const nightDone = quest.subProgress?.night || false;
      progressPercent = ((quest.progress / quest.target) || 0) * 100;
      progressText = `<div class="flex gap-2 justify-center mb-2 text-xs" style="color: var(--neuro-text-light);">
        <span class="${dayDone ? 'text-green-500 font-bold' : ''}">☀️ Day ${dayDone ? '✔' : ''}</span>
        <span class="${nightDone ? 'text-green-500 font-bold' : ''}">🌙 Night ${nightDone ? '✔' : ''}</span>
      </div>`;
    } else {
      progressPercent = Math.min(100, ((quest.progress / quest.target) || 0) * 100);
      progressText = `<div class="flex justify-between text-xs mb-1" style="color: var(--neuro-text-light);">
        <span>Progress</span><span>${quest.progress}/${quest.target}</span>
      </div>`;
    }
    const NEUMORPHIC_STYLE = `background: #e0e5ec; padding: 25px; border-radius: 15px; box-shadow: inset 4px 4px 8px #b8bec5, inset -4px -4px 8px #ffffff; transition: all 0.2s ease-in-out; position: relative; cursor: ${quest.completed ? 'default' : (questType === 'daily' && quest.tab ? 'pointer' : 'default')}; min-height: 220px; display: flex; flex-direction: column;`;
    const COMPLETED_STYLE = `background: #d8e0e7; box-shadow: inset 2px 2px 4px #b8bec5, inset -2px -2px 4px #ffffff; border: 1px solid #c8d1db;`;
    const clickHandler = quest.completed ? '' : (questType === 'daily' && quest.tab ? `onclick="window.app.nav.switchTab('${quest.tab}')"` : '');
    return `
      <div class="quest-card-neumorphic" style="${NEUMORPHIC_STYLE} ${quest.completed ? COMPLETED_STYLE : ''}" ${clickHandler}>
        ${quest.completed ? '<div class="quest-checkmark">✔</div>' : ''}
        <div class="flex items-start gap-4 mb-3">
          <div class="quest-icon" style="color: var(--neuro-accent); font-size: 2.5rem; flex-shrink: 0;">${quest.icon}</div>
          <div class="flex-1 text-left">
            <h4 class="text-lg font-bold mb-1" style="color: var(--neuro-text);">${quest.name}</h4>
            <p class="text-xs mb-2" style="color: var(--neuro-text-light); line-height: 1.4;">${quest.inspirational}</p>
          </div>
        </div>
        ${!quest.completed
          ? `<div class="quest-progress-container" style="margin-top: auto;">
               ${progressText}
               <div class="quest-progress-bar" style="background: #c8d1db; border-radius: 5px; overflow: hidden; height: 8px;">
                 <div class="quest-progress-fill" style="width: ${progressPercent}%; background: var(--neuro-accent); height: 100%; border-radius: 5px; transition: width 0.3s ease;"></div>
               </div>
             </div>`
          : '<div class="text-center py-2 mt-auto" style="color: #22c55e; font-weight: 600;">Quest Complete! 🎉</div>'}
        <div class="flex justify-between items-center mt-4 pt-3" style="border-top: 1px solid #c8d1db;">
          <span class="text-sm font-bold" style="color: #f59e0b;">+${quest.xpReward} XP</span>
          ${quest.karmaReward ? `<span class="text-sm font-bold" style="color: #8b5cf6;">+${quest.karmaReward} Karma</span>` : ''}
        </div>
        ${!quest.completed && questType === 'daily' && quest.tab
          ? '<div class="text-center mt-2"><span class="text-xs" style="color: var(--neuro-text-lighter);">👆 Click to start</span></div>'
          : ''}
      </div>
    `;
  }

  renderDailyCard(type, card, title, backImage) {
    return `
      <div class="neuro-card" style="padding: 30px; background: #e0e5ec;">
        <div class="daily-card-wrapper" onclick="window.app.dashboard.flipDailyCard('${type}')">
          <div class="daily-card-inner" id="${type}-flip">
            <div class="daily-card-back">
              <div class="card-content">
                <img src="${backImage}" alt="Card Back" style="width: 100%; height: auto; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <h3 class="text-xl font-bold mt-4 mb-2" style="color: var(--neuro-text);">${title}</h3>
                <p class="text-sm" style="color: var(--neuro-text-light);">Click to Reveal</p>
              </div>
            </div>
            <div class="daily-card-front">
              <div class="card-content">
                <img src="${card.image}" alt="${card.name}" style="width: 100%; height: auto; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <h3 class="text-xl font-bold mt-4 mb-2" style="color: var(--neuro-accent);">${card.name}</h3>
                <p class="text-sm" style="color: var(--neuro-text); line-height: 1.6;">${card.meaning}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderAffirmationCard(affirmation) {
    return `
      <div class="neuro-card" style="padding: 30px; background: #e0e5ec;">
        <div class="daily-card-wrapper" onclick="window.app.dashboard.flipDailyCard('affirmation')">
          <div class="daily-card-inner" id="affirmation-flip">
            <div class="daily-card-back">
              <div class="card-content">
                <img src="${this.CARD_BACK_URL}" alt="Card Back" style="width: 100%; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <h3 class="text-xl font-bold mt-4 mb-2" style="color: var(--neuro-text);">Daily Affirmation</h3>
                <p class="text-sm" style="color: var(--neuro-text-light);">Click to Reveal</p>
              </div>
            </div>
            <div class="daily-card-front">
              <div class="card-content">
                <div class="daily-card-affirmation-box">
                  <p class="text-xl font-semibold text-center" style="color: white; line-height: 1.6;">"${affirmation}"</p>
                </div>
                <h3 class="text-xl font-bold mt-4 mb-2" style="color: var(--neuro-accent);">Your Daily Affirmation</h3>
                <p class="text-sm" style="color: var(--neuro-text-light);">Embrace this message today</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderBoosterCard(booster) {
    return `
      <div class="neuro-card" style="padding: 30px; background: #e0e5ec;">
        <div class="daily-card-wrapper" onclick="window.app.dashboard.flipDailyCard('booster')">
          <div class="daily-card-inner" id="booster-flip">
            <div class="daily-card-back">
              <div class="card-content">
                <img src="${this.CARD_BACK_URL}" alt="Card Back" style="width: 100%; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <h3 class="text-xl font-bold mt-4 mb-2" style="color: var(--neuro-text);">Happiness Booster</h3>
                <p class="text-sm" style="color: var(--neuro-text-light);">Click to Reveal</p>
              </div>
            </div>
            <div class="daily-card-front">
              <div class="card-content">
                <div class="daily-card-booster-box">
                  <div class="text-6xl mb-4">${booster.emoji}</div>
                  <h4 class="text-2xl font-bold mb-3" style="color: white;">${booster.title}</h4>
                  <p class="mb-3" style="color: rgba(255,255,255,0.9); font-size: 1rem; line-height: 1.5;">${booster.description}</p>
                  <p class="text-sm" style="color: rgba(255,255,255,0.7);">${booster.duration} • ${booster.category}</p>
                </div>
                <h3 class="text-xl font-bold mt-4 mb-2" style="color: var(--neuro-accent);">Your Happiness Booster</h3>
                <p class="text-sm" style="color: var(--neuro-text-light);">Do this to refresh</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderRecentAchievements(status) {
    return `
      <div class="neuro-card mb-8" style="padding: 40px; background: #e0e5ec;">
        <h3 class="text-2xl font-bold mb-6" style="color: var(--neuro-text);">🏆 Recent Achievements</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${status.achievements.slice(-6).reverse().map(achievement => `
            <div class="p-4 text-center" style="background: rgba(102, 126, 234, 0.05); border-radius: 12px; border: 2px solid rgba(102, 126, 234, 0.3);">
              <div class="text-4xl mb-2">${achievement.icon || '🏆'}</div>
              <h4 class="font-bold mb-1" style="color: var(--neuro-text);">${achievement.name}</h4>
              <p class="text-xs mb-2" style="color: var(--neuro-text-light);">${achievement.inspirational || ''}</p>
              <span class="text-xs" style="color: #f59e0b;">+${achievement.xp} XP</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderStyles() {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500&display=swap');
        .countdown-badge{
          background:#e11d48;
          color:#fff;
          font-family:'Orbitron',monospace;
          font-size:14px;
          padding:2px 8px;
          border-radius:12px;
          margin-left:6px;
          display:inline-block;
          min-width:72px;
          text-align:center;
          letter-spacing:.5px;
        }
        .quest-tabs{display:flex;gap:10px}
        .quest-tab-btn{
          flex:1 1 0;
          min-width:0;
          background:#e0e5ec;
          border:none;
          padding:14px 10px;
          border-radius:10px;
          font-weight:600;
          cursor:pointer;
          transition:all .3s ease;
          color:var(--neuro-text-light);
          box-shadow:4px 4px 8px #b8bec5,-4px -4px 8px #fff;
          text-align:center;
        }
        .quest-tab-btn.active{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;box-shadow:inset 4px 4px 8px rgba(0,0,0,.2)}
        .daily-card-wrapper{perspective:1000px;width:100%;cursor:pointer;height:auto;position:relative}
        .daily-card-inner{position:relative;width:100%;height:auto;text-align:center;transition:transform .6s ease;transform-style:preserve-3d}
        .daily-card-inner.flipped{transform:rotateY(180deg)}
        .daily-card-back,.daily-card-front{width:100%;height:100%;backface-visibility:hidden;-webkit-backface-visibility:hidden;-moz-backface-visibility:hidden}
        .daily-card-back{position:relative;transform:rotateY(0deg);z-index:2}
        .daily-card-front{position:absolute;top:0;left:0;transform:rotateY(180deg);z-index:1;display:flex;flex-direction:column}
        .daily-card-inner.flipped .daily-card-back{z-index:1}
        .daily-card-inner.flipped .daily-card-front{z-index:2}
        .card-content{width:100%;height:100%;background:transparent;display:flex;flex-direction:column;padding:0}
        .daily-card-back img{width:100%;height:auto;display:block;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,.15)}
        .daily-card-affirmation-box,.daily-card-booster-box{width:100%;aspect-ratio:200/350;display:flex;align-items:center;justify-content:center;border-radius:12px;padding:20px;box-shadow:0 4px 12px rgba(0,0,0,.1);overflow:hidden}
        .daily-card-affirmation-box{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%)}
        .daily-card-booster-box{background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);flex-direction:column;text-align:center}
        @media (max-width:768px){.daily-card-affirmation-box,.daily-card-booster-box{aspect-ratio:200/300;padding:15px}}
        #dashboard-tab .neuro-card{background:#e0e5ec!important}
        .progress-bar{background:#c8d1db;height:8px;border-radius:999px;overflow:hidden;box-shadow:inset 1px 1px 2px var(--neuro-shadow-dark), inset -1px -1px 2px var(--neuro-shadow-light);}
        .progress-fill{height:100%;background:linear-gradient(90deg,var(--neuro-accent),var(--neuro-accent-light));border-radius:999px;transition:width .3s ease;}
        .quest-card-neumorphic .quest-checkmark{position:absolute;top:15px;right:15px;font-size:1.5rem;color:#22c55e;font-weight:700}
        .quest-count{font-size:.85rem;opacity:.8}
        .quest-tab-content{animation:fadeIn .3s ease}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      </style>
    `;
  }

  attachEventListeners() {}
}
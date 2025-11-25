// ============================================
// HAPPINESS ENGINE - WITH QUEST INTEGRATION
// ============================================

// Import affirmations data
import affirmationsData from '../data/affirmations.js';

class HappinessEngine {
  constructor(app) {
    this.app = app;
    this.boosters = [];
    this.currentBooster = null;
    this.currentQuote = null;
    this.currentAffirmation = null;
    this.boostersLoaded = false;
    
    // Load affirmations immediately
    this.affirmations = window.affirmations || affirmationsData;
    
    this.loadBoosters();
  }

  async loadBoosters() {
    try {
      console.log('📥 [HappinessEngine] Loading boosters from JSON...');
      const response = await fetch('./js/happiness-boosters.json');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.boosters || !Array.isArray(data.boosters)) {
        throw new Error('Invalid data structure');
      }
      
      this.boosters = data.boosters;
      this.boostersLoaded = true;
      
      // Reset current booster so render() gets a fresh one
      this.currentBooster = null;
      this.currentQuote = null;
      this.currentAffirmation = null;
      
      // Re-render if tab is visible
      const tab = document.getElementById('happiness-tab');
      if (tab && !tab.classList.contains('hidden')) {
        this.render();
      }
      
    } catch (error) {
      console.error('❌ [HappinessEngine] Failed to load boosters:', error);
      
      // Fallback boosters
      this.boosters = [
        { id: 1, title: '5-Minute Dance Party', emoji: '💃', description: 'Put on your favorite song and move your body!', duration: '5 min', category: 'Movement' },
        { id: 2, title: 'Gratitude Snapshot', emoji: '📸', description: 'Quickly name 3 things you\'re grateful for right now.', duration: '3 min', category: 'Mindfulness' },
        { id: 3, title: 'Power Pose', emoji: '🦸', description: 'Stand like a superhero for 2 minutes to boost confidence.', duration: '2 min', category: 'Confidence' },
        { id: 4, title: 'Mindful Sip', emoji: '🍵', description: 'Drink a glass of water or tea, focusing only on the sensation.', duration: '4 min', category: 'Calm' },
        { id: 5, title: 'Quick Stretch', emoji: '🤸', description: 'Gently stretch your arms, neck, and back for 3 minutes.', duration: '3 min', category: 'Body' },
        { id: 6, title: 'Listen to One Song', emoji: '🎶', description: 'Listen to one favorite song without any distractions.', duration: '4 min', category: 'Joy' }
      ];
      this.boostersLoaded = true;
      console.log('⚠️ [HappinessEngine] Using fallback boosters');
    }
  }

  _getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  getDailyBooster() {
    if (!this.boostersLoaded || !this.boosters || this.boosters.length === 0) {
      return { id: 0, title: 'Loading...', emoji: '⏳', description: 'Loading boosters...', duration: '...', category: 'Loading' };
    }
    return this.boosters[this._getDayOfYear() % this.boosters.length];
  }

  getRandomBooster() {
    if (!this.boostersLoaded || !this.boosters || this.boosters.length === 0) {
      return { id: 0, title: 'Loading...', emoji: '⏳', description: 'Loading boosters...', duration: '...', category: 'Loading' };
    }
    return this.app.randomFrom(this.boosters);
  }

  getDailyAffirmation() {
    const affirmations = this.affirmations || window.affirmations;
    
    if (!affirmations || !affirmations.general_positive_affirmations) {
      console.warn('⚠️ Affirmations not loaded, using fallback');
      return "You are doing great.";
    }
    
    const general = affirmations.general_positive_affirmations;
    if (!general || general.length === 0) {
      return "You are doing great.";
    }
    
    const affirmation = general[this._getDayOfYear() % general.length];
    return typeof affirmation === 'string' ? affirmation : affirmation.text;
  }
  
  getRandomAffirmation() {
    const affirmations = this.affirmations || window.affirmations;
    
    if (!affirmations) {
      console.warn('⚠️ Affirmations not loaded, using fallback');
      return "You are capable of amazing things.";
    }
    
    const allAffirmations = [];
    for (const category in affirmations) {
      const categoryAffirmations = affirmations[category];
      if (Array.isArray(categoryAffirmations)) {
        allAffirmations.push(...categoryAffirmations);
      }
    }
    
    if (allAffirmations.length === 0) {
      return "You are capable of amazing things.";
    }
    
    const randomAffirmation = this.app.randomFrom(allAffirmations);
    return typeof randomAffirmation === 'string' ? randomAffirmation : randomAffirmation.text;
  }

  // ============================================
  // VIEW TRACKING FOR QUEST INTEGRATION
  // ============================================
  
  trackView() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('daily_booster_views');
    let data = { date: today, count: 0 };
    
    if (stored) {
      try {
        data = JSON.parse(stored);
        if (data.date !== today) {
          // New day - reset count
          data = { date: today, count: 0 };
        }
      } catch (e) {
        console.error('Error reading booster views:', e);
      }
    }
    
    data.count += 1;
    localStorage.setItem('daily_booster_views', JSON.stringify(data));
    
    // ⭐ QUEST INTEGRATION: Progress quest (up to 5 views per day)
    if (data.count <= 5 && this.app.gamification) {
      this.app.gamification.progressQuest('daily', 'daily_booster', 1);
    }
    
    return data.count;
  }

  getTodayViewCount() {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('daily_booster_views');
    
    if (!stored) return 0;
    
    try {
      const data = JSON.parse(stored);
      if (data.date === today) {
        return data.count || 0;
      }
    } catch (e) {
      console.error('Error reading view count:', e);
    }
    
    return 0;
  }

  render() {
    const tab = document.getElementById('happiness-tab');
    
    if (!tab) {
      console.error('❌ Happiness tab not found!');
      return;
    }
    
    if (!this.currentBooster) {
        this.currentBooster = this.getDailyBooster();
    }
    if (!this.currentQuote) {
        this.currentQuote = window.QuotesData ? window.QuotesData.getQuoteOfTheDay() : { text: 'Stay positive!', author: 'Unknown' };
    }
    if (!this.currentAffirmation) {
        this.currentAffirmation = this.getDailyAffirmation();
    }

    const viewCount = this.getTodayViewCount();
    const viewsRemaining = Math.max(0, 5 - viewCount);

    tab.innerHTML = `
      <div class="p-6">
        <div style="max-width: 800px; margin: 0 auto;">
          <header class="text-center mb-10">
            <h1 class="text-4xl font-bold" style="color: var(--neuro-text);">Daily Happiness Boosters</h1>
            <p class="mt-4 text-lg" style="color: var(--neuro-text-light);">
              Your daily dose of inspiration with boosters, quotes, and affirmations.
            </p>
            ${viewCount > 0 ? `
              <div class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full" style="background: rgba(102, 126, 234, 0.1);">
                <span style="color: var(--neuro-accent); font-weight: bold;">${viewCount}/5 views today</span>
                ${viewCount >= 5 ? `
                  <span style="color: var(--neuro-success);">✓ Quest Complete!</span>
                ` : `
                  <span style="color: var(--neuro-text-light);">(${viewsRemaining} more to complete quest)</span>
                `}
              </div>
            ` : ''}
          </header>

          <main>
            <!-- Happiness Booster Card -->
            <div class="neuro-card">
              <div class="flex items-center mb-4">
                <span class="text-3xl" style="margin-right: 1rem;">${this.currentBooster.emoji}</span>
                <h2 class="text-2xl font-bold" style="color: var(--neuro-text);">Happiness Booster</h2>
              </div>
              <div class="text-center">
                <h3 class="text-2xl font-bold" style="color: var(--neuro-accent);">${this.currentBooster.title}</h3>
                <p class="mt-2 text-lg">${this.currentBooster.description}</p>
                <div class="mt-4 text-sm" style="color: var(--neuro-text-light);">
                  <span>${this.currentBooster.duration}</span> • <span>${this.currentBooster.category}</span>
                </div>
              </div>
              <div class="mt-6 flex justify-end">
                <button onclick="window.featuresManager.engines.happiness.refreshBooster()" class="btn btn-secondary">
                  🔄 Refresh Booster
                </button>
              </div>
            </div>

            <!-- Quote of the Day Card -->
            <div class="neuro-card">
              <div class="flex items-center mb-4">
                <span class="text-3xl" style="margin-right: 1rem;">📜</span>
                <h2 class="text-2xl font-bold" style="color: var(--neuro-text);">Quote of the Day</h2>
              </div>
              <blockquote class="text-xl italic" style="border-left: 4px solid var(--neuro-accent); padding-left: 1rem;">
                <p>"${this.currentQuote.text}"</p>
                <footer class="mt-4 text-right not-italic font-semibold" style="color: var(--neuro-text); text-align: right;">
                  — ${this.currentQuote.author}
                </footer>
              </blockquote>
              <div class="mt-6 flex justify-end">
                <button onclick="window.featuresManager.engines.happiness.refreshQuote()" class="btn btn-secondary">
                  🔄 Refresh Quote
                </button>
              </div>
            </div>

            <!-- Daily Affirmation Card -->
            <div class="neuro-card">
              <div class="flex items-center mb-4">
                <span class="text-3xl" style="margin-right: 1rem;">✨</span>
                <h2 class="text-2xl font-bold" style="color: var(--neuro-text);">Daily Affirmation</h2>
              </div>
              <p class="text-2xl font-semibold text-center" style="color: var(--neuro-accent);">
                "${this.currentAffirmation}"
              </p>
              <div class="mt-6 flex justify-end">
                <button onclick="window.featuresManager.engines.happiness.refreshAffirmation()" class="btn btn-secondary">
                  🔄 Refresh Affirmation
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    `;
    
  }

  refreshBooster() {
    this.currentBooster = this.getRandomBooster();
    
    // Track view for quest
    const viewCount = this.trackView();
    
    this.render();
    
    if (this.app.showToast) {
      if (viewCount >= 5) {
        this.app.showToast('✨ Quest complete! You\'ve viewed 5 boosters today!', 'success');
      } else {
        this.app.showToast(`✨ New booster revealed! (${viewCount}/5)`, 'success');
      }
    }
  }

  refreshQuote() {
    this.currentQuote = window.QuotesData ? window.QuotesData.getRandomQuote() : { text: 'Stay positive!', author: 'Unknown' };
    
    // Track view for quest
    const viewCount = this.trackView();
    
    this.render();
    
    if (this.app.showToast) {
      if (viewCount >= 5) {
        this.app.showToast('📜 Quest complete! You\'ve viewed 5 items today!', 'success');
      } else {
        this.app.showToast(`📜 New quote revealed! (${viewCount}/5)`, 'success');
      }
    }
  }

  refreshAffirmation() {
    this.currentAffirmation = this.getRandomAffirmation();
    
    // Track view for quest
    const viewCount = this.trackView();
    
    this.render();
    
    if (this.app.showToast) {
      if (viewCount >= 5) {
        this.app.showToast('💫 Quest complete! You\'ve viewed 5 items today!', 'success');
      } else {
        this.app.showToast(`💫 New affirmation revealed! (${viewCount}/5)`, 'success');
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.HappinessEngine = HappinessEngine;
}

export default HappinessEngine;
// ============================================
// HAPPINESS ENGINE - UPDATED WITH SELF INQUIRY CARD
// ============================================

import affirmationsData from '../Features/Data/AffirmationsList.js';
import { InquiryEngine } from '../Features/InquiryEngine.js';

class HappinessEngine {
  constructor(app) {
    this.app = app;
    this.boosters = [
      { id: 1, title: '5-Minute Dance Party', emoji: '💃', description: 'Put on your favorite song and move your body!', duration: '5 min', category: 'Movement' },
      { id: 2, title: 'Gratitude Snapshot', emoji: '📸', description: 'Quickly name 3 things you\'re grateful for right now.', duration: '3 min', category: 'Mindfulness' },
      { id: 3, title: 'Power Pose', emoji: '🦸', description: 'Stand like a superhero for 2 minutes to boost confidence.', duration: '2 min', category: 'Confidence' },
      { id: 4, title: 'Mindful Sip', emoji: '🍵', description: 'Drink a glass of water or tea, focusing only on the sensation.', duration: '4 min', category: 'Calm' },
      { id: 5, title: 'Quick Stretch', emoji: '🤸', description: 'Gently stretch your arms, neck, and back for 3 minutes.', duration: '3 min', category: 'Body' },
      { id: 6, title: 'Listen to One Song', emoji: '🎶', description: 'Listen to one favorite song without any distractions.', duration: '4 min', category: 'Joy' }
    ];
    this.boostersLoaded = true;
    this.currentBooster = this.getRandomBooster();
    this.currentQuote   = null;
    this.currentAffirmation = null;
    this.currentInquiry = null; // NEW
    this.affirmations   = window.affirmations || affirmationsData;
    
    // Initialize Inquiry Engine
    this.inquiryEngine = new InquiryEngine('beginner');
    
    this.loadBoosters();
  }

  async loadBoosters() {
    try {
      const res = await fetch('./Features/Data/HappinessBoostersList.json');
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      this.boosters = data.boosters;
      this.boostersLoaded = true;
      const tab = document.getElementById('happiness-tab');
      if (tab && !tab.classList.contains('hidden')) this.render();
    } catch (e) { console.error('boosters load failed', e); }
  }

  _getDayOfYear() {
    const now = new Date(), start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
  }
  getDailyBooster() { return this.boosters[this._getDayOfYear() % this.boosters.length]; }
  getRandomBooster() { return this.app.randomFrom(this.boosters); }
  getDailyAffirmation() {
    const list = this.affirmations?.general_positive_affirmations;
    if (!list?.length) return 'You are doing great.';
    const item = list[this._getDayOfYear() % list.length];
    return typeof item === 'string' ? item : item.text;
  }
  getRandomAffirmation() {
    const src = this.affirmations;
    if (!src) return 'You are capable of amazing things.';
    const pool = [];
    for (const cat in src) if (Array.isArray(src[cat])) pool.push(...src[cat]);
    if (!pool.length) return 'You are capable of amazing things.';
    const pick = this.app.randomFrom(pool);
    return typeof pick === 'string' ? pick : pick.text;
  }

  // NEW: Get random inquiry question
  getRandomInquiry() {
    const domains = [
      'Responsibility and Power', 'Emotional Honesty', 'Identity and Roles', 
      'Creativity and Expression', 'Shadow and Integration', 'Wisdom and Insight', 
      'Joy and Fulfillment', 'Physical Well-Being and Energy', 'Relationship', 
      'Spiritual Growth', 'Fear and Resistance', 'Boundaries and Consent',
      'Purpose and Direction', 'Mind and Awareness'
    ];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    return this.inquiryEngine.getRandomQuestion(randomDomain);
  }

  trackView() {
    const today = new Date().toDateString();
    let data = { date: today, count: 0 };
    try {
      const s = localStorage.getItem('daily_booster_views');
      if (s) { const p = JSON.parse(s); if (p.date === today) data = p; }
    } catch {}
    data.count += 1;
    localStorage.setItem('daily_booster_views', JSON.stringify(data));
    if (data.count <= 5 && this.app.gamification) this.app.gamification.progressQuest('daily', 'daily_booster', 1);
    return data.count;
  }
  getTodayViewCount() {
    const today = new Date().toDateString();
    try {
      const s = localStorage.getItem('daily_booster_views');
      if (!s) return 0;
      const p = JSON.parse(s);
      return p.date === today ? p.count || 0 : 0;
    } catch { return 0; }
  }

  /* --------------- 360° flip helper --------------- */
  _flipCard(cardId, newHtml) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const inner = card.querySelector('.flip-card-inner');
    const back  = card.querySelector('.flip-card-back');
    back.innerHTML = newHtml;
    const currentY = parseFloat(inner.style.transform.replace(/[^\d.-]/g, '')) || 0;
    inner.style.transform = `rotateY(${currentY + 360}deg)`;
    const onEnd = () => {
      inner.removeEventListener('transitionend', onEnd);
      card.querySelector('.flip-card-front').innerHTML = newHtml;
    };
    inner.addEventListener('transitionend', onEnd);
  }

  /* --------------- REFRESH ACTIONS --------------- */
  refreshBooster() {
    this.currentBooster = this.getRandomBooster();
    const viewCount = this.trackView();
    const html = `
      <div class="flex items-center" style="margin-bottom: 1rem;">
        <span class="text-3xl mr-4">${this.currentBooster.emoji}</span>
        <h2 class="text-2xl font-bold" style="color: var(--neuro-text);">A Quick Happiness Booster</h2>
      </div>
      <div class="text-center">
        <h3 class="text-2xl font-bold" style="color: var(--neuro-accent);">${this.currentBooster.title}</h3>
        <p class="mt-2 text-lg">${this.currentBooster.description}</p>
        <div class="mt-4 text-sm" style="color: var(--neuro-text-light);">
          <span>${this.currentBooster.duration}</span> • <span>${this.currentBooster.category}</span>
        </div>
      </div>
      <div class="mt-6 flex justify-end">
        <button onclick="window.featuresManager.engines.happiness.refreshBooster()" class="btn btn-secondary">🔄 Refresh Booster</button>
      </div>`;
    this._flipCard('booster-card', html);
    if (window.app?.gamification) window.app.gamification.incrementHappinessViews();
    if (this.app.showToast) {
      if (viewCount >= 5) this.app.showToast('✨ Quest complete! You\'ve viewed 5 boosters today!', 'success');
      else this.app.showToast(`✨ New booster revealed! (${viewCount}/5)`, 'success');
    }
  }

  refreshQuote() {
    this.currentQuote = window.QuotesData ? window.QuotesData.getRandomQuote() : { text: 'Stay positive!', author: 'Unknown' };
    const viewCount = this.trackView();
    const html = `
      <div class="flex items-center" style="margin-bottom: 1rem;">
        <span class="text-3xl mr-4">📜</span>
        <h2 class="text-2xl font-bold" style="color: var(--neuro-text);">Inspirational Quote</h2>
      </div>
      <p class="text-2xl font-semibold text-center" style="color: var(--neuro-accent);">
        "${this.currentQuote.text}"
      </p>
      <p class="mt-3 text-center text-lg" style="color: var(--neuro-text);">
        - ${this.currentQuote.author}
      </p>
      <div class="mt-6 flex justify-end">
        <button onclick="window.featuresManager.engines.happiness.refreshQuote()" class="btn btn-secondary">🔄 Refresh Quote</button>
      </div>`;
    this._flipCard('quote-card', html);
    if (window.app?.gamification) window.app.gamification.incrementHappinessViews();
    if (this.app.showToast) {
      if (viewCount >= 5) this.app.showToast('📜 Quest complete! You\'ve viewed 5 items today!', 'success');
      else this.app.showToast(`📜 New quote revealed! (${viewCount}/5)`, 'success');
    }
  }

  refreshAffirmation() {
    this.currentAffirmation = this.getRandomAffirmation();
    const viewCount = this.trackView();
    const html = `
      <div class="flex items-center" style="margin-bottom: 1rem;">
        <span class="text-3xl mr-4">✨</span>
        <h2 class="text-2xl font-bold" style="color: var(--neuro-text);">Positive Affirmation</h2>
      </div>
      <p class="text-2xl font-semibold text-center" style="color: var(--neuro-accent);">
        "${this.currentAffirmation}"
      </p>
      <div class="mt-6 flex justify-end">
        <button onclick="window.featuresManager.engines.happiness.refreshAffirmation()" class="btn btn-secondary">🔄 Refresh Affirmation</button>
      </div>`;
    this._flipCard('affirm-card', html);
    if (window.app?.gamification) window.app.gamification.incrementHappinessViews();
    if (this.app.showToast) {
      if (viewCount >= 5) this.app.showToast('💫 Quest complete! You\'ve viewed 5 items today!', 'success');
      else this.app.showToast(`💫 New affirmation revealed! (${viewCount}/5)`, 'success');
    }
  }

  // NEW: Refresh Inquiry
  refreshInquiry() {
    this.currentInquiry = this.getRandomInquiry();
    const viewCount = this.trackView();
    const intensityEmoji = { 1: '🌱', 2: '🌿', 3: '🌳', 4: '🔥' };
    
    const html = `
      <div class="flex items-center" style="margin-bottom: 1rem;">
        <span class="text-3xl mr-4">${intensityEmoji[this.currentInquiry.intensity] || '💭'}</span>
        <h2 class="text-2xl font-bold" style="color: var(--neuro-text);">Self Inquiry</h2>
      </div>
      <div class="text-center">
        <div style="margin-bottom: 1rem; padding: 0.5rem; background: var(--neuro-bg-secondary); border-radius: 8px; display: inline-block;">
          <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--neuro-accent);">
            ${this.currentInquiry.domain}
          </span>
        </div>
        <p class="text-2xl font-semibold" style="color: var(--neuro-accent); line-height: 1.4; margin-bottom: 1rem;">
          ${this.currentInquiry.question}
        </p>
        <p class="mt-2 text-lg" style="font-style: italic; color: var(--neuro-text-secondary);">
          ${this.currentInquiry.holding}
        </p>
        <div class="mt-4 text-sm" style="color: var(--neuro-text-light);">
          <span>Level ${this.currentInquiry.intensity}</span> • <span>Self-Inquiry</span>
        </div>
      </div>
      <div class="mt-6 flex justify-end">
        <button onclick="window.featuresManager.engines.happiness.refreshInquiry()" class="btn btn-secondary">🔄 Refresh Inquiry</button>
      </div>`;
    this._flipCard('inquiry-card', html);
    if (window.app?.gamification) window.app.gamification.incrementHappinessViews();
    if (this.app.showToast) {
      if (viewCount >= 5) this.app.showToast('💭 Quest complete! You\'ve viewed 5 items today!', 'success');
      else this.app.showToast(`💭 New inquiry revealed! (${viewCount}/5)`, 'success');
    }
  }

  /* --------------- RENDER --------------- */
  render() {
    const tab = document.getElementById('happiness-tab');
    if (!tab) return;
    if (!this.currentBooster) this.currentBooster = this.getDailyBooster();
    if (!this.currentQuote)   this.currentQuote   = window.QuotesData ? window.QuotesData.getQuoteOfTheDay() : { text: 'Stay positive!', author: 'Unknown' };
    if (!this.currentAffirmation) this.currentAffirmation = this.getDailyAffirmation();
    if (!this.currentInquiry) this.currentInquiry = this.getRandomInquiry(); // NEW
    
    const viewCount = this.getTodayViewCount();
    const viewsRemaining = Math.max(0, 5 - viewCount);
    const intensityEmoji = { 1: '🌱', 2: '🌿', 3: '🌳', 4: '🔥' };

tab.innerHTML = `
  <div style="padding:1.5rem;min-height:100vh;">
    <div class="universal-content">

      <header class="text-center" style="margin-bottom: 2.5rem;">
        <div class="main-header project-curiosity">
          <h1>Happiness and Motivation</h1>
          <h3>Your daily dose of Inspirational Quotes with Happiness Boosters, Positive-Affirmations, and Self-Inquiry.</h3>
        </div>
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

      <main class="space-y-6">
        <!--  Booster Card  -->
        <div class="neuro-card flip-card" id="booster-card">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <div class="flex items-center" style="margin-bottom: 1rem;">
                <span class="text-3xl mr-4">${this.currentBooster.emoji}</span>
                <h2 class="text-2xl font-bold" style="color: var(--neuro-text);">A Quick Happiness Booster</h2>
              </div>
              <div class="text-center">
                <h3 class="text-2xl font-bold" style="color: var(--neuro-accent);">${this.currentBooster.title}</h3>
                <p class="mt-2 text-lg">${this.currentBooster.description}</p>
                <div class="mt-4 text-sm" style="color: var(--neuro-text-light);">
                  <span>${this.currentBooster.duration}</span> • <span>${this.currentBooster.category}</span>
                </div>
              </div>
              <div class="mt-6 flex justify-end">
                <button onclick="window.featuresManager.engines.happiness.refreshBooster()" class="btn btn-secondary">🔄 Refresh Booster</button>
              </div>
            </div>
            <div class="flip-card-back"></div>
          </div>
        </div>

        <!--  Quote Card  -->
        <div class="neuro-card flip-card" id="quote-card">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <div class="flex items-center" style="margin-bottom: 1rem;">
                <span class="text-3xl mr-4">📜</span>
                <h2 class="text-2xl font-bold" style="color: var(--neuro-text);">Inspirational Quote</h2>
              </div>
              <p class="text-2xl font-semibold text-center" style="color: var(--neuro-accent);">
                "${this.currentQuote.text}"
              </p>
              <p class="mt-3 text-center text-lg" style="color: var(--neuro-text);">
                - ${this.currentQuote.author}
              </p>
              <div class="mt-6 flex justify-end">
                <button onclick="window.featuresManager.engines.happiness.refreshQuote()" class="btn btn-secondary">🔄 Refresh Quote</button>
              </div>
            </div>
            <div class="flip-card-back"></div>
          </div>
        </div>

        <!--  Affirmation Card  -->
        <div class="neuro-card flip-card" id="affirm-card">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <div class="flex items-center" style="margin-bottom: 1rem;">
                <span class="text-3xl mr-4">✨</span>
                <h2 class="text-2xl font-bold" style="color: var(--neuro-text);">Positive Affirmation</h2>
              </div>
              <p class="text-2xl font-semibold text-center" style="color: var(--neuro-accent);">
                "${this.currentAffirmation}"
              </p>
              <div class="mt-6 flex justify-end">
                <button onclick="window.featuresManager.engines.happiness.refreshAffirmation()" class="btn btn-secondary">🔄 Refresh Affirmation</button>
              </div>
            </div>
            <div class="flip-card-back"></div>
          </div>
        </div>

        <!--  NEW: Self Inquiry Card  -->
        <div class="neuro-card flip-card" id="inquiry-card">
          <div class="flip-card-inner">
            <div class="flip-card-front">
              <div class="flex items-center" style="margin-bottom: 1rem;">
                <span class="text-3xl mr-4">${intensityEmoji[this.currentInquiry.intensity] || '💭'}</span>
                <h2 class="text-2xl font-bold" style="color: var(--neuro-text);">Self Inquiry</h2>
              </div>
              <div class="text-center">
                <div style="margin-bottom: 1rem; padding: 0.5rem; background: var(--neuro-bg-secondary); border-radius: 8px; display: inline-block;">
                  <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 700; color: var(--neuro-accent);">
                    ${this.currentInquiry.domain}
                  </span>
                </div>
                <p class="text-2xl font-semibold" style="color: var(--neuro-accent); line-height: 1.4; margin-bottom: 1rem;">
                  ${this.currentInquiry.question}
                </p>
                <p class="mt-2 text-lg" style="font-style: italic; color: var(--neuro-text-secondary);">
                  ${this.currentInquiry.holding}
                </p>
                <div class="mt-4 text-sm" style="color: var(--neuro-text-light);">
                  <span>Level ${this.currentInquiry.intensity}</span> • <span>Self-Inquiry</span>
                </div>
              </div>
              <div class="mt-6 flex justify-end">
                <button onclick="window.featuresManager.engines.happiness.refreshInquiry()" class="btn btn-secondary">🔄 Refresh Inquiry</button>
              </div>
            </div>
            <div class="flip-card-back"></div>
          </div>
        </div>
      </main>

    </div>
  </div>
`;
  }
}

if (typeof window !== 'undefined') window.HappinessEngine = HappinessEngine;
export default HappinessEngine;
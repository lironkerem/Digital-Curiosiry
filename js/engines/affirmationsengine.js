// ============================================
// AFFIRMATIONS ENGINE - FIXED VERSION
// ============================================

// Import affirmations data
import affirmationsData from '../data/affirmations.js';

class AffirmationsEngine {
  constructor(app) {
    this.app = app;
    // Load from imported data instead of hardcoded fallback
    this.affirmations = window.affirmations || affirmationsData || {
      general_positive_affirmations: [
        { text: "I am worthy of love and belonging exactly as I am", tags: [] },
        { text: "I trust in the divine timing of my life", tags: [] },
        { text: "I am safe, protected, and guided", tags: [] }
      ]
    };
    this.currentAffirmation = null;
    
    console.log('✅ Affirmations loaded:', Object.keys(this.affirmations).length, 'categories');
  }

  render() {
    const tab = document.getElementById('affirmations-tab');
    
    if (!this.currentAffirmation) {
      tab.innerHTML = `
        <div class="min-h-screen bg-gray-900 p-6">
          <div class="max-w-6xl mx-auto">
            <h2 class="text-4xl font-bold text-white mb-4">Positive Affirmations</h2>
            <p class="text-gray-400 mb-8">Powerful statements to reprogram your mindset</p>

            <div class="text-center mb-12">
              <div class="flip-card inline-block w-80 h-48 mb-6" onclick="this.classList.toggle('flipped')">
                <div class="flip-card-inner">
                  <div class="flip-card-front bg-gradient-to-br from-pink-600 to-purple-600 p-8 flex items-center justify-center">
                    <div class="text-center">
                      <p class="text-white text-2xl font-bold mb-4">Daily Affirmation</p>
                      <p class="text-pink-100">Tap to reveal ✨</p>
                    </div>
                  </div>
                  <div class="flip-card-back bg-gradient-to-br from-purple-600 to-blue-600 p-8 flex items-center justify-center">
                    <p class="text-white text-xl font-semibold text-center">
                      "${this.getDailyAffirmation()}"
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <button onclick="window.featuresManager.engines.affirmations.randomCard()" class="btn btn-primary text-lg">
                  🎲 Random Affirmation
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      tab.innerHTML = `
        <div class="min-h-screen bg-gray-900 p-6">
          <div class="max-w-4xl mx-auto flex items-center justify-center min-h-[80vh]">
            <div class="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 text-center w-full max-w-2xl">
              <div class="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <span class="text-5xl">✨</span>
              </div>
              <p class="text-white text-4xl font-bold mb-12">
                "${this.currentAffirmation}"
              </p>
              <div class="flex justify-center space-x-4">
                <button onclick="window.featuresManager.engines.affirmations.reset()" class="btn btn-secondary">
                  ← Back
                </button>
                <button onclick="window.featuresManager.engines.affirmations.randomCard()" class="btn btn-primary">
                  🎲 Another One
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  getDailyAffirmation() {
    // Get affirmations array
    const general = this.affirmations.general_positive_affirmations || [];
    
    if (general.length === 0) {
      console.warn('⚠️ No affirmations loaded');
      return "I am worthy of love and belonging exactly as I am.";
    }
    
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const affirmation = general[dayOfYear % general.length];
    
    // Handle both string and object formats
    const text = typeof affirmation === 'string' ? affirmation : affirmation.text;
    
    console.log('💫 Daily affirmation selected:', text.substring(0, 50) + '...');
    return text;
  }

  randomCard() {
    // Flatten all affirmation categories into one array
    const allAffirmations = [];
    
    for (const category in this.affirmations) {
      const categoryAffirmations = this.affirmations[category];
      if (Array.isArray(categoryAffirmations)) {
        allAffirmations.push(...categoryAffirmations);
      }
    }
    
    if (allAffirmations.length === 0) {
      console.warn('⚠️ No affirmations available');
      this.currentAffirmation = "I am worthy of love and belonging exactly as I am.";
    } else {
      const randomAffirmation = allAffirmations[Math.floor(Math.random() * allAffirmations.length)];
      this.currentAffirmation = typeof randomAffirmation === 'string' ? randomAffirmation : randomAffirmation.text;
    }
    
    this.render();
  }

  reset() {
    this.currentAffirmation = null;
    this.render();
  }
}

// Export for ES6 modules
export default AffirmationsEngine;

// Also expose to window for backward compatibility
if (typeof window !== 'undefined') {
  window.AffirmationsEngine = AffirmationsEngine;
}
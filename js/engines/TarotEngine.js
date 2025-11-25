// js/TarotEngine.js - Complete Tarot System with Quest Integration
// Includes Major Arcana, Minor Arcana, Court Cards, and Card Back Flip Animation

class TarotEngine {
  constructor(app) {
    this.app = app;
    this.TAROT_BASE_URL = 'https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/Tarot%20Cards%20images/';
    this.CARD_BACK_URL = 'https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/Tarot%20Cards%20images/CardBacks.jpg';
    
    this.spreads = {
      single: { 
        name: 'Daily Oracle', 
        cards: 1, 
        desc: 'Single card guidance',
        positions: ['Your Card']
      },
      three: { 
        name: '3-Card Spread', 
        cards: 3, 
        desc: 'Past • Present • Future',
        positions: ['Past', 'Present', 'Future']
      },
      six: { 
        name: '6-Card Insight', 
        cards: 6, 
        desc: 'Complete situational analysis',
        positions: ['Situation', 'Challenge', 'Past Influence', 'Future Influence', 'Your Power', 'Outcome']
      }
    };
    
    this.selectedSpread = 'single';
    this.shuffledDeck = [];
    this.flippedCards = new Set();
    this.currentReading = []; // Track current reading for quest

    this.prepareReading();
  }

  // ============================================
  // CARD NAME GENERATION
  // ============================================
  
  getTarotCardName(number, suit = 'major') {
    if (suit === 'major') {
      const names = {
        0: "The Fool", 1: "The Magician", 2: "The High Priestess",
        3: "The Empress", 4: "The Emperor", 5: "The Hierophant",
        6: "The Lovers", 7: "The Chariot", 8: "Strength",
        9: "The Hermit", 10: "Wheel of Fortune", 11: "Justice",
        12: "The Hanged Man", 13: "Death", 14: "Temperance",
        15: "The Devil", 16: "The Tower", 17: "The Star",
        18: "The Moon", 19: "The Sun", 20: "Judgement", 21: "The World"
      };
      return names[number] || "The Fool";
    } else {
      const suitNames = {
        'pentacles': 'Pentacles',
        'swords': 'Swords', 
        'cups': 'Cups',
        'wands': 'Wands'
      };
      
      if (number <= 10) {
        return `${number} of ${suitNames[suit]}`;
      } else {
        const courts = { 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King' };
        return `${courts[number]} of ${suitNames[suit]}`;
      }
    }
  }

  // ============================================
  // CARD IMAGE URL GENERATION
  // ============================================
  
  getTarotCardImage(number, suit = 'major') {
    if (suit === 'major') {
      const num = String(number).padStart(2, '0');
      const name = this.getTarotCardName(number, 'major').replace(/\s+/g, '');
      return `${this.TAROT_BASE_URL}${num}-${name}.jpg`;
    } else {
      const suitCap = suit.charAt(0).toUpperCase() + suit.slice(1);
      const num = String(number).padStart(2, '0');
      return `${this.TAROT_BASE_URL}${suitCap}${num}.jpg`;
    }
  }

  // ============================================
  // CARD MEANINGS
  // ============================================
  
  getTarotCardMeaning(number, suit = 'major') {
    if (suit === 'major') {
      const meanings = {
        0: "A sacred beginning, full of faith and curiosity. Trust the unknown path before you.", 1: "All the tools are in your hands. You are the bridge between spirit and matter.", 2: "Silence holds the answers you seek. Trust your inner knowing.", 3: "The Earth mirrors your abundance. Nurture what you love.", 4: "True power is built through order and wisdom. Take authority over your life.", 5: "Seek guidance in tradition and timeless truth. Knowledge becomes lived wisdom.", 6: "Union of soul and choice of heart. Harmony is born when love aligns with truth.", 7: "Willpower shapes destiny. Victory is achieved through balance of heart and mind.", 8: "Gentle courage tames inner storms. True strength is soft yet unbreakable.", 9: "Withdraw to reconnect with your light. The answers you seek are within.", 10: "Life turns in divine rhythm. Every rise and fall carries hidden blessings.", 11: "The scales always balance in time. Choose integrity.", 12: "Surrender brings revelation. Sometimes you must pause to see from a higher angle.", 13: "Endings are beginnings disguised. Transformation renews you into higher truth.", 14: "Balance is your sacred art. Patience and moderation bring peace.", 15: "Bondage is often self-made. Recognize what controls you and reclaim your power.", 16: "When illusion collapses, liberation follows. Trust the breakdown.", 17: "Hope returns like light after storm. Believe again in miracles.", 18: "The path is unclear but alive with mystery. Feel your way through intuition.", 19: "Joy, clarity, and vitality fill your being. Let your light shine.", 20: "Awakening through self-realization. Rise into your higher purpose.", 21: "Completion, integration, and mastery. Celebrate how far you've come."
      };
      return meanings[number] || "New beginnings and infinite possibility await you.";
    } else if (number <= 10) {
      return this.getMinorArcanaMeaning(number, suit);
    } else {
      return this.getCourtCardMeaning(number, suit);
    }
  }

  getMinorArcanaMeaning(number, suit) {
    const meanings = {
      pentacles: { 1: "New financial opportunity or material beginning. Plant seeds for future abundance.", 2: "Balance between multiple priorities. Juggling responsibilities with grace.", 3: "Collaboration and teamwork. Your skills are recognized and valued.", 4: "Holding on too tightly. Security through control or fear of loss.", 5: "Financial or material hardship. Temporary struggle leads to resilience.", 6: "Generosity and fair exchange. Giving and receiving in balance.", 7: "Patience with long-term investments. Results take time to manifest.", 8: "Mastery through practice. Dedication to craft and skill development.", 9: "Self-sufficiency and material comfort. Enjoying the fruits of your labor.", 10: "Lasting wealth and legacy. Family, tradition, and generational abundance." },
      swords: { 1: "Mental clarity and breakthrough. Truth cuts through confusion.", 2: "Difficult decision or stalemate. Time to weigh options carefully.", 3: "Heartbreak or painful truth. Necessary release brings healing.", 4: "Rest and recovery. Taking time to recharge mentally.", 5: "Conflict and defeat. Learning humility through challenge.", 6: "Transition to calmer waters. Moving away from turmoil.", 7: "Deception or strategy. Proceed with awareness and caution.", 8: "Mental restriction. Breaking free from limiting beliefs.", 9: "Anxiety and worry. Nightmares that lose power in daylight.", 10: "Ending of a difficult cycle. Rock bottom becomes foundation." },
      cups: { 1: "New emotional beginning. Opening your heart to love and connection.", 2: "Partnership and mutual attraction. Harmony between two souls.", 3: "Celebration and friendship. Joy shared multiplies.", 4: "Emotional apathy or missed opportunity. Look beyond dissatisfaction.", 5: "Loss and disappointment. Grief that teaches perspective.", 6: "Nostalgia and innocence. Returning to simpler joys.", 7: "Illusion and fantasy. Ground dreams in reality.", 8: "Walking away from the familiar. Seeking deeper meaning.", 9: "Emotional fulfillment. Wishes granted, contentment realized.", 10: "Lasting happiness and family harmony. Emotional abundance overflows." },
      wands: { 1: "Creative spark and new inspiration. Bold initiative ignites passion.", 2: "Future planning and decisions. Vision meets preparation.", 3: "Expansion and foresight. Progress through strategic action.", 4: "Celebration and homecoming. Stability through joyful foundation.", 5: "Competition and conflict. Growth through challenge.", 6: "Victory and recognition. Success earned through perseverance.", 7: "Standing your ground. Defending your position with courage.", 8: "Swift action and momentum. Things move quickly now.", 9: "Resilience and persistence. Nearly there—don't give up.", 10: "Burden of responsibility. Carrying weight that may not be yours." }
    };
    return meanings[suit]?.[number] || "This card brings its unique energy to your reading.";
  }

  getCourtCardMeaning(number, suit) {
    const courtNames = { 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King' };
    const rank = courtNames[number];
    const meanings = {
      pentacles: { Page: "Student of the material world. Eager to learn practical skills and build security.", Knight: "Methodical and reliable. Steady progress toward tangible goals.", Queen: "Nurturer of resources. Abundant, practical, and grounded in care.", King: "Master of the material realm. Wealthy in wisdom and resources." },
      swords: { Page: "Curious mind seeking truth. Quick wit but inexperienced with consequences.", Knight: "Driven by ideals and logic. Charging forward with mental clarity.", Queen: "Sharp intellect with experience. Clear boundaries and honest communication.", King: "Authority through wisdom. Just, logical, and fair in judgment." },
      cups: { Page: "Emotionally open and intuitive. Beginning to understand feelings and dreams.", Knight: "Romantic and idealistic. Following the heart with passion.", Queen: "Emotionally mature and compassionate. Deeply intuitive and nurturing.", King: "Emotional mastery and diplomacy. Calm waters and balanced heart." },
      wands: { Page: "Enthusiastic explorer. New creative ventures and bold messages.", Knight: "Adventurous and impulsive. Chasing passion with fiery energy.", Queen: "Confident and charismatic. Inspiring others through authentic presence.", King: "Visionary leader. Turning inspiration into lasting impact." }
    };
    return meanings[suit]?.[rank] || "This court card represents a person or energy in your life.";
  }

  // ============================================
  // DECK BUILDING & READING PREPARATION
  // ============================================
  
  buildFullDeck() {
    const fullDeck = [];
    for (let i = 0; i <= 21; i++) {
      fullDeck.push({ type: 'major', number: i, suit: 'major' });
    }
    const suits = ['pentacles', 'swords', 'cups', 'wands'];
    suits.forEach(suit => {
      for (let i = 1; i <= 14; i++) {
        fullDeck.push({ type: i <= 10 ? 'minor' : 'court', number: i, suit: suit });
      }
    });
    return fullDeck;
  }

  shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  prepareReading() {
    const fullDeck = this.buildFullDeck();
    this.shuffledDeck = this.shuffleDeck(fullDeck);
    this.flippedCards.clear();
    this.currentReading = []; // Reset current reading
  }

  // ============================================
  // CARD FLIP ANIMATION & REVEAL - WITH QUEST INTEGRATION
  // ============================================
  
  flipCard(index) {
    if (this.flippedCards.has(index)) return;

    if (!this.shuffledDeck || this.shuffledDeck.length === 0) {
      if (this.app.showToast) this.app.showToast("No more cards in the deck!", "error");
      return;
    }
    
    this.flippedCards.add(index);
    const cardData = this.shuffledDeck.pop();
    const card = {
        name: this.getTarotCardName(cardData.number, cardData.suit),
        meaning: this.getTarotCardMeaning(cardData.number, cardData.suit),
        imageUrl: this.getTarotCardImage(cardData.number, cardData.suit),
        cardData: cardData
    };
    
    // Add to current reading
    this.currentReading.push(card);
    
    const cardContainer = document.getElementById(`tarot-card-container-${index}`);
    const cardFront = cardContainer.querySelector('.tarot-card-front');
    const cardDetails = document.getElementById(`tarot-card-details-${index}`);

    if (cardContainer && cardFront && cardDetails) {
        cardFront.innerHTML = `<img src="${card.imageUrl}" alt="${card.name}" class="tarot-card-image" onerror="this.style.display='none'; this.parentElement.innerHTML='<div class="tarot-card-error"></div>`;
        
        cardDetails.innerHTML = `
            <h4 class="font-bold mt-4 mb-2" style="color: var(--neuro-text);">${card.name}</h4>
            <p style="color: var(--neuro-text-light);" class="text-sm leading-relaxed">${card.meaning}</p>
        `;
        cardDetails.style.opacity = '1';
        cardDetails.style.transition = 'opacity 0.5s ease 0.5s';

        cardContainer.classList.add('flipped');
    }

    // ⭐ QUEST INTEGRATION: Check if spread is complete
    this.checkSpreadCompletion();
  }

  // ============================================
  // SPREAD COMPLETION & QUEST TRACKING
  // ============================================
  
  checkSpreadCompletion() {
    const numCards = this.spreads[this.selectedSpread].cards;
    
    // Check if all cards in the spread have been flipped
    if (this.flippedCards.size === numCards) {
      // Spread is complete!
      this.completeTarotSpread();
    }
  }

  completeTarotSpread() {
    const spreadType = this.spreads[this.selectedSpread].name;
    
    // Save the reading to state
    if (this.app.state) {
      const reading = {
        spreadType: spreadType,
        spreadKey: this.selectedSpread,
        cards: this.currentReading.map(c => ({
          name: c.name,
          meaning: c.meaning
        })),
        timestamp: new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      };
      
      this.app.state.addEntry('tarot', reading);
    }

    // ⭐ QUEST INTEGRATION: Trigger daily quest (any spread type counts)
    if (this.app.gamification) {
      this.app.gamification.progressQuest('daily', 'tarot_spread', 1);
    }

    // Show completion message
    if (this.app.showToast) {
      this.app.showToast(`✨ ${spreadType} complete! Reading saved.`, 'success');
    }

    // Check for achievements
    this.checkAchievements();
  }

  checkAchievements() {
    const total = this.app.state?.data?.tarotEntries?.length || 0;
    const gm = this.app.gamification;

    if (!gm) return;

    // First tarot reading
    if (total === 1) {
      gm.grantAchievement({ 
        id: 'first_tarot', 
        name: 'First Reading', 
        xp: 50, 
        icon: '🃏', 
        inspirational: 'You\'ve opened the door to divine guidance!' 
      });
    }

    // 10 tarot readings
    if (total === 10) {
      gm.grantAchievement({ 
        id: 'tarot_10', 
        name: 'Tarot Apprentice', 
        xp: 100, 
        icon: '🔮', 
        inspirational: '10 readings! The cards speak to you clearly!' 
      });
    }

    // 50 tarot readings
    if (total === 50) {
      gm.grantAchievement({ 
        id: 'tarot_50', 
        name: 'Tarot Master', 
        xp: 250, 
        icon: '✨', 
        inspirational: '50 readings! You are attuned to cosmic wisdom!' 
      });
    }

    // 100 tarot readings
    if (total === 100) {
      gm.grantAchievement({ 
        id: 'tarot_100', 
        name: 'Oracle of the Cards', 
        xp: 500, 
        icon: '🌟', 
        inspirational: '100 readings! The universe speaks through you!' 
      });
    }
  }

  // ============================================
  // RENDERING
  // ============================================
  
  render() {
    const tab = document.getElementById('tarot-tab');
    if (!tab) return;
    
    const numCards = this.spreads[this.selectedSpread].cards;
    const positions = this.spreads[this.selectedSpread].positions;
    
    let gridClass = 'md:grid-cols-1';
    let cardWidth = 'max-w-[250px]';
    if (numCards === 3) {
        gridClass = 'md:grid-cols-3';
        cardWidth = 'max-w-[220px]';
    } else if (numCards === 6) {
        gridClass = 'grid-cols-2 md:grid-cols-3';
        cardWidth = 'max-w-[200px]';
    }

    tab.innerHTML = `
      <div class="min-h-screen p-6">
        <div class="max-w-7xl mx-auto">
          <!-- Spread Selection UI -->
          <div class="text-center mb-8">
            <h2 class="text-4xl font-bold mb-4" style="color: var(--neuro-text);">Tarot Guidance</h2>
            <p style="color: var(--neuro-text-light); font-size: 1.1rem;" class="mb-8">Choose a spread for your reading</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            ${Object.entries(this.spreads).map(([key, spread]) => `
              <div onclick="window.featuresManager.engines.tarot.selectSpread('${key}')" class="card cursor-pointer ${this.selectedSpread === key ? 'border-4' : ''}" style="${this.selectedSpread === key ? 'border-color: var(--neuro-accent);' : ''} padding: 1.5rem;">
                <h4 class="text-xl font-bold mb-2" style="color: var(--neuro-text);">${spread.name}</h4>
                <p style="color: var(--neuro-text-light);" class="text-sm">${spread.desc}</p>
              </div>
            `).join('')}
          </div>

          <!-- Card Reading Area -->
          <div class="card" style="padding: 2rem;">
            <div class="flex items-center justify-between mb-8">
              <h3 class="text-2xl font-bold" style="color: var(--neuro-text);">${this.spreads[this.selectedSpread].name}</h3>
              <p style="color: var(--neuro-text-light);">Click a card to reveal its meaning</p>
            </div>
            <div class="grid ${gridClass} gap-x-6 gap-y-10 place-items-center">
              ${Array.from({ length: numCards }).map((_, index) => `
                <div class="flex flex-col items-center w-full ${cardWidth} mx-auto">
                  <h4 class="text-lg font-bold mb-3 h-8" style="color: var(--neuro-accent);">${positions[index] || ''}</h4>
                  <div class="tarot-card-flip-container" id="tarot-card-container-${index}" onclick="window.featuresManager.engines.tarot.flipCard(${index})">
                    <div class="tarot-card-flip-inner">
                      <div class="tarot-card-back">
                        <img src="${this.CARD_BACK_URL}" alt="Card Back" class="tarot-card-image">
                      </div>
                      <div class="tarot-card-front">
                        <!-- Image injected here -->
                      </div>
                    </div>
                  </div>
                  <div id="tarot-card-details-${index}" class="text-center mt-2" style="opacity: 0; min-height: 100px;">
                    <!-- Details injected here -->
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
      <style>
        .tarot-card-flip-container { perspective: 1000px; cursor: pointer; width: 100%; aspect-ratio: 200 / 350; }
        .tarot-card-flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.8s; transform-style: preserve-3d; }
        .tarot-card-flip-container.flipped .tarot-card-flip-inner { transform: rotateY(180deg); }
        .tarot-card-back, .tarot-card-front { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; }
        .tarot-card-front { transform: rotateY(180deg); }
        .tarot-card-image { width: 100%; height: 100%; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .tarot-card-error { display:flex; align-items:center; justify-content:center; height:100%; font-size:4rem; }
      </style>
    `;
  }

  // ============================================
  // USER INTERACTIONS
  // ============================================
  
  selectSpread(spreadKey) {
    this.selectedSpread = spreadKey;
    this.prepareReading();
    this.render();
  }

  reset() {
    this.selectSpread(this.selectedSpread);
  }
}

// ============================================
// EXPORTS
// ============================================

// Export for ES6 modules
export default TarotEngine;

// Also expose to window for backward compatibility
if (typeof window !== 'undefined') {
  window.TarotEngine = TarotEngine;
}
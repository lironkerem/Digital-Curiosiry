// js/energy-engine-enhanced.js - WITH QUEST INTEGRATION

class EnergyEngineEnhanced {
  constructor(app) {
    this.app = app;
    this.searchQuery = '';
    
    // Chakra definitions
    this.CHAKRAS = [
      { key: 'root', name: 'Root', color: '#e04b4b' },
      { key: 'sacral', name: 'Sacral', color: '#f08a4b' },
      { key: 'solar', name: 'Solar', color: '#f6c24a' },
      { key: 'heart', name: 'Heart', color: '#6fcf97' },
      { key: 'throat', name: 'Throat', color: '#5fb7f0' },
      { key: 'thirdEye', name: 'Third Eye', color: '#8b6be6' },
      { key: 'crown', name: 'Crown', color: '#c59ee9' }
    ];
    
    // Mood options
    this.MOODS = ['grounded', 'anxious', 'calm', 'happy', 'creative', 'tired', 'focused'];
    
    // Practices library
    this.PRACTICES = [
      { 
        id: 'ground.3', 
        title: '3 min Grounding', 
        description: 'Grounding breath and roots visualization', 
        durationSec: 180,
        chakra: 'root'
      },
      { 
        id: 'heart.5', 
        title: '5 min Heart Soften', 
        description: 'Loving kindness practice', 
        durationSec: 300,
        chakra: 'heart'
      },
      { 
        id: 'root.7', 
        title: '7 min Root Reset', 
        description: 'Earthing and body scan', 
        durationSec: 420,
        chakra: 'root'
      }
    ];
    
    // Current check-in state
    this.currentCheckin = this.getTodayCheckin();
  }

  // ============================================
  // DATA MANAGEMENT
  // ============================================
  
  getTodayCheckin() {
    const today = this.getISODate();
    const entries = this.app.state.data.energyEntries || [];
    const todayEntry = entries.find(e => this.getISODate(e.timestamp) === today);
    
    if (todayEntry && todayEntry.chakras) {
      return {
        overallEnergy: todayEntry.energy || 6,
        moodTags: todayEntry.moodTags || [],
        chakras: todayEntry.chakras,
        notes: todayEntry.notes || '',
        practicesDone: todayEntry.practicesDone || [],
        timestamp: todayEntry.timestamp,
        dayCheckin: todayEntry.dayCheckin || false,
        nightCheckin: todayEntry.nightCheckin || false
      };
    }
    
    return {
      overallEnergy: 6,
      moodTags: [],
      chakras: this.getDefaultChakraSnapshot(),
      notes: '',
      practicesDone: [],
      timestamp: Date.now(),
      dayCheckin: false,
      nightCheckin: false
    };
  }
  
  getDefaultChakraSnapshot() {
    const snapshot = {};
    this.CHAKRAS.forEach(c => snapshot[c.key] = 5);
    return snapshot;
  }
  
  getISODate(timestamp = Date.now()) {
    const d = new Date(timestamp);
    d.setHours(0, 0, 0, 0);
    return d.toISOString().split('T')[0];
  }
  
  // ============================================
  // SAVE CHECK-IN - WITH QUEST INTEGRATION
  // ============================================
  saveCheckin(commitPractice = false) {
    const today = this.getISODate();
    const hour = new Date().getHours();
    
    // Determine time of day (5am-5pm = day, 5pm-5am = night)
    const timeOfDay = (hour >= 5 && hour < 17) ? 'day' : 'night';
    
    // Update or create entry
    const entries = this.app.state.data.energyEntries || [];
    const existingIndex = entries.findIndex(e => this.getISODate(e.timestamp) === today);
    
    // Mark which check-in was done
    if (timeOfDay === 'day') {
      this.currentCheckin.dayCheckin = true;
    } else {
      this.currentCheckin.nightCheckin = true;
    }
    
    const entry = {
      energy: this.currentCheckin.overallEnergy,
      moodTags: this.currentCheckin.moodTags,
      chakras: this.currentCheckin.chakras,
      notes: this.currentCheckin.notes,
      practicesDone: commitPractice ? 
        [...(this.currentCheckin.practicesDone || []), 'manual'] : 
        (this.currentCheckin.practicesDone || []),
      timestamp: Date.now(),
      date: today,
      dayCheckin: this.currentCheckin.dayCheckin,
      nightCheckin: this.currentCheckin.nightCheckin,
      timeOfDay: timeOfDay // Track which time this save was
    };
    
    if (existingIndex >= 0) {
      // Preserve previous check-ins
      const existing = entries[existingIndex];
      entry.dayCheckin = entry.dayCheckin || existing.dayCheckin;
      entry.nightCheckin = entry.nightCheckin || existing.nightCheckin;
      entries[existingIndex] = entry;
    } else {
      entries.unshift(entry);
    }
    
    this.app.state.data.energyEntries = entries;
    this.app.state.saveAppData();
    this.app.state.updateStreak();
    
    // ⭐ QUEST INTEGRATION: Trigger energy check-in quest
    if (this.app.gamification) {
      this.app.gamification.progressEnergyCheckin(timeOfDay);
    }
    
    // Show appropriate message
    const checkinType = timeOfDay === 'day' ? 'Day' : 'Night';
    this.app.showToast(`✅ ${checkinType} energy check-in saved!`, 'success');
    
    // Check for achievements
    this.checkAchievements();
    
    this.render();
  }

  checkAchievements() {
    const total = this.app.state.data.energyEntries?.length || 0;
    const gm = this.app.gamification;

    if (!gm) return;

    // First check-in
    if (total === 1) {
      gm.grantAchievement({ 
        id: 'first_energy', 
        name: 'Energy Awareness', 
        xp: 50, 
        icon: '⚡', 
        inspirational: 'You\'ve begun tracking your energy!' 
      });
    }

    // 10 check-ins
    if (total === 10) {
      gm.grantAchievement({ 
        id: 'energy_10', 
        name: 'Energy Explorer', 
        xp: 100, 
        icon: '🌟', 
        inspirational: '10 check-ins! Your awareness grows!' 
      });
    }

    // 50 check-ins
    if (total === 50) {
      gm.grantAchievement({ 
        id: 'energy_50', 
        name: 'Energy Master', 
        xp: 250, 
        icon: '✨', 
        inspirational: '50 check-ins! You understand your energy patterns!' 
      });
    }

    // 100 check-ins
    if (total === 100) {
      gm.grantAchievement({ 
        id: 'energy_100', 
        name: 'Energy Sage', 
        xp: 500, 
        icon: '🔮', 
        inspirational: '100 check-ins! You are a master of energy flow!' 
      });
    }
  }
  
  getWeeklyData() {
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7.push(this.getISODate(d.getTime()));
    }
    
    const entries = this.app.state.data.energyEntries || [];
    return last7.map(date => {
      const entry = entries.find(e => this.getISODate(e.timestamp) === date);
      return entry ? entry.energy : 0;
    });
  }
  
  getChakraAverages() {
    const entries = this.app.state.data.energyEntries || [];
    if (entries.length === 0) return this.getDefaultChakraSnapshot();
    
    const totals = this.getDefaultChakraSnapshot();
    Object.keys(totals).forEach(key => totals[key] = 0); // reset to 0
    let count = 0;
    
    entries.forEach(entry => {
      if (entry.chakras) {
        count++;
        this.CHAKRAS.forEach(c => {
          totals[c.key] += (entry.chakras[c.key] || 0);
        });
      }
    });
    
    if (count === 0) return this.getDefaultChakraSnapshot();
    
    const averages = {};
    this.CHAKRAS.forEach(c => {
      averages[c.key] = Math.round((totals[c.key] / count) * 10) / 10;
    });
    
    return averages;
  }

  // ============================================
  // MAIN RENDER (SINGLE VIEW)
  // ============================================
  
  render() {
    const tab = document.getElementById('energy-tab');
    const stats = this.app.state.getStats();
    const weeklyData = this.getWeeklyData();
    const chakraAvg = this.getChakraAverages();
    const journalEntries = this.app.state.data.energyEntries || [];
    
    const filteredJournal = this.searchQuery ? 
      journalEntries.filter(e => 
        (e.notes || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (e.moodTags || []).join(' ').toLowerCase().includes(this.searchQuery.toLowerCase())
      ) : journalEntries;

    // Get current time of day
    const hour = new Date().getHours();
    const timeOfDay = (hour >= 5 && hour < 17) ? 'day' : 'night';
    const checkinStatus = timeOfDay === 'day' ? this.currentCheckin.dayCheckin : this.currentCheckin.nightCheckin;

    tab.innerHTML = `
      <div class="min-h-screen p-6" style="background: var(--neuro-bg);">
        <div class="max-w-7xl mx-auto">
          
          <!-- Header -->
          <div class="mb-6">
            <h2 class="text-4xl font-bold mb-2" style="color: var(--neuro-text);">Energy Tracker</h2>
            <p style="color: var(--neuro-text-light); font-size: 1.1rem;">Daily check-in, chakra health, and journal</p>
          </div>

          <!-- Main Check-in Card -->
          <div class="card mb-6">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-2xl font-bold" style="color: var(--neuro-text);">Good ${this.getTimeOfDay()}</h3>
                <p class="text-sm" style="color: var(--neuro-text-light);">How is your energy today?</p>
                ${checkinStatus ? `
                  <p class="text-sm mt-1" style="color: var(--neuro-success);">
                    ✓ ${timeOfDay === 'day' ? 'Day' : 'Night'} check-in completed
                  </p>
                ` : ''}
              </div>
              <div class="text-right">
                <p class="text-sm" style="color: var(--neuro-text-light);">${new Date().toLocaleDateString()}</p>
                <p class="text-sm" style="color: var(--neuro-text-light);">Streak: ${stats.currentStreak} day(s)</p>
                <div class="flex gap-2 mt-2 justify-end text-xs">
                  <span class="${this.currentCheckin.dayCheckin ? 'badge badge-success' : 'badge'}" style="padding: 4px 8px;">
                    ☀️ Day ${this.currentCheckin.dayCheckin ? '✓' : ''}
                  </span>
                  <span class="${this.currentCheckin.nightCheckin ? 'badge badge-success' : 'badge'}" style="padding: 4px 8px;">
                    🌙 Night ${this.currentCheckin.nightCheckin ? '✓' : ''}
                  </span>
                </div>
              </div>
            </div>

            <!-- Overall Energy Slider -->
            <div class="mb-6">
              <label class="form-label">Overall Energy Level</label>
              <div class="flex items-center gap-4">
                <input 
                  type="range" 
                  id="energy-overall-slider"
                  min="0" 
                  max="10" 
                  step="0.5"
                  value="${this.currentCheckin.overallEnergy}"
                  class="flex-1"
                />
                <span id="energy-overall-value" class="text-3xl font-bold" style="color: var(--neuro-accent); min-width: 3rem; text-align: center;">
                  ${this.currentCheckin.overallEnergy}
                </span>
              </div>
              <div class="flex justify-between mt-2">
                <span class="text-sm" style="color: var(--neuro-text-light);">Low</span>
                <span class="text-sm" style="color: var(--neuro-text-light);">High</span>
              </div>
            </div>

            <!-- Mood Selection -->
            <div class="mb-6">
              <label class="form-label">Current Mood</label>
              <div id="mood-chips" class="flex flex-wrap gap-2">
                ${this.MOODS.map(mood => `
                  <button 
                    class="chip ${this.currentCheckin.moodTags.includes(mood) ? 'active' : ''}"
                    data-mood="${mood}"
                    style="padding: 8px 16px; border-radius: 999px; cursor: pointer; font-size: 0.9rem; transition: all 0.2s;">
                    ${this.getMoodEmoji(mood)} ${this.capitalize(mood)}
                  </button>
                `).join('')}
              </div>
            </div>

            <!-- Chakra Quick Check -->
            <div class="mb-6">
              <label class="form-label">Quick Chakra Check</label>
              <div id="chakra-row" class="chakra-row">
                ${this.renderChakraRow()}
              </div>
            </div>
            
            <!-- Notes -->
            <div class="mb-6">
              <label for="energy-notes" class="form-label">Notes (optional)</label>
              <textarea 
                  id="energy-notes" 
                  class="form-input" 
                  placeholder="Any reflections, dreams, or notable events...">${this.currentCheckin.notes || ''}</textarea>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 flex-wrap">
              <button id="btn-save-checkin" class="btn btn-primary">
                💾 Save ${timeOfDay === 'day' ? 'Day' : 'Night'} Check-in
              </button>
              <button id="btn-reset-today" class="btn btn-secondary">
                🔄 Reset Form
              </button>
            </div>
          </div>
          
          <!-- MINI ANALYTICS – SIDE-BY-SIDE -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <!-- Weekly Trend -->
            <div class="card p-4">
              <h3 class="text-lg font-bold mb-3" style="color: var(--neuro-text);">Weekly Trend</h3>
              ${this.renderLineChart(weeklyData, 280, 120)}
              <div class="mt-2 text-center">
                <p class="text-xs" style="color: var(--neuro-text-light);">
                  ${weeklyData.filter(v => v > 0).length
                    ? `Avg: <strong>${Math.round(
                        weeklyData.reduce((s, v) => s + v, 0) /
                        weeklyData.filter(v => v > 0).length
                      )}</strong>`
                    : 'No data yet'}
                </p>
              </div>
            </div>

            <!-- Chakra Balance -->
            <div class="card p-4">
              <h3 class="text-lg font-bold mb-3" style="color: var(--neuro-text);">Chakra Balance</h3>
              <div class="flex justify-center">${this.renderRadarChart(chakraAvg, 200)}</div>
              <div class="grid grid-cols-4 gap-2 mt-3 text-xs text-center">
                ${this.CHAKRAS.map(c => `
                  <div>
                    <div class="font-bold" style="color: ${c.color};">${chakraAvg[c.key]}</div>
                    <div class="text-gray-500">${c.name}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- COLLAPSIBLE JOURNAL SECTION -->
          <div class="card calc-expandable-card" id="journal-collapsible-card">
            <div class="calc-expandable-header" id="journal-collapsible-header">
              <span class="chevron">›</span>
              <h3>📖 My Energy Journal (${journalEntries.length} entries)</h3>
            </div>
            <div class="calc-expandable-content">
              <div class="mb-6">
                <input 
                  type="text" 
                  id="journal-search"
                  class="form-input"
                  placeholder="Search notes or moods..."
                  value="${this.searchQuery}"
                />
              </div>
              <div class="space-y-4">
                ${filteredJournal.length === 0 ? `
                  <div class="card text-center" style="padding: 4rem;">
                    <div class="text-7xl mb-4">📝</div>
                    <p style="color: var(--neuro-text-light);">
                      ${this.searchQuery ? 'No entries found matching your search' : 'No journal entries yet. Your check-ins will appear here.'}
                    </p>
                  </div>
                ` : filteredJournal.slice(0, 30).map(entry => this.renderJournalEntry(entry)).join('')}
              </div>
              ${filteredJournal.length > 30 ? `
                <div class="text-center mt-6">
                  <p class="text-sm" style="color: var(--neuro-text-light);">
                    Showing 30 most recent entries
                  </p>
                </div>
              ` : ''}
            </div>
          </div>

        </div>
      </div>

      <style>
        .chakra-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding: 8px 2px;
        }
        
        .chakra-mini-card {
          flex: 0 0 96px;
          min-width: 96px;
          background: var(--neuro-bg);
          border-radius: 12px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          position: relative;
          box-shadow: 8px 8px 18px var(--neuro-shadow-dark), -8px -8px 18px var(--neuro-shadow-light);
        }
        
        .chakra-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          color: white;
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.2);
        }
        
        .chakra-pulse {
          position: absolute;
          inset: -6px;
          border-radius: 16px;
          pointer-events: none;
          transition: all 260ms ease;
        }
        
        .chip {
          background: rgba(31,45,61,0.04);
          border: 1px solid rgba(0,0,0,0.02);
        }
        
        .chip.active {
          background: linear-gradient(90deg, rgba(246,194,74,0.16), rgba(110,231,183,0.12));
          box-shadow: inset 4px 4px 8px rgba(0,0,0,0.04), inset -4px -4px 8px rgba(255,255,255,0.7);
        }
        
        /* Styles for collapsible journal card from neumorphic-theme.css */
        .calc-expandable-header {
            padding: 24px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .calc-expandable-header h3 {
            margin: 0;
            font-size: 1.1rem;
            color: var(--neuro-text);
        }
        .chevron {
            font-size: 1.5rem;
            transition: transform var(--transition-normal);
            color: var(--neuro-accent);
        }
        .calc-expandable-card.expanded .chevron {
            transform: rotate(90deg);
        }
        .calc-expandable-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height var(--transition-slow);
        }
        .calc-expandable-card.expanded .calc-expandable-content {
            max-height: 5000px;
            padding: 0 24px 24px;
        }
      </style>
    `;
    
    this.attachEventListeners();
  }
  
  renderChakraRow() {
    return this.CHAKRAS.map(chakra => {
      const value = this.currentCheckin.chakras[chakra.key] || 5;
      const imbalance = Math.abs(5 - value);
      const pulseSize = Math.min(12, imbalance * 2 + 2);
      const pulseOpacity = Math.min(0.48, imbalance / 6 + 0.08);
      
      return `
        <div class="chakra-mini-card" data-chakra="${chakra.key}">
          <div class="chakra-pulse" style="
            box-shadow: 0 0 ${pulseSize}px ${chakra.color}${Math.floor(pulseOpacity * 255).toString(16)};
            opacity: ${imbalance > 0 ? 1 : 0};
            transform: scale(${1 + imbalance * 0.01});
          "></div>
          <div class="chakra-icon" style="background: ${chakra.color};">
            ${chakra.name.charAt(0)}
          </div>
          <div style="font-size: 13px; font-weight: 700; text-align: center;">${chakra.name}</div>
          <input 
            type="range" 
            class="chakra-slider"
            data-chakra="${chakra.key}"
            min="0" 
            max="10" 
            step="0.5" 
            value="${value}"
            style="width: 100%;"
          />
          <div style="font-size: 13px; font-weight: 700;">${value}</div>
        </div>
      `;
    }).join('');
  }

  attachEventListeners() {
    // Overall energy slider
    document.getElementById('energy-overall-slider')?.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.currentCheckin.overallEnergy = val;
        document.getElementById('energy-overall-value').textContent = val;
    });

    // Notes textarea
    document.getElementById('energy-notes')?.addEventListener('input', (e) => {
        this.currentCheckin.notes = e.target.value;
    });
    
    // Mood chips
    document.querySelectorAll('[data-mood]')?.forEach(chip => {
      chip.addEventListener('click', (e) => {
        const mood = e.currentTarget.dataset.mood;
        const index = this.currentCheckin.moodTags.indexOf(mood);
        
        if (index >= 0) {
          this.currentCheckin.moodTags.splice(index, 1);
          e.currentTarget.classList.remove('active');
        } else {
          this.currentCheckin.moodTags.push(mood);
          e.currentTarget.classList.add('active');
        }
      });
    });
    
    // Chakra sliders
    document.querySelectorAll('.chakra-slider')?.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const chakraKey = e.target.dataset.chakra;
        const value = parseFloat(e.target.value);
        this.currentCheckin.chakras[chakraKey] = value;
        
        const card = e.target.closest('.chakra-mini-card');
        card.querySelector('div:last-child').textContent = value;
        
        const pulse = card.querySelector('.chakra-pulse');
        const imbalance = Math.abs(5 - value);
        const pulseSize = Math.min(12, imbalance * 2 + 2);
        const pulseOpacity = Math.min(0.48, imbalance / 6 + 0.08);
        const chakra = this.CHAKRAS.find(c => c.key === chakraKey);
        
        pulse.style.boxShadow = `0 0 ${pulseSize}px ${chakra.color}${Math.floor(pulseOpacity * 255).toString(16)}`;
        pulse.style.opacity = imbalance > 0 ? 1 : 0;
        pulse.style.transform = `scale(${1 + imbalance * 0.01})`;
      });
    });
    
    // Action buttons
    document.getElementById('btn-save-checkin')?.addEventListener('click', () => {
      this.saveCheckin(false);
    });
    
    document.getElementById('btn-reset-today')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear the form? This will not delete today\'s saved entry.')) {
        this.currentCheckin = {
          overallEnergy: 6,
          moodTags: [],
          chakras: this.getDefaultChakraSnapshot(),
          notes: '',
          practicesDone: [],
          timestamp: Date.now(),
          dayCheckin: false,
          nightCheckin: false
        };
        this.render();
      }
    });

    // Journal collapsible card
    document.getElementById('journal-collapsible-header')?.addEventListener('click', () => {
        document.getElementById('journal-collapsible-card').classList.toggle('expanded');
    });

    // Journal search listener
    document.getElementById('journal-search')?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value;
      this.render();
      document.getElementById('journal-collapsible-card')?.classList.add('expanded');
    });
  }

  generateRecommendations(chakraAvg) {
    const recommendations = [];
    const sorted = Object.entries(chakraAvg)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2);
    
    sorted.forEach(([key, value]) => {
      const chakra = this.CHAKRAS.find(c => c.key === key);
      const practice = this.PRACTICES.find(p => p.chakra === key);
      
      if (value < 5 && practice) {
        recommendations.push(`
          <div class="flex items-start gap-3 mb-4 p-4 rounded-lg" style="background: rgba(102, 126, 234, 0.05);">
            <div style="font-size: 2rem;">🧘</div>
            <div>
              <div class="font-bold" style="color: ${chakra.color};">${chakra.name} Chakra may need attention</div>
              <p class="text-sm" style="color: var(--neuro-text-light);">
                Consider this practice: ${practice.title} - ${practice.description}
              </p>
            </div>
          </div>
        `);
      }
    });
    
    return recommendations.length > 0 ? recommendations.join('') : 
      '<p style="color: var(--neuro-text-light);">Your chakras seem well balanced! Keep up the great work.</p>';
  }

  renderJournalEntry(entry) {
    const date = new Date(entry.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    // Show which check-ins were done
    const checkinBadges = [];
    if (entry.dayCheckin) checkinBadges.push('<span class="badge badge-success" style="font-size: 0.75rem;">☀️ Day</span>');
    if (entry.nightCheckin) checkinBadges.push('<span class="badge badge-success" style="font-size: 0.75rem;">🌙 Night</span>');
    
    return `
      <div class="card" style="border-left: 4px solid var(--neuro-accent);">
        <div class="flex justify-between items-start mb-4">
          <div>
            <div class="font-bold text-lg" style="color: var(--neuro-text);">${dateStr}</div>
            <div class="text-sm" style="color: var(--neuro-text-light);">
              ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            ${checkinBadges.length > 0 ? `
              <div class="flex gap-2 mt-2">
                ${checkinBadges.join('')}
              </div>
            ` : ''}
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold" style="color: var(--neuro-accent);">${entry.energy}</div>
            <div class="text-sm" style="color: var(--neuro-text-light);">Energy</div>
          </div>
        </div>

        ${(entry.moodTags || []).length > 0 ? `
          <div class="flex flex-wrap gap-2 mb-4">
            ${entry.moodTags.map(mood => `
              <span class="badge" style="font-size: 0.85rem;">
                ${this.getMoodEmoji(mood)} ${this.capitalize(mood)}
              </span>
            `).join('')}
          </div>
        ` : ''}

        ${entry.notes ? `
          <div style="color: var(--neuro-text); line-height: 1.6; white-space: pre-wrap;">
            ${entry.notes}
          </div>
        ` : ''}

        ${entry.chakras ? `
          <div class="mt-4 pt-4" style="border-top: 1px solid rgba(0,0,0,0.05);">
            <div class="text-sm font-bold mb-2" style="color: var(--neuro-text-light);">Chakras:</div>
            <div class="grid grid-cols-4 md:grid-cols-7 gap-2">
              ${this.CHAKRAS.map(c => `
                <div class="text-center">
                  <div class="text-xs mb-1" style="color: var(--neuro-text-light);">${c.name}</div>
                  <div class="text-sm font-bold" style="color: ${c.color};">
                    ${entry.chakras[c.key] || 5}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  // ============================================
  // CHARTS
  // ============================================
  
  renderLineChart(points, width, height) {
    if (!points || points.length === 0 || points.every(p => p === 0)) {
      return `<div style="text-align: center; padding: 2rem; color: var(--neuro-text-light);">No energy data for this period yet</div>`;
    }
    
    const maxV = Math.max(...points, 10);
    const minV = 0;
    const range = Math.max(1, maxV - minV);
    const stepX = width / Math.max(1, points.length - 1);
    
    const coords = points.map((p, i) => {
      const x = i * stepX;
      const y = height - ((p - minV) / range) * height;
      return `${x},${y}`;
    }).join(' ');
    
    return `
      <svg viewBox="0 0 ${width} ${height}" style="max-width: 100%; height: auto;">
        <polyline 
          fill="none" 
          stroke="var(--neuro-accent)" 
          stroke-width="3" 
          stroke-linecap="round" 
          stroke-linejoin="round" 
          points="${coords}" 
        />
        ${points.map((p, i) => {
          if (p === 0) return '';
          const x = i * stepX;
          const y = height - ((p - minV) / range) * height;
          return `<circle cx="${x}" cy="${y}" r="4" fill="var(--neuro-accent)" />`;
        }).join('')}
      </svg>
    `;
  }

  renderRadarChart(values, size) {
    const keys = this.CHAKRAS.map(c => c.key);
    const cx = size / 2;
    const cy = size / 2;
    const rMax = size / 2 - 24;
    
    const points = keys.map((k, i) => {
      const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
      const v = Math.max(0, Math.min(10, values[k] || 0));
      const ratio = v / 10;
      const x = cx + Math.cos(angle) * rMax * ratio;
      const y = cy + Math.sin(angle) * rMax * ratio;
      return `${x},${y}`;
    }).join(' ');
    
    return `
      <svg viewBox="0 0 ${size} ${size}" style="max-width: 100%; height: auto;">
        <!-- Background rings -->
        ${[0.25, 0.5, 0.75, 1].map(r => {
          const rr = rMax * r;
          return `<circle cx="${cx}" cy="${cy}" r="${rr}" stroke="#e6eef4" fill="none" stroke-width="1" />`;
        }).join('')}
        
        <!-- Axes -->
        ${keys.map((k, i) => {
          const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
          const x = cx + Math.cos(angle) * rMax;
          const y = cy + Math.sin(angle) * rMax;
          return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#eef6fa" stroke-width="1" />`;
        }).join('')}
        
        <!-- Data polygon -->
        <polygon 
          points="${points}" 
          fill="rgba(102, 126, 234, 0.2)" 
          stroke="var(--neuro-accent)" 
          stroke-width="2" 
        />
        
        <!-- Labels -->
        ${this.CHAKRAS.map((c, i) => {
          const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
          const x = cx + Math.cos(angle) * (rMax + 12);
          const y = cy + Math.sin(angle) * (rMax + 12);
          return `
            <text 
              x="${x}" 
              y="${y}" 
              text-anchor="middle" 
              dominant-baseline="middle" 
              font-size="10" 
              fill="var(--neuro-text-light)"
            >
              ${c.name}
            </text>
          `;
        }).join('')}
      </svg>
    `;
  }

  // ============================================
  // HELPERS
  // ============================================
  
  getMoodEmoji(mood) {
    const emojis = {
      grounded: '🌍',
      anxious: '😰',
      calm: '😌',
      happy: '😊',
      creative: '🎨',
      tired: '😴',
      focused: '🎯'
    };
    return emojis[mood] || '😊';
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getTimeOfDay() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
}

// Export
if (typeof window !== 'undefined') {
  window.EnergyEngineEnhanced = EnergyEngineEnhanced;
}

export default EnergyEngineEnhanced;
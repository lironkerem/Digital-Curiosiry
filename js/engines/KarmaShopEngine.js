// ============================================
// js/KarmaShopEngine.js - Karma Shop with 3 Items Per Category
// ============================================

export class KarmaShopEngine {
  constructor(app) {
    this.app = app;
    this.activeBoosts = this.loadActiveBoosts();
    this.checkExpiredBoosts();
    
    // Shop catalog - 3 items per category (15 total)
    this.items = [
      // POWER-UPS (3 items)
      {
        id: 'xp_boost_24h',
        name: '2x XP Boost',
        description: 'Double all XP gains for 24 hours',
        cost: 15,
        icon: '⚡',
        category: 'Power-Ups',
        consumable: true,
        duration: 86400000,
        rarity: 'uncommon'
      },
      {
        id: 'instant_level_up',
        name: 'Instant Level Up',
        description: 'Skip directly to your next level',
        cost: 100,
        icon: '🚀',
        category: 'Power-Ups',
        consumable: true,
        rarity: 'legendary'
      },
      {
        id: 'karma_multiplier',
        name: 'Karma Multiplier',
        description: 'Earn 2x Karma for 48 hours',
        cost: 20,
        icon: '💫',
        category: 'Power-Ups',
        consumable: true,
        duration: 172800000,
        rarity: 'rare'
      },

      // RECOVERY (3 items)
      {
        id: 'restore_streak',
        name: 'Restore Streak',
        description: 'Restore your daily streak to your best record',
        cost: 20,
        icon: '🔥',
        category: 'Recovery',
        consumable: true,
        rarity: 'uncommon'
      },
      {
        id: 'energy_restore',
        name: 'Energy Restore',
        description: 'Instantly restore your energy level to 100%',
        cost: 12,
        icon: '💚',
        category: 'Recovery',
        consumable: true,
        rarity: 'common'
      },
      {
        id: 'chakra_restore',
        name: 'Chakra Restore',
        description: 'Restore all chakras to 50% minimum',
        cost: 25,
        icon: '🌈',
        category: 'Recovery',
        consumable: true,
        rarity: 'uncommon'
      },

      // QUEST HELPERS (3 items)
      {
        id: 'skip_daily_quest',
        name: 'Skip Daily Quest',
        description: 'Instantly complete one daily quest of your choice',
        cost: 10,
        icon: '⭐',
        category: 'Quest Helpers',
        consumable: true,
        rarity: 'common'
      },
      {
        id: 'quest_tracker',
        name: 'Quest Tracker Pro',
        description: 'Show detailed quest statistics and insights',
        cost: 35,
        icon: '📊',
        category: 'Quest Helpers',
        consumable: false,
        rarity: 'rare'
      },
      {
        id: 'auto_daily_complete',
        name: 'Auto Daily Complete',
        description: 'One random daily quest completes automatically each day (7 days)',
        cost: 50,
        icon: '🎯',
        category: 'Quest Helpers',
        consumable: true,
        duration: 604800000,
        rarity: 'epic'
      },

      // FEATURES (3 items)
      {
        id: 'custom_affirmation',
        name: 'Custom Affirmation Creator',
        description: 'Create and save unlimited personal affirmations',
        cost: 30,
        icon: '✏️',
        category: 'Features',
        consumable: false,
        rarity: 'rare'
      },
      {
        id: 'advanced_meditations',
        name: 'Advanced Meditations',
        description: 'Unlock premium guided meditation library',
        cost: 40,
        icon: '🧘‍♀️',
        category: 'Features',
        consumable: false,
        rarity: 'rare'
      },
      {
        id: 'dream_journal',
        name: 'Dream Journal',
        description: 'Unlock dream recording and interpretation feature',
        cost: 35,
        icon: '🌙',
        category: 'Features',
        consumable: false,
        rarity: 'rare'
      },

      // UPGRADES (3 items)
      {
        id: 'extra_quest_slot',
        name: 'Extra Daily Quest',
        description: 'Permanently add a 7th daily quest slot for more rewards',
        cost: 50,
        icon: '📋',
        category: 'Upgrades',
        consumable: false,
        rarity: 'epic'
      },
      {
        id: 'karma_cap_increase',
        name: 'Karma Cap Increase',
        description: 'Increase max karma storage by 100 points',
        cost: 60,
        icon: '💎',
        category: 'Upgrades',
        consumable: false,
        rarity: 'epic'
      },
      {
        id: 'golden_profile',
        name: 'Golden Profile Badge',
        description: 'Show off your dedication with a permanent golden badge',
        cost: 75,
        icon: '👑',
        category: 'Upgrades',
        consumable: false,
        rarity: 'legendary'
      }
    ];
  }

  loadActiveBoosts() {
    try {
      return JSON.parse(localStorage.getItem('karma_active_boosts')) || [];
    } catch {
      return [];
    }
  }

  saveActiveBoosts() {
    localStorage.setItem('karma_active_boosts', JSON.stringify(this.activeBoosts));
  }

  checkExpiredBoosts() {
    const now = Date.now();
    this.activeBoosts = this.activeBoosts.filter(boost => boost.expiresAt > now);
    this.saveActiveBoosts();
  }

  isBoostActive(boostId) {
    this.checkExpiredBoosts();
    return this.activeBoosts.some(boost => boost.id === boostId);
  }

  activateBoost(boostId, duration) {
    const expiresAt = Date.now() + duration;
    this.activeBoosts.push({ id: boostId, expiresAt });
    this.saveActiveBoosts();
  }

  canPurchase(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) return { can: false, reason: 'Item not found' };

    const karma = this.app.gamification.state.karma;
    if (karma < item.cost) {
      return { can: false, reason: `Need ${item.cost - karma} more Karma` };
    }

    if (!item.consumable && this.isItemOwned(itemId)) {
      return { can: false, reason: 'Already owned' };
    }

    return { can: true };
  }

  isItemOwned(itemId) {
    const purchaseHistory = this.getPurchaseHistory();
    return purchaseHistory.some(p => p.itemId === itemId);
  }

  purchase(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) {
      this.app.showToast('❌ Item not found', 'error');
      return false;
    }

    const check = this.canPurchase(itemId);
    if (!check.can) {
      this.app.showToast(`❌ ${check.reason}`, 'error');
      return false;
    }

    this.app.gamification.state.karma -= item.cost;
    this.app.gamification.saveState();

    this.recordPurchase(itemId, item.cost);
    this.applyItemEffect(itemId, item);

    this.app.showToast(`✅ Purchased: ${item.name}!`, 'success');
    this.render();
    
    return true;
  }

  recordPurchase(itemId, cost) {
    const history = this.getPurchaseHistory();
    history.push({
      itemId,
      cost,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem('karma_purchase_history', JSON.stringify(history));
  }

  getPurchaseHistory() {
    try {
      return JSON.parse(localStorage.getItem('karma_purchase_history')) || [];
    } catch {
      return [];
    }
  }

  applyItemEffect(itemId, item) {
    switch(itemId) {
      case 'xp_boost_24h':
        this.activateBoost('xp_boost', item.duration);
        this.app.showToast('⚡ 2x XP active for 24 hours!', 'success');
        break;

      case 'instant_level_up':
        const currentLevel = this.app.gamification.calculateLevel();
        const nextLevelXP = (currentLevel.level + 1) ** 2 * 100;
        this.app.gamification.state.xp = nextLevelXP;
        this.app.gamification.checkLevelUp();
        break;

      case 'karma_multiplier':
        this.activateBoost('karma_multiplier', item.duration);
        this.app.showToast('💫 2x Karma active for 48 hours!', 'success');
        break;

      case 'restore_streak':
        const best = this.app.gamification.state.streak.best;
        this.app.gamification.state.streak.current = best;
        this.app.gamification.saveState();
        this.app.showToast(`🔥 Streak restored to ${best} days!`, 'success');
        break;

      case 'energy_restore':
        this.app.gamification.updateEnergy(100 - this.app.gamification.state.energyLevel);
        break;

      case 'chakra_restore':
        Object.keys(this.app.gamification.state.chakraProgress).forEach(chakra => {
          const current = this.app.gamification.state.chakraProgress[chakra];
          if (current < 50) {
            this.app.gamification.state.chakraProgress[chakra] = 50;
          }
        });
        this.app.gamification.saveState();
        this.app.showToast('🌈 All chakras restored to 50%!', 'success');
        break;

      case 'skip_daily_quest':
        this.showQuestSelector();
        break;

      case 'quest_tracker':
        this.app.gamification.unlockFeature('quest_tracker');
        break;

      case 'auto_daily_complete':
        this.activateBoost('auto_daily_complete', item.duration);
        this.app.showToast('🎯 Auto Daily Complete active for 7 days!', 'success');
        break;

      case 'custom_affirmation':
        this.app.gamification.unlockFeature('custom_affirmation');
        break;

      case 'advanced_meditations':
        this.app.gamification.unlockFeature('advanced_meditations');
        break;

      case 'dream_journal':
        this.app.gamification.unlockFeature('dream_journal');
        break;

      case 'extra_quest_slot':
        this.app.gamification.unlockFeature('extra_quest_slot');
        this.addExtraDailyQuest();
        break;

      case 'karma_cap_increase':
        this.app.gamification.unlockFeature('karma_cap_increase');
        this.app.showToast('💎 Karma cap increased by 100!', 'success');
        break;

      case 'golden_profile':
        this.app.gamification.unlockFeature('golden_profile');
        this.app.showToast('👑 Golden Profile Badge unlocked!', 'success');
        break;
    }
  }

  showQuestSelector() {
    const dailyQuests = this.app.gamification.state.quests.daily.filter(q => !q.completed);
    
    if (dailyQuests.length === 0) {
      this.app.showToast('ℹ️ All daily quests already complete!', 'info');
      return;
    }

    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    modal.innerHTML = `
      <div style="background: #e0e5ec; padding: 40px; border-radius: 20px; max-width: 500px; width: 90%;">
        <h3 class="text-2xl font-bold mb-4" style="color: var(--neuro-text);">Select Quest to Complete</h3>
        <div class="space-y-3">
          ${dailyQuests.map(quest => `
            <button onclick="window.karmaShop.completeSelectedQuest('${quest.id}')" 
                    class="btn btn-primary w-full">
              ${quest.icon} ${quest.name} (${quest.progress}/${quest.target})
            </button>
          `).join('')}
        </div>
        <button onclick="this.closest('div[style*=fixed]').remove()" 
                class="btn btn-secondary w-full mt-4">
          Cancel
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    window.karmaShop = this;
  }

  completeSelectedQuest(questId) {
    this.app.gamification.completeQuest('daily', questId);
    document.querySelector('div[style*="position: fixed"]')?.remove();
    this.app.showToast('✅ Quest completed instantly!', 'success');
  }

  addExtraDailyQuest() {
    if (this.app.gamification.state.quests.daily.find(q => q.id === 'bonus_practice')) {
      return;
    }
    
    const extraQuest = {
      id: 'bonus_practice',
      name: 'Bonus Practice Session',
      progress: 0,
      target: 1,
      completed: false,
      xpReward: 50,
      karmaReward: 5,
      icon: '⭐',
      tab: 'meditations',
      inspirational: 'Go beyond your daily routine!'
    };
    
    this.app.gamification.state.quests.daily.push(extraQuest);
    this.app.gamification.saveState();
  }

  render() {
    const tab = document.getElementById('karma-shop-tab');
    const karma = this.app.gamification.state.karma;
    const purchaseHistory = this.getPurchaseHistory();

    const categories = ['Power-Ups', 'Recovery', 'Quest Helpers', 'Features', 'Upgrades'];
    
    tab.innerHTML = `
      <div class="min-h-screen p-6" style="background: #e0e5ec;">
        <div class="max-w-7xl mx-auto">
          
          <div class="text-center mb-8">
            <h2 class="text-4xl font-bold mb-4" style="color: var(--neuro-text);">✨ Karma Shop</h2>
            <p style="color: var(--neuro-text-light); font-size: 1.1rem;">
              Exchange your karma for spiritual upgrades
            </p>
          </div>

          <div class="neuro-card mb-8" style="padding: 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); text-align: center;">
            <h3 class="text-2xl font-bold mb-2" style="color: white;">Your Karma Balance</h3>
            <p class="text-7xl font-bold mb-4" style="color: white;">${karma}</p>
            <p class="text-sm" style="color: rgba(255,255,255,0.8);">
              Earn more by completing daily quests and practices
            </p>
          </div>

          ${this.renderActiveBoosts()}

          ${categories.map(category => `
            <div class="mb-8">
              <h3 class="text-2xl font-bold mb-4" style="color: var(--neuro-text);">
                ${category}
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${this.items.filter(i => i.category === category).map(item => {
                  const canBuy = this.canPurchase(item.id);
                  const isOwned = !item.consumable && this.isItemOwned(item.id);
                  const rarityColors = {
                    common: '#e0e5ec',
                    uncommon: 'rgba(34, 197, 94, 0.1)',
                    rare: 'rgba(59, 130, 246, 0.1)',
                    epic: 'rgba(168, 85, 247, 0.1)',
                    legendary: 'rgba(251, 191, 36, 0.1)'
                  };
                  
                  return `
                    <div class="neuro-card" style="padding: 30px; background: ${rarityColors[item.rarity]}; position: relative; min-height: 280px; display: flex; flex-direction: column;">
                      ${isOwned ? '<div style="position: absolute; top: 10px; right: 10px; background: #22c55e; color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">OWNED</div>' : ''}
                      
                      <div class="text-center mb-4">
                        <div class="text-5xl mb-3">${item.icon}</div>
                        <h4 class="text-xl font-bold mb-2" style="color: var(--neuro-text);">
                          ${item.name}
                        </h4>
                        <p class="text-sm mb-4" style="color: var(--neuro-text-light); line-height: 1.5;">
                          ${item.description}
                        </p>
                      </div>

                      <div style="margin-top: auto;">
                        <div class="flex items-center justify-between mb-4">
                          <span class="text-xs uppercase font-bold" style="color: ${this.getRarityColor(item.rarity)};">
                            ${item.rarity}
                          </span>
                          <span class="text-lg font-bold" style="color: #f59e0b;">
                            ${item.cost} ✨
                          </span>
                        </div>

                        <button 
                          onclick="window.featuresManager.engines['karma-shop'].purchase('${item.id}')"
                          class="btn ${canBuy.can ? 'btn-primary' : 'btn-secondary'} w-full"
                          ${!canBuy.can ? 'disabled' : ''}
                          style="${!canBuy.can ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                          ${isOwned ? '✓ Owned' : canBuy.can ? '🛒 Purchase' : canBuy.reason}
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          `).join('')}

          ${purchaseHistory.length > 0 ? `
            <div class="neuro-card" style="padding: 40px;">
              <h3 class="text-2xl font-bold mb-6" style="color: var(--neuro-text);">📜 Purchase History</h3>
              <div class="space-y-2">
                ${purchaseHistory.slice(-10).reverse().map(purchase => {
                  const item = this.items.find(i => i.id === purchase.itemId);
                  const date = new Date(purchase.timestamp).toLocaleDateString();
                  return `
                    <div class="flex justify-between items-center p-3" style="background: rgba(102, 126, 234, 0.05); border-radius: 8px;">
                      <span>${item?.icon || '📦'} ${item?.name || purchase.itemId}</span>
                      <span class="text-sm" style="color: var(--neuro-text-light);">${date} • ${purchase.cost} Karma</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;
  }

  renderActiveBoosts() {
    this.checkExpiredBoosts();
    if (this.activeBoosts.length === 0) return '';

    return `
      <div class="neuro-card mb-8" style="padding: 30px; background: rgba(34, 197, 94, 0.1);">
        <h3 class="text-xl font-bold mb-4" style="color: var(--neuro-text);">🔋 Active Boosts</h3>
        <div class="space-y-2">
          ${this.activeBoosts.map(boost => {
            const timeLeft = Math.ceil((boost.expiresAt - Date.now()) / 3600000);
            const boostNames = {
              'xp_boost': '⚡ 2x XP Boost',
              'karma_multiplier': '💫 2x Karma Multiplier',
              'auto_daily_complete': '🎯 Auto Daily Complete'
            };
            return `
              <div class="flex justify-between items-center p-3" style="background: rgba(34, 197, 94, 0.1); border-radius: 8px;">
                <span style="font-weight: 600;">${boostNames[boost.id] || boost.id}</span>
                <span class="text-sm" style="color: var(--neuro-text-light);">${timeLeft}h remaining</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  getRarityColor(rarity) {
    const colors = {
      common: '#9ca3af',
      uncommon: '#22c55e',
      rare: '#3b82f6',
      epic: '#a855f7',
      legendary: '#fbbf24'
    };
    return colors[rarity] || '#9ca3af';
  }
}

export default KarmaShopEngine;
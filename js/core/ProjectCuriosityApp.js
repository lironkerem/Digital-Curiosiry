// js/core/ProjectCuriosityApp.js  (FULL PATCH 2025-11-25)
import { showToast }                     from './utils/toast.js';
import * as modal                        from './utils/modal.js';
import { GamificationEngine }            from '../engines/GamificationEngine.js';

/* eslint-disable no-unused-vars */
/* ==========================================================================
   PROJECT CURIOSITY – MAIN APPLICATION CLASS
   ========================================================================== */

export default class ProjectCuriosityApp {

  constructor(deps) {
    this.deps = deps;
    this.state = new deps.AppState();
    this.auth = new deps.AuthManager(this);
    this.nav = null;
    this.dashboard = new deps.DashboardManager(this);
    this.gamification = new GamificationEngine(this);

    // make showToast available as instance method
    this.showToast = showToast;

    this.setupGamificationListeners();
    window.app = this;
  }

  /* ----------------------------------------------------------
     profile save – called by user-tab.js
     ---------------------------------------------------------- */
  saveQuickProfile() {
    const user = {
      name: document.getElementById('profile-name').value.trim(),
      email: document.getElementById('profile-email').value.trim(),
      phone: document.getElementById('profile-phone').value.trim(),
      birthday: document.getElementById('profile-birthday').value,
      emoji: document.getElementById('profile-emoji').value,
      avatarUrl: document.getElementById('profile-avatar-img').src.startsWith('data:')
        ? document.getElementById('profile-avatar-img').src
        : null
    };
    this.state.currentUser = { ...this.state.currentUser, ...user };
    localStorage.setItem('pc_user', JSON.stringify(this.state.currentUser));
    location.reload();          // or lighter re-render if you have one
  }

  /* --------------------------------------------------------------------------
     Gamification events (unchanged)
     -------------------------------------------------------------------------- */
  setupGamificationListeners() {
    this.gamification.on('levelUp', ({ level, title }) => {
      showToast(`🎉 Level Up! You are now a ${title} (Level ${level})!`, 'success');
      this.playLevelUpAnimation();
    });

    this.gamification.on('xpGained', ({ amount, source }) => {
      showToast(`✨ +${amount} XP from ${source}`, 'info');
    });

    this.gamification.on('streakUpdated', ({ current, best }) => {
      if (current > 1) showToast(`🔥 ${current} Day Streak!`, 'success');
      if (current === best && current > 3) showToast(`🏆 New Best Streak: ${best} Days!`, 'success');
    });

    this.gamification.on('achievementUnlocked', (ach) => {
      showToast(`🏅 Achievement: ${ach.name}`, 'success');
      this.showAchievementModal(ach);
    });

    this.gamification.on('badgeUnlocked', (badge) => {
      showToast(`🎖️ New Badge: ${badge.name}`, 'success');
    });

    this.gamification.on('questCompleted', (q) => {
      showToast(`✅ Quest Complete: ${q.name}`, 'success');
    });

    this.gamification.on('dailyQuestsComplete', () => {
      showToast('🌟 All Daily Quests Complete! +50 Bonus XP', 'success');
    });

    this.gamification.on('chakraUpdated', ({ chakra, value }) => {
      if (value >= 100) showToast(`💎 ${chakra} Chakra Mastered!`, 'success');
    });

    this.gamification.on('inspirationalMessage', (msg) => {
      showToast(`💫 ${msg}`, 'info');
    });

    this.gamification.on('featureUnlocked', (id) => {
      showToast(`🔓 New Feature Unlocked: ${id}`, 'success');
    });
  }

  playLevelUpAnimation() {
    const confetti = document.createElement('div');
    confetti.className = 'level-up-confetti';
    confetti.innerHTML = '🎉✨🌟⭐💫';
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }

  showAchievementModal(achievement) {
    const modalEl = document.createElement('div');
    modalEl.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(4px);
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 50px 40px;
      border-radius: 25px;
      text-align: center;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
      transform: scale(0.7) translateY(-50px);
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      position: relative;
    `;
    
    content.innerHTML = `
      <div style="font-size: 5rem; margin-bottom: 1.5rem; animation: bounce 0.6s ease-in-out;">${achievement.icon || '🏆'}</div>
      <h2 style="color: white; font-size: 2rem; font-weight: bold; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">Achievement Unlocked!</h2>
      <h3 style="color: rgba(255,255,255,0.95); font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">${achievement.name}</h3>
      <p style="color: rgba(255,255,255,0.9); font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem;">${achievement.inspirational || ''}</p>
      <button 
        onclick="this.closest('div[style*=fixed]').remove()" 
        style="
          background: white;
          color: #667eea;
          border: none;
          padding: 12px 40px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        "
        onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(0,0,0,0.3)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.2)';"
      >Awesome! 🎉</button>
    `;
    
    modalEl.appendChild(content);
    document.body.appendChild(modalEl);
    
    setTimeout(() => {
      modalEl.style.opacity = '1';
      content.style.transform = 'scale(1) translateY(0)';
    }, 10);
    
    if (!document.getElementById('achievement-bounce-style')) {
      const style = document.createElement('style');
      style.id = 'achievement-bounce-style';
      style.textContent = `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `;
      document.head.appendChild(style);
    }
    
    setTimeout(() => {
      modalEl.style.opacity = '0';
      content.style.transform = 'scale(0.7) translateY(-50px)';
      setTimeout(() => modalEl.remove(), 300);
    }, 8000);
    
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) {
        modalEl.style.opacity = '0';
        content.style.transform = 'scale(0.7) translateY(-50px)';
        setTimeout(() => modalEl.remove(), 300);
      }
    });
  }

  /* --------------------------------------------------------------------------
     App bootstrap (unchanged)
     -------------------------------------------------------------------------- */
  async init() {
    console.log('🧘 Initializing Project Curiosity...');
    if (this.auth.checkAuth()) {
      this.initializeApp();
    } else {
      this.auth.renderAuthScreen();
    }
  }

  initializeApp() {
    console.log('✅ User authenticated, loading app...');
    const authScreen = document.getElementById('auth-screen');
    if (authScreen) {
      authScreen.style.display = 'none';
      authScreen.innerHTML = '';
    }
    const appContainer = document.getElementById('main-app');
    if (appContainer) appContainer.classList.remove('hidden');

    this.nav = new this.deps.NavigationManager(this);
    this.nav.render();

    this.loadModules();
    this.restoreLastTab();
    this.checkDailyReset();
    console.log('🎉 Project Curiosity loaded successfully!');
  }

  checkDailyReset() {
    const lastReset = localStorage.getItem('lastDailyReset');
    const today = new Date().toDateString();
    if (lastReset !== today) {
      this.gamification.resetDailyQuests();
      localStorage.setItem('lastDailyReset', today);
      console.log('📅 Daily quests reset');
    }
  }

  loadModules() {
    this.dashboard.render();
    if (window.FeaturesManager) {
      window.featuresManager = new window.FeaturesManager(this);
    }
    if (window.initCalculator) {
      window.initCalculator();
    }
  }

  /* ----------------------------------------------------------
     SINGLE SOURCE OF TRUTH – delegate every tab to FeaturesManager
     ---------------------------------------------------------- */
  initializeTab(tabName) {
    switch (tabName) {
      case 'dashboard':
        this.dashboard.render();
        break;

      case 'calculator':
        {
          const calcTab = document.getElementById('calculator-tab');
          if (calcTab) {
            calcTab.style.display = 'block';
            calcTab.style.visibility = 'visible';
            calcTab.style.opacity = '1';
          }
          if (window.initCalculator) window.initCalculator();
          else if (window.calculatorInstance) console.log('Calculator already initialized');
        }
        break;

      case 'flip-script':
        window.featuresManager?.init('flip-script');
        break;

      case 'karma-shop':
        window.featuresManager?.init('karma-shop');
        break;

      case 'meditations':
      case 'tarot':
      case 'energy':
      case 'happiness':
      case 'gratitude':
      case 'journal':
      case 'shadow-alchemy':
        window.featuresManager?.init(tabName);
        break;

      default:
        console.warn(`Unknown tab: ${tabName}`);
    }
  }

  restoreLastTab() {
    const lastTab = localStorage.getItem('pc_active_tab') || 'dashboard';
    if (this.nav) this.nav.switchTab(lastTab);
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('pc_user');
      localStorage.removeItem('pc_active_tab');
      location.reload();
    }
  }

  /* legacy wrappers – keep old HTML onclick=... working */
  openSettings() { modal.openSettings(this); }
  openAbout()    { modal.openAbout(this); }
  openContact()  { modal.openContact(this); }
  openBilling()  { modal.openBilling(this); }

  randomFrom(array) {
    if (!Array.isArray(array) || !array.length) return null;
    return array[Math.floor(Math.random() * array.length)];
  }

  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}
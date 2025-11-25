// NavigationManager.js – cleaned, user menu removed, wired to UserTab
import UserTab from './user-tab.js';

export default class NavigationManager {
  constructor(app) {
    this.app = app;
    this.userTab = new UserTab(app);
  }

  render() {
    const navHTML = `
      <!-- CENTRED HEADER -->
      <div class="app-header">
        <img class="app-logo" src="https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/Watermarks/Logo.svg" alt="Aanandoham Logo">
        <div class="app-text">
          <h1 class="app-title">Aanandoham's Digital Curiosity</h1>
          <p class="app-tagline">Your complete digital spiritual-growth daily companion</p>
        </div>
      </div>

      <!-- NAV TABS -->
      <nav class="main-nav">
        <ul class="nav-tabs" id="nav-tabs">
          <li class="nav-item active" data-tab="dashboard"><span class="nav-icon">🏠</span><span class="nav-label">Main Dashboard</span></li>
          <li class="nav-item" data-tab="energy"><span class="nav-icon">⚡</span><span class="nav-label">Daily Energy Tracker</span></li>
          <li class="nav-item" data-tab="tarot"><span class="nav-icon">🃏</span><span class="nav-label">Tarot Cards Guidance</span></li>
          <li class="nav-item" data-tab="gratitude"><span class="nav-icon">🙏</span><span class="nav-label">Gratitude Practice</span></li>
          <li class="nav-item" data-tab="happiness"><span class="nav-icon">😊</span><span class="nav-label">Happiness Booster</span></li>
          <li class="nav-item" data-tab="journal"><span class="nav-icon">📓</span><span class="nav-label">My Private Journal</span></li>
          <li class="nav-item" data-tab="meditations"><span class="nav-icon">🧘‍♀️</span><span class="nav-label">Guided Meditations</span></li>
          <li class="nav-item" data-tab="flip-script"><span class="nav-icon">🔄</span><span class="nav-label">Flip The Script</span></li>
          <li class="nav-item" data-tab="calculator"><span class="nav-icon">🔮</span><span class="nav-label">Self Analysis Pro</span></li>
          <li class="nav-item" data-tab="shadow-alchemy"><span class="nav-icon">🎭</span><span class="nav-label">Shadow Alchemy Lab</span></li>
          <li class="nav-item" data-tab="karma-shop"><span class="nav-icon">✨</span><span class="nav-label">Karma Shop</span></li>
        </ul>
      </nav>

      <!-- INLINE STYLES -->
      <style>
        .app-header{display:flex;align-items:center;justify-content:center;gap:20px;margin:6px auto 18px;padding:18px 30px;max-width:800px;border-radius:var(--radius-xl,24px);background:linear-gradient(135deg,var(--neuro-accent),var(--neuro-accent-light));color:#fff;box-shadow:12px 12px 24px var(--neuro-shadow-dark),-12px -12px 24px var(--neuro-shadow-light);}
        .app-logo{width:100px;height:100px;object-fit:contain;flex-shrink:0;}
        .app-text{text-align:left;}
        .app-title{font-size:2.5rem;font-weight:700;margin:0 0 4px;}
        .app-tagline{font-size:1.1rem;opacity:.9;margin:0;}
      </style>
    `;

    const appContainer = document.getElementById('app-container');
    if (appContainer) {
      appContainer.insertAdjacentHTML('afterbegin', navHTML);
      // render and init the user tab
      appContainer.insertAdjacentHTML('afterbegin', this.userTab.render());
      this.userTab.init();
    }
    this.setupEventListeners();
  }

  setupEventListeners() {
    // tabs
    document.querySelectorAll('.nav-item').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });
  }

  switchTab(tabName) {
    document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active', 'hidden');
      content.style.display = 'none';
    });
    const target = document.getElementById(`${tabName}-tab`);
    if (target) {
      target.classList.add('active');
      target.style.display = 'block';
    }
    this.app.initializeTab(tabName);
    localStorage.setItem('pc_active_tab', tabName);
  }
}
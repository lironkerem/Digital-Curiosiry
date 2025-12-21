// NavigationManager.js  (updated for FAB + sheet on mobile)
import UserTab from './User-Tab.js';

export default class NavigationManager {
  constructor(app) {
    this.app = app;
    this.userTab = new UserTab(app);
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.swipeDebounceTimer = null;
    this.currentBubbleIndex = 0;
    this.bubbleElements = [];          // kept for keyboard nav compat
    this.sheetOpen = false;            // new flag
  }

  render() {
    const navHTML = `
      <!-- CENTRED HEADER -->
      <div class="app-header">
        <img class="header-image" 
             src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/Header.png" 
             alt="Aanandoham Header">
      </div>

      <!-- PROGRESS BAR -->
      <div id="progress-bar" class="progress-bar" role="progressbar" aria-label="Loading progress"></div>

      <!-- DESKTOP NAV TABS (unchanged) -->
      <nav class="main-nav desktop-nav" role="navigation" aria-label="Main navigation">
        <ul class="nav-tabs" id="nav-tabs" role="tablist">
          <li class="nav-item active" data-tab="dashboard" data-label="Main Dashboard" role="tab" aria-selected="true" tabindex="0">
            <img class="nav-image" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavDashboard.png" alt="Main Dashboard">
          </li>
          <li class="nav-item" data-tab="energy" data-label="Daily Energy Tracker" role="tab" aria-selected="false" tabindex="-1">
            <img class="nav-image" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavEnergy.png" alt="Daily Energy Tracker">
          </li>
          <li class="nav-item" data-tab="tarot" data-label="Tarot Cards Guidance" role="tab" aria-selected="false" tabindex="-1">
            <img class="nav-image" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavTarot.png" alt="Tarot Cards Guidance">
          </li>
          <li class="nav-item" data-tab="gratitude" data-label="Gratitude Practice" role="tab" aria-selected="false" tabindex="-1">
            <img class="nav-image" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavGratitude.png" alt="Gratitude Practice">
          </li>
          <li class="nav-item" data-tab="happiness" data-label="Happiness Booster" role="tab" aria-selected="false" tabindex="-1">
            <img class="nav-image" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavHappiness.png" alt="Happiness Booster">
          </li>
          <li class="nav-item" data-tab="journal" data-label="My Private Journal" role="tab" aria-selected="false" tabindex="-1">
            <img class="nav-image" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavJournal.png" alt="My Private Journal">
          </li>
          <li class="nav-item" data-tab="meditations" data-label="Guided Meditations" role="tab" aria-selected="false" tabindex="-1">
            <img class="nav-image" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavMeditations.png" alt="Guided Meditations">
          </li>
          <li class="nav-item" data-tab="flip-script" data-label="Flip The Script" role="tab" aria-selected="false" tabindex="-1">
            <img class="nav-image" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavFlip.png" alt="Flip The Script">
          </li>
          <li class="nav-item" data-tab="calculator" data-label="Self Analysis Pro" role="tab" aria-selected="false" tabindex="-1">
            <img class="nav-image" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavAnalysis.png" alt="Self Analysis Pro">
          </li>
          <li class="nav-item" data-tab="shadow-alchemy" data-label="Shadow Alchemy Lab" role="tab" aria-selected="false" tabindex="-1">
            <img class="nav-image" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavShadow.png" alt="Shadow Alchemy Lab">
            <span class="premium-badge">PREMIUM</span>
          </li>
          <li class="nav-item" data-tab="karma-shop" data-label="Karma Shop" role="tab" aria-selected="false" tabindex="-1">
            <img class="nav-image" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavShop.png" alt="Karma Shop">
          </li>
        </ul>
      </nav>

      <!-- MOBILE SINGLE-FAB + SHEET -->
      <button id="mobile-fab" class="mobile-fab" aria-label="Open navigation menu" aria-expanded="false">
        <span class="fab-icon"></span>
      </button>

      <div id="mobile-sheet" class="mobile-sheet" role="dialog" aria-modal="true" aria-hidden="true">
        <div class="sheet-grip"></div>
        <div class="sheet-header">Choose a feature</div>
        <div class="sheet-scroller">
          <div class="sheet-row" data-tab="energy"         role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavEnergy.png"         alt=""><span>Daily Energy</span></div>
          <div class="sheet-row" data-tab="happiness"      role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavHappiness.png"      alt=""><span>Happiness</span></div>
          <div class="sheet-row" data-tab="gratitude"      role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavGratitude.png"      alt=""><span>Gratitude</span></div>
          <div class="sheet-row" data-tab="journal"        role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavJournal.png"        alt=""><span>Journal</span></div>
          <div class="sheet-row" data-tab="tarot"          role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavTarot.png"          alt=""><span>Tarot</span></div>
          <div class="sheet-row" data-tab="meditations"    role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavMeditations.png"    alt=""><span>Meditations</span></div>
          <div class="sheet-row" data-tab="karma-shop"     role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavShop.png"           alt=""><span>Karma Shop</span></div>
          <div class="sheet-row" data-tab="flip-script"    role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavFlip.png"           alt=""><span>Flip Script</span></div>
          <div class="sheet-row" data-tab="calculator"     role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavAnalysis.png"        alt=""><span>Self-Analysis</span></div>
          <div class="sheet-row" data-tab="shadow-alchemy" role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavShadow.png"         alt=""><span>Shadow Lab</span></div>
          <div class="sheet-row" data-tab="chatbot"        role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/Chat.png"            alt=""><span>AI Chat</span></div>
        </div>
      </div>
      <div id="sheet-scrim" class="sheet-scrim"></div>

      <!-- LEGACY POPUP/BACKDROP (kept empty so existing CSS stays valid until you delete it) -->
      <div id="bubble-backdrop" class="bubble-backdrop" aria-hidden="true"></div>
      <div id="bubble-popup" role="dialog" aria-modal="true"></div>
    `;

    const appContainer = document.getElementById('app-container');
    if (appContainer) {
      if (!document.querySelector('.app-header')) {
        appContainer.insertAdjacentHTML('afterbegin', navHTML);
      }
      if (!document.getElementById('user-dropdown')) {
        appContainer.insertAdjacentHTML('afterbegin', this.userTab.render());
        this.userTab.init();
      }
    }
    this.setupEventListeners();
    this.setupSwipeGestures();
    this.setupKeyboardNavigation();
    this.setupMobileSheet();   // NEW
  }

  /* --------------------- DESKTOP + COMMON --------------------- */
  setupEventListeners() {
    document.querySelectorAll('.nav-item').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab, tab.dataset.label));
      tab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.switchTab(tab.dataset.tab, tab.dataset.label);
        }
      });
    });
  }

  setupKeyboardNavigation() {
    // keep desktop bubble array for arrow navigation (even if bubbles gone)
    this.bubbleElements = Array.from(document.querySelectorAll('.sheet-row')); // mobile sheet rows
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.sheetOpen) this.closeMobileSheet();
        return;
      }
      // arrow nav inside sheet
      if (this.sheetOpen) {
        const rows = [...document.querySelectorAll('.sheet-row')];
        const current = document.activeElement;
        const idx = rows.indexOf(current);
        if (idx < 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); rows[(idx + 1) % rows.length].focus(); }
        if (e.key === 'ArrowUp')   { e.preventDefault(); rows[(idx - 1 + rows.length) % rows.length].focus(); }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); current.click(); }
      }
    });
  }

  createParticles(bubble, e) { /* your original method, unchanged */ }

  createRipple(bubble, e) { /* your original method, unchanged */ }

  /* --------------------- MOBILE FAB + SHEET --------------------- */
  setupMobileSheet() {
    if (window.innerWidth > 767) return; // desktop uses tabs

    const fab   = document.getElementById('mobile-fab');
    const sheet = document.getElementById('mobile-sheet');
    const scrim = document.getElementById('sheet-scrim');

    const open = () => {
      sheet.setAttribute('aria-hidden', 'false');
      fab.setAttribute('aria-expanded', 'true');
      scrim.classList.add('visible');
      this.sheetOpen = true;
      sheet.querySelector('.sheet-row').focus();
      if (navigator.vibrate) navigator.vibrate(10);
    };
    const close = () => {
      sheet.setAttribute('aria-hidden', 'true');
      fab.setAttribute('aria-expanded', 'false');
      scrim.classList.remove('visible');
      this.sheetOpen = false;
      fab.focus();
    };
    this.closeMobileSheet = close; // expose for ESC

    fab.addEventListener('click', () => open());
    scrim.addEventListener('click', () => close());

    // row clicks
    sheet.addEventListener('click', (e) => {
      const row = e.target.closest('.sheet-row');
      if (!row) return;
      close();
      const navItem = document.querySelector(`[data-tab="${row.dataset.tab}"]`);
      this.switchTab(row.dataset.tab, navItem?.dataset.label);
    });
  }

  /* --------------------- CHAT-BOT (unchanged) --------------------- */
  openChatBot() {
    const chatPanel = document.querySelector('#chatbot-float-panel');
    const chatBubble = document.querySelector('#chatbot-float-bubble');
    if (chatPanel && chatBubble) {
      chatBubble.style.display = 'none';
      chatPanel.classList.add('open');
      const chatClose = document.querySelector('#chatbot-float-close');
      if (chatClose) {
        chatClose.onclick = (e) => {
          e.stopPropagation();
          chatPanel.classList.remove('open');
          chatBubble.style.display = 'none';
        };
      }
      const chatInput = document.querySelector('.chatbot-ai-input');
      if (chatInput) setTimeout(() => chatInput.focus(), 300);
    } else {
      console.warn('ChatBotAI not ready yet');
      setTimeout(() => this.openChatBot(), 500);
    }
  }

  /* --------------------- SWIPE (unchanged) --------------------- */
  setupSwipeGestures() { /* your original code, untouched */ }

  handleSwipe(tabOrder) { /* your original code, untouched */ }

  updateBreadcrumb(label) { /* your original code, untouched */ }

  showProgress() { /* your original code, untouched */ }

  switchTab(tabName, label) {
    if (tabName === 'calculator' && !window.calculatorChunk) {
      window.calculatorChunk = 'requested';
    }
    this.showProgress();
    this.updateBreadcrumb(label);

    // desktop tab ARIA
    document.querySelectorAll('.nav-item').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
      t.setAttribute('tabindex', '-1');
    });
    const activeNavItem = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeNavItem) {
      activeNavItem.classList.add('active');
      activeNavItem.setAttribute('aria-selected', 'true');
      activeNavItem.setAttribute('tabindex', '0');
    }

    // content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active', 'hidden');
      content.style.display = 'none';
      content.setAttribute('aria-hidden', 'true');
    });
    const target = document.getElementById(`${tabName}-tab`);
    if (target) {
      target.classList.add('active');
      target.style.display = 'block';
      target.setAttribute('aria-hidden', 'false');
    }

    this.app.initializeTab(tabName);
    localStorage.setItem('pc_active_tab', tabName);
    if (navigator.vibrate) navigator.vibrate(10);
  }
}
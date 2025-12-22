// NavigationManager.js  (mobile 3-button bar + all fixes)
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

      <!-- CTA FOOTER (unchanged) -->
      <div id="cta-footer-wrapper">
        <!-- your existing CTA footer gets injected here -->
      </div>

      <!-- NEW 3-BUTTON MOBILE BAR (always under CTA) -->
      <nav id="mobile-bottom-bar" class="mobile-bottom-bar" role="navigation" aria-label="Mobile navigation">
        <button class="mobile-tab left"  data-popup="miniapps" aria-haspopup="true" aria-expanded="false">
          <img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/MiniApps.png" alt="">
          <span>Mini Apps</span>
        </button>

        <button class="mobile-tab center active" data-tab="dashboard" aria-selected="true">
          <img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/Dashboard.png" alt="">
          <span>Home</span>
        </button>

        <button class="mobile-tab right" data-popup="features" aria-haspopup="true" aria-expanded="false">
          <img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/Features.png" alt="">
          <span>Features</span>
        </button>
      </nav>

      <!-- MINI-APPS SHEET -->
      <div id="sheet-miniapps" class="mobile-sheet" role="dialog" aria-modal="true" aria-hidden="true">
        <div class="sheet-grip"></div>
        <div class="sheet-header">Mini Apps</div>
        <div class="sheet-scroller">
          <div class="sheet-row" data-tab="flip-script"    role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavFlip.png"    alt=""><span>Flip the Script</span></div>
          <div class="sheet-row" data-tab="calculator"     role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavAnalysis.png" alt=""><span>Self-Analysis</span></div>
          <div class="sheet-row" data-tab="shadow-alchemy" role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavShadow.png"  alt=""><span>Shadow Lab</span></div>
          <div class="sheet-row" data-tab="chatbot"        role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/Chat.png"       alt=""><span>AI Chat</span></div>
          <div class="sheet-row" data-tab="karma-shop"     role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavShop.png"     alt=""><span>Karma Shop</span></div>
        </div>
      </div>

      <!-- FEATURES SHEET -->
      <div id="sheet-features" class="mobile-sheet" role="dialog" aria-modal="true" aria-hidden="true">
        <div class="sheet-grip"></div>
        <div class="sheet-header">Features</div>
        <div class="sheet-scroller">
          <div class="sheet-row" data-tab="energy"      role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavEnergy.png"      alt=""><span>Daily Energy</span></div>
          <div class="sheet-row" data-tab="happiness"   role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavHappiness.png"   alt=""><span>Happiness</span></div>
          <div class="sheet-row" data-tab="gratitude"   role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavGratitude.png"   alt=""><span>Gratitude</span></div>
          <div class="sheet-row" data-tab="journal"     role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavJournal.png"     alt=""><span>Journal</span></div>
          <div class="sheet-row" data-tab="tarot"       role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavTarot.png"       alt=""><span>Tarot</span></div>
          <div class="sheet-row" data-tab="meditations" role="menuitem" tabindex="0"><img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavMeditations.png" alt=""><span>Meditations</span></div>
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
    this.setupMobileBottomBar();   // NEW
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
    // arrow nav inside sheets
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.sheetOpen) this.closeSheets();
        return;
      }
      if (!this.sheetOpen) return;
      const rows = [...document.querySelectorAll('.sheet-row')];
      const current = document.activeElement;
      const idx = rows.indexOf(current);
      if (idx < 0) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); rows[(idx + 1) % rows.length].focus(); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); rows[(idx - 1 + rows.length) % rows.length].focus(); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); current.click(); }
    });
  }

  createParticles(bubble, e) { /* your original method, unchanged */ }

  createRipple(bubble, e) { /* your original method, unchanged */ }

  /* --------------------- MOBILE 3-BUTTON BAR --------------------- */
  setupMobileBottomBar(){
    if(window.innerWidth > 767) return; // desktop uses tabs

    const bar   = document.getElementById('mobile-bottom-bar');
    const scrim = document.getElementById('sheet-scrim');
    const tabs  = [...bar.querySelectorAll('.mobile-tab')];
    const sheets= [...document.querySelectorAll('.mobile-sheet')];

    const openSheet = (id) => {
      const sheet = document.getElementById(id);
      if(!sheet) return;
      sheet.setAttribute('aria-hidden','false');
      scrim.classList.add('visible');
      this.sheetOpen = true;
      document.body.classList.add('sheet-open'); // lock body scroll
      sheet.querySelector('.sheet-row').focus();
      if(navigator.vibrate) navigator.vibrate(10);
    };
    const closeSheets = () => {
      sheets.forEach(s=>s.setAttribute('aria-hidden','true'));
      scrim.classList.remove('visible');
      tabs.forEach(t=>t.setAttribute('aria-expanded','false'));
      this.sheetOpen = false;
      document.body.classList.remove('sheet-open');
    };
    this.closeSheets = closeSheets; // expose for ESC

    // centre tab = real switch
    const homeTab = bar.querySelector('.mobile-tab.center');
    homeTab.addEventListener('click',()=>{
      closeSheets();
      this.switchTab('dashboard','Main Dashboard');
    });

    // left & right open sheets
    bar.querySelector('.left').addEventListener('click',(e)=>{
      openSheet('sheet-miniapps');
      e.currentTarget.setAttribute('aria-expanded','true');
    });
    bar.querySelector('.right').addEventListener('click',(e)=>{
      openSheet('sheet-features');
      e.currentTarget.setAttribute('aria-expanded','true');
    });

    // scrim closes
    scrim.addEventListener('click',closeSheets);

    // row clicks
    sheets.forEach(sheet=>{
      sheet.addEventListener('click',(e)=>{
        const row = e.target.closest('.sheet-row');
        if(!row) return;
        closeSheets();
        const navItem = document.querySelector(`[data-tab="${row.dataset.tab}"]`);
        this.switchTab(row.dataset.tab, navItem?.dataset.label);
      });
    });

    // swipe-down to close
    sheets.forEach(sheet=>{
      let startY = 0;
      sheet.addEventListener('touchstart', e => startY = e.touches[0].clientY, {passive:true});
      sheet.addEventListener('touchend', e => {
        const endY = e.changedTouches[0].clientY;
        if (startY - endY < -80) closeSheets(); // down 80 px
      }, {passive:true});
    });

    // left/right swipe to change tab – de-sensitised
const swipeOrder = [
  'dashboard',        // 0  ← STARTING POINT
  'energy',           // 1
  'tarot',            // 2
  'gratitude',        // 3
  'happiness',        // 4
  'journal',          // 5
  'meditations',      // 6
  'flip-script',      // 7
  'calculator',       // 8  (Self Analysis Pro)
  'shadow-alchemy',   // 9
  'karma-shop'        // 10
];
    let startX = 0, startT = 0;
    const SWIPE_THRESHOLD = 120;   // px
    const SWIPE_TIME = 300;        // ms
    window.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      startT = Date.now();
    }, {passive:true});
    window.addEventListener('touchend', e => {
      const endX = e.changedTouches[0].clientX;
      const deltaX = startX - endX;
      const deltaT = Date.now() - startT;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD || deltaT > SWIPE_TIME) return;
      const active = localStorage.getItem('pc_active_tab') || 'dashboard';
      const idx = swipeOrder.indexOf(active);
      const next = deltaX > 0 ? idx + 1 : idx - 1;
      if (next < 0 || next >= swipeOrder.length) return;
      const navItem = document.querySelector(`[data-tab="${swipeOrder[next]}"]`);
      if (navItem) this.switchTab(swipeOrder[next], navItem.dataset.label);
    }, {passive:true});
  }

  /* --------------------- CHAT-BOT (unchanged) --------------------- */
  openChatBot() { /* your original code, untouched */ }

  /* --------------------- SWIPE (unchanged) --------------------- */
  setupSwipeGestures() { /* your original code, untouched */ }

  handleSwipe(tabOrder) { /* your original code, untouched */ }

  showProgress() { /* your original code, untouched */ }

  switchTab(tabName, label) {
    if (tabName === 'calculator' && !window.calculatorChunk) {
      window.calculatorChunk = 'requested';
    }
    this.showProgress();

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
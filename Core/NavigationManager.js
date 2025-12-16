// NavigationManager.js

import UserTab from './User-Tab.js';

export default class NavigationManager {
  constructor(app) {
    this.app = app;
    this.userTab = new UserTab(app);
    this.touchStartX = 0;
    this.touchEndX = 0;
    this.swipeDebounceTimer = null;
    this.currentBubbleIndex = 0;
    this.bubbleElements = [];
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

      <!-- DESKTOP NAV TABS -->
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

      <!-- MOBILE BUBBLE BAR -->
      <nav id="bubble-bar" class="mobile-nav" role="navigation" aria-label="Mobile navigation">
        <div class="bubble-wrapper" data-bubble="home">
          <button class="bubble home active" data-bubble="home" aria-label="Home - Main Dashboard" tabindex="0">
            <img class="bubble-icon" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/Dashboard.png" alt="">
            <span class="ripple"></span>
            <canvas class="particles"></canvas>
          </button>
          <div class="bubble-label">Home</div>
        </div>
        
        <div class="bubble-wrapper" data-bubble="features">
          <button class="bubble features" data-bubble="features" aria-label="Features menu" aria-haspopup="true" aria-expanded="false" tabindex="0">
            <img class="bubble-icon" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/Features.png" alt="">
            <span class="ripple"></span>
            <canvas class="particles"></canvas>
          </button>
          <div class="bubble-label">Features</div>
        </div>
        
        <div class="bubble-wrapper" data-bubble="miniapps">
          <button class="bubble miniapps" data-bubble="miniapps" aria-label="Mini apps menu" aria-haspopup="true" aria-expanded="false" tabindex="0">
            <img class="bubble-icon" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/MiniApps.png" alt="">
            <span class="ripple"></span>
            <canvas class="particles"></canvas>
          </button>
          <div class="bubble-label">Mini Apps</div>
        </div>
        
        <div class="bubble-wrapper" data-bubble="chatbot">
          <button class="bubble chatbot" data-bubble="chatbot" aria-label="AI Chatbot" tabindex="0">
            <img class="bubble-icon" src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/Chat.png" alt="">
            <span class="ripple"></span>
            <canvas class="particles"></canvas>
          </button>
          <div class="bubble-label">Chat</div>
        </div>
      </nav>

      <!-- BACKDROP -->
      <div id="bubble-backdrop" class="bubble-backdrop" aria-hidden="true"></div>

      <!-- MOBILE POPUP MENU -->
      <div id="bubble-popup" role="dialog" aria-modal="true" aria-labelledby="popup-title"></div>
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
    this.setupBubbleBar();
    this.setupSwipeGestures();
    this.setupKeyboardNavigation();
  }

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
    this.bubbleElements = Array.from(document.querySelectorAll('.bubble'));
    
    document.addEventListener('keydown', (e) => {
      // Escape to close popup
      if (e.key === 'Escape') {
        this.hidePopup();
        return;
      }

      // Tab navigation for bubbles
      const focusedBubble = document.activeElement;
      if (!focusedBubble.classList.contains('bubble')) return;

      const currentIndex = this.bubbleElements.indexOf(focusedBubble);
      
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        e.preventDefault();
        this.bubbleElements[currentIndex - 1].focus();
      } else if (e.key === 'ArrowRight' && currentIndex < this.bubbleElements.length - 1) {
        e.preventDefault();
        this.bubbleElements[currentIndex + 1].focus();
      }
    });
  }

  // Particle effect
  createParticles(bubble, e) {
    const canvas = bubble.querySelector('.particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const rect = bubble.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    const particles = [];
    const particleCount = 20;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: centerX,
        y: centerY,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 1,
        size: Math.random() * 3 + 1
      });
    }
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      let alive = false;
      particles.forEach(p => {
        if (p.life > 0) {
          alive = true;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.life})`;
          ctx.fill();
          
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 0.02;
        }
      });
      
      if (alive) requestAnimationFrame(animate);
    };
    
    animate();
  }

  // Ripple effect
  createRipple(bubble, e) {
    const ripple = bubble.querySelector('.ripple');
    if (!ripple) return;
    
    const rect = bubble.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
    const y = (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    bubble.classList.remove('ripple-active');
    void bubble.offsetWidth; // Force reflow
    bubble.classList.add('ripple-active');
    
    setTimeout(() => bubble.classList.remove('ripple-active'), 600);
  }

  setupBubbleBar() {
    const menuMap = {
      home: null,
      features: [
        {tab:'energy', img:'https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavEnergy.png', category:'Features'},
        {tab:'happiness', img:'https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavHappiness.png', category:'Features'},
        {tab:'gratitude', img:'https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavGratitude.png', category:'Features'},
        {tab:'journal', img:'https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavJournal.png', category:'Features'},
        {tab:'tarot', img:'https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavTarot.png', category:'Features'},
        {tab:'meditations', img:'https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavMeditations.png', category:'Features'},
        {tab:'karma-shop', img:'https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavShop.png', category:'Features'}
      ],
      miniapps: [
        {tab:'flip-script', img:'https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavFlip.png', category:'Mini Apps'},
        {tab:'calculator', img:'https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavAnalysis.png', category:'Mini Apps'},
        {tab:'shadow-alchemy', img:'https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/NavShadow.png', category:'Mini Apps'}
      ],
      chatbot: null
    };

    const popup = document.getElementById('bubble-popup');
    const backdrop = document.getElementById('bubble-backdrop');
    const bubbles = document.querySelectorAll('.bubble');
    
    let popupContent = null; // Lazy load content

const showPopup = (items, title, bubbleElement) => {
  // Create fresh popup content
  popupContent = items.map(item =>
    `<div class="popup-row" data-tab="${item.tab}" role="menuitem" tabindex="0">
      <img src="${item.img}" alt="${item.tab}">
    </div>`
  ).join('');
  
  popup.innerHTML = popupContent;
  
  // Clear previous state and INSTANTLY hide
  popup.classList.remove('visible');
  backdrop.classList.remove('visible');
  popup.style.display = 'none';
  popup.style.opacity = '0';
  
  // Cancel any running animations
  const animations = popup.getAnimations();
  animations.forEach(anim => anim.cancel());
  
  // Set fixed width
  popup.style.width = '180px';
  popup.style.minWidth = '180px';
  popup.style.maxWidth = '180px';
  popup.style.position = 'fixed';
  
  // Make visible for measurement but invisible to user
  popup.style.display = 'block';
  popup.style.visibility = 'hidden';
  popup.style.opacity = '0';
  popup.style.transform = 'scale(0.8)'; // Start at small scale
  
  // Force layout calculation
  void popup.offsetHeight;
  
  // Calculate position after dimensions are known
  requestAnimationFrame(() => {
    const bubbleWrapper = bubbleElement.closest('.bubble-wrapper');
    const popupRect = popup.getBoundingClientRect();
    
    const appContainer = document.getElementById('app-container');
    const zoomLevel = parseFloat(window.getComputedStyle(appContainer).zoom) || 1;
    
    // Use the actual bubble element (not wrapper) for more precise centering
    const bubbleRect = bubbleElement.getBoundingClientRect();
    const bubbleCenter = bubbleRect.left + (bubbleRect.width / 2);
    const popupHalfWidth = popupRect.width / 2;
    
    // Adjust for zoom and fine-tune centering
    const leftPos = ((bubbleCenter - popupHalfWidth) / zoomLevel) - 14;
    const topPos = (bubbleRect.top - popupRect.height - 16) / zoomLevel;
    
    // Set position
    popup.style.left = leftPos + 'px';
    popup.style.top = topPos + 'px';
    
    // Set transform-origin to center top (popup expands upward from its anchor point)
    popup.style.transformOrigin = 'center top';
    
    // Force position AND transform to be applied instantly
    popup.style.transition = 'none';
    void popup.offsetHeight;
    
    // Re-enable transitions
    popup.style.transition = '';
    
    // Now make visible and animate from this position
    popup.style.visibility = 'visible';
    popup.style.opacity = '1';
    popup.classList.add('visible');
    backdrop.classList.add('visible');
    
    // Update ARIA
    const triggerBubble = document.querySelector(`[data-bubble="${Object.keys(menuMap).find(k => menuMap[k] === items)}"]`);
    if (triggerBubble) triggerBubble.setAttribute('aria-expanded', 'true');
    
    // Focus first item after animation
    setTimeout(() => popup.querySelector('.popup-row')?.focus(), 260);
  });
};
    const hidePopup = () => {
      backdrop.classList.remove('visible');
      popup.animate([
        {transform:'scale(1)', opacity:1},
        {transform:'scale(0.8)', opacity:0}
      ], {duration:200, easing:'ease-in'}).onfinish = () => {
        popup.classList.remove('visible');
        popup.style.display = 'none';
      };
      
      // Update ARIA
      document.querySelectorAll('.bubble[aria-expanded="true"]').forEach(b => 
        b.setAttribute('aria-expanded', 'false')
      );
    };
    
    this.hidePopup = hidePopup; // Store for keyboard nav

    bubbles.forEach(bubble => {
      bubble.addEventListener('click', (e) => {
        const type = bubble.dataset.bubble;
        
        // Visual effects
        this.createRipple(bubble, e);
        this.createParticles(bubble, e);
        
        // Update active state
        document.querySelectorAll('.bubble').forEach(b => b.classList.remove('active'));
        bubble.classList.add('active');
        
        if (type === 'home') {
          hidePopup();
          this.switchTab('dashboard', 'Main Dashboard');
        } else if (type === 'chatbot') {
          hidePopup();
          this.openChatBot();
        } else if (menuMap[type]) {
          const title = type === 'features' ? 'Features' : 'Mini Apps';
          showPopup(menuMap[type], title, bubble);
        }
        
        // Haptic feedback
        if (window.navigator.vibrate) {
          window.navigator.vibrate(10);
        }
      });
      
      // Keyboard activation
      bubble.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          bubble.click();
        }
      });
    });

    popup.addEventListener('click', (e) => {
      const row = e.target.closest('.popup-row');
      if (row) {
        hidePopup();
        const navItem = document.querySelector(`[data-tab="${row.dataset.tab}"]`);
        this.switchTab(row.dataset.tab, navItem?.dataset.label);
        
        if (window.navigator.vibrate) {
          window.navigator.vibrate(10);
        }
      }
    });
    
    // Keyboard nav for popup items
    popup.addEventListener('keydown', (e) => {
      const items = Array.from(popup.querySelectorAll('.popup-row'));
      const current = document.activeElement;
      const currentIndex = items.indexOf(current);
      
      if (e.key === 'ArrowDown' && currentIndex < items.length - 1) {
        e.preventDefault();
        items[currentIndex + 1]?.focus();
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        e.preventDefault();
        items[currentIndex - 1]?.focus();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        current?.click();
      }
    });

    backdrop.addEventListener('click', hidePopup);
  }

  openChatBot() {
    // Check if ChatBotAI exists
    const chatPanel = document.querySelector('#chatbot-float-panel');
    const chatBubble = document.querySelector('#chatbot-float-bubble');
    const chatClose = document.querySelector('#chatbot-float-close');
    
    if (chatPanel && chatBubble) {
      // Hide the old floating bubble permanently
      chatBubble.style.display = 'none';
      
      // Open the chat panel
      chatPanel.classList.add('open');
      
      // Override the close button to keep bubble hidden
      if (chatClose) {
        chatClose.onclick = (e) => {
          e.stopPropagation();
          chatPanel.classList.remove('open');
          // Keep the old bubble hidden even after closing
          chatBubble.style.display = 'none';
        };
      }
      
      // Focus on input
      const chatInput = document.querySelector('.chatbot-ai-input');
      if (chatInput) {
        setTimeout(() => chatInput.focus(), 300);
      }
    } else {
      // Fallback if ChatBotAI not initialized yet
      console.warn('ChatBotAI not ready yet');
      setTimeout(() => this.openChatBot(), 500);
    }
  }

  setupSwipeGestures() {
    const tabOrder = ['dashboard', 'energy', 'tarot', 'gratitude', 'happiness', 
                      'journal', 'meditations', 'flip-script', 'calculator', 
                      'shadow-alchemy', 'karma-shop'];
    
    document.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});

    document.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      
      // Debounce swipe gestures
      clearTimeout(this.swipeDebounceTimer);
      this.swipeDebounceTimer = setTimeout(() => {
        this.handleSwipe(tabOrder);
      }, 50);
    }, {passive: true});
  }

  handleSwipe(tabOrder) {
    const swipeThreshold = 100;
    const diff = this.touchStartX - this.touchEndX;
    
    if (Math.abs(diff) < swipeThreshold) return;
    
    const activeTab = localStorage.getItem('pc_active_tab') || 'dashboard';
    const currentIndex = tabOrder.indexOf(activeTab);
    
    if (diff > 0 && currentIndex < tabOrder.length - 1) {
      const nextTab = tabOrder[currentIndex + 1];
      const navItem = document.querySelector(`[data-tab="${nextTab}"]`);
      this.switchTab(nextTab, navItem?.dataset.label);
    } else if (diff < 0 && currentIndex > 0) {
      const prevTab = tabOrder[currentIndex - 1];
      const navItem = document.querySelector(`[data-tab="${prevTab}"]`);
      this.switchTab(prevTab, navItem?.dataset.label);
    }
  }

  updateBreadcrumb(label) {
    // Breadcrumb removed
  }

  showProgress() {
    const bar = document.getElementById('progress-bar');
    if (bar) {
      bar.style.width = '0%';
      bar.classList.add('loading');
      bar.setAttribute('aria-valuenow', '0');
      setTimeout(() => {
        bar.style.width = '100%';
        bar.setAttribute('aria-valuenow', '100');
        setTimeout(() => {
          bar.classList.remove('loading');
          bar.style.width = '0%';
          bar.setAttribute('aria-valuenow', '0');
        }, 400);
      }, 10);
    }
  }

  switchTab(tabName, label) {
    if (tabName === 'calculator' && !window.calculatorChunk) {
      window.calculatorChunk = 'requested';
    }

    // Show loading states
    this.showProgress();
    
    // Update breadcrumb
    this.updateBreadcrumb(label);

    // Update ARIA states
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
    
    // Haptic feedback
    if (window.navigator.vibrate) {
      window.navigator.vibrate(10);
    }
  }
}
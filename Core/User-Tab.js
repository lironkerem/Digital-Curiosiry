// User-Tab.js — COMPLETE PATCHED VERSION (Fixed image rendering + swapped positions + Admin Hacks)

export default class UserTab {
  constructor(app) {
    this.app = app;
  }

  render() {
    const html = `
      <div class="user-menu" id="user-menu">
        <button class="user-menu-btn" id="user-menu-btn" aria-expanded="false" aria-controls="user-dropdown">
          <span id="user-avatar-img" class="user-avatar user-avatar-img hidden"></span>
          <span id="user-avatar-emoji" class="user-avatar">${this.app.state.currentUser?.emoji || '👤'}</span>
          <img src="https://raw.githubusercontent.com/lironkerem/Digital-Curiosiry/main/assets/Tabs/UserTab.png"
               alt="User Tab Icon" class="user-tab-icon" />
          <span class="user-chevron">▼</span>
        </button>

        <div class="user-dropdown" id="user-dropdown" role="menu">
          <button class="dropdown-item" data-section="profile">👤 Profile</button>
          <div class="accordion-panel" id="panel-profile"></div>

          <button class="dropdown-item" data-section="settings">🎭 Skins</button>
          <div class="accordion-panel" id="panel-settings"></div>

          <button class="dropdown-item" data-section="automations">⚙️ Automations</button>
          <div class="accordion-panel" id="panel-automations"></div>

          <button class="dropdown-item" data-section="about">ℹ️ About the App</button>
          <div class="accordion-panel" id="panel-about"></div>

          <button class="dropdown-item" data-section="rules">📜 Rules</button>
          <div class="accordion-panel" id="panel-rules"></div>

          <button class="dropdown-item" data-section="contact">📧 Contact Me</button>
          <div class="accordion-panel" id="panel-contact"></div>

          <button class="dropdown-item" data-section="export">💾 Export Data</button>
          <div class="accordion-panel" id="panel-export"></div>

          <button class="dropdown-item" data-section="billing">⬆️ Pricings</button>
          <div class="accordion-panel" id="panel-billing"></div>

          ${this.app.state.currentUser?.isAdmin ? `
            <button class="dropdown-item" data-section="admin">🔧 Admin Hacks</button>
            <div class="accordion-panel" id="panel-admin"></div>
          ` : ''}

          <div class="dropdown-divider"></div>
          <button class="dropdown-item" data-action="logout">🚪 Logout</button>
        </div>
      </div>

      <style>
        /* ----------  STICKY MENU  ---------- */
        .user-menu{position:fixed;top:12px;right:12px;z-index:60;}

        .user-menu-btn{
  display:flex;
  align-items:center;
  gap:10px;
  background:linear-gradient(135deg, var(--neuro-accent), var(--neuro-accent-light));  /* Match skin colors */
  border:none;
  padding:8px 14px;
  border-radius:12px;
  cursor:pointer;
  box-shadow:var(--shadow-raised);
  transition:box-shadow .2s;
  color:#fff;  /* White text for better contrast */
}
        .user-menu-btn:hover{box-shadow:var(--shadow-raised-hover);}
        .user-menu-btn:active{box-shadow:var(--shadow-inset);}
        
        /* UserTab icon comes second */
        .user-tab-icon{
          width:32px;
          height:32px;
          object-fit:contain;
          order:2;
        }
        
        /* Avatar comes first */
        .user-avatar{
          width:40px;
          height:40px;
          border-radius:50%;
          object-fit:cover;
          background:var(--neuro-bg);
          display:flex;
          align-items:center;
          justify-content:center;
          font-size:1.4rem;
          box-shadow:var(--shadow-inset-sm);
          order:1;
        }
        
        /* For image avatars */
        .user-avatar-img{
          background-size:cover;
          background-position:center;
        }
        
        .user-avatar.hidden{display:none;}

        .user-chevron{font-size:.7rem;color:var(--neuro-text-light);margin-left:4px;transition:transform .2s;order:3;}
        .user-menu-btn[aria-expanded="true"] .user-chevron{transform:rotate(180deg);}
        
        .user-dropdown{
          position:absolute;
          right:0;
          top:calc(100% + 6px);
          width:230px;
          background:var(--neuro-bg);
          border-radius:24px;
          box-shadow:var(--shadow-raised-lg);
          padding:12px 0;
          z-index:50;
          opacity:0;
          transform:scale(.95);
          pointer-events:none;
          transition:opacity .2s,transform .2s;
          max-height:80vh;
          overflow-y:auto;
        }
        .user-dropdown.active{opacity:1;transform:scale(1);pointer-events:auto;}
        
        .dropdown-divider{
          height:1px;
          background:var(--neuro-shadow-dark);
          margin:8px 0;
          opacity:0.5;
        }
        
.dropdown-item{
  display:block;
  width:calc(100% - 60px);
  margin:0 auto 12px auto;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  text-align:left;
  padding:12px 8px;
  font-size:1rem;
  background:var(--neuro-bg);  /* Keep neumorphic background */
  border:2px solid var(--neuro-accent);  /* Border uses skin color instead */
  border-radius:10px;
  color:var(--neuro-text);  /* Keep normal text color */
  cursor:pointer;
  box-shadow:var(--shadow-raised);
  transition:all .2s;
  font-weight:500;
}
.dropdown-item:hover{
  background:rgba(var(--neuro-accent), 0.1);  /* Subtle tint on hover */
  border-color:var(--neuro-accent-light);
  box-shadow:var(--shadow-raised-hover);
  transform:translateY(-1px);
}
.dropdown-item:active{
  background:var(--neuro-bg);
  box-shadow:var(--shadow-inset);
  transform:translateY(0);
}
        .accordion-panel{
          padding:8px 12px;
          font-size:.85rem;
          color:var(--neuro-text-light);
          display:none;
        }
        .accordion-panel.active{display:block;}
        
        .avatar-upload-label{position:relative;cursor:pointer;display:inline-block;}
        .avatar-upload-label input[type="file"]{position:absolute;opacity:0;width:0;height:0;pointer-events:none;}
        
        .profile-avatar-container{
          width:80px;
          height:80px;
          border-radius:50%;
          background:var(--neuro-bg);
          box-shadow:var(--shadow-inset);
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
          cursor:pointer;
          position:relative;
        }
        .profile-avatar-container img{width:100%;height:100%;object-fit:cover;}
        .profile-avatar-emoji{font-size:2.5rem;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);}
        
        .accordion-inner input[type="text"],
        .accordion-inner input[type="email"],
        .accordion-inner input[type="tel"],
        .accordion-inner input[type="date"],
        .accordion-inner select{
          width:100%;
          padding:6px 8px;
          font-size:.8rem;
          border-radius:8px;
          border:none;
          background:var(--neuro-bg);
          box-shadow:var(--shadow-inset-sm);
          margin-bottom:8px;
          font-family:inherit;
          color:var(--neuro-text);
        }
        
        .btn-link{
          font-size:.8rem;
          padding:4px 8px;
          background:transparent;
          border:none;
          color:var(--neuro-accent);
          cursor:pointer;
          text-decoration:underline;
          border-radius:4px;
        }
        .btn-link:hover{background:rgba(102,126,234,.08);}
        
        .theme-checkbox-group{display:flex;flex-direction:column;gap:8px;margin-top:8px;}
        .theme-checkbox-label{display:flex;align-items:center;gap:8px;cursor:pointer;padding:4px 0;}

        /* Toggle Switch Styles */
        .toggle-switch-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          gap: 12px;
        }
        .toggle-switch-container.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .toggle-switch-label {
          flex: 1;
          font-size: 0.9rem;
          color: var(--neuro-text);
        }
        .toggle-switch {
          position: relative;
          width: 48px;
          height: 24px;
          cursor: pointer;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-slider {
          position: absolute;
          inset: 0;
          background: var(--neuro-shadow-dark);
          border-radius: 24px;
          transition: all 0.3s;
          box-shadow: var(--shadow-inset-sm);
        }
        .toggle-slider:before {
          content: "";
          position: absolute;
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background: var(--neuro-bg);
          border-radius: 50%;
          transition: all 0.3s;
          box-shadow: var(--shadow-raised);
        }
        .toggle-switch input:checked + .toggle-slider {
          background: var(--neuro-accent);
          box-shadow: var(--shadow-glow);
        }
        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(24px);
        }
        .toggle-switch input:disabled + .toggle-slider {
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* Automation Styles */
        .automation-group {
          background: rgba(102, 126, 234, 0.05);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 10px;
        }
        .automation-header {
          margin-bottom: 6px;
        }
        .automation-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          cursor: pointer;
          color:var(--neuro-text);
        }
        .automation-label input[type="checkbox"] {
          cursor: pointer;
        }
        .automation-controls {
          padding-left: 28px;
          font-size: 0.85rem;
          opacity: 1;
          transition: opacity 0.2s;
          color:var(--neuro-text-light);
        }
        .automation-controls.disabled {
          opacity: 0.4;
        }
        .automation-controls input[type="number"] {
          width: 60px;
          padding: 4px 6px;
          margin: 0 4px;
          border-radius: 6px;
          border: none;
          background: var(--neuro-bg);
          box-shadow: var(--shadow-inset-sm);
          text-align: center;
          color:var(--neuro-text);
        }
      </style>
    `;
    if (!document.getElementById('user-tab-styles')) {
      const s = document.createElement('style');
      s.id = 'user-tab-styles';
      s.textContent = html.match(/<style>(.+?)<\/style>/s)[1];
      document.head.appendChild(s);
    }
    return html.replace(/<style>.+?<\/style>/s, '');
  }

  init() {
    if (!window.app.renderProfileHTML) {
      window.app.renderProfileHTML = () => {
        const u = this.app.state.currentUser || {};
        return `
          <div class="accordion-inner">
            <div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:10px;">
              <label class="avatar-upload-label" title="Click to change picture">
                <input type="file" id="avatar-upload" accept="image/*">
                <div class="profile-avatar-container" id="profile-avatar-preview">
                  <img id="profile-avatar-img" src="${u.avatarUrl || ''}" style="${u.avatarUrl ? '' : 'display:none;'}">
                  <span class="profile-avatar-emoji" style="${u.avatarUrl ? 'display:none;' : ''}">${u.emoji || '👤'}</span>
                </div>
              </label>
              <select id="profile-emoji">${['👤','♈️','♉️','♊️','♋️','♌️','♍️','♎️','♏️','♐️','♑️','♒️','♓️','🧘‍♀️','🌙','☀️','🌟','🔮','🦋','🌿','🌸','🕉️','🍀'].map(e=>'<option '+(e===u.emoji?'selected':'')+' value="'+e+'">'+e+'</option>').join('')}</select>
            </div>
            <input id="profile-name" type="text" maxlength="30" placeholder="Display name" value="${u.name || ''}">
            <input id="profile-email" type="email" placeholder="E-mail" value="${u.email || ''}">
            <input id="profile-phone" type="tel" placeholder="Phone" value="${u.phone || ''}">
            <input id="profile-birthday" type="date" value="${u.birthday || ''}">
            <button class="btn-link" id="save-profile-btn">Save changes</button>
          </div>
        `;
      };

      window.app.renderAboutHTML = () => `
        <div class="accordion-inner">
          <p><strong>Digital Curiosity</strong> by Aanandoham, 2026.</p>
          <p>A digital way, for a digital practitioner, to continue practicing Spirituality in the 21st Century.</p>
          <p>This App was built to share tools, practices and ancient wisdom - digitally, from your device.</p>
          <p>It is a convenient, accessible way, to stay connected to your 'Self', by small daily practices.</p>
          <p>My hope is that you will utilize it to enhance your life, one small function at a time.</p>
        </div>`;

      window.app.renderRulesHTML = () => `
        <div class="accordion-inner" style="
          white-space: pre-line;
          line-height: 1.45;
          max-height: 260px;
          overflow-y: auto;
          padding-right: 6px;
        ">
This App is designed to create a fun, safe space, to encourage you and motivate you on a daily basis.
The more you will use its features and functions, the more you will "grow" and "get rich" in the app.
But more importantly, you will grow and get rich in Real Life. And this is the purpose.
So, play, use it, write, go deep, be truthful to yourself, practice and enjoy the process.

---------------------------
1. CORE CURRENCY RULES
---------------------------
- XP is the only way to level up.
- Karma is spent in the Karma-Shop for enhancements, premium features and private sessions.
---------------------------
2. LEVEL & XP RULES
---------------------------
Level 1  - Seeker      - 0
Level 2  - Practitioner - 300
Level 3  - Adept        - 800
Level 4  - Healer       - 1,600
Level 5  - Master       - 3,200
Level 6  - Sage         - 6,500
Level 7  - Enlightened  - 20,000
Level 8  - Buddha       - 50,000
Level 9  - Light        - 150,000
Level 10 - Emptiness    - 400,000
---------------------------

Have fun,
Aanandoham, 2026.
        </div>`;

      window.app.renderContactHTML = () => `
        <div class="accordion-inner">
          <p>Contact me for questions, private sessions, classes, retreats, guidance or any technical issues.</p>
          <a href="https://lironkerem.wixsite.com/project-curiosity" target="_blank" style="font-weight:bold;text-decoration:underline;color:var(--neuro-accent);">Official website</a><br>
          <a href="mailto:lironkerem@gmail.com" style="font-weight:bold;text-decoration:underline;color:var(--neuro-accent);">Email me</a><br>
          <a href="https://www.facebook.com/AanandohamsProjectCuriosity" target="_blank" style="font-weight:bold;text-decoration:underline;color:var(--neuro-accent);">Facebook Page</a>
        </div>`;

      window.app.renderExportHTML = () => `
        <div class="accordion-inner">
          <button class="btn-link" onclick="window.app.exportUserData()">Download JSON</button>
        </div>`;

      window.app.renderBillingHTML = () => `
        <div class="accordion-inner">
          <p><strong>Free</strong> - basic tools, ads free forever.</p>
          <p><strong>Practitioner</strong> - full Premium packs, monthly.</p>
          <p><strong>Adept</strong> - Premium packs + Sessons discounts, monthly.</p>
          <p><strong>Master</strong> - Premium packs + Discounts + 1-on-1 calls.</p>
          <button class="btn-link">Choose plan</button>
        </div>`;

      window.app.renderAdminHTML = () => `
        <div class="accordion-inner" id="admin-panel-container">
          <div id="admin-tab-mount"></div>
        </div>`;

      window.app.renderSettingsHTML = () => {
        const activeTheme = localStorage.getItem('activeTheme') || 'default';
        const isDarkMode = document.body.classList.contains('dark-mode');
        const hasChampagne = this.app.gamification?.state?.unlockedFeatures?.includes('luxury_champagne_gold_skin');
        const hasIndigo    = this.app.gamification?.state?.unlockedFeatures?.includes('royal_indigo_skin');
        const hasEarth     = this.app.gamification?.state?.unlockedFeatures?.includes('earth_luxury_skin');
        
        return `
        <div class="accordion-inner">
          <div style="margin-bottom:16px;">
            <div class="toggle-switch-container">
              <span class="toggle-switch-label">🌙 Dark Mode</span>
              <label class="toggle-switch">
                <input type="checkbox" id="dark-mode-toggle" ${isDarkMode ? 'checked' : ''}>
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <hr style="border:none;height:1px;background:rgba(0,0,0,.1);margin:16px 0;">

          <div style="margin-bottom:12px;font-weight:600;">Select Theme</div>

          <div class="toggle-switch-container">
            <span class="toggle-switch-label">Default (Neumorphic)</span>
            <label class="toggle-switch">
              <input type="checkbox" class="theme-toggle" data-theme="default" ${activeTheme === 'default' ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="toggle-switch-container">
            <span class="toggle-switch-label">Escaping the Matrix</span>
            <label class="toggle-switch">
              <input type="checkbox" class="theme-toggle" data-theme="matrix-code" ${activeTheme === 'matrix-code' ? 'checked' : ''}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <hr style="border:none;height:1px;background:rgba(0,0,0,.1);margin:16px 0;">

          <div style="margin-bottom:12px;font-weight:600;">Premium Themes</div>

          <div class="toggle-switch-container ${hasChampagne ? '' : 'disabled'}" 
               title="${hasChampagne ? '' : '🔒 Purchase in Karma Shop to unlock'}">
            <span class="toggle-switch-label">Champagne Gold ${hasChampagne ? '' : '🔒'}</span>
            <label class="toggle-switch">
              <input type="checkbox" class="theme-toggle" data-theme="champagne-gold" 
                ${activeTheme === 'champagne-gold' ? 'checked' : ''} 
                ${hasChampagne ? '' : 'disabled'}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="toggle-switch-container ${hasIndigo ? '' : 'disabled'}"
               title="${hasIndigo ? '' : '🔒 Purchase in Karma Shop to unlock'}">
            <span class="toggle-switch-label">Royal Indigo ${hasIndigo ? '' : '🔒'}</span>
            <label class="toggle-switch">
              <input type="checkbox" class="theme-toggle" data-theme="royal-indigo" 
                ${activeTheme === 'royal-indigo' ? 'checked' : ''} 
                ${hasIndigo ? '' : 'disabled'}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="toggle-switch-container ${hasEarth ? '' : 'disabled'}"
               title="${hasEarth ? '' : '🔒 Purchase in Karma Shop to unlock'}">
            <span class="toggle-switch-label">Earth Luxury ${hasEarth ? '' : '🔒'}</span>
            <label class="toggle-switch">
              <input type="checkbox" class="theme-toggle" data-theme="earth-luxury" 
                ${activeTheme === 'earth-luxury' ? 'checked' : ''} 
                ${hasEarth ? '' : 'disabled'}>
              <span class="toggle-slider"></span>
            </label>
          </div>

          <hr style="border:none;height:1px;background:rgba(0,0,0,.1);margin:12px 0;">
          <small style="opacity:.7">Changes apply immediately. Dark mode works with all themes!</small>
        </div>`;
      };

      window.app.renderAutomationsHTML = () => {
        const automations = JSON.parse(localStorage.getItem('wellness_automations')) || {
          selfReset: { enabled: false, interval: 60 },
          fullBodyScan: { enabled: false, interval: 180 },
          nervousSystem: { enabled: false, interval: 120 },
          tensionSweep: { enabled: false, interval: 120 }
        };

        return `
          <div class="accordion-inner">
            <p style="font-size:0.85rem;margin-bottom:12px;opacity:0.8;">
              Enable automatic reminders for your wellness practices
            </p>

            <div class="automation-group">
              <div class="automation-header">
                <label class="automation-label">
                  <input type="checkbox" id="auto-self-reset" 
                    ${automations.selfReset.enabled ? 'checked' : ''}>
                  <span>🧘 Self Reset</span>
                </label>
              </div>
              <div class="automation-controls ${automations.selfReset.enabled ? '' : 'disabled'}">
                <label>Every 
                  <input type="number" id="interval-self-reset" 
                    value="${automations.selfReset.interval}" 
                    min="15" max="480" step="15"
                    ${automations.selfReset.enabled ? '' : 'disabled'}>
                  minutes
                </label>
              </div>
            </div>

            <div class="automation-group">
              <div class="automation-header">
                <label class="automation-label">
                  <input type="checkbox" id="auto-full-body-scan" 
                    ${automations.fullBodyScan.enabled ? 'checked' : ''}>
                  <span>🌊 Full Body Scan</span>
                </label>
              </div>
              <div class="automation-controls ${automations.fullBodyScan.enabled ? '' : 'disabled'}">
                <label>Every 
                  <input type="number" id="interval-full-body-scan" 
                    value="${automations.fullBodyScan.interval}" 
                    min="15" max="480" step="15"
                    ${automations.fullBodyScan.enabled ? '' : 'disabled'}>
                  minutes
                </label>
              </div>
            </div>

            <div class="automation-group">
              <div class="automation-header">
                <label class="automation-label">
                  <input type="checkbox" id="auto-nervous-system" 
                    ${automations.nervousSystem.enabled ? 'checked' : ''}>
                  <span>⚡ Nervous System Reset</span>
                </label>
              </div>
              <div class="automation-controls ${automations.nervousSystem.enabled ? '' : 'disabled'}">
                <label>Every 
                  <input type="number" id="interval-nervous-system" 
                    value="${automations.nervousSystem.interval}" 
                    min="15" max="480" step="15"
                    ${automations.nervousSystem.enabled ? '' : 'disabled'}>
                  minutes
                </label>
              </div>
            </div>

            <div class="automation-group">
              <div class="automation-header">
                <label class="automation-label">
                  <input type="checkbox" id="auto-tension-sweep" 
                    ${automations.tensionSweep.enabled ? 'checked' : ''}>
                  <span>🌀 Tension Sweep</span>
                </label>
              </div>
              <div class="automation-controls ${automations.tensionSweep.enabled ? '' : 'disabled'}">
                <label>Every 
                  <input type="number" id="interval-tension-sweep" 
                    value="${automations.tensionSweep.interval}" 
                    min="15" max="480" step="15"
                    ${automations.tensionSweep.enabled ? '' : 'disabled'}>
                  minutes
                </label>
              </div>
            </div>

            <button class="btn-link" id="save-automations-btn">Save Automation Settings</button>
            
            <hr style="border:none;height:1px;background:rgba(0,0,0,.1);margin:12px 0;">
            <small style="opacity:.7;font-size:0.75rem;">
              ⚠️ Automations will trigger pop-up reminders at your chosen intervals while the app is open.
            </small>
          </div>
        `;
      };
    }

    const dropdown = document.getElementById('user-dropdown');
    if (!dropdown) return;

    document.querySelectorAll('.dropdown-item[data-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        const panel = document.getElementById(`panel-${section}`);
        const isOpen = panel.classList.contains('active');
        document.querySelectorAll('.accordion-panel').forEach(p => p.classList.remove('active'));
        if (!isOpen) {
          panel.classList.add('active');
          if (!panel.dataset.filled) {
            switch (section) {
              case 'profile':      panel.innerHTML = window.app.renderProfileHTML();      break;
              case 'settings':     panel.innerHTML = window.app.renderSettingsHTML();     break;
              case 'automations':  panel.innerHTML = window.app.renderAutomationsHTML();  break;
              case 'about':        panel.innerHTML = window.app.renderAboutHTML();        break;
              case 'rules':        panel.innerHTML = window.app.renderRulesHTML();        break;
              case 'contact':      panel.innerHTML = window.app.renderContactHTML();      break;
              case 'export':       panel.innerHTML = window.app.renderExportHTML();       break;
              case 'billing':      panel.innerHTML = window.app.renderBillingHTML();      break;
              case 'admin':        
                panel.innerHTML = window.app.renderAdminHTML();
                this.loadAdminPanel();
                break;
            }
            panel.dataset.filled = '1';
            if (section === 'profile') this.attachProfileHandlers();
            if (section === 'settings') this.attachSettingsHandlers();
            if (section === 'automations') this.attachAutomationsHandlers();
          }
        }
      });
    });

    document.querySelector('[data-action="logout"]')?.addEventListener('click', () => this.showLogoutModal());

    const userBtn = document.getElementById('user-menu-btn');
    if (!userBtn) return;

    userBtn.addEventListener('click', e => {
      e.stopPropagation();
      const expanded = userBtn.getAttribute('aria-expanded') === 'true';
      userBtn.setAttribute('aria-expanded', !expanded);
      dropdown.classList.toggle('active');
      this.syncAvatar();
    });

    document.addEventListener('click', e => {
      if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
        userBtn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('active');
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        userBtn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('active');
      }
    });

    this.syncAvatar();
    this.loadActiveTheme();
  }

  attachProfileHandlers() {
    document.getElementById('profile-emoji')?.addEventListener('change', e => {
      const emojiSpan = document.querySelector('.profile-avatar-emoji');
      const img = document.getElementById('profile-avatar-img');
      if (emojiSpan) emojiSpan.textContent = e.target.value;
      if (img) img.style.display = 'none';
      if (emojiSpan) emojiSpan.style.display = 'block';
    });
    document.getElementById('avatar-upload')?.addEventListener('change', () => this.liveAvatarPreview());
    document.getElementById('save-profile-btn')?.addEventListener('click', () => {
      if (typeof window.app.saveQuickProfile === 'function') window.app.saveQuickProfile();
      else console.warn('saveQuickProfile() not found on window.app');
    });
  }

showLogoutModal() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="neuro-modal modal-small">
      <div class="modal-header">
        <div class="modal-icon">🚪</div>
        <h3 class="modal-title">Logout Confirmation</h3>
      </div>
      <p class="modal-message">Are you sure you want to logout?</p>
      <div class="modal-actions">
        <button class="btn" id="cancel-logout">Cancel</button>
        <button class="btn btn-primary" id="confirm-logout">Logout</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('cancel-logout').addEventListener('click', () => {
    modal.remove();
  });
  
  document.getElementById('confirm-logout').addEventListener('click', () => {
    modal.remove();
    window.app.logout();
  });
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Close on ESC key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

  attachSettingsHandlers() {
    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', e => {
        window.DarkMode.toggle(e.target.checked);
      });
    }

    // Theme toggles - only one can be active at a time
    document.querySelectorAll('.theme-toggle').forEach(toggle => {
      toggle.addEventListener('change', e => {
        if (e.target.checked) {
          // Uncheck all other theme toggles
          document.querySelectorAll('.theme-toggle').forEach(other => {
            if (other !== e.target) {
              other.checked = false;
            }
          });
          // Apply the selected theme
          this.switchTheme(e.target.dataset.theme);
        } else {
          // Prevent unchecking - at least one must be active
          e.target.checked = true;
        }
      });
    });
  }

  attachAutomationsHandlers() {
    const tools = ['self-reset', 'full-body-scan', 'nervous-system', 'tension-sweep'];
    
    tools.forEach(tool => {
      const checkbox = document.getElementById(`auto-${tool}`);
      const intervalInput = document.getElementById(`interval-${tool}`);
      const controls = checkbox?.closest('.automation-group')?.querySelector('.automation-controls');
      
      if (checkbox) {
        checkbox.addEventListener('change', (e) => {
          if (intervalInput) intervalInput.disabled = !e.target.checked;
          if (controls) {
            if (e.target.checked) {
              controls.classList.remove('disabled');
            } else {
              controls.classList.add('disabled');
            }
          }
        });
      }
    });

    document.getElementById('save-automations-btn')?.addEventListener('click', () => {
      this.saveAutomations();
    });
  }

  saveAutomations() {
    const automations = {
      selfReset: {
        enabled: document.getElementById('auto-self-reset')?.checked || false,
        interval: parseInt(document.getElementById('interval-self-reset')?.value || 60)
      },
      fullBodyScan: {
        enabled: document.getElementById('auto-full-body-scan')?.checked || false,
        interval: parseInt(document.getElementById('interval-full-body-scan')?.value || 180)
      },
      nervousSystem: {
        enabled: document.getElementById('auto-nervous-system')?.checked || false,
        interval: parseInt(document.getElementById('interval-nervous-system')?.value || 120)
      },
      tensionSweep: {
        enabled: document.getElementById('auto-tension-sweep')?.checked || false,
        interval: parseInt(document.getElementById('interval-tension-sweep')?.value || 120)
      }
    };

    localStorage.setItem('wellness_automations', JSON.stringify(automations));
    
    if (window.app.restartAutomations) {
      window.app.restartAutomations();
    }
    
    this.app.showToast('✅ Automation settings saved!', 'success');
  }

  // ----------  FIXED THEME SWITCHER  ----------
  switchTheme(themeName) {
    // cleanup
    document.body.classList.remove('champagne-gold', 'royal-indigo', 'earth-luxury', 'matrix-code');
    document.querySelectorAll('link[data-premium-theme]').forEach(l => l.remove());
    localStorage.setItem('activeTheme', themeName);

    // default selected → re-enable default dark-mode.css
    if (themeName === 'default') {
      document.getElementById('dark-mode-css')?.removeAttribute('disabled');
      // Remove matrix rain for default theme
      if (window.app && window.app.initMatrixRain) {
        const existing = document.querySelector('.matrix-rain-container');
        if (existing) existing.remove();
      }
      return;
    }

    // premium/matrix skin selected → disable default dark-mode.css
    document.body.classList.add(themeName);
    document.getElementById('dark-mode-css')?.setAttribute('disabled', 'true');

    const file = `./Assets/CSS/${themeName}.css`;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = file;
    link.setAttribute('data-premium-theme', themeName);
    document.head.appendChild(link);

    // Initialize Matrix rain if matrix-code skin selected
    if (themeName === 'matrix-code' && window.app && window.app.initMatrixRain) {
      // Small delay to let CSS load
      setTimeout(() => window.app.initMatrixRain(), 100);
    }
  }

  loadActiveTheme() {
    const t = localStorage.getItem('activeTheme');
    if (t && t !== 'default') this.switchTheme(t);
  }

  liveAvatarPreview() {
    const file = document.getElementById('avatar-upload').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById('profile-avatar-img');
      const emoji = document.querySelector('.profile-avatar-emoji');
      if (img) { img.src = e.target.result; img.style.display = 'block'; }
      if (emoji) emoji.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  syncAvatar() {
    const u = this.app.state.currentUser || {};
    const imgSpan = document.getElementById('user-avatar-img');
    const emojiSpan = document.getElementById('user-avatar-emoji');
    
    if (u.avatarUrl) {
      imgSpan.style.backgroundImage = `url(${u.avatarUrl})`;
      imgSpan.classList.remove('hidden');
      emojiSpan.classList.add('hidden');
    } else {
      imgSpan.classList.add('hidden');
      emojiSpan.classList.remove('hidden');
      emojiSpan.textContent = u.emoji || '👤';
    }
  }

  async loadAdminPanel() {
    const mount = document.getElementById('admin-tab-mount');
    if (!mount) return;
    
    mount.innerHTML = '<div style="text-align:center;padding:20px;color:var(--neuro-text);">Loading admin panel...</div>';
    
    try {
      const { AdminTab } = await import('./Admin-Tab.js');
      const { supabase } = await import('./Supabase.js');
      const adminTab = new AdminTab(supabase);
      const content = await adminTab.render();
      mount.innerHTML = '';
      mount.appendChild(content);
    } catch (error) {
      console.error('Failed to load admin panel:', error);
      mount.innerHTML = '<div style="color:#ff4757;padding:10px;">Failed to load admin panel: ' + error.message + '</div>';
    }
  }
}
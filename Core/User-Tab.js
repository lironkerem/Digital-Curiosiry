// User-Tab.js – 100 % complete, no stubs

export default class UserTab {
  constructor(app) {
    this.app = app;
    this.btn = null;
  }

  render() {
    const html = `
      <div class="user-menu" id="user-menu">
        <button class="user-disc" id="user-menu-btn" aria-expanded="false" aria-controls="user-dropdown">
          <svg class="disc-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.8-1.36-6.05-3.55C7.35 13.36 9.57 12 12 12s4.65 1.36 6.05 3.65C16.8 17.84 14.5 19.2 12 19.2z"/>
          </svg>
          <span class="disc-avatar">
            <img class="disc-avatar-img hidden" alt="avatar">
            <span class="disc-avatar-emoji">👤</span>
          </span>
          <span class="disc-dot hidden"></span>
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
        .user-menu{position:fixed;top:12px;right:12px;z-index:100;}
        .user-disc{width:36px;height:36px;border-radius:50%;border:none;background:var(--neuro-bg);box-shadow:var(--shadow-raised);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:box-shadow .2s,transform .2s;}
        .user-disc:active{box-shadow:var(--shadow-inset);transform:scale(.95);}
        .disc-icon{width:20px;height:20px;fill:#fff;transition:opacity .2s;}
        .disc-avatar{width:28px;height:28px;border-radius:50%;background:var(--neuro-bg);box-shadow:var(--shadow-inset-sm);display:flex;align-items:center;justify-content:center;overflow:hidden;transition:opacity .2s;}
        .disc-avatar-img{width:100%;height:100%;object-fit:cover;}
        .disc-avatar-emoji{font-size:1.1rem;}
        .user-disc .disc-icon{opacity:1;}
        .user-disc .disc-avatar{opacity:0;position:absolute;}
        .user-disc.avatar-mode .disc-icon{opacity:0;}
        .user-disc.avatar-mode .disc-avatar{opacity:1;}
        .disc-dot{position:absolute;top:2px;right:2px;width:8px;height:8px;border-radius:50%;background:var(--neuro-accent);box-shadow:0 0 4px var(--neuro-accent);animation:pulseDot 1.5s infinite;}
        @keyframes pulseDot{0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.3);opacity:.8;}}
        .user-dropdown{position:absolute;right:0;top:calc(100% + 6px);width:230px;background:var(--neuro-bg);border-radius:24px;box-shadow:var(--shadow-raised-lg);padding:12px 0;opacity:0;transform:scale(.95);pointer-events:none;transition:opacity .2s,transform .2s;z-index:50;max-height:80vh;overflow-y:auto;}
        .user-dropdown.active{opacity:1;transform:scale(1);pointer-events:auto;}
        .dropdown-divider{height:1px;background:var(--neuro-shadow-dark);margin:8px 0;opacity:.5;}
        .dropdown-item{display:block;width:calc(100% - 24px);margin:0 auto 8px auto;padding:10px 8px;font-size:.95rem;text-align:left;background:var(--neuro-bg);border:1px solid var(--neuro-shadow-dark);border-radius:10px;color:var(--neuro-text);cursor:pointer;box-shadow:var(--shadow-raised-sm);transition:all .2s;}
        .dropdown-item:hover{background:rgba(102,126,234,.08);border-color:var(--neuro-accent);}
        .dropdown-item:active{box-shadow:var(--shadow-inset);}
        .accordion-panel{padding:8px 12px;font-size:.85rem;color:var(--neuro-text-light);display:none;}
        .accordion-panel.active{display:block;}
        .avatar-upload-label{position:relative;cursor:pointer;display:inline-block;}
        .avatar-upload-label input[type=file]{position:absolute;opacity:0;width:0;height:0;pointer-events:none;}
        .profile-avatar-container{width:80px;height:80px;border-radius:50%;background:var(--neuro-bg);box-shadow:var(--shadow-inset);display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;position:relative;margin:0 auto 10px;}
        .profile-avatar-container img{width:100%;height:100%;object-fit:cover;}
        .profile-avatar-emoji{font-size:2.5rem;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);}
        .accordion-inner input[type=text],.accordion-inner input[type=email],.accordion-inner input[type=tel],.accordion-inner input[type=date],.accordion-inner select{width:100%;padding:6px 8px;font-size:.8rem;border-radius:8px;border:none;background:var(--neuro-bg);box-shadow:var(--shadow-inset-sm);margin-bottom:8px;font-family:inherit;color:var(--neuro-text);}
        .btn-link{font-size:.8rem;padding:4px 8px;background:transparent;border:none;color:var(--neuro-accent);cursor:pointer;text-decoration:underline;border-radius:4px;}
        .btn-link:hover{background:rgba(102,126,234,.08);}
        .automation-group{background:rgba(102,126,234,.05);border-radius:8px;padding:10px;margin-bottom:10px;}
        .automation-label{display:flex;align-items:center;gap:8px;font-weight:600;cursor:pointer;color:var(--neuro-text);}
        .automation-controls{padding-left:28px;font-size:.85rem;color:var(--neuro-text-light);}
        .automation-controls.disabled{opacity:.4;}
        .toggle-switch-container{display:flex;align-items:center;justify-content:space-between;padding:8px 0;gap:12px;}
        .toggle-switch{position:relative;width:44px;height:22px;cursor:pointer;}
        .toggle-switch input{opacity:0;width:0;height:0;}
        .toggle-slider{position:absolute;inset:0;background:var(--neuro-shadow-dark);border-radius:22px;transition:.3s;box-shadow:var(--shadow-inset-sm);}
        .toggle-slider:before{content:"";position:absolute;height:16px;width:16px;left:3px;bottom:3px;background:var(--neuro-bg);border-radius:50%;transition:.3s;box-shadow:var(--shadow-raised);}
        .toggle-switch input:checked + .toggle-slider{background:var(--neuro-accent);}
        .toggle-switch input:checked + .toggle-slider:before{transform:translateX(22px);}
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
    // helpers that other tabs expect
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
        <div class="accordion-inner" style="white-space: pre-line; line-height: 1.45; max-height: 260px; overflow-y: auto; padding-right: 6px;">
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
        const hasIndigo = this.app.gamification?.state?.unlockedFeatures?.includes('royal_indigo_skin');
        const hasEarth = this.app.gamification?.state?.unlockedFeatures?.includes('earth_luxury_skin');
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
            <p style="font-size:0.85rem;margin-bottom:12px;opacity:0.8;">Enable automatic reminders for your wellness practices</p>
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
            <small style="opacity:.7;font-size:0.75rem;">⚠️ Automations will trigger pop-up reminders at your chosen intervals while the app is open.</small>
          </div>`;
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

    this.btn = document.getElementById('user-menu-btn');
    if (!this.btn) return;

    this.btn.addEventListener('click', e => {
      e.stopPropagation();
      const expanded = this.btn.getAttribute('aria-expanded') === 'true';
      this.btn.setAttribute('aria-expanded', !expanded);
      dropdown.classList.toggle('active');
      this.syncAvatar();
    });

    document.addEventListener('click', e => {
      if (!this.btn.contains(e.target) && !dropdown.contains(e.target)) {
        this.btn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('active');
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.btn.setAttribute('aria-expanded', 'false');
        dropdown.classList.remove('active');
      }
    });

    this.syncAvatar();
    this.loadActiveTheme();
  }

  /* ----------  all helpers present  ---------- */
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

  attachSettingsHandlers() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('change', e => {
        window.DarkMode.toggle(e.target.checked);
      });
    }
    document.querySelectorAll('.theme-toggle').forEach(toggle => {
      toggle.addEventListener('change', e => {
        if (e.target.checked) {
          document.querySelectorAll('.theme-toggle').forEach(other => {
            if (other !== e.target) other.checked = false;
          });
          this.switchTheme(e.target.dataset.theme);
        } else {
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
          if (controls) controls.classList.toggle('disabled', !e.target.checked);
        });
      }
    });
    document.getElementById('save-automations-btn')?.addEventListener('click', () => this.saveAutomations());
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
    if (window.app.restartAutomations) window.app.restartAutomations();
    this.app.showToast('✅ Automation settings saved!', 'success');
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

  loadActiveTheme() {
    try {
      const t = localStorage.getItem('activeTheme');
      if (t && t !== 'default') {
        setTimeout(() => this.switchTheme(t), 100);
      }
    } catch (error) {
      console.warn('Failed to load active theme:', error);
      localStorage.setItem('activeTheme', 'default');
    }
  }

  switchTheme(themeName) {
    document.body.classList.remove('champagne-gold', 'royal-indigo', 'earth-luxury', 'matrix-code');
    document.querySelectorAll('link[data-premium-theme]').forEach(l => l.remove());
    localStorage.setItem('activeTheme', themeName);
    if (themeName === 'default') {
      document.getElementById('dark-mode-css')?.removeAttribute('disabled');
      const rain = document.querySelector('.matrix-rain-container');
      if (rain) rain.remove();
      return;
    }
    document.body.classList.add(themeName);
    document.getElementById('dark-mode-css')?.setAttribute('disabled', 'true');
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `./Assets/CSS/${themeName}.css`;
    link.setAttribute('data-premium-theme', themeName);
    document.head.appendChild(link);
    if (themeName === 'matrix-code' && window.app?.initMatrixRain) {
      setTimeout(() => window.app.initMatrixRain(), 100);
    }
  }

  loadAdminPanel() {
    const mount = document.getElementById('admin-tab-mount');
    if (!mount) return;
    mount.innerHTML = '<div style="text-align:center;padding:20px;color:var(--neuro-text);">Loading admin panel...</div>';
    import('./Admin-Tab.js')
      .then(({ AdminTab }) => import('./Supabase.js').then(({ supabase }) => {
        const adminTab = new AdminTab(supabase);
        return adminTab.render();
      }))
      .then(content => {
        mount.innerHTML = '';
        mount.appendChild(content);
      })
      .catch(err => {
        console.error('Failed to load admin panel:', err);
        mount.innerHTML = '<div style="color:#ff4757;padding:10px;">Failed to load admin panel: ' + err.message + '</div>';
      });
  }

  /* ----------  disc helpers  ---------- */
  syncAvatar() {
    const u = this.app.state.currentUser || {};
    const iconFace = this.btn.querySelector('.disc-icon');
    const avFace = this.btn.querySelector('.disc-avatar');
    const avImg = this.btn.querySelector('.disc-avatar-img');
    const avEmoji = this.btn.querySelector('.disc-avatar-emoji');

    if (u.avatarUrl && u.avatarUrl.trim() !== '') {
      avImg.src = u.avatarUrl;
      avImg.classList.remove('hidden');
      avEmoji.classList.add('hidden');
      this.btn.classList.add('avatar-mode');
    } else {
      avEmoji.textContent = u.emoji || '👤';
      avImg.classList.add('hidden');
      avEmoji.classList.remove('hidden');
      this.btn.classList.remove('avatar-mode');
    }
  }

  showLogoutModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="neuro-modal modal-small">
        <div class="modal-header"><div class="modal-icon">🚪</div><h3 class="modal-title">Logout?</h3></div>
        <p class="modal-message">Are you sure you want to logout?</p>
        <div class="modal-actions">
          <button class="btn" id="cancel-logout">Cancel</button>
          <button class="btn btn-primary" id="confirm-logout">Logout</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#cancel-logout').onclick = () => modal.remove();
    modal.querySelector('#confirm-logout').onclick = () => { modal.remove(); window.app.logout(); };
    modal.onclick = e => { if (e.target === modal) modal.remove(); };
  }
}
// user-tab.js – upgraded with Profile section, image-first avatar, accordion triggers styled like logout
export default class UserTab {
  constructor(app) {
    this.app = app;
  }

  render() {
    const html = `
      <div class="user-menu" id="user-menu">
        <button class="user-menu-btn" id="user-menu-btn" aria-expanded="false" aria-controls="user-dropdown">
          <span id="user-avatar-img" class="user-avatar hidden"></span>
          <span id="user-avatar-emoji" class="user-avatar">${this.app.state.currentUser?.emoji || '👤'}</span>
          <span class="user-handle">${this.app.state.currentUser?.name || 'User'}</span>
          <span class="user-chevron">▼</span>
        </button>

        <div class="user-dropdown" id="user-dropdown" role="menu">
          <!-- ===== 1. NEW PROFILE SECTION ===== -->
          <button class="dropdown-item" data-section="profile">👤 Profile</button>
          <div class="accordion-panel" id="panel-profile"></div>

          <!-- ===== 2. SETTINGS (existing) ===== -->
          <button class="dropdown-item" data-section="settings">⚙️ Settings</button>
          <div class="accordion-panel" id="panel-settings"></div>

          <!-- ===== 3. ABOUT THE APP ===== -->
          <button class="dropdown-item" data-section="about">ℹ️ About the App</button>
          <div class="accordion-panel" id="panel-about"></div>

          <!-- ===== 4. CONTACT ME ===== -->
          <button class="dropdown-item" data-section="contact">📧 Contact Me</button>
          <div class="accordion-panel" id="panel-contact"></div>

          <!-- ===== 5. EXPORT DATA ===== -->
          <button class="dropdown-item" data-section="export">💾 Export Data</button>
          <div class="accordion-panel" id="panel-export"></div>

          <!-- ===== 6. PRICINGS ===== -->
          <button class="dropdown-item" data-section="billing">⬆️ Pricings</button>
          <div class="accordion-panel" id="panel-billing"></div>

          <div class="dropdown-divider"></div>
          <button class="dropdown-item" data-action="logout">🚪 Logout</button>
        </div>
      </div>

      <!-- ===== STYLES ===== -->
      <style>
        .user-menu{position:absolute;top:12px;right:12px;z-index:60;}
        .user-menu-btn{display:flex;align-items:center;gap:10px;background:#e0e5ec;border:none;padding:8px 14px;border-radius:12px;cursor:pointer;box-shadow:4px 4px 8px #b8bec5,-4px -4px 8px #ffffff;transition:box-shadow .2s;}
        .user-menu-btn:hover{box-shadow:2px 2px 4px #b8bec5,-2px -2px 4px #ffffff;}
        .user-menu-btn:active{box-shadow:inset 2px 2px 4px #b8bec5,inset -2px -2px 4px #ffffff;}
        .user-avatar{width:40px;height:40px;border-radius:50%;object-fit:cover;background:#e0e5ec;display:flex;align-items:center;justify-content:center;font-size:1.4rem;box-shadow:inset 1px 1px 2px #b8bec5,inset -1px -1px 2px #ffffff;}
        .user-avatar.hidden{display:none;}
        .user-handle{font-weight:600;font-size:.95rem;color:var(--neuro-text);}
        .user-chevron{font-size:.7rem;color:var(--neuro-text-light);margin-left:4px;transition:transform .2s;}
        .user-menu-btn[aria-expanded="true"] .user-chevron{transform:rotate(180deg);}
        .user-dropdown{position:absolute;right:0;top:calc(100% + 6px);width:260px;background:#e0e5ec;border-radius:24px;box-shadow:12px 12px 24px #b8bec5,-12px -12px 24px #ffffff;padding:12px;z-index:50;opacity:0;transform:scale(.95);pointer-events:none;transition:opacity .2s,transform .2s;}
        .user-dropdown.active{opacity:1;transform:scale(1);pointer-events:auto;}
        .dropdown-divider{height:1px;background:#c8d1db;margin:8px 0;}
        .dropdown-item{width:100%;text-align:left;padding:8px 12px;font-size:.9rem;background:transparent;border:none;border-radius:8px;color:#2c3e50;cursor:pointer;transition:background .2s,box-shadow .2s;}
        .dropdown-item:hover{background:rgba(102,126,234,.08);box-shadow:1px 1px 2px #b8bec5,-1px -1px 2px #ffffff;}
        .dropdown-item:active{background:rgba(102,126,234,.15);box-shadow:inset 1px 1px 2px #b8bec5,inset -1px -1px 2px #ffffff;}

        /* ----- accordion panels ----- */
        .accordion-panel{padding:8px 12px;font-size:.85rem;color:#6c757d;display:none;}
        .accordion-panel.active{display:block;}

        /* ----- profile specific styles ----- */
        .avatar-upload-label{position:relative;cursor:pointer;display:inline-block;}
        .avatar-upload-label input[type="file"]{position:absolute;opacity:0;width:0;height:0;pointer-events:none;}
        .profile-avatar-container{width:80px;height:80px;border-radius:50%;background:#e0e5ec;box-shadow:inset 2px 2px 4px #b8bec5,inset -2px -2px 4px #ffffff;display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;position:relative;}
        .profile-avatar-container img{width:100%;height:100%;object-fit:cover;}
        .profile-avatar-emoji{font-size:2.5rem;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);}

        /* ----- input consistency ----- */
        .accordion-inner input[type="text"],
        .accordion-inner input[type="email"],
        .accordion-inner input[type="tel"],
        .accordion-inner input[type="date"],
        .accordion-inner select{width:100%;padding:6px 8px;font-size:.8rem;border-radius:8px;border:none;background:#e0e5ec;box-shadow:inset 1px 1px 2px #b8bec5,inset -1px -1px 2px #ffffff;margin-bottom:8px;font-family:inherit;}

        /* ----- mini buttons ----- */
        .btn-link{font-size:.8rem;padding:4px 8px;background:transparent;border:none;color:var(--neuro-accent);cursor:pointer;text-decoration:underline;border-radius:4px;}
        .btn-link:hover{background:rgba(102,126,234,.08);}
      </style>
    `;
    // only inject styles once – no duplicate markup
    if (!document.getElementById('user-tab-styles')) {
      const s = document.createElement('style');
      s.id = 'user-tab-styles';
      s.textContent = html.match(/<style>(.+?)<\/style>/s)[1];
      document.head.appendChild(s);
    }
    return html.replace(/<style>.+?<\/style>/s, ''); // return markup without <style>
  }

  init() {
    // expose renderers (if not already)
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
              <select id="profile-emoji">${['👤','♈️','♉️','♊️','♋️','♌️','♍️','♎️','♏️','♐️','♑️','♒️','♓️','🧘‍♀️','🌙','☀️','🌟','🔮','🦋','🌿','🌸','🕉️','🍀'].map(e=>`<option ${e===u.emoji?'selected':''} value="${e}">${e}</option>`).join('')}</select>
            </div>

            <input id="profile-name" type="text" maxlength="30" placeholder="Display name" value="${u.name || ''}">
            <input id="profile-email" type="email" placeholder="E-mail" value="${u.email || ''}">
            <input id="profile-phone" type="tel" placeholder="Phone" value="${u.phone || ''}">
            <input id="profile-birthday" type="date" value="${u.birthday || ''}">

            <button class="btn-link" id="save-profile-btn">Save changes</button>
          </div>
        `;
      };

      window.app.renderAboutHTML     = () => `
        <div class="accordion-inner">
          <p><strong>Digital Curiosity</strong> by Aanandoham, 2026.</p>
          <p>A digital way, for a digital practitioner, to continue practicing Spirituality in the 21st Century.</p>
          <p>This App was built to share tools, practices and ancient wisdom – digitally, from your device.</p>
          <p>It is a convenient, accessible way, to stay connected to your 'Self', by small daily practices.</p>
          <p>My hope is that you will utilize it to enhance your life, one small function at a time.</p>
        </div>`;

      window.app.renderContactHTML   = () => `
        <div class="accordion-inner">
          <p>Contact me for questions, private sessions, classes, retreats, guidance or any technical issues.</p>
          <a href="https://lironkerem.wixsite.com/project-curiosity" target="_blank">Official website</a><br>
          <a href="mailto:lironkerem@gmail.com">lironkerem@gmail.com</a><br>
          <a href="http://wa.me/+972524588767" target="_blank">WhatsApp</a><br>
          <a href="https://www.facebook.com/AanandohamsProjectCuriosity" target="_blank">Facebook Page</a>
        </div>`;

      window.app.renderExportHTML    = () => `
        <div class="accordion-inner">
          <button class="btn-link" onclick="window.app.exportUserData()">Download JSON</button>
        </div>`;

      window.app.renderBillingHTML   = () => `
        <div class="accordion-inner">
          <p><strong>Free</strong> – basic tools, ads free forever.</p>
          <p><strong>Practitioner</strong> – full tools pack, monthly.</p>
          <p><strong>Adept</strong> – + retreats discount, yearly.</p>
          <p><strong>Master</strong> – lifetime access + 1-on-1 calls.</p>
          <button class="btn-link">Choose plan</button>
        </div>`;

      window.app.renderSettingsHTML  = () => `
        <div class="accordion-inner">
          <label><input type="checkbox"> Dark mode</label><br>
          <label><input type="checkbox"> Email notifications</label><br>
          <button class="btn-link">Save settings</button>
        </div>`;
    }

    // accordion behaviour
    const dropdown = document.getElementById('user-dropdown');
    if (!dropdown) return;

    document.querySelectorAll('.dropdown-item[data-section]').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.dataset.section;
        const panel   = document.getElementById(`panel-${section}`);
        const isOpen  = panel.classList.contains('active');

        document.querySelectorAll('.accordion-panel').forEach(p => p.classList.remove('active'));

        if (!isOpen) {
          panel.classList.add('active');
          if (!panel.dataset.filled) {
            switch (section) {
              case 'profile':   panel.innerHTML = window.app.renderProfileHTML();   break;
              case 'settings':  panel.innerHTML = window.app.renderSettingsHTML();  break;
              case 'about':     panel.innerHTML = window.app.renderAboutHTML();     break;
              case 'contact':   panel.innerHTML = window.app.renderContactHTML();   break;
              case 'export':    panel.innerHTML = window.app.renderExportHTML();    break;
              case 'billing':   panel.innerHTML = window.app.renderBillingHTML();   break;
            }
            panel.dataset.filled = '1';
            if (section === 'profile') this.attachProfileHandlers();
          }
        }
      });
    });

    // logout
    document.querySelector('[data-action="logout"]')?.addEventListener('click', () => window.app.logout());

    // menu open/close (click-outside + ESC)
    const userBtn = document.getElementById('user-menu-btn');
    if (!userBtn) return;

    userBtn.addEventListener('click', e => {
      e.stopPropagation();
      const expanded = userBtn.getAttribute('aria-expanded') === 'true';
      userBtn.setAttribute('aria-expanded', !expanded);
      dropdown.classList.toggle('active');
      this.syncAvatar(); // show image or emoji in button
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

    // initial avatar state
    this.syncAvatar();
  }

  /* ------------------------------------------------- */
  /* --------------- helper methods ------------------ */
  /* ------------------------------------------------- */
  attachProfileHandlers() {
    // live preview while selecting emoji
    document.getElementById('profile-emoji')?.addEventListener('change', e => {
      const emojiSpan = document.querySelector('.profile-avatar-emoji');
      const img = document.getElementById('profile-avatar-img');
      if (emojiSpan) emojiSpan.textContent = e.target.value;
      if (img) img.style.display = 'none';
      if (emojiSpan) emojiSpan.style.display = 'block';
    });

    // live preview while selecting image
    document.getElementById('avatar-upload')?.addEventListener('change', () => this.liveAvatarPreview());

    // save button
    document.getElementById('save-profile-btn')?.addEventListener('click', () => {
      if (typeof window.app.saveQuickProfile === 'function') window.app.saveQuickProfile();
      else console.warn('saveQuickProfile() not found on window.app');
    });
  }

  liveAvatarPreview() {
    const file = document.getElementById('avatar-upload').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.getElementById('profile-avatar-img');
      const emojiSpan = document.querySelector('.profile-avatar-emoji');
      if (img) {
        img.src = e.target.result;
        img.style.display = 'block';
      }
      if (emojiSpan) emojiSpan.style.display = 'none';
    };
    reader.readAsDataURL(file);
  }

  syncAvatar() {
    const u = this.app.state.currentUser || {};
    const imgSpan = document.getElementById('user-avatar-img');
    const emojiSpan = document.getElementById('user-avatar-emoji');
    if (u.avatarUrl) {
      imgSpan.style.backgroundImage = `url(${u.avatarUrl})`;
      imgSpan.style.backgroundSize = 'cover';
      imgSpan.classList.remove('hidden');
      emojiSpan.classList.add('hidden');
    } else {
      imgSpan.classList.add('hidden');
      emojiSpan.classList.remove('hidden');
      emojiSpan.textContent = u.emoji || '👤';
    }
  }
}
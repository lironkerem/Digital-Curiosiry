// Modal.js
/* global window, document */

import { showToast } from './Toast.js';

/* --------------------------------------------------
   NEUMORPHIC MODAL SYSTEM
   -------------------------------------------------- */
export class NeumorphicModal {
  static showConfirm(msg, onConfirm, opts = {}) {
    const { title = 'Confirm Action', confirmText = 'Confirm', cancelText = 'Cancel', isDanger = false, icon = '⚠️' } = opts;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
<div class="neuro-modal modal-small">
  <div class=modal-header>
    <div class=modal-icon>${icon}</div>
    <h3 class=modal-title>${title}</h3>
    <p class=modal-message>${msg}</p>
  </div>
  <div class=modal-actions>
    <button class="btn modal-cancel">${cancelText}</button>
    <button class="btn btn-primary modal-confirm ${isDanger ? 'modal-btn-danger' : ''}">${confirmText}</button>
  </div>
</div>`;
    document.body.appendChild(overlay);
    const close = () => { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 200); };
    overlay.querySelector('.modal-cancel').onclick = close;
    overlay.querySelector('.modal-confirm').onclick = () => { close(); if (onConfirm) onConfirm(); };
    overlay.onclick = e => { if (e.target === overlay) close(); };
    const esc = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);
  }

  static showPrompt(msg, def, onConfirm, opts = {}) {
    const { title = 'Edit Entry', confirmText = 'Save', cancelText = 'Cancel', placeholder = 'Enter text...', icon = '✏️', multiline = false } = opts;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const inputEl = multiline
      ? `<textarea class=form-input rows=4 placeholder="${placeholder}">${def || ''}</textarea>`
      : `<input type=text class=form-input placeholder="${placeholder}" value="${def || ''}">`;
    overlay.innerHTML = `
<div class=neuro-modal>
  <div class=modal-header>
    <div class="modal-icon icon-small">${icon}</div>
    <h3 class=modal-title>${title}</h3>
    <p class=modal-message>${msg}</p>
  </div>
  <div class=modal-input-wrapper>${inputEl}</div>
  <div class=modal-actions>
    <button class="btn modal-cancel">${cancelText}</button>
    <button class="btn btn-primary modal-confirm">${confirmText}</button>
  </div>
</div>`;
    document.body.appendChild(overlay);
    const input = overlay.querySelector('input, textarea');
    const close = () => { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 200); };
    const submit = () => {
      const v = input.value.trim();
      if (v) { close(); if (onConfirm) onConfirm(v); }
    };
    setTimeout(() => { input.focus(); input.select(); }, 100);
    overlay.querySelector('.modal-cancel').onclick = close;
    overlay.querySelector('.modal-confirm').onclick = submit;
    overlay.onclick = e => { if (e.target === overlay) close(); };
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !multiline) { e.preventDefault(); submit(); }
      if (e.key === 'Escape') close();
    });
  }

  static showAlert(msg, opts = {}) {
    const { title = 'Notice', buttonText = 'OK', icon = 'ℹ️', type = 'info' } = opts;
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
<div class="neuro-modal modal-small">
  <div class=modal-header>
    <div class=modal-icon>${icon || icons[type]}</div>
    <h3 class=modal-title>${title}</h3>
    <p class=modal-message>${msg}</p>
  </div>
  <div class=modal-actions>
    <button class="btn btn-primary modal-confirm" style=width:100%>${buttonText}</button>
  </div>
</div>`;
    document.body.appendChild(overlay);
    const close = () => { overlay.style.opacity = '0'; setTimeout(() => overlay.remove(), 200); };
    overlay.querySelector('.modal-confirm').onclick = close;
    overlay.onclick = e => { if (e.target === overlay) close(); };
    const esc = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } };
    document.addEventListener('keydown', esc);
  }
}

/* --------------------------------------------------
   EXISTING MODAL FUNCTIONS
   -------------------------------------------------- */
export function saveQuickProfile(app) {
  const u = app.state.currentUser;
  u.name  = document.getElementById('dropdown-displayname').value.trim() || 'Seeker';
  u.email = document.getElementById('dropdown-email').value.trim();
  u.phone = document.getElementById('dropdown-phone').value.trim();
  u.birthday = document.getElementById('dropdown-birthday').value;
  u.avatarEmoji = document.getElementById('dropdown-emoji').value;
  localStorage.setItem('pc_user', JSON.stringify(u));
  refreshAvatar(app);
  showToast('Profile saved ✔', 'success');
}

export function refreshAvatar(app) {
  const u = app.state.currentUser;
  const img = document.getElementById('user-avatar-img');
  const em  = document.getElementById('user-avatar-emoji');
  if (u.avatarFile) {
    img.src = u.avatarFile;
    img.style.display = 'block';
    em.style.display  = 'none';
    document.getElementById('avatar-preview').innerHTML = `<img src="${u.avatarFile}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`;
  } else {
    img.style.display = 'none';
    em.style.display  = 'block';
    em.textContent = u.avatarEmoji || '👤';
    document.getElementById('avatar-preview').textContent = u.avatarEmoji || '👤';
  }
  document.getElementById('user-name').textContent = u.name;
}

export function avatarUploadHandler(app) {
  const file = document.getElementById('avatar-upload').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = 50;
      c.getContext('2d').drawImage(img, 0, 0, 50, 50);
      app.state.currentUser.avatarFile = c.toDataURL('image/png');
      app.state.currentUser.avatarEmoji = '';
      refreshAvatar(app);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

export const openSettings = app => buildModal(app, 'settings', 'Settings', settingsModalContent());
export const openAbout    = app => buildModal(app, 'about',   'About',   aboutModalContent());
export const openContact  = app => buildModal(app, 'contact','Contact us',contactModalContent());
export const openBilling  = app => buildModal(app, 'billing','Choose your plan',billingModalContent(app));

export function buildModal(app, id, title, innerHTML) {
  document.getElementById(id + '-modal')?.remove();
  const d = document.createElement('div');
  d.id = id + '-modal';
  d.className = 'modal-overlay';
  d.innerHTML = `<div class=modal-card><div class=modal-header><h3>${title}</h3><button onclick="this.closest('.modal-overlay').remove()">✕</button></div><div class=modal-body>${innerHTML}</div></div>`;
  document.body.appendChild(d);
}

export const settingsModalContent = () => `
<div class=settings-tabs>
  <button class="tab-btn active" onclick="window.app.switchSettingTab(event,'general')">General</button>
  <button class=tab-btn onclick="window.app.switchSettingTab(event,'privacy')">Privacy</button>
  <button class=tab-btn onclick="window.app.switchSettingTab(event,'notifs')">Notifications</button>
  <button class=tab-btn onclick="window.app.switchSettingTab(event,'data')">Data</button>
</div>
<div id=general class="tab-pane active">
  <label>App language</label><select class=form-input><option>English</option></select>
  <label>Theme</label><select class=form-input><option>Neumorphic Light</option></select>
  <label>Daily reminder</label><input type=time class=form-input>
</div>
<div id=privacy class=tab-pane>
  <label><input type=checkbox> Allow analytics</label>
  <label><input type=checkbox> Share progress with friends</label>
</div>
<div id=notifs class=tab-pane>
  <label><input type=checkbox checked> Morning quote</label>
  <label><input type=checkbox checked> Streak reminder</label>
</div>
<div id=data class=tab-pane>
  <p>Download everything we store about you.</p>
  <button class="btn btn-secondary" onclick="window.app.exportUserData()">Export JSON</button>
</div>`;

export const aboutModalContent    = () => `<p>Digital Curiosity v 1.0<br>Built with ❤️ by Aanandoham.<br>Licences: MIT (code), CC-BY (images).</p>`;

export const contactModalContent  = () => `
<form onsubmit="window.app.sendContact(event)">
  <input class=form-input name=subject placeholder=Subject required>
  <textarea class=form-input name=body rows=4 placeholder="Your message" required></textarea>
  <button class="btn btn-primary">Send</button>
</form>`;

export const billingModalContent  = app => `
<div class=plans-grid>
  ${app.plans.map(p => `
<div class="plan-card ${p.id}">
  <div class=plan-price>${p.price}</div>
  <h4>${p.name}</h4>
  <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
  ${app.state.currentUser.plan === p.id
    ? '<span class="badge badge-success">Current</span>'
    : `<button class="btn btn-primary" onclick="window.app.selectPlan('${p.id}')">Choose</button>`}
</div>`).join('')}
</div>`;

export const selectPlan = (app, planId) => showToast(`Plan "${planId}" selected – payment integration needed`, 'info');

export const switchSettingTab = (ev, tab) => {
  ev.target.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  ev.target.classList.add('active');
  ev.target.closest('.modal-card').querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
};
// js/core/utils/modal.js
import { showToast } from './toast.js';

/* --------------------------------------------------
   Pure helpers – receive everything they need
   -------------------------------------------------- */

export function saveQuickProfile(app) {
  const user = app.state.currentUser;
  user.name  = document.getElementById('dropdown-displayname').value.trim() || 'Seeker';
  user.email = document.getElementById('dropdown-email').value.trim();
  user.phone = document.getElementById('dropdown-phone').value.trim();
  user.birthday = document.getElementById('dropdown-birthday').value;
  user.avatarEmoji = document.getElementById('dropdown-emoji').value;
  localStorage.setItem('pc_user', JSON.stringify(user));
  refreshAvatar(app);
  showToast('Profile saved ✓', 'success');
}

export function refreshAvatar(app) {
  const u = app.state.currentUser;
  const img = document.getElementById('user-avatar-img');
  const em  = document.getElementById('user-avatar-emoji');
  if (u.avatarFile) {
    img.src = u.avatarFile;
    img.style.display = 'block';
    em.style.display  = 'none';
    document.getElementById('avatar-preview').innerHTML =
      `<img src="${u.avatarFile}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
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
      const canvas = document.createElement('canvas');
      const size = 50;
      canvas.width = canvas.height = size;
      canvas.getContext('2d').drawImage(img, 0, 0, size, size);
      app.state.currentUser.avatarFile = canvas.toDataURL('image/png');
      app.state.currentUser.avatarEmoji = '';
      refreshAvatar(app);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

export function openSettings(app) { buildModal(app, 'settings', 'Settings', settingsModalContent()); }
export function openAbout(app)    { buildModal(app, 'about',   'About',   aboutModalContent()); }
export function openContact(app)  { buildModal(app, 'contact','Contact us',contactModalContent()); }
export function openBilling(app)  { buildModal(app, 'billing','Choose your plan',billingModalContent()); }

export function buildModal(app, id, title, innerHTML) {
  document.getElementById(id + '-modal')?.remove();
  const div = document.createElement('div');
  div.id = id + '-modal';
  div.className = 'modal-overlay';
  div.innerHTML =
    `<div class="modal-card">
       <div class="modal-header"><h3>${title}</h3><button onclick="this.closest('.modal-overlay').remove()">✕</button></div>
       <div class="modal-body">${innerHTML}</div>
     </div>`;
  document.body.appendChild(div);
}

export const settingsModalContent = () => `
  <div class="settings-tabs">
    <button class="tab-btn active" onclick="window.app.switchSettingTab(event,'general')">General</button>
    <button class="tab-btn" onclick="window.app.switchSettingTab(event,'privacy')">Privacy</button>
    <button class="tab-btn" onclick="window.app.switchSettingTab(event,'notifs')">Notifications</button>
    <button class="tab-btn" onclick="window.app.switchSettingTab(event,'data')">Data</button>
  </div>
  <div id="general" class="tab-pane active">
    <label>App language</label><select class="form-input"><option>English</option></select>
    <label>Theme</label><select class="form-input"><option>Neumorphic Light</option></select>
    <label>Daily reminder</label><input type="time" class="form-input">
  </div>
  <div id="privacy" class="tab-pane">
    <label><input type="checkbox"> Allow analytics</label>
    <label><input type="checkbox"> Share progress with friends</label>
  </div>
  <div id="notifs" class="tab-pane">
    <label><input type="checkbox" checked> Morning quote</label>
    <label><input type="checkbox" checked> Streak reminder</label>
  </div>
  <div id="data" class="tab-pane">
    <p>Download everything we store about you.</p>
    <button class="btn btn-secondary" onclick="window.app.exportUserData()">Export JSON</button>
  </div>`;

export const aboutModalContent    = () => `<p>Digital Curiosity v 1.0<br>Built with ❤️ by Aanandoham.<br>Licences: MIT (code), CC-BY (images).</p>`;

export const contactModalContent  = () => `
  <form onsubmit="window.app.sendContact(event)">
    <input class="form-input" name="subject" placeholder="Subject" required>
    <textarea class="form-input" name="body" rows="4" placeholder="Your message" required></textarea>
    <button class="btn btn-primary">Send</button>
  </form>`;

export const billingModalContent  = (app) => `
  <div class="plans-grid">
    ${app.plans.map(p => `
      <div class="plan-card ${p.id}">
        <div class="plan-price">${p.price}</div>
        <h4>${p.name}</h4>
        <ul>${p.features.map(f => `<li>${f}</li>`).join('')}</ul>
        ${app.state.currentUser.plan === p.id
          ? '<span class="badge badge-success">Current</span>'
          : `<button class="btn btn-primary" onclick="window.app.selectPlan('${p.id}')">Choose</button>`}
      </div>`).join('')}
  </div>`;

export function selectPlan(app, planId) {
  showToast(`Plan "${planId}" selected – payment integration needed`, 'info');
}

export function switchSettingTab(ev, tab) {
  ev.target.parentElement.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  ev.target.classList.add('active');
  ev.target.closest('.modal-card').querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(tab).classList.add('active');
}
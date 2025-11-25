/*
 * Self-Analysis Pro  –  production-ready app.js
 * OFF-LINE-FIRST :  no start-up ping, no mandatory server calls.
 * Server contacted ONLY when user explicitly requests:
 *   – full natal chart (TOB + location)  –or–
 *   – PDF download (template fetch)
 */
/*  add at the very top – after that leave the file exactly as it is  */
export function bootSelfAnalysis(hostElement) {
  // patch globals so the mini-app thinks it owns the tab
  const originalBody = document.body;
  document.body = hostElement;            // redirect all queries
  window.selfAnalysisHost = hostElement;  // optional safety ref

  // run original init
  if (window.initApp) window.initApp();   // your old entry point
}
import Utils from './utils.js';
import DataMeanings from './meanings.js';
import { UIManager } from './ui.js';
import { AstrologyEngine } from './astrology.js';
import { renderNatalChartBlock } from './ui.natal.js';
import NumerologyEngine from './numerology.js';
import { buildNarrative, getNumerologySummary, getAstrologySummary, getTreeSummary } from './narrativeEngine.js';

// ----------  lazy loaders  ----------
const loadPDFAssembler = () => import('./PDFAssembler.js').then(m => m.default);
const loadTarotEngine   = () => import('./TarotEngine.js').then(m => m.default);

class SelfAnalysisApp {
  constructor() {
    this.appState = { formData: {}, analysis: {} };
    this.astrologyEngine = new AstrologyEngine();
    this.numerologyEngine = new NumerologyEngine();
    this.tarotEngine = null;   // lazy
    this.ui = new UIManager();
    this.init();
    this.loadSavedProgress();
  }

  init() {
    const form = document.getElementById('analysis-form');
    if (form) {
      form.addEventListener('submit', e => { e.preventDefault(); this.handleAnalyze(); });
      form.addEventListener('input', Utils.debounce(() => this.saveProgress(), 1000));
    }
    document.getElementById('btn-clear')?.addEventListener('click', () => this.clearAll());
    document.getElementById('btn-pdf')?.addEventListener('click', () => this.downloadPDF());
    // OFF-LINE-FIRST:  no health ping on load
    // this.checkAPIHealth();
  }

  /* ----------  form data  ---------- */
  collectFormData() {
    const f = document.getElementById('analysis-form');
    if (!f) return;
    const loc = document.getElementById('location-birth');
    this.appState.formData = {
      firstName: Utils.sanitizeInput(f.firstName?.value || ''),
      middleName: Utils.sanitizeInput(f.middleName?.value || ''),
      lastName: Utils.sanitizeInput(f.lastName?.value || ''),
      dateOfBirth: f.dateOfBirth?.value || '',
      timeOfBirth: f.timeOfBirth?.value || '',
      locationOfBirth: Utils.sanitizeInput(loc?.value || ''),
      locationLat: loc?.dataset.lat || '',
      locationLon: loc?.dataset.lon || '',
      includeY: f.includeY?.checked || false,
      tzone: null
    };
  }

  saveProgress() {
    try {
      const f = document.getElementById('analysis-form');
      if (!f) return;
      const loc = document.getElementById('location-birth');
      const dump = {
        firstName: f.firstName.value, middleName: f.middleName.value, lastName: f.lastName.value,
        dateOfBirth: f.dateOfBirth.value, timeOfBirth: f.timeOfBirth.value,
        locationOfBirth: loc.value, locationLat: loc.dataset.lat || '', locationLon: loc.dataset.lon || '',
        includeY: f.includeY.checked, timestamp: Date.now()
      };
      localStorage.setItem('selfAnalysisProgress', JSON.stringify(dump));
    } catch {}
  }

  loadSavedProgress() {
    try {
      const raw = localStorage.getItem('selfAnalysisProgress');
      if (!raw) return;
      const data = JSON.parse(raw);
      if ((Date.now() - data.timestamp) / 1000 / 60 > 60) { localStorage.removeItem('selfAnalysisProgress'); return; }
      const f = document.getElementById('analysis-form');
      if (!f) return;
      Object.keys(data).forEach(k => { if (f[k]) f[k].value = data[k] || ''; });
      const loc = document.getElementById('location-birth');
      if (loc && data.locationOfBirth) {
        loc.value = data.locationOfBirth;
        if (data.locationLat) loc.dataset.lat = data.locationLat;
        if (data.locationLon) loc.dataset.lon = data.locationLon;
      }
      if (data.includeY) f.includeY.checked = true;
    } catch {}
  }

  /* ----------  main analyse flow  ---------- */
  async handleAnalyze() {
    const progressWrapper = document.getElementById('progress-wrapper');
    try {
      this.collectFormData();
      if (!this.appState.formData.firstName || !this.appState.formData.lastName || !this.appState.formData.dateOfBirth) {
        throw Object.assign(new Error('Required fields missing'),
          { userTitle: 'Required Fields Missing', userMsg: 'Please fill in First Name, Last Name and Date of Birth.' });
      }
      progressWrapper.style.display = 'block';
      this.updateProgress(0, 'Starting analysis…');
      console.log('Running analysis…');

      /* 1. numerology (always local) */
      const numPromise = Promise.resolve(this.numerologyEngine.analyze(this.appState.formData));
      /* 2. timezone – only if coordinates supplied AND server reachable */
      let tzPromise = Promise.resolve(null);
      const { locationLat: lat, locationLon: lon, dateOfBirth: dob } = this.appState.formData;
      if (lat && lon && dob) tzPromise = this.fetchTimezoneWithRetry(lat, lon, dob);
      const [numerology, tzone] = await Promise.all([numPromise, tzPromise]);
      this.appState.formData.tzone = tzone;
      this.updateProgress(40, 'Processing numerology…');
      console.log('Numerology results:', numerology);

      /* 3. astrology – optional, degrades gracefully */
      this.updateProgress(50, 'Calculating astrology…');
      let astrology = null;
      if (this.appState.formData.dateOfBirth) {
        try {
          astrology = await this.analyzeAstrologyWithRetry(this.appState.formData);
        } catch (astroErr) {
          console.warn('Astrology API failed – using basic zodiac', astroErr.message);
          const [y, m, d] = this.appState.formData.dateOfBirth.split('-').map(Number);
          const zodiac = this.astrologyEngine.getZodiacSign(m, d);
          const sefira = this.astrologyEngine.getSefiraFromPlanet(zodiac.planet);
          astrology = { zodiac, sefira, planets: null, houses: null, aspects: null, natalChart: null };
          this.handleError(astroErr, 'Limited Astrology Data', 'Full natal-chart service is temporarily unavailable. We’ve calculated your zodiac sign, ruling planet(s) and Tree of Life connection.');
        }
      }

// ----------  4. tarot (lazy)  ----------
this.updateProgress(70, 'Loading tarot engine…');
if (!this.tarotEngine) {
  const TarotEngineModule = await loadTarotEngine();
  this.tarotEngine = new TarotEngineModule();
}
this.updateProgress(75, 'Generating tarot correspondences…');
      const tarot = {
        lifePath: numerology.lifePath ? this.tarotEngine.getCardsForNumber(numerology.lifePath.value) : [],
        expression: numerology.expression ? this.tarotEngine.getCardsForNumber(numerology.expression.value) : [],
        soulUrge: numerology.soulUrge ? this.tarotEngine.getCardsForNumber(numerology.soulUrge.value) : []
      };
      if (astrology?.planets) {
        const sun = astrology.planets.output?.find(p => p.name === 'Sun');
        if (sun?.sign) tarot.sunSign = this.tarotEngine.getCardsForZodiac(sun.sign);
      }

      this.appState.analysis = { numerology, astrology, tarot };
      if (astrology?.planets) renderNatalChartBlock(astrology);

      this.updateProgress(95, 'Finalising display…');
      this.renderSummaries();
      document.getElementById('btn-pdf') && (document.getElementById('btn-pdf').disabled = false);
      this.updateProgress(100, 'Complete!');
      window.dispatchEvent(new Event('analysisComplete'));
      setTimeout(() => progressWrapper.style.display = 'none', 500);
      localStorage.removeItem('selfAnalysisProgress');
      window.app.__analysisJustFinished = true;
      setTimeout(() => window.app.__analysisJustFinished = false, 1000);
    } catch (err) {
      this.handleError(err, err.userTitle || 'Analysis Error', err.userMsg || 'An unexpected error occurred during analysis.');
      progressWrapper.style.display = 'none';
    }
  }

  /* ----------  retry helpers  ---------- */
  async fetchTimezoneWithRetry(lat, lon, dateStr, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch('/api/astro-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: 'timezone', params: { lat, lon, dateOfBirth: dateStr } }),
          signal: AbortSignal.timeout(8000)
        });
        if (!res.ok) throw new Error('tz err');
        return (await res.json()).tzone || 0;
      } catch (e) {
        if (i === retries - 1) { console.warn('All tz attempts failed – default 0'); return 0; }
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
    return 0;
  }

  async analyzeAstrologyWithRetry(formData, retries = 2) {
    for (let i = 0; i < retries; i++) {
      try { return await this.astrologyEngine.analyze(formData); }
      catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, 2000 * (i + 1)));
      }
    }
  }

  updateProgress(percent, msg = '') {
    const inner = document.getElementById('progress-inner');
    const text  = document.getElementById('progress-text');
    if (inner) { inner.style.width = `${percent}%`; inner.textContent = `${percent}%`; }
    if (text && msg) text.textContent = msg;
  }

  renderSummaries() {
    const { numerology, astrology, tarot } = this.appState.analysis;
    const user = {
      firstName: numerology?.input?.firstName || 'Seeker',
      numerology: {
        lifePath: numerology?.lifePath?.value,
        destiny: numerology?.expression?.value,
        soulUrge: numerology?.soulUrge?.value,
        personality: numerology?.personality?.value
      },
      astrology: {
        sun: astrology?.zodiac?.name?.toLowerCase(),
        moon: astrology?.planets?.output?.find(p => p.name === 'Moon')?.sign?.toLowerCase(),
        rising: astrology?.houses?.output?.house_1?.sign?.toLowerCase()
      },
      tree: astrology?.sefira?.toLowerCase()?.split('(')[0]?.trim()
    };
    const numSum = getNumerologySummary(user.numerology);
    const astroSum = getAstrologySummary(user.astrology);
    const treeSum = getTreeSummary(user.tree);
    const story = buildNarrative(user);

    const fill = (id, html, placeholder = '') => {
      const el = document.getElementById(id);
      if (el) { el.classList.remove('placeholder-text'); el.innerHTML = html || placeholder; }
    };
    fill('summary-numerology-content', numSum.join('<br>'));
fill('summary-astrology-content',
  (astrology?.zodiac
    ? `<strong>Zodiac Sign:</strong> ${astrology.zodiac.name}<br>` +
      `<strong>Ruling Planet(s):</strong> ${astrology.zodiac.planet}<br>` +
      `<strong>Alchemical Element:</strong> ${astrology.zodiac.element}<br><br>`
    : '') +
  astroSum.join('<br>')
);
    fill('summary-tree-content', `${astrology?.sefira ? `<strong>Prominent Sefira:</strong> ${astrology.sefira}<br><br>` : ''}${treeSum || 'No Tree of Life data.'}`);
    fill('personal-narrative-content', story.replace(/\n/g, '\n'));

    this.ui.populateResults({ ...numerology, zodiac: astrology?.zodiac || null, sefira: astrology?.sefira || null }, null);
  }

  clearAll() {
    document.getElementById('analysis-form')?.reset();
    const loc = document.getElementById('location-birth');
    if (loc) { loc.value = ''; delete loc.dataset.lat; delete loc.dataset.lon; }
    this.appState = { formData: {}, analysis: {} };
    localStorage.removeItem('selfAnalysisProgress');
    document.querySelectorAll('.placeholder-text').forEach(el => el.classList.add('placeholder-text'));
    document.getElementById('btn-pdf') && (document.getElementById('btn-pdf').disabled = true);
    this.ui.clearResults();
    window.resetStepIndicator && window.resetStepIndicator();
    console.log('App reset to initial state');
  }

  handleError(err, title, userMsg) {
    console.error(title, err);
    const existing = document.querySelector('.error-modal');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.className = 'error-modal';
    overlay.innerHTML = `
      <div class="error-modal-content">
        <h3>${title}</h3>
        <p>${userMsg}</p>
        <button id="close-err" class="btn">Got it</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#close-err').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
  }

  async downloadPDF() {
    const popup = document.createElement('div');
    popup.id = 'pdf-loading-popup';
    popup.innerHTML = `
      <div style="display:flex;align-items:center;gap:15px;">
        <div class="pdf-spinner"></div>
        <div>
          <div style="font-size:18px;font-weight:700;color:var(--primary-color)">Generating PDF…</div>
          <div style="font-size:16px;color:#666">Your Personal Analysis PDF is being generated now</div>
        </div>
      </div>`;
    document.body.appendChild(popup);
    if (!document.getElementById('pdf-spinner-style')) {
      const s = document.createElement('style');
      s.id = 'pdf-spinner-style';
      s.textContent = '@keyframes pdfSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}} .pdf-spinner{width:40px;height:40px;border:4px solid rgba(63,118,82,.2);border-top-color:var(--primary-color);border-radius:50%;animation:pdfSpin 1s linear infinite;}';
      document.head.appendChild(s);
    }
    try {
      const PDFAssembler = await loadPDFAssembler();
      const firstName = this.appState.formData?.firstName || 'User';
      const pdf = new PDFAssembler({
        sourcePdfUrl: 'https://raw.githubusercontent.com/lironkerem/self-analysis-pro/main/assets/Source_PDF/Self%20Analysis%20Pro%20Guidebook.pdf',
        options: { autoDownload: true, downloadFilename: `${firstName}_Self-Analysis_Project-Curiosity.pdf` }
      });
      await pdf.assemble(this.appState);
      setTimeout(() => popup.remove(), 500);
    } catch (e) {
      popup.remove();
      this.handleError(e, 'PDF Download Failed', 'We’re unable to generate your guidebook right now. Please try again or contact us.');
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new SelfAnalysisApp();
});
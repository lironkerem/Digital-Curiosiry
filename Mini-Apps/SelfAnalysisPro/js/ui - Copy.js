// UI Management - FIXED: Expandable cards now work properly
// Key fix: Re-initialize expandables AFTER content is rendered

import DataMeanings from './meanings.js';
import TarotEngine from './TarotEngine.js';

class UIManager {
  constructor() {
    this.tarot = new TarotEngine();
    this.onAnalyze = null;
    this.onPdf = null;
    this.onClear = null;
    this.progressMgr = null;
    this.toast = null;
    this._debouncedValidate = null;
  }

  /* ----------------- Initialization & Wiring ----------------- */
  init() {
    // Create helpers
    if (typeof window.ProgressManager === 'function') {
      try { this.progressMgr = new window.ProgressManager(); } catch (e) { console.warn('ProgressManager init failed', e); }
    }
    if (typeof window.ToastManager === 'function') {
      try { this.toast = new window.ToastManager(); } catch (e) { console.warn('ToastManager init failed', e); }
    }

    // Form and controls
    this.form = document.getElementById('analysis-form');
    this.btnAnalyze = document.getElementById('btn-analyze');
    this.btnPdf = document.getElementById('btn-pdf');
    this.btnClear = document.getElementById('btn-clear');

    // Debounced validation
    this._debouncedValidate = window.Utils?.debounce ? window.Utils.debounce((...a) => this.validateAll(...a), 220) : ((fn) => fn);

    if (this.form) {
      // Enable/disable analyze on input
      this.form.addEventListener('input', () => {
        try { this._debouncedValidate(); } catch (e) { this.validateAll(); }
      });

      // Handle submit
      this.form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        if (!this.validateAll()) {
          this.showToast && this.showToast('Please fix the highlighted fields', 'error');
          return;
        }
        const formData = this.getFormData();
        if (typeof this.onAnalyze === 'function') {
          this.showProgress?.(5, 'Starting…');
          this.onAnalyze(formData);
        }
      });
    }

    if (this.btnPdf) {
      this.btnPdf.disabled = true;
      this.btnPdf.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof this.onPdf === 'function') this.onPdf();
      });
    }

    if (this.btnClear) {
      this.btnClear.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.form) this.form.reset();
        this.clearResults();
        if (typeof this.onClear === 'function') this.onClear();
        this.validateAll();
      });
    }

    // ✅ FIX: Initialize expandables that exist on page load
    this.initializeExpandableCards();
    
    this.validateAll();
  }

  /* ✅ FIX: Better expandable initialization with proper event delegation */
  initializeExpandableCards() {
    // Wait for DOM to be ready
    setTimeout(() => {
      const cards = document.querySelectorAll('.expandable-card');
      
      console.log(`🔧 Initializing ${cards.length} expandable cards`);
      
      cards.forEach(card => {
        const header = card.querySelector('.expandable-header');
        const content = card.querySelector('.expandable-content');
        
        if (!header || !content) return;

        // Remove old listeners by cloning
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);

        // Check initial state
        const isExpanded = card.classList.contains('expanded');
        content.style.display = isExpanded ? 'block' : 'none';
        
        // Set initial aria state
        card.setAttribute('aria-expanded', isExpanded.toString());

        // Story watermark special handling
        if (card.hasAttribute('data-section') && card.getAttribute('data-section') === 'personal-narrative') {
          const parentCard = card.closest('.story-watermark');
          if (parentCard && isExpanded) {
            parentCard.classList.add('story-expanded');
          }
        }

        // Toggle function
        const toggle = () => {
          const expanded = card.classList.contains('expanded');
          card.classList.toggle('expanded');
          content.style.display = expanded ? 'none' : 'block';
          card.setAttribute('aria-expanded', (!expanded).toString());

          // Handle story watermark
          if (card.hasAttribute('data-section') && card.getAttribute('data-section') === 'personal-narrative') {
            const parentCard = card.closest('.story-watermark');
            if (parentCard) {
              if (!expanded) parentCard.classList.add('story-expanded');
              else parentCard.classList.remove('story-expanded');
            }
          }
          
          console.log(`🔄 Toggled card: ${card.getAttribute('data-section')} - ${!expanded ? 'OPEN' : 'CLOSED'}`);
        };

        // Attach listeners
        newHeader.addEventListener('click', toggle);
        newHeader.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        });
      });
      
      console.log('✅ Expandable cards initialized');
    }, 100);
  }
/* -------------- Form Validation & Data -------------- */
  validateAll() {
    if (!this.form) return false;
    let ok = true;

    const first = document.getElementById('first-name');
    const middle = document.getElementById('middle-name');
    const last = document.getElementById('last-name');
    const dob = document.getElementById('date-of-birth');
    const tob = document.getElementById('time-of-birth');
    const loc = document.getElementById('location-birth');

    const fErr = document.getElementById('first-error');
    const mErr = document.getElementById('middle-error');
    const lErr = document.getElementById('last-error');
    const dErr = document.getElementById('dob-error');
    const tErr = document.getElementById('tob-error');
    const locErr = document.getElementById('location-error');

    let res = window.Validation?.validateName(first?.value);
    if (!res || !res.valid) { ok = false; if (fErr) fErr.textContent = res?.message || 'Required'; } else if (fErr) fErr.textContent = '';

    res = window.Validation?.validateName(middle?.value);
    if (!res || !res.valid) { if (mErr) mErr.textContent = res?.message || ''; } else if (mErr) mErr.textContent = '';

    res = window.Validation?.validateName(last?.value);
    if (!res || !res.valid) { ok = false; if (lErr) lErr.textContent = res?.message || 'Required'; } else if (lErr) lErr.textContent = '';

    res = window.Validation?.validateDateOfBirth(dob?.value);
    if (!res || !res.valid) { ok = false; if (dErr) dErr.textContent = res?.message || 'Required'; } else if (dErr) dErr.textContent = '';

    res = window.Validation?.validateTimeOfBirth(tob?.value);
    if (!res || !res.valid) { if (tErr) tErr.textContent = res?.message || ''; } else if (tErr) tErr.textContent = '';

    res = window.Validation?.validateLocation(loc?.value);
    if (!res || !res.valid) { if (locErr) locErr.textContent = res?.message || ''; } else if (locErr) locErr.textContent = '';

    if (this.btnAnalyze) this.btnAnalyze.disabled = !ok;
    return ok;
  }

  getFormData() {
    if (!this.form) return {};
    const formEl = this.form;
    const fd = {
      firstName: window.Utils?.sanitizeInput(formEl.elements['firstName']?.value || ''),
      middleName: window.Utils?.sanitizeInput(formEl.elements['middleName']?.value || ''),
      lastName: window.Utils?.sanitizeInput(formEl.elements['lastName']?.value || ''),
      dateOfBirth: formEl.elements['dateOfBirth']?.value || '',
      timeOfBirth: formEl.elements['timeOfBirth']?.value || '',
      locationOfBirth: window.Utils?.sanitizeInput(formEl.elements['locationOfBirth']?.value || ''),
      includeY: formEl.elements['includeY']?.checked || false
    };
    fd.first = fd.firstName;
    fd.last = fd.lastName;
    fd.fullName = `${fd.firstName} ${fd.middleName ? fd.middleName + ' ' : ''}${fd.lastName}`.trim();
    return fd;
  }

  /* ------------------ Progress & Toast ------------------ */
  showProgress(percentage, message = '') {
    if (!this.progressMgr) {
      if (typeof window.ProgressManager === 'function') {
        try { this.progressMgr = new window.ProgressManager(); } catch (e) { console.warn('ProgressManager create failed', e); }
      }
    }
    if (this.progressMgr) {
      this.progressMgr.setProgress(percentage, message);
      if (percentage < 100) this.progressMgr.wrapper.style.display = 'block';
      else setTimeout(() => this.progressMgr.hide(), 400);
    } else {
      const text = document.getElementById('progress-text');
      if (text) text.textContent = message || '';
    }
  }

  enablePdf(enable = true) {
    if (this.btnPdf) this.btnPdf.disabled = !enable;
  }

  showToast(message, type = 'success') {
    if (this.toast && typeof this.toast.show === 'function') return this.toast.show(message, type);
    console.log(`[toast:${type}] ${message}`);
  }

  /* ----------------- Rendering & Results ----------------- */
  populateResults(results, narrativeResults) {
    this.updateQuickSummary(results, narrativeResults);
    this.updateDeepAnalysis(results);
    this.generateNumerologyCards(results);

    if (narrativeResults && narrativeResults.fullNarrative) {
      const narrativeContent = document.getElementById('personal-narrative-content');
      if (narrativeContent) {
        narrativeContent.classList.remove('placeholder-text');
        narrativeContent.textContent = narrativeResults.fullNarrative;
      }
    }
    
    // ✅ FIX: Re-initialize expandables after content is added
    this.initializeExpandableCards();
  }

  displayResults(payload) {
    if (!payload) return;
    const results = payload.num ? Object.assign({}, payload.num, payload.astro, payload.tree, { sefira: payload.tree?.sephiroth?.[0] }) : payload;
    const narrativeResults = payload.narrative || payload;
    this.populateResults(results, narrativeResults);
    this.showProgress(100, 'Complete');
    this.enablePdf(true);
  }

  _renderTarotSection(cards, title = "Tarot Correspondences") {
    if (!cards || cards.length === 0) return '';
    const cardsHTML = this.tarot.renderCards(cards);
    return `
      <div class="tarot-section-wrapper">
        <h3 class="tarot-section-title">${title}</h3>
        ${cardsHTML}
      </div>
    `;
  }
updateQuickSummary(results, narrativeResults) {
    if (narrativeResults) {
      const numContent = document.getElementById('summary-numerology-content');
      if (numContent && narrativeResults.numerologySummary && narrativeResults.numerologySummary.length) {
        numContent.classList.remove('placeholder-text');
        numContent.innerHTML = narrativeResults.numerologySummary.join('<br><br>');
      }

      const astroContent = document.getElementById('summary-astrology-content');
      if (astroContent) {
        astroContent.classList.remove('placeholder-text');
        let astroHTML = '';
        if (results.zodiac) {
          astroHTML += `Zodiac Sign: <strong>${results.zodiac.name || '—'}</strong><br>`;
          astroHTML += `Ruling Planet(s): <strong>${results.zodiac.planet || '—'}</strong><br>`;
          astroHTML += `Alchemical Element: <strong>${results.zodiac.element || '—'}</strong><br><br>`;
        }
        if (narrativeResults.astrologySummary && narrativeResults.astrologySummary.length) {
          astroHTML += narrativeResults.astrologySummary.join('<br><br>');
        }
        astroContent.innerHTML = astroHTML;
      }

      const treeContent = document.getElementById('summary-tree-content');
      if (treeContent) {
        treeContent.classList.remove('placeholder-text');
        let treeHTML = '';
        if (results.sefira) {
          treeHTML += `Prominent Sefira: <strong>${results.sefira}</strong><br><br>`;
        }
        if (narrativeResults.treeSummary) {
          treeHTML += narrativeResults.treeSummary;
        } else {
          treeHTML += 'No Tree of Life summary available.';
        }
        treeContent.innerHTML = treeHTML;
      }
    }
  }

  updateDeepAnalysis(results) {
    // ✅ FIX: Hide astrology placeholder
    const astroPlaceholder = document.getElementById('astrology-content-placeholder');
    if (astroPlaceholder) astroPlaceholder.style.display = 'none';

    // ✅ FIX: Show astrology subcards (remove .hidden class)
    ['zodiac-sign', 'ruling-planet', 'alchemical-element', 'natal-chart'].forEach(section => {
      const card = document.querySelector(`.expandable-card[data-section="${section}"]`);
      if (card) {
        card.classList.remove('hidden');
        card.style.display = 'block';
      }
    });

    // ✅ FIX: Show tree data (remove .hidden class)
    const treePlaceholder = document.getElementById('tree-content-placeholder');
    const treeData = document.getElementById('tree-content-data');
    if (treePlaceholder) {
      treePlaceholder.classList.add('hidden');
      treePlaceholder.style.display = 'none';
    }
    if (treeData) {
      treeData.classList.remove('hidden');
      treeData.style.display = 'block';
    }

    const deepElements = {
      'deep-zodiac': results.zodiac?.name || '—',
      'deep-planet': results.zodiac?.planet || '—',
      'deep-element': results.zodiac?.element || '—',
      'deep-sefira': results.sefira || '—'
    };

    Object.entries(deepElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    // Zodiac Sign
    if (results.zodiac?.name) {
      const headerEl = document.getElementById('zodiac-meaning-header');
      const meaningEl = document.getElementById('zodiac-meaning');
      if (headerEl) headerEl.textContent = `The meaning of ${results.zodiac.name}`;
      if (meaningEl) {
        meaningEl.innerHTML = DataMeanings.getZodiacMeaning(results.zodiac.name);
        const zodiacCards = this.tarot.getCardsForZodiac(results.zodiac.name);
        const tarotHTML = this._renderTarotSection(zodiacCards, 'Tarot Correspondences');
        meaningEl.insertAdjacentHTML('afterend', tarotHTML);
      }
    }

    // Handle dual planets
    if (results.zodiac?.planet) {
      const headerEl = document.getElementById('planet-meaning-header');
      const meaningEl = document.getElementById('planet-meaning');
      const planets = results.zodiac.planet.split(',').map(p => p.trim());

      if (headerEl) {
        headerEl.textContent = planets.length > 1
          ? `The meanings of ${planets.join(' and ')}`
          : `The meaning of ${planets[0]}`;
      }

      if (meaningEl) {
        let html = '';
        planets.forEach((planet, index) => {
          if (index > 0) html += '<hr style="margin: 20px 0; border: 1px solid #ddd;">';
          html += `<h4 style="color: #3F7652; margin-top: ${index > 0 ? '20px' : '0'};">${planet}</h4>`;
          html += DataMeanings.getPlanetMeaning(planet);
        });
        meaningEl.innerHTML = html;

        let allPlanetCards = [];
        planets.forEach(planet => {
          const planetCards = this.tarot.getCardsForPlanet(planet);
          allPlanetCards = allPlanetCards.concat(planetCards);
        });

        if (allPlanetCards.length > 0) {
          const tarotHTML = this._renderTarotSection(allPlanetCards, planets.length > 1 ? 'Tarot Correspondences' : 'Tarot Correspondence');
          meaningEl.insertAdjacentHTML('afterend', tarotHTML);
        }
      }
    }

    // Element
    if (results.zodiac?.element) {
      const headerEl = document.getElementById('element-meaning-header');
      const meaningEl = document.getElementById('element-meaning');
      if (headerEl) headerEl.textContent = `The meaning of ${results.zodiac.element}`;
      if (meaningEl) {
        meaningEl.innerHTML = DataMeanings.getElementMeaning(results.zodiac.element);
        const elementCards = this.tarot.getCardsForElement(results.zodiac.element);
        const tarotHTML = this._renderTarotSection(elementCards, 'Tarot Suit Correspondence');
        meaningEl.insertAdjacentHTML('afterend', tarotHTML);
      }
    }

    // Sefira (Tree of Life)
    if (results.sefira) {
      const headerEl = document.getElementById('sefira-meaning-header');
      const meaningEl = document.getElementById('sefira-meaning');
      if (headerEl) headerEl.textContent = `The meaning of ${results.sefira}`;
      if (meaningEl) {
        meaningEl.innerHTML = DataMeanings.getSefiraMeaning(results.sefira);
        const sefiraName = results.sefira.split('(')[0].trim();
        const sefiraCards = this.tarot.getCardsForSefira(sefiraName, null);
        const tarotHTML = this._renderTarotSection(sefiraCards, 'Tarot Correspondences');
        meaningEl.insertAdjacentHTML('afterend', tarotHTML);
      }
    }

    this.initializeTarotClickHandlers();
  }
generateNumerologyCards(results) {
    const container = document.getElementById('numerology-cards-container');
    if (!container) return;

    const cardConfigs = [
      { key: 'firstName', title: 'Life Lessons (First Name)', subtitle: '', explanation: 'Life Lessons are derived from the consonants in your full birth name. They represent the recurring challenges and opportunities for growth that your soul specifically chose for this lifetime.' },
      { key: 'lastName', title: 'Spiritual Support (Last Name)', subtitle: '', explanation: 'Derived from the vowels in your full name, Spiritual Support reflects the inner guidance, resources, and strengths your soul possesses.' },
      { key: 'lifePath', title: 'Life Path (Date of Birth)', subtitle: '', explanation: 'The Life Path Number, derived from your birth date, is considered the most fundamental number in the chart. It outlines your primary purpose, life direction, and key lessons.' },
      { key: 'expression', title: 'Destiny (Full Name)', subtitle: '', explanation: 'The Expression or Destiny Number is calculated from the full name and reveals your core abilities, talents, and life mission.' },
      { key: 'soulsDirection', title: 'Soul\'s Direction (Full Name + Date of Birth)', subtitle: '', explanation: 'Soul\'s Direction highlights the ultimate trajectory of your soul. It represents the integration of lessons learned, natural talents, and spiritual inclinations.' },
      { key: 'personality', title: 'Personality (Outer)', subtitle: '', explanation: 'Derived from the consonants in your name, the Personality Number reveals how others perceive you and the traits you project.' },
      { key: 'soulUrge', title: 'Soul\'s Urge (Desire)', subtitle: '', explanation: 'Calculated from the vowels in your name, the Soul\'s Urge reflects your inner motivations, drives, and what truly fulfills you.' },
      { key: 'maturity', title: 'Maturity Number', subtitle: '', explanation: 'The Maturity Number represents the full potential of your life journey. It indicates the qualities, talents, and wisdom you are likely to fully develop later in life.' },
      { key: 'balance', title: 'Balance Number', subtitle: '', explanation: 'Derived from the initials of your full name, the Balance Number provides insight into how you respond to stress, challenges, or uncertainty.' },
      { key: 'birthday', title: 'Birthday', subtitle: '', explanation: 'The Birthday Number comes from the day of the month you were born and represents a specific talent, skill, or attribute you bring to life.' }
    ];

    container.innerHTML = cardConfigs.map(config => {
      const data = results[config.key];
      if (!data) return '';

      const tarotCards = this.tarot.getCardsForNumber(data.value);
      const tarotHTML = tarotCards.length > 0 ? this._renderTarotSection(tarotCards, 'Tarot Correspondences') : '';

      const titleHTML = config.subtitle
        ? `${config.title} <span style="font-size: 25px;">${config.subtitle}</span>`
        : config.title;

      return `<section class="expandable-card numerology-card" data-section="${config.key}">
        <div class="expandable-header" tabindex="0" role="button">
          <span class="chevron">›</span><span>${titleHTML}</span>
        </div>
        <div class="expandable-content">
          <div class="calculation-trace">${data.trace || '—'}</div>
          <div class="sum-line">Sum total of numbers = ${data.raw} / Reduced = ${data.value}</div>
          <div class="final-number">FINAL NUMBER = ${data.value}</div>
          <hr>
          <div class="explanation-heading">Explanation for ${config.title}:</div>
          <div class="explanation-text">${config.explanation}</div>
          <div class="explanation-heading">Meaning of the number ${data.value}:</div>
          <div class="explanation-text">${DataMeanings.getNumberMeaning(data.value)}</div>
          ${tarotHTML}
        </div>
      </section>`;
    }).join('');

    this.addSpecialNumerologyCards(container, results);
    
    // ✅ FIX: Re-initialize after adding numerology cards
    this.initializeExpandableCards();
    this.initializeTarotClickHandlers();
  }

  addSpecialNumerologyCards(container, results) {
    const karmicTrace = results.karmicDebt?.length ?
      results.karmicDebt.map(k => `${k.place}=${k.raw}`).join(' ; ') : 'None';
    const karmicMeaning = results.karmicDebt?.length ?
      "Karmic Debt Numbers indicate unresolved lessons or challenges carried from past lifetimes." :
      "No karmic debt numbers detected.";

    container.innerHTML += `<section class="expandable-card numerology-card" data-section="karmic">
      <div class="expandable-header" tabindex="0" role="button">
        <span class="chevron">›</span><span>Karmic Debt</span>
      </div>
      <div class="expandable-content">
        <div class="calculation-trace">${karmicTrace}</div>
        <div class="sum-line">Karmic Numbers: ${karmicTrace}</div>
        <div class="final-number">KARMIC ANALYSIS = ${results.karmicDebt?.length || 0} numbers found</div>
        <hr>
        <div class="explanation-heading">Explanation for Karmic Debt:</div>
        <div class="explanation-text">${karmicMeaning}</div>
      </div>
    </section>`;

    if (results.pinnacles) {
      const p = results.pinnacles;
      const pinnacleTrace = `P1=${p.p1.value}(${p.p1.raw}), P2=${p.p2.value}(${p.p2.raw}), P3=${p.p3.value}(${p.p3.raw}), P4=${p.p4.value}(${p.p4.raw})`;

      let pinnaclesTarot = '';
      [p.p1.value, p.p2.value, p.p3.value, p.p4.value].forEach((val, idx) => {
        const cards = this.tarot.getCardsForNumber(val);
        if (cards.length > 0) {
          pinnaclesTarot += `<div class="tarot-card-spacing"><strong class="tarot-subsection-title">Pinnacle ${idx + 1} (${val}) Tarot:</strong></div>`;
          pinnaclesTarot += this.tarot.renderCards(cards);
        }
      });

      container.innerHTML += `<section class="expandable-card numerology-card" data-section="pinnacles">
        <div class="expandable-header" tabindex="0" role="button">
          <span class="chevron">›</span><span>4 Cycles of Pinnacles</span>
        </div>
        <div class="expandable-content">
          <div class="calculation-trace">${pinnacleTrace}</div>
          <div class="sum-line">Four Major Life Phases</div>
          <div class="final-number">PINNACLES = ${p.p1.value}, ${p.p2.value}, ${p.p3.value}, ${p.p4.value}</div>
          <hr>
          <div class="explanation-heading">Explanation for 4 Pinnacle Cycles:</div>
          <div class="explanation-text">The Pinnacle Cycles are four major phases in life, derived from the birth date, that outline opportunities, challenges, and growth patterns in each stage.</div>
          ${pinnaclesTarot}
        </div>
      </section>`;
    }

    if (results.challenges) {
      const c = results.challenges;
      const challengeTrace = `C1=${c.ch1.value}(${c.ch1.raw}), C2=${c.ch2.value}(${c.ch2.raw}), C3=${c.ch3.value}(${c.ch3.raw}), C4=${c.ch4.value}(${c.ch4.raw})`;

      let challengesTarot = '';
      [c.ch1.value, c.ch2.value, c.ch3.value, c.ch4.value].forEach((val, idx) => {
        const cards = this.tarot.getCardsForNumber(val);
        if (cards.length > 0) {
          challengesTarot += `<div class="tarot-card-spacing"><strong class="tarot-subsection-title">Challenge ${idx + 1} (${val}) Tarot:</strong></div>`;
          challengesTarot += this.tarot.renderCards(cards);
        }
      });

      container.innerHTML += `<section class="expandable-card numerology-card" data-section="challenges">
        <div class="expandable-header" tabindex="0" role="button">
          <span class="chevron">›</span><span>Challenge Numbers</span>
        </div>
        <div class="expandable-content">
          <div class="calculation-trace">${challengeTrace}</div>
          <div class="sum-line">Four Life Challenge Areas</div>
          <div class="final-number">CHALLENGES = ${c.ch1.value}, ${c.ch2.value}, ${c.ch3.value}, ${c.ch4.value}</div>
          <hr>
          <div class="explanation-heading">Explanation for Challenge Numbers:</div>
          <div class="explanation-text">Challenge Numbers indicate obstacles, recurring difficulties, or tests of character that require conscious effort and resilience.</div>
          ${challengesTarot}
        </div>
      </section>`;
    }
  }
initializeTarotClickHandlers() {
    setTimeout(() => {
      document.querySelectorAll('.tarot-card').forEach(card => {
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);

        newCard.addEventListener('click', () => {
          const cardNumber = newCard.getAttribute('data-card-number');
          const cardType = newCard.getAttribute('data-card-type');
          const cardSuit = newCard.getAttribute('data-card-suit');
          this.showTarotModal(cardType, cardSuit, cardNumber);
        });
      });
    }, 100);
  }

  showTarotModal(cardType, cardSuit, cardNumber) {
    let meaning = '';
    let cardName = '';

    if (cardType === 'major') {
      meaning = DataMeanings.getTarotMeaning('major', Number(cardNumber));
      cardName = this.tarot.getMajorArcanaName(Number(cardNumber));
    } else {
      meaning = DataMeanings.getTarotMeaning(cardSuit, Number(cardNumber));
      if (cardType === 'court') {
        const courtNames = { 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King' };
        cardName = `${courtNames[cardNumber]} of ${cardSuit.charAt(0).toUpperCase() + cardSuit.slice(1)}`;
      } else {
        cardName = `${cardNumber} of ${cardSuit.charAt(0).toUpperCase() + cardSuit.slice(1)}`;
      }
    }

    let modal = document.getElementById('tarot-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tarot-modal';
      modal.className = 'tarot-modal';
      modal.innerHTML = `
        <div class="tarot-modal-content">
          <span class="tarot-modal-close">&times;</span>
          <h3 class="tarot-modal-title"></h3>
          <div class="tarot-modal-body"></div>
        </div>
      `;
      document.body.appendChild(modal);

      modal.querySelector('.tarot-modal-close').addEventListener('click', () => {
        modal.classList.remove('show');
      });
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
      });
    }

    modal.querySelector('.tarot-modal-title').textContent = cardName;
    modal.querySelector('.tarot-modal-body').textContent = meaning;
    modal.classList.add('show');
  }

  clearResults() {
    const summaryCards = ['summary-numerology-content', 'summary-astrology-content', 'summary-tree-content'];
    summaryCards.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        element.classList.add('placeholder-text');
        element.textContent = 'Run analysis to see your summary.';
      }
    });

    const narrativeContent = document.getElementById('personal-narrative-content');
    if (narrativeContent) {
      narrativeContent.classList.add('placeholder-text');
      narrativeContent.textContent = 'Run analysis to see your personalized narrative.';
    }

    const deepElements = {
      'deep-zodiac': 'Run analysis to see your Zodiac Sign',
      'deep-planet': 'Run analysis to see your Ruling Planet',
      'deep-element': 'Run analysis to see your Alchemical Element',
      'deep-sefira': 'Run analysis to see your Prominent Sefira'
    };

    Object.entries(deepElements).forEach(([id, text]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = text;
        element.classList.add('placeholder-text');
      }
    });

    ['zodiac', 'planet', 'element', 'sefira'].forEach(type => {
      const headerEl = document.getElementById(`${type}-meaning-header`);
      const meaningEl = document.getElementById(`${type}-meaning`);
      if (headerEl) headerEl.textContent = '';
      if (meaningEl) meaningEl.innerHTML = '';
    });

    const container = document.getElementById('numerology-cards-container');
    if (container) {
      container.classList.add('placeholder-text');
      container.innerHTML = 'Run analysis to see your complete Numerology report.';
    }

    const natalOutput = document.getElementById('natal-chart-output');
    if (natalOutput) {
      natalOutput.classList.add('placeholder-text');
      natalOutput.textContent = 'Enter time of birth and location of birth to generate your complete natal chart.';
    }

    // Hide astrology subcards again
    ['zodiac-sign', 'ruling-planet', 'alchemical-element', 'natal-chart'].forEach(section => {
      const card = document.querySelector(`.expandable-card[data-section="${section}"]`);
      if (card) {
        card.classList.add('hidden');
        card.style.display = 'none';
      }
    });

    // Hide tree data again
    const treePlaceholder = document.getElementById('tree-content-placeholder');
    const treeData = document.getElementById('tree-content-data');
    if (treePlaceholder) {
      treePlaceholder.classList.remove('hidden');
      treePlaceholder.style.display = 'block';
    }
    if (treeData) {
      treeData.classList.add('hidden');
      treeData.style.display = 'none';
    }

    // Show astrology placeholder again
    const astroPlaceholder = document.getElementById('astrology-content-placeholder');
    if (astroPlaceholder) astroPlaceholder.style.display = 'block';

    // Disable PDF after clearing
    this.enablePdf(false);
  }
}

export { UIManager };
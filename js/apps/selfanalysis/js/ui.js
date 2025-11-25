// UI Management and Form Handling with Tarot Integration
// FIXED: Tarot spacing consistency across all sections

import DataMeanings from './meanings.js';
import TarotEngine from './TarotEngine.js';

class UIManager {
  constructor() {
    this.tarot = new TarotEngine();
    this.initializeExpandableCards();
  }
  
  initializeExpandableCards() { 
    setTimeout(() => {
      document.querySelectorAll('.expandable-card').forEach(card => { 
        const header = card.querySelector('.expandable-header'); 
        const content = card.querySelector('.expandable-content'); 
        if (!header || !content) return;
        
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
        
        const isExpanded = card.classList.contains('expanded'); 
        content.style.display = isExpanded ? 'block' : 'none'; 
        
        // FIXED: Initialize story watermark state on page load
        if (card.hasAttribute('data-section') && card.getAttribute('data-section') === 'personal-narrative') {
          const parentCard = card.closest('.story-watermark');
          if (parentCard && isExpanded) {
            parentCard.classList.add('story-expanded');
          }
        }
        
        const toggle = () => { 
          const expanded = card.classList.contains('expanded'); 
          card.classList.toggle('expanded'); 
          content.style.display = expanded ? 'none' : 'block'; 
          card.setAttribute('aria-expanded', (!expanded).toString());
          
          // Handle story watermark parent (JavaScript fallback)
          if (card.hasAttribute('data-section') && card.getAttribute('data-section') === 'personal-narrative') {
            const parentCard = card.closest('.story-watermark');
            if (parentCard) {
              if (!expanded) {
                parentCard.classList.add('story-expanded');
              } else {
                parentCard.classList.remove('story-expanded');
              }
            }
          }
        }; 
        
        newHeader.addEventListener('click', toggle); 
        newHeader.addEventListener('keydown', (e) => { 
          if (e.key === 'Enter' || e.key === ' ') { 
            e.preventDefault(); 
            toggle(); 
          } 
        }); 
      }); 
    }, 100);
  }
  
// FIXED: "Tarot Correspondences" heading changed to H3 size (35px)
_renderTarotSection(cards, title = "Tarot Correspondences") {
  if (!cards || cards.length === 0) return '';
  
  const cardsHTML = this.tarot.renderCards(cards);
  
  return `
    <div class="tarot-section-wrapper" style="margin-top: 20px;">
      <h3 style="margin: 0 0 12px 0; text-align: center; background: var(--primary-color); color: white; padding: 12px 20px; border-radius: 20px;">${title}</h3>
      ${cardsHTML}
    </div>
  `;
}
  
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
    const astroPlaceholder = document.getElementById('astrology-content-placeholder');
    if (astroPlaceholder) astroPlaceholder.style.display = 'none';
    
    ['zodiac-sign', 'ruling-planet', 'alchemical-element', 'natal-chart'].forEach(section => {
      const card = document.querySelector(`.expandable-card[data-section="${section}"]`);
      if (card) card.style.display = 'block';
    });
    
    const treePlaceholder = document.getElementById('tree-content-placeholder');
    const treeData = document.getElementById('tree-content-data');
    if (treePlaceholder) treePlaceholder.style.display = 'none';
    if (treeData) treeData.style.display = 'block';
    
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
    
    // FIXED: Insert Tarot as sibling (same structure as Numerology)
    
    // Zodiac Sign
    if (results.zodiac?.name) { 
      const headerEl = document.getElementById('zodiac-meaning-header'); 
      const meaningEl = document.getElementById('zodiac-meaning'); 
      if (headerEl) headerEl.textContent = `The meaning of ${results.zodiac.name}`; 
      if (meaningEl) {
        meaningEl.innerHTML = DataMeanings.getZodiacMeaning(results.zodiac.name);
        
        // Insert Tarot AFTER meaningEl as sibling
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
        
        // Insert Tarot AFTER meaningEl as sibling (for all planets combined)
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
        
        // Insert Tarot AFTER meaningEl as sibling
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
        
        // Insert Tarot AFTER meaningEl as sibling
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
          pinnaclesTarot += `<div style="margin-top: 15px;"><strong>Pinnacle ${idx + 1} (${val}) Tarot:</strong></div>`;
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
          challengesTarot += `<div style="margin-top: 15px;"><strong>Challenge ${idx + 1} (${val}) Tarot:</strong></div>`;
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
        element.style.color = 'red';
        element.style.fontStyle = 'italic';
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
  }
}
export { UIManager };
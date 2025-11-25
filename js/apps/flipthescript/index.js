// js/apps/flipthescript/index.js - Updated Version
let cssCache = null;

async function loadCSS() {
  if (cssCache) return cssCache;
  const res = await fetch(new URL('./styles.css', import.meta.url));
  cssCache = await res.text();
  return cssCache;
}

export default class FlipTheScriptApp {
  constructor(app) {
    this.app = app;
  }

  async render() {
    // 1. Inject full stylesheet once
    if (!document.querySelector('#flip-the-script-styles')) {
      const style = document.createElement('style');
      style.id = 'flip-the-script-styles';
      style.textContent = await loadCSS();
      document.head.appendChild(style);
    }

    // 2. Load Google Fonts for Amatic SC
    if (!document.querySelector('#flip-script-fonts')) {
      const fontLink = document.createElement('link');
      fontLink.id = 'flip-script-fonts';
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Amatic+SC:wght@400;700&display=swap';
      document.head.appendChild(fontLink);
    }

    // 3. Load affirmations data
    if (!window.affirmations) {
      try {
        const affModule = await import('./data.js');
        window.affirmations = affModule.default || affModule.affirmations;
        console.log('✅ Affirmations loaded');
      } catch (err) {
        console.error('Failed to load affirmations:', err);
      }
    }

    // 4. Load FlipEngine
    if (!window.FlipEngine) {
      try {
        await import('./engine.js');
        console.log('✅ FlipEngine loaded');
      } catch (err) {
        console.error('Failed to load FlipEngine:', err);
      }
    }

    // 5. Build the HTML shell
    const tab = document.getElementById('flip-script-tab');
    tab.innerHTML = `
      <div class="page fade-in">
        <div class="app-container centered">
          <header class="main-header project-curiosity">
            <h1>Flip The Script</h1>
          </header>

          <section class="card input-section" id="input-section">
            <div class="input-layout">
              <div class="input-main">
                <div class="textarea-wrapper">
                  <textarea id="negative-input" placeholder="Type or say your negative thought or belief here.." maxlength="500"></textarea>
                  <button id="voice-input-btn" class="voice-input-btn" title="Speak your thought">🎤</button>
                  <div class="char-counter"><span id="char-count">0</span>/500 characters</div>
                </div>
              </div>
              <div class="flip-suggestions">
                <p class="suggestion-label">💭 Try being more specific:</p>
                <div class="suggestion-buttons-grid">
                  <button class="suggestion-btn" data-text="I feel ">I feel...</button>
                  <button class="suggestion-btn" data-text="I can't ">I can't...</button>
                  <button class="suggestion-btn" data-text="I'm worried about ">I'm worried about...</button>
                  <button class="suggestion-btn" data-text="I hate ">I hate...</button>
                  <button class="suggestion-btn" data-text="I'm afraid that ">I'm afraid that...</button>
                  <button class="suggestion-btn" data-text="I always ">I always...</button>
                </div>
              </div>
            </div>

            <div class="btn-group-vertical">
              <button id="flip-btn" class="btn primary flip-main-btn">✨ Flip It Now✨</button>
              <button id="clear-btn" class="btn secondary clear-small-btn">Clear</button>
            </div>

            <div class="progress-wrapper hidden" id="progress-wrapper">
              <div class="progress-bar">
                <div class="progress-inner" id="progress-inner">0%</div>
              </div>
            </div>
          </section>

          <section id="output-section" class="output-main-event hidden">
            <div class="output-card">
              <div class="output-header">
                <h2>✨ Your Flipped Script</h2>
              </div>
              
              <div class="output-content">
                <p id="extended-flip" class="flipped-text">Your Flipped Script will appear here...</p>
              </div>

              <button id="flip-another-btn" class="btn flip-another-inside">🔄 Flip Another Thought</button>
              
              <div class="action-icons">
                <button id="save-extended" class="icon-btn" title="Save">💾</button>
                <button id="audio-extended" class="icon-btn" title="Listen">🔊</button>
              </div>
            </div>
          </section>

          <section id="saved-section" class="collapsible-card">
            <button class="collapse-toggle" aria-expanded="false">
              <span class="collapse-icon">▶</span>
              <h2>💾 Your Saved Flips</h2>
            </button>
            <div class="collapse-content collapsed">
              <div class="saved-controls">
                <input type="text" id="search-saved" class="search-input" placeholder="🔍 Search saved flips...">
              </div>

              <ul id="saved-list"></ul>

              <div class="backup-restore">
                <button id="backup-id" class="btn">📥 Backup</button>
                <button id="restore-id" class="btn">📤 Restore</button>
              </div>
            </div>
          </section>

        </div>
      </div>
    `;

    // 6. Mount behaviour
    import('./ui.js').then(m => m.mountUI(this.app));
  }
}
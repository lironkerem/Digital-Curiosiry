/*  /js/apps/selfanalysis/loader.js  – Clean Big-App Integration  */

export default class SelfAnalysisLauncher {
  constructor(bigApp) {
    this.bigApp = bigApp;
    this.instance = null;
    this.isInitialized = false;
  }

  /* ---- Big-App calls this when calculator-tab is shown ---- */
  render() {
    const host = document.getElementById('calculator-tab');
    if (!host) {
      console.error('❌ Calculator tab not found');
      return;
    }

    // Only render once
    if (this.isInitialized) {
      this.revalidate();
      return;
    }

    console.log('🎯 Loading Self-Analysis Pro...');
    host.innerHTML = '<div class="loading-spinner-inner"><div class="spinner"></div><p>Loading Self-Analysis Pro...</p></div>';

    // Fetch HTML content
    fetch('/Mini-Apps/SelfAnalysisPro/index.html')
      .then(r => r.text())
      .then(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const appPage = doc.getElementById('app-page');
        
        if (!appPage) {
          throw new Error('app-page element not found in HTML');
        }

        // Build layout with Big-App header
        host.innerHTML = `
  <div style="background:var(--neuro-bg);padding:1.5rem;min-height:100vh;">
    <div class="universal-content">

      <!-- Big-App Unified Header -->
      <header class="main-header project-curiosity">
        <h1>Self-Analysis Pro</h1>
        <h3>Analyse your 'Self', using Numerology, Astrology, Tree of Life and Tarot</h3>
      </header>

      <!-- Mini-App Content -->
      <div class="card selfanalysis-scope">
        ${appPage.innerHTML}
      </div>

    </div>
  </div>
`;
        
        // Initialize custom pickers BEFORE booting the app
        return this.initializeCustomPickers().then(() => {
          // Boot the mini-app
          return import('/Mini-Apps/SelfAnalysisPro/js/app.js');
        });
      })
      .then(module => {
        if (typeof module.bootSelfAnalysis === 'function') {
          this.instance = module.bootSelfAnalysis(host);
          this.isInitialized = true;
          console.log('✅ Self-Analysis Pro loaded');
        } else {
          throw new Error('bootSelfAnalysis function not found');
        }
      })
      .catch(err => {
        console.error('❌ Self-Analysis loader failed:', err);
        host.innerHTML = `
          <div class="card" style="padding:2rem;text-align:center;color:var(--neuro-error);">
            <h2>Failed to Load Self-Analysis Pro</h2>
            <p>${err.message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Reload Page</button>
          </div>
        `;
      });
  }

  /* ---- Initialize Custom Date/Time Pickers ---- */
  async initializeCustomPickers() {
    try {
      console.log('🎯 Initializing custom pickers...');
      
      // Import picker classes
      const [
        { CustomDatePicker },
        { CustomTimePicker },
        { StepIndicator }
      ] = await Promise.all([
        import('/Mini-Apps/SelfAnalysisPro/js/customDatePicker.js'),
        import('/Mini-Apps/SelfAnalysisPro/js/customTimePicker.js'),
        import('/Mini-Apps/SelfAnalysisPro/js/stepindicator.js')
      ]);
      
      // Initialize date picker
      if (document.getElementById('date-of-birth')) {
        window.customDatePicker = new CustomDatePicker('date-of-birth');
        console.log('✅ CustomDatePicker initialized');
      }
      
      // Initialize time picker
      if (document.getElementById('time-of-birth')) {
        window.customTimePicker = new CustomTimePicker('time-of-birth');
        console.log('✅ CustomTimePicker initialized');
      }
      
      // Initialize step indicator
      if (document.getElementById('step-indicator')) {
        window.stepIndicator = new StepIndicator();
        window.resetStepIndicator = () => {
          if (window.stepIndicator) {
            window.stepIndicator.reset();
          }
        };
        console.log('✅ StepIndicator initialized');
      }
      
    } catch (err) {
      console.error('❌ Failed to initialize custom pickers:', err);
      throw err;
    }
  }

  /* ---- Re-validate form when tab is re-entered ---- */
  revalidate() {
    if (window.revalidateForm && typeof window.revalidateForm === 'function') {
      window.revalidateForm();
    }
  }

  /* ---- Cleanup when switching away from tab ---- */
  cleanup() {
    // Optional: Clear any timers, remove listeners, etc.
    console.log('🧹 Self-Analysis cleanup (if needed)');
  }
}
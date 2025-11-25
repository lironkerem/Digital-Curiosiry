/*  /js/apps/selfanalysis/loader.js  – cohesive, theme-consistent loader  */
export default class SelfAnalysisLauncher {
  constructor(bigApp) { this.bigApp = bigApp; }

  /* ---- public: Big-App calls this when calculator-tab is shown ---- */
  render() {
    const host = document.getElementById('calculator-tab');
    if (!host) return;

    host.innerHTML = '';   // clean slate

    Promise.all([
      fetch('/js/apps/selfanalysis/index.html').then(r => r.text()),
      fetch('/js/apps/selfanalysis/css/styles.css').then(r => r.text())
    ]).then(([html, css]) => {
      // 1.  inject scoped CSS (once only)
      if (!document.getElementById('selfanalysis-css')) {
        const style = document.createElement('style');
        style.id = 'selfanalysis-css';
        style.textContent = this._scopeCss(css, 'selfanalysis-scope');
        document.head.appendChild(style);
      }

      // 2.  extract the *real* content (skip <html><head>…)
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const page = doc.getElementById('app-page');
      const rawContent = page ? page.innerHTML : doc.body.innerHTML;

      // 3.  wrap inside the SAME layout every other engine uses
      host.innerHTML = `
        <div class="min-h-screen p-6">
          <div class="max-w-6xl mx-auto">
            <!-- title block -->
            <div class="text-center mb-8">
              <h2 class="text-4xl font-bold mb-4" style="color:var(--neuro-text)">
                Self-Analysis Pro
              </h2>
              <p class="mb-8" style="color:var(--neuro-text-light);font-size:1.1rem">
                Enter your details and receive a complete spiritual snapshot
              </p>
            </div>

            <!-- the actual mini-app lives inside a card -->
            <div class="card selfanalysis-scope" style="padding:2rem">
              ${rawContent}
            </div>
          </div>
        </div>
      `;

      // 4.  boot the mini-app (same entry point as before)
      return import('/js/apps/selfanalysis/js/app.js');
    }).then(mod => {
      mod.bootSelfAnalysis(host);
      this._focusFirstInput(host);
    }).catch(err => console.error('Self-Analysis loader failed:', err));
  }

  /* ---- private: scope every CSS rule ---- */
  _scopeCss(cssText, scopeClass) {
    return cssText
      .replace(/([^{}]+){/g, (m, sel) => {
        if (sel.trim().startsWith('@')) return m;   // leave @media / @keyframes
        const scoped = sel
          .split(',')
          .map(s => `.${scopeClass} ${s.trim()}`)
          .join(', ');
        return `${scoped} {`;
      });
  }

  /* ---- private: focus first input ---- */
  _focusFirstInput(host) {
    let tries = 0;
    const id = setInterval(() => {
      const first = host.querySelector('#first-name');
      if (first) { first.focus(); clearInterval(id); }
      if (++tries > 30) clearInterval(id);   // 4.5 s max
    }, 150);
  }
}
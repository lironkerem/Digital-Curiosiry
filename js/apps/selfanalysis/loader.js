/*  /js/apps/selfanalysis/loader.js  – iframe-free, CSS-scoped, bullet-proof loader  */
export default class SelfAnalysisLauncher {
  constructor(bigApp) { this.bigApp = bigApp; }

  /* ---- public: Big-App calls this when calculator-tab becomes active ---- */
  render() {
    const host = document.getElementById('calculator-tab');
    if (!host) return;

    host.innerHTML = '';                       // remove any previous content

    Promise.all([
      fetch('/js/apps/selfanalysis/index.html').then(r => r.text()),
      fetch('/js/apps/selfanalysis/css/styles.css').then(r => r.text())
    ]).then(([html, css]) => {
      // 1.  inject scoped CSS (once only)
      if (!document.getElementById('selfanalysis-css')) {
        const style       = document.createElement('style');
        style.id          = 'selfanalysis-css';
        style.textContent = this._scopeCss(css, 'selfanalysis-scope');
        document.head.appendChild(style);
      }

      // 2.  wrap mini-app markup so CSS rules only hit inside this wrapper
      const bodyHTML = new DOMParser().parseFromString(html, 'text/html').body.innerHTML;
      host.innerHTML = `<div class="selfanalysis-scope">${bodyHTML}</div>`;

      // 3.  load mini-app ES-module and boot it
      return import('/js/apps/selfanalysis/js/app.js');
    }).then(mod => {
      mod.bootSelfAnalysis(host);              // mini-app thinks it owns the world
      this._focusFirstInput(host);             // UX nicety
    }).catch(err => console.error('Self-Analysis loader failed:', err));
  }

  /* ---- private: scope every CSS rule ---- */
  _scopeCss(cssText, scopeClass) {
    return cssText
      .replace(/([^{}]+){/g, (m, sel) => {
        if (sel.trim().startsWith('@')) return m;               // leave @media / @keyframes alone
        const scoped = sel
          .split(',')
          .map(s => `.${scopeClass} ${s.trim()}`)
          .join(', ');
        return `${scoped} {`;
      });
  }

  /* ---- private: focus first input after mini-app renders ---- */
  _focusFirstInput(host) {
    let tries = 0;
    const id = setInterval(() => {
      const first = host.querySelector('#first-name');
      if (first) { first.focus(); clearInterval(id); }
      if (++tries > 30) clearInterval(id);        // 4.5 s max
    }, 150);
  }
}
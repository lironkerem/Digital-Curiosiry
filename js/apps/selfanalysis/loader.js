/*  /js/apps/selfanalysis/loader.js  – iframe-free loader  */
export default class SelfAnalysisLauncher {
  constructor(bigApp) { this.bigApp = bigApp; }

  // ----------  public: called by Big-App when tab becomes active  ----------
  render() {
    const host = document.getElementById('calculator-tab');
    if (!host) return;

    // 1. wipe previous content (keeps id collisions away)
    host.innerHTML = '';

    // 2. fetch mini-app assets (same files as before)
    Promise.all([
      fetch('/js/apps/selfanalysis/index.html').then(r => r.text()),
      fetch('/js/apps/selfanalysis/css/styles.css').then(r => r.text())
    ]).then(([html, css]) => {
      // 3. inject CSS once (scoped to the tab)
      if (!document.getElementById('selfanalysis-css')) {
        const style = document.createElement('style');
        style.id = 'selfanalysis-css';
        style.textContent = css;
        document.head.appendChild(style);
      }

      // 4. drop the mini-app markup straight into the tab
      host.innerHTML = new DOMParser()
        .parseFromString(html, 'text/html')
        .body.innerHTML;

      // 5. load the mini-app’s own JS as a *module* (same as before)
      return import('/js/apps/selfanalysis/js/app.js');
    }).then(mod => {
      // 6. boot the mini-app (it will think it lives in its own world)
      mod.bootSelfAnalysis(host);

      // 7. focus first input (same helper you already had)
      this._focusFirstInput(host);
    }).catch(err => console.error('Self-Analysis loader failed', err));
  }

  // ----------  private ----------
  _focusFirstInput(host) {
    let tries = 0;
    const id = setInterval(() => {
      const first = host.querySelector('#first-name');
      if (first) {
        first.focus();
        clearInterval(id);
      }
      if (++tries > 30) clearInterval(id); // 4.5 s max
    }, 150);
  }
}
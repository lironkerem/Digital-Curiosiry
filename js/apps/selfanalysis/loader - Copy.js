/*  /js/apps/selfanalysis/loader.js  – bullet-proof loader for the Self-Analysis mini-app */
export default class SelfAnalysisLauncher {
  constructor(bigApp) { this.bigApp = bigApp; }

  render() {
    const host = document.getElementById('calculator-tab');
    if (!host) return;

    // Defensive: remove any legacy markup so the iframe is the only content in the tab.
    // This prevents duplicate UIs and ID collisions (old vs new calculator DOM).
    host.innerHTML = '';

    /* 1. create iframe only once ******************************************/
    let iframe = host.querySelector('iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.style.cssText = 'width:100%;height:100%;border:none;display:block';
      // allow programmatic focus
      iframe.setAttribute('tabindex', '0');
      host.appendChild(iframe);

      /* 2. write content AFTER fetching HTML & CSS for the mini-app *********/
      Promise.all([
        fetch('/js/apps/selfanalysis/index.html').then(r => r.text()),
        fetch('/js/apps/selfanalysis/css/styles.css').then(r => r.text())
      ]).then(([html, css]) => {
        const doc = iframe.contentDocument;
        doc.open();

        // Inject <base> so relative paths in index.html resolve to the mini-app folder.
        // Also include global libs expected by the mini-app (pdf-lib, jspdf).
        doc.write(`
          <!doctype html>
          <html>
          <head>
            <meta charset="utf-8">
            <base href="/js/apps/selfanalysis/">
            <style>${css}</style>

            <!-- pdf-lib: used by PDFAssembler (global) -->
            <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"><\/script>

            <!-- jspdf: kept for compatibility if used elsewhere -->
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
          </head>
          <body>
            ${new DOMParser().parseFromString(html, 'text/html').body.innerHTML}
            <script type="module">
              (async () => {
                try {
                  // Relative import resolves to /js/apps/selfanalysis/js/app.js because of <base>
                  const mod = await import('./js/app.js');
                  try { mod.bootSelfAnalysis(document.body); }
                  catch (e) {
                    window.addEventListener('DOMContentLoaded', () => mod.bootSelfAnalysis(document.body));
                  }
                } catch (err) {
                  console.error('Failed to load selfanalysis app module inside iframe', err);
                }
              })();
            <\/script>
          </body>
          </html>
        `);
        doc.close();

        // 3. Try to focus the first input inside the iframe as soon as possible.
        //    Retry for a short while until the mini-app finishes initializing.
        (function tryFocusIframeInput() {
          const maxAttempts = 30; // ~4.5s (30 * 150ms)
          let attempts = 0;
          const timer = setInterval(() => {
            attempts += 1;
            try {
              const idoc = iframe.contentDocument;
              if (!idoc) return;
              const firstInput = idoc.getElementById('first-name') || idoc.querySelector('input, textarea, [tabindex]');
              if (firstInput) {
                try { iframe.focus(); } catch (e) {}
                try { firstInput.focus(); } catch (e) {}
                try { iframe.contentWindow?.revalidateForm?.(); } catch (e) {}
                clearInterval(timer);
                return;
              }
            } catch (e) {
              // Access can fail while iframe initializing; ignore and retry
            }
            if (attempts >= maxAttempts) clearInterval(timer);
          }, 150);
        })();
      }).catch(err => {
        console.error('Failed to fetch Self‑Analysis HTML or CSS for iframe:', err);
      });
    }

    /* 4. every time user enters tab – re-validate the mini-app form *******/
    // If iframe already exists, trigger its revalidation (called on tab re-entry)
    iframe = host.querySelector('iframe');
    if (iframe && iframe.contentWindow && iframe.contentWindow.revalidateForm) {
      try { iframe.contentWindow.revalidateForm(); } catch (e) { /* noop */ }
    }
  }
}
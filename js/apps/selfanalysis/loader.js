/*  /js/apps/selfanalysis/loader.js  – bullet-proof  */
export default class SelfAnalysisLauncher {
  constructor(bigApp) { this.bigApp = bigApp; }

  render() {
    const host = document.getElementById('calculator-tab');
    if (!host) return;

    /* 1.  create iframe only once ******************************/
    if (!host.querySelector('iframe')) {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'width:100%;height:100%;border:none;display:block';
      host.appendChild(iframe);

      /* 2.  write content AFTER iframe onload ****************/
      Promise.all([
        fetch('/js/apps/selfanalysis/index.html').then(r => r.text()),
        fetch('/js/apps/selfanalysis/css/styles.css').then(r => r.text())
      ]).then(([html, css]) => {
        const doc = iframe.contentDocument;
        doc.open();
        // Inject base so relative paths in index.html resolve to the mini-app folder.
        doc.write(`
          <!doctype html>
          <html>
// inside doc.write(...) — head section
<head>
  <meta charset="utf-8">
  <base href="/js/apps/selfanalysis/">
  <style>${css}</style>

  <!-- Add pdf-lib (global) which PDFAssembler expects -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"><\/script>

  <!-- Keep jspdf if needed by other code -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
</head>
          <body>
            ${new DOMParser().parseFromString(html, 'text/html').body.innerHTML}
            <script type="module">
              (async () => {
                try {
                  // Relative import resolves to /js/apps/selfanalysis/js/app.js because of the <base>
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
      }).catch(err => {
        console.error('Failed to fetch Self‑Analysis HTML or CSS for iframe:', err);
      });
    }

    /* 3.  every time user enters tab – re-validate ************/
    const iframe = host.querySelector('iframe');
    if (iframe && iframe.contentWindow && iframe.contentWindow.revalidateForm) {
      iframe.contentWindow.revalidateForm();   // mini-app function – see below
    }
  }
}
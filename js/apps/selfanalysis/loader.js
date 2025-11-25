/*  /js/apps/selfanalysis/loader.js  – bullet-proof  */
export default class SelfAnalysisLauncher {
  constructor(bigApp) { this.bigApp = bigApp; }

  render() {
    const host = document.getElementById('calculator-tab');

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
        doc.write(`
          <!doctype html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>${css}</style>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
          </head>
          <body>
            ${new DOMParser().parseFromString(html, 'text/html').body.innerHTML}
            <script type="module">
              import { bootSelfAnalysis } from '/js/apps/selfanalysis/app.js';
              window.addEventListener('DOMContentLoaded', () => bootSelfAnalysis(document.body));
            <\/script>
          </body>
          </html>
        `);
        doc.close();
      });
    }

    /* 3.  every time user enters tab – re-validate ************/
    const iframe = host.querySelector('iframe');
    if (iframe && iframe.contentWindow && iframe.contentWindow.revalidateForm) {
      iframe.contentWindow.revalidateForm();   // mini-app function – see below
    }
  }
}
export default class SelfAnalysisLauncher {
  constructor(bigApp) { this.bigApp = bigApp; }

  render() {
    const host = document.getElementById('calculator-tab');
    if (host.dataset.saLoaded) return;
    host.dataset.saLoaded = '1';

    // 1.  create an invisible iframe that fills the tab
    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:none;display:block';
    host.appendChild(iframe);

    // 2.  write the **entire** mini-app into the iframe
    Promise.all([
      fetch('/js/apps/selfanalysis/index.html').then(r => r.text()),
      fetch('/js/apps/selfanalysis/css/styles.css').then(r => r.text())
    ]).then(([html, css]) => {
      const doc = iframe.contentDocument;
      doc.open();
      doc.write(`
        <!doctype html>
        <head>
          <meta charset="utf-8">
          <style>${css}</style>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"><\/script>
        </head>
        <body>
          ${new DOMParser().parseFromString(html, 'text/html').body.innerHTML}
          <script type="module" src="/js/apps/selfanalysis/app.js"><\/script>
        </body>
      `);
      doc.close();
    });
  }
}
// api/test-push.js
export default (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`
<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Push test</title>
  <style>body{font-family:sans-serif;padding:2rem}</style>
</head>
<body>
  <h2>Send yourself a test notification</h2>
  <button id="fire">Fire test notification</button>
  <pre id="log"></pre>

  <script>
    const log = txt => document.getElementById('log').textContent += txt + '\\n';
    fire.onclick = async () => {
      log('Fetching subscriptions...');
      const res = await fetch('/api/subs');
      const list = await res.json();
      if (!list.length) return log('No subscriptions saved yet. Enable notifications in your app first.');
      log('Found ' + list.length + ' sub(s). Sending...');
      const send = await fetch('/api/send', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          sub: list[0],
          payload: {title:'Test 🎉', body:'It works!'}
        })
      });
      const out = await send.json();
      log(JSON.stringify(out, null, 2));
    };
  </script>
</body>
</html>
  `);
};
// Core/push-setup.js
document.getElementById('pushBtn').onclick = async () => {
  alert('Clicked!');
  document.getElementById('pushBtn').textContent = 'Notifications ON';
  await fetch('/api/save-sub', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(await (await navigator.serviceWorker.ready).pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: Uint8Array.from(atob('BGC3GSs75wSk-IXvSHfsmr725CJnQxNuYJHExJZ113yITzwPgAZrVe6-IGyD1zC_t5mtH3-HG1P4GndS8PnSrOc'), c => c.charCodeAt(0))
    }))
  });
};
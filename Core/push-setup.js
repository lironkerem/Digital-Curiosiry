// Core/push-setup.js
const VAPID_PUBLIC_KEY = 'BGC3GSs75wSk-IXvSHfsmr725CJnQxNuYJHExJZ113yITzwPgAZrVe6-IGyD1zC_t5mtH3-HG1P4GndS8PnSrOc';

document.getElementById('pushBtn').onclick = async () => {
  const sw = await navigator.serviceWorker.ready;
  const sub = await sw.pushManager.getSubscription();
  if (sub) {
    await sub.unsubscribe();
    document.getElementById('pushBtn').textContent = 'Enable notifications';
  } else {
    const newSub = await sw.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: Uint8Array.from(atob(VAPID_PUBLIC_KEY), c => c.charCodeAt(0))
    });
    await fetch('/api/save-sub', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(newSub)
    });
    document.getElementById('pushBtn').textContent = 'Notifications ON';
  }
};
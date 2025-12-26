// Core/push-setup.js
const VAPID_PUBLIC_KEY = 'BGC3GSs75wSk-IXvSHfsmr725CJnQxNuYJHExJZ113yITzwPgAZrVe6-IGyD1zC_t5mtH3-HG1P4GndS8PnSrOc';

const pushBtn = document.getElementById('pushBtn');
if (!pushBtn) throw new Error('pushBtn not found');

let subscription = null;

pushBtn.onclick = async () => {
  try {
    const sw = await navigator.serviceWorker.ready;
    const sub = await sw.pushManager.getSubscription();
    if (sub) {
      await sub.unsubscribe();
      subscription = null;
    } else {
      subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      await fetch('/api/save-sub', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(subscription)
      });
    }
    pushBtn.textContent = subscription ? 'Notifications ON' : 'Enable notifications';
  } catch (err) {
    alert('Error: ' + err.message);
  }
};

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
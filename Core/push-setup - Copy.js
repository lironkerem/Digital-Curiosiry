// Core/push-setup.js
const VAPID_PUBLIC_KEY = 'BGC3GSs75wSk-IXvSHfsmr725CJnQxNuYJHExJZ113yITzwPgAZrVe6-IGyD1zC_t5mtH3-HG1P4GndS8PnSrOc';

// 1. REGISTER SERVICE WORKER
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(reg => console.log('SW registered:', reg))
    .catch(err => console.error('SW registration failed:', err));
}

// 2. UPDATE BUTTON STATE ON LOAD
async function updateButtonState() {
  if (!('serviceWorker' in navigator)) return;
  const sw = await navigator.serviceWorker.ready;
  const sub = await sw.pushManager.getSubscription();
  const btn = document.getElementById('pushBtn');
  btn.textContent = sub ? 'Notifications ON' : 'Enable notifications';
}

// Check state when SW is ready
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then(updateButtonState);
}

// 3. HANDLE BUTTON CLICK
document.getElementById('pushBtn').onclick = async () => {
  const btn = document.getElementById('pushBtn');
  
  try {
    const sw = await navigator.serviceWorker.ready;
    const sub = await sw.pushManager.getSubscription();
    
    if (sub) {
      // Unsubscribe
      await sub.unsubscribe();
      btn.textContent = 'Enable notifications';
      console.log('Unsubscribed from push');
    } else {
      // Subscribe
      const newSub = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      
      const response = await fetch('/api/save-sub', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newSub)
      });
      
      if (!response.ok) throw new Error('Failed to save subscription');
      
      btn.textContent = 'Notifications ON';
      console.log('Subscribed to push:', newSub);
    }
  } catch (err) {
    console.error('Push subscription error:', err);
    alert('Failed to toggle notifications: ' + err.message);
  }
};

// Helper to convert base64 VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}
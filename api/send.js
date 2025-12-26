import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { sub, payload } = req.body;   // sub = subscription object, payload = {title, body, ...}

  try {
    await webpush.sendNotification(sub, JSON.stringify(payload));
    res.json({ sent: true });
  } catch (err) {
    // 410 = subscription expired
    if (err.statusCode === 410) {
      res.status(410).json({ error: 'subscription gone' });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};
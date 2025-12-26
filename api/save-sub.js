// api/save-sub.js  (shared Map)
global._pushSubs = global._pushSubs || new Map();

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  const sub = req.body;
  if (!sub?.endpoint) return res.status(400).json({ error: 'bad sub' });
  global._pushSubs.set(sub.endpoint, sub);
  console.log('Saved sub:', sub.endpoint);
  res.json({ ok: true });
};
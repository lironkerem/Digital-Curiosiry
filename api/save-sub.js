// api/save-sub.js  (simple in-memory stub for now)
const subs = new Map(); // endpoint -> subscription object

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const sub = req.body;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: 'bad sub' });

  subs.set(sub.endpoint, sub); // replace if exists
  console.log('Saved sub:', sub.endpoint);
  res.json({ ok: true });
};
// api/save-sub.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  
  const sub = req.body;
  if (!sub?.endpoint) return res.status(400).json({ error: 'bad sub' });
  
  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert({
      endpoint: sub.endpoint,
      subscription: sub
    }, { onConflict: 'endpoint' });
  
  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  console.log('Saved sub:', sub.endpoint);
  res.json({ ok: true });
};
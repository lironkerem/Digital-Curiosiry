// api/subs.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async (req, res) => {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('subscription');
  
  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  const list = data.map(row => row.subscription);
  res.json(list);
};
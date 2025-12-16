// DB.js
/* global window, console */

import { supabase } from './Supabase.js';

/* GET current user's row (returns the JSON payload or NULL on error) */
export async function fetchProgress() {
  try {
    const { data: { session }, error: sessErr } = await supabase.auth.getSession();
    if (sessErr) { console.error('❌ Session error:', sessErr); return null; }
    if (!session) { console.log('⚠️ No active session'); return null; }

    const { data, error } = await supabase.from('user_progress').select('payload').single();
    if (error) {
      if (error.code === 'PGRST116') return {}; // new user
      console.error('❌ fetchProgress error:', error); return null;
    }
    return data?.payload || {};
  } catch (e) {
    console.error('❌ Unexpected error in fetchProgress:', e); return null;
  }
}

/* UPSERT the whole blob (overwrite the entire JSON) */
export async function saveProgress(payload) {
  try {
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr) { console.error('❌ User error:', userErr); throw new Error('Failed to get user'); }
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('user_progress')
      .upsert({ user_id: user.id, payload, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

    if (error) { console.error('❌ saveProgress failed:', error); throw error; }
    console.log('☁️ Progress Saved on Cloud & Locally');
  } catch (e) {
    console.error('❌ Unexpected error in saveProgress:', e); throw e;
  }
}
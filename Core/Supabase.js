// Supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.0/+esm';

export const supabase = createClient(
  'https://qfbarhxfmzpgbgkaymuk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmYmFyaHhmbXpwZ2Jna2F5bXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1ODg4MjEsImV4cCI6MjA4MDE2NDgyMX0.twBWw0dZnLRTWTHav0sJ77GXyvsGR3ZgPplRO2vVSFk'
);
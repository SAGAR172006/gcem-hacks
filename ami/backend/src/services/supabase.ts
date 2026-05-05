import { createClient } from '@supabase/supabase-js'
import { config } from '../config'

// Anon client — used for auth operations (respects Row Level Security)
export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)

// Service role client — used server-side to bypass RLS (e.g. creating profiles)
// NEVER expose this key to the frontend
export const supabaseAdmin = createClient(config.supabaseUrl, config.supabaseServiceKey)

// Supabase Client Configuration

import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const supabaseUrl = "https://yelpgrzncstunyfdwmgi.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbHBncnpuY3N0dW55ZmR3bWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2MDcyODQsImV4cCI6MjA4MTE4MzI4NH0.lTkPuRcErQpQ_osy_OtiUpjZDGJtXc9kdfLGlo5RiKU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

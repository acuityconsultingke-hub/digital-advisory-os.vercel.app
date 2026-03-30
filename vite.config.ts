import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',{ /* Changed base path */ }
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
  },
  // other configurations if any
});
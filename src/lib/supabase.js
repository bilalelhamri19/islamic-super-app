import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase
try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } else {
    console.log('Supabase not configured, using local storage only')
    // Mock object if no config
    supabase = {
      auth: {
        signUp: () => Promise.resolve({ data: null, error: { message: 'Local mode' } }),
        signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Local mode' } }),
        signOut: () => Promise.resolve()
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            order: () => Promise.resolve({ data: null, error: null })
          })
        }),
        insert: () => Promise.resolve({ error: null }),
        upsert: () => Promise.resolve({ error: null }),
        update: () => ({ eq: () => Promise.resolve({ error: null }) }),
        delete: () => ({ eq: () => Promise.resolve({ error: null }) })
      }),
      isMock: true
    }
  }
} catch (e) {
  console.log('Supabase not available, using local storage only')
  supabase = {
    auth: {
      signUp: () => Promise.resolve({ data: null, error: { message: 'Local mode' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Local mode' } }),
      signOut: () => Promise.resolve()
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: null, error: null })
        })
      }),
      insert: () => Promise.resolve({ error: null }),
      upsert: () => Promise.resolve({ error: null }),
      update: () => ({ eq: () => Promise.resolve({ error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ error: null }) })
    }),
    isMock: true
  }
}

export { supabase }

// Fallback في الحالة ماكانش Supabase مثبت
let supabaseInstance = {
  auth: {
    signUp: async () => ({ error: { message: 'Local mode only' } }),
    signInWithPassword: async () => ({ error: { message: 'Local mode only' } }),
    signOut: async () => ({})
  },
  from: () => ({
    select: () => ({
      single: async () => ({ data: null, error: null }),
      order: () => ({ then: async () => ({ data: null, error: null }) }),
      then: async (fn) => fn({ data: null, error: null })
    }),
    insert: async () => ({ error: null }),
    update: async () => ({ error: null }),
    delete: async () => ({ error: null }),
    upsert: async () => ({ error: null }),
    eq: () => ({ single: async () => ({ data: null, error: null }) })
  }),
  isMock: true
};

// محاولة تحميل Supabase إذا هو موجود
try {
  const module = await import('@supabase/supabase-js');
  const createClient = module.createClient;
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (createClient && supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.log('Using local only mode:', e);
}

export const supabase = supabaseInstance;

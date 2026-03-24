import { supabase } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
}

export const authService = {
  async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!supabase) return { user: null, error: 'Supabase no está configurado.' };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'No se pudo crear el usuario.' };
    return { user: { id: data.user.id, email: data.user.email! }, error: null };
  },

  async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    if (!supabase) return { user: null, error: 'Supabase no está configurado.' };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { user: null, error: error.message };
    if (!data.user) return { user: null, error: 'Credenciales inválidas.' };
    return { user: { id: data.user.id, email: data.user.email! }, error: null };
  },

  async signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async getSession(): Promise<AuthUser | null> {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return null;
    return { id: data.session.user.id, email: data.session.user.email! };
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? { id: session.user.id, email: session.user.email! } : null);
    });
  },
};

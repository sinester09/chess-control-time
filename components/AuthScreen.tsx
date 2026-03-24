import React, { useState } from 'react';
import { authService } from '../src/services/authService';
import { LogoEmpresas } from './icons';

interface AuthScreenProps {
  onAuth: (userId: string, email: string) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (mode === 'login') {
      const { user, error: err } = await authService.signIn(email, password);
      if (err) { setError(err); setLoading(false); return; }
      if (user) onAuth(user.id, user.email);
    } else {
      const { error: err } = await authService.signUp(email, password);
      if (err) { setError(err); setLoading(false); return; }
      setSignupDone(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <LogoEmpresas size={80} className="mb-3" />
          <h1 className="text-2xl font-bold text-white">Chess Control</h1>
          <p className="text-slate-400 text-sm mt-1">Controlador de tiempo y productividad</p>
        </div>

        {signupDone ? (
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8 text-center">
            <div className="text-4xl mb-3">✉️</div>
            <h2 className="text-white font-semibold text-lg mb-2">Revisa tu correo</h2>
            <p className="text-slate-400 text-sm mb-4">
              Te enviamos un enlace de confirmación a <span className="text-cyan-400">{email}</span>.
              Confirma tu cuenta e inicia sesión.
            </p>
            <button
              onClick={() => { setSignupDone(false); setMode('login'); }}
              className="text-cyan-400 hover:text-cyan-300 text-sm font-medium"
            >
              Ir al inicio de sesión
            </button>
          </div>
        ) : (
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8">
            {/* Tab toggle */}
            <div className="flex bg-slate-700 rounded-xl p-1 mb-6">
              <button
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'login'
                    ? 'bg-cyan-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => { setMode('signup'); setError(null); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === 'signup'
                    ? 'bg-cyan-500 text-white shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Registrarse
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Correo electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1.5">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition"
              >
                {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;

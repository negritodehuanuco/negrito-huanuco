import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminLoginView: React.FC = () => {
  const { login, navigateTo } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = login(email, password, 'admin');
      if (!res.success) {
        setError(res.message || 'Credenciales administrativas no válidas. Verifique su correo y contraseña.');
      }
    }, 400);
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 text-white p-7 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-600/30">
            <Shield className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h1 className="text-xl font-black text-white tracking-wider uppercase">
            ACCESO DEL DUEÑO / ADMIN
          </h1>
          <div className="text-xs font-black text-red-500 mt-1 flex items-center justify-center gap-1.5">
            <span>NEGRITO DE HUÁNUCO</span>
            <span className="text-neutral-400 font-mono text-[10px]">· negritodehuanuco.com</span>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            Consola central de supervisión, comisiones del 20% y gerencia general.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {forgotSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Instrucciones de recuperación enviadas al canal seguro del propietario.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="maycolconde13@gmail.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500 focus:outline-hidden transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setForgotSent(true)}
                className="text-[11px] font-bold text-red-600 hover:text-red-700"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500 focus:outline-hidden transition-colors font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>{isLoading ? 'Verificando...' : 'INICIAR SESIÓN COMO DUEÑO'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

  

          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
            >
              ← Volver al sitio público de clientes (negritodehuanuco.com)
            </button>
          </div>
        </form>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
          Acceso privado restringido. No existe registro público para esta consola.
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { User, Mail, Phone, Lock, MapPin, X, ArrowRight, AlertCircle, CheckCircle2, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ClientAuthModal: React.FC = () => {
  const { authModalOpen, authModalTab, closeAuthModal, openAuthModal, login, registerClient, submitForgotPassword } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!authModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = login(email || 'cliente@negritodehuanuco.com', password, 'client');
      if (!res.success) {
        setError(res.message || 'Error al iniciar sesión.');
      } else {
        closeAuthModal();
      }
    }, 300);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      registerClient({
        name: name || 'Maycol Conde Figueroa',
        email: email || 'cliente@negritodehuanuco.com',
        phone: phone || '962 451 892',
        address: address || 'Jr. Dos de Mayo 745, Huánuco',
      });
      closeAuthModal();
    }, 300);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = submitForgotPassword(email || 'cliente@negritodehuanuco.com');
      setSuccessMessage(res.message);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                {authModalTab === 'login' && 'INICIAR SESIÓN · CLIENTE'}
                {authModalTab === 'register' && 'CREAR CUENTA · CLIENTE'}
                {authModalTab === 'forgot' && 'RECUPERAR CONTRASEÑA'}
              </h2>
              <p className="text-[11px] text-neutral-300">
                NEGRITO DE HUÁNUCO · negritodehuanuco.com
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers if login/register */}
        {authModalTab !== 'forgot' && (
          <div className="flex bg-neutral-100 p-1.5 border-b border-neutral-200">
            <button
              type="button"
              onClick={() => {
                setError(null);
                openAuthModal('login');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authModalTab === 'login' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                openAuthModal('register');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                authModalTab === 'register' ? 'bg-black text-white shadow-xs' : 'text-neutral-600 hover:text-black'
              }`}
            >
              Crear una Cuenta
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB: LOGIN */}
          {authModalTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@negritodehuanuco.com"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-neutral-700 uppercase">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => openAuthModal('forgot')}
                    className="text-[11px] font-bold text-red-600 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{loading ? 'Accediendo...' : 'Iniciar Sesión'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('cliente@negritodehuanuco.com');
                  setPassword('123456');
                }}
                className="w-full py-2 bg-neutral-100 hover:bg-red-50 border border-neutral-200 hover:border-red-400 text-neutral-700 hover:text-red-900 font-bold text-xs rounded-xl text-center transition-colors cursor-pointer"
              >
                ⚡ Autocompletar datos de cliente registrado
              </button>
            </form>
          )}

          {/* TAB: REGISTER */}
          {authModalTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Maycol Conde Figueroa"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="962 451 892"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@negritodehuanuco.com"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Dirección Habitual (Huánuco / Amarilis / Pillco Marca)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jr. Dos de Mayo 745, Huánuco Centro"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{loading ? 'Creando cuenta...' : 'Crear Mi Cuenta'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB: FORGOT PASSWORD */}
          {authModalTab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-3.5">
              <p className="text-xs text-neutral-600 leading-relaxed">
                Ingresa el correo electrónico asociado a tu cuenta de cliente de NEGRITO DE HUÁNUCO. Te enviaremos un enlace de recuperación seguro.
              </p>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cliente@negritodehuanuco.com"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-black hover:bg-neutral-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-600/40"
              >
                <span>{loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}</span>
              </button>

              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Volver a Iniciar Sesión
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Bike,
  User,
  MessageCircle,
  LogOut,
  ShoppingBag,
  Shield,
  ChevronRight,
  UserPlus,
  Columns3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    currentUser,
    logout,
    openAuthModal,
    setIsClientProfileOpen,
    activeClientOrderId,
    orders,
  } = useApp();

  const activeOrder = orders.find(
    (o) => o.id === activeClientOrderId && o.status !== 'entregado' && o.status !== 'cancelado'
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* Brand Title / Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-black border-2 border-red-600 flex items-center justify-center text-white font-black shadow-md shadow-red-600/25 group-hover:scale-105 transition-transform">
              <Bike className="w-6 h-6 stroke-[2.5] text-red-500" />
            </div>
            <div>
              <div className="text-xl font-extrabold tracking-tight text-black leading-none flex items-center gap-1.5">
                NEGRITO <span className="text-red-600">DE HUÁNUCO</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-tight leading-tight mt-0.5">
                <span className="text-red-600 font-mono font-bold bg-red-50 px-1 rounded border border-red-200">negritodehuanuco.com</span>
                <span className="text-neutral-500 hidden sm:inline">·</span>
                <span className="text-neutral-600 font-mono text-[11px] hidden sm:inline">
                  {currentRoute === '/visualizacion'
                    ? '/visualizacion'
                    : currentRoute === '/administracion' || currentRoute === '/administración' || currentRoute === '/admin'
                    ? '/administracion'
                    : currentRoute.startsWith('/repartidor') || currentRoute.startsWith('/delivery')
                    ? '/repartidores'
                    : '/'}
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center Navigation Links (Contextual to current area) */}
        {currentRoute.startsWith('/repartidor') || currentRoute.startsWith('/delivery') ? (
          <nav className="hidden lg:flex items-center gap-4 text-xs font-bold text-neutral-800">
            <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-lg flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-red-600" />
              <span>Portal de Repartidores</span>
            </span>
            <button
              type="button"
              onClick={() => {
                navigateTo('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-red-600 transition-colors cursor-pointer text-neutral-600"
            >
              ← Ir al Sitio de Clientes
            </button>
          </nav>
        ) : currentRoute === '/administracion' || currentRoute === '/administración' || currentRoute === '/admin' ? (
          <nav className="hidden lg:flex items-center gap-4 text-xs font-bold text-neutral-800">
            <span className="px-2.5 py-1 bg-black text-red-400 border border-neutral-800 rounded-lg flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-red-500" />
              <span>Consola Administrativa HQ</span>
            </span>
            <button
              type="button"
              onClick={() => {
                navigateTo('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-red-600 transition-colors cursor-pointer text-neutral-600"
            >
              👁️ Ver Sitio Clientes
            </button>
            <button
              type="button"
              onClick={() => {
                navigateTo('/repartidores');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-red-600 transition-colors cursor-pointer text-neutral-600"
            >
              🏍️ Ver Repartidores
            </button>
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-neutral-800">
            <button
              type="button"
              onClick={() => {
                navigateTo('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              Inicio
            </button>
            <button
              type="button"
              onClick={() => {
                navigateTo('/');
                const el = document.getElementById('servicios-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              Servicios
            </button>
            <button
              type="button"
              onClick={() => {
                navigateTo('/');
                const el = document.getElementById('seccion-transporte');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-red-600 transition-colors cursor-pointer"
            >
              Transporte
            </button>
            {activeOrder && (
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="text-red-700 hover:text-red-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                <span>Seguimiento</span>
              </button>
            )}
          </nav>
        )}

        {/* Right Action Items */}
        <div className="flex items-center gap-2">
          {/* Active Order Pill */}
          {activeOrder && (
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[11px] font-bold hover:bg-red-100 transition-colors shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span>Pedido: {activeOrder.id}</span>
            </button>
          )}

          {/* 📲 SOPORTE POR WHATSAPP (976 387 226) */}
          <a
            href="https://wa.me/51976387226?text=Hola%20NEGRITO%20DE%20HU%C3%81NUCO%2C%20necesito%20soporte%20y%20asistencia."
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black hover:bg-neutral-900 text-white font-extrabold text-xs transition-colors shadow-xs cursor-pointer border border-neutral-800"
            title="Soporte WhatsApp Huánuco: 976 387 226"
          >
            <MessageCircle className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span className="hidden sm:inline">📲 WhatsApp</span>
          </a>

          {/* Botón "QUIERO SER REPARTIDOR" */}
          {(!currentRoute.startsWith('/repartidor') && !currentRoute.startsWith('/delivery')) && (
            <button
              type="button"
              onClick={() => navigateTo('/repartidores/registro')}
              className="hidden sm:flex items-center gap-1 px-3 py-2 text-xs font-extrabold rounded-xl border bg-white hover:bg-red-50 text-neutral-800 hover:text-red-700 border-neutral-300 hover:border-red-400 shadow-xs transition-all cursor-pointer"
            >
              <Bike className="w-3.5 h-3.5 text-red-600" />
              <span>Quiero ser repartidor</span>
            </button>
          )}

          {/* User Auth Buttons: Iniciar Sesión / Crear Cuenta OR Profile */}
          {!currentUser ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="px-3 py-2 text-xs font-extrabold text-neutral-800 hover:text-red-600 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
              >
                INICIAR SESIÓN
              </button>
              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="px-3 py-2 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>CREAR CUENTA</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              {currentUser.role === 'client' && (
                <button
                  type="button"
                  onClick={() => setIsClientProfileOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-black text-xs font-bold transition-colors cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover border border-red-500"
                  />
                  <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] text-red-600 font-extrabold uppercase">Mi Cuenta</span>
                </button>
              )}

              {currentUser.role === 'driver' && (
                <button
                  type="button"
                  onClick={() => navigateTo('/repartidores')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black text-white text-xs font-bold transition-colors cursor-pointer border border-neutral-800"
                >
                  <Bike className="w-3.5 h-3.5 text-red-500" />
                  <span className="max-w-[100px] truncate">{currentUser.name.split(' ')[0]}</span>
                  <span className="text-[10px] uppercase font-black bg-red-600 text-white px-1.5 rounded">Repartidor</span>
                </button>
              )}

              {currentUser.role === 'admin' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => navigateTo('/administracion')}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentRoute === '/administracion' || currentRoute === '/administración' || currentRoute === '/admin'
                        ? 'bg-red-600 text-white font-black shadow-md shadow-red-600/30'
                        : 'bg-black text-white hover:bg-neutral-900 border border-neutral-800'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-red-400" />
                    <span className="max-w-[130px] truncate hidden sm:inline">Dueño / Persona a Cargo</span>
                    <span className="text-[10px] uppercase font-black bg-neutral-900 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">HQ</span>
                  </button>

                  <div className="hidden sm:flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => navigateTo('/')}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        currentRoute === '/' || currentRoute === '/cliente'
                          ? 'bg-black text-white shadow-xs'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                      title="Ver interfaz de cliente (/)"
                    >
                      Cliente
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('/repartidores')}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        currentRoute.startsWith('/repartidor') || currentRoute.startsWith('/delivery')
                          ? 'bg-black text-white shadow-xs'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                      title="Ver portal de repartidores (/repartidores)"
                    >
                      Repartidores
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Bike, MessageCircle, ShoppingBag, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Header: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    currentUser,
    logout,
    setOpenRegistrationModal,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        {/* 1. Logotipo Oficial */}
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
                <span className="text-red-600 font-mono font-bold bg-red-50 px-1 rounded border border-red-200">
                  negritodehuanuco.com
                </span>
                <span className="text-neutral-500 hidden sm:inline">·</span>
                <span className="text-neutral-500 text-[10px] hidden sm:inline">
                  Huánuco · Amarilis · Pillco Marca
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* 2. Botones de cabecera: WhatsApp, Quiero ser repartidor y Solicitar Pedido */}
        <div className="flex items-center gap-2">
          {/* Botón WhatsApp Oficial */}
          <a
            href="https://wa.me/51976387226?text=Hola%20NEGRITO%20DE%20HU%C3%81NUCO%2C%20necesito%20soporte%20y%20asistencia."
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black hover:bg-neutral-900 text-white font-extrabold text-xs transition-colors shadow-xs cursor-pointer border border-neutral-800"
            title="Soporte WhatsApp Huánuco: 976 387 226"
          >
            <MessageCircle className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>

          {/* Botón "Quiero ser repartidor" (Abre modal de postulación) */}
          <button
            type="button"
            onClick={() => setOpenRegistrationModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-xl border bg-white hover:bg-red-50 text-neutral-900 hover:text-red-600 border-neutral-300 hover:border-red-400 shadow-xs transition-all cursor-pointer"
          >
            <Bike className="w-3.5 h-3.5 text-red-600" />
            <span className="hidden sm:inline">Quiero ser repartidor</span>
            <span className="sm:hidden">Repartidor</span>
          </button>

          {/* Botón para solicitar servicio / pedido */}
          <button
            type="button"
            onClick={() => {
              if (currentRoute !== '/') {
                navigateTo('/');
              }
              const el = document.getElementById('servicios-grid');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="px-3.5 py-2 text-xs font-black bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white rounded-xl shadow-md shadow-red-600/25 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SOLICITAR PEDIDO</span>
            <span className="sm:hidden">PEDIR</span>
          </button>

          {/* Cierre de sesión discreto si está autenticado en sesión privada (Admin o Conductor) */}
          {currentUser && (
            <button
              type="button"
              onClick={logout}
              className="p-2 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
              title={`Cerrar sesión activa (${currentUser.name})`}
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

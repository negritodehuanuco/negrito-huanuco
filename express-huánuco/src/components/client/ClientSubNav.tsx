import React from 'react';
import {
  Home,
  PlusCircle,
  Package,
  Compass,
  Clock,
  User,
  LogOut
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type ClientTab = 'home' | 'wizard' | 'orders' | 'tracking' | 'history' | 'profile';

interface ClientSubNavProps {
  currentTab: ClientTab;
  onSelectTab: (tab: ClientTab) => void;
}

export const ClientSubNav: React.FC<ClientSubNavProps> = ({ currentTab, onSelectTab }) => {
  const { currentUser, logout, openAuthModal, activeClientOrderId, orders } = useApp();

  const activeOrdersCount = orders.filter(
    (o) =>
      o.status !== 'entregado' &&
      o.status !== 'cancelado' &&
      (!currentUser ||
        o.customer.phone === currentUser.phone ||
        o.customer.name.toLowerCase().includes(currentUser.name.split(' ')[0].toLowerCase()))
  ).length;

  const handleTabClick = (tab: ClientTab) => {
    if ((tab === 'orders' || tab === 'history' || tab === 'profile') && !currentUser) {
      openAuthModal('login');
      return;
    }
    onSelectTab(tab);
  };

  return (
    <div className="mb-6 flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs overflow-x-auto no-scrollbar">
      <button
        type="button"
        onClick={() => handleTabClick('home')}
        className={`flex-1 min-w-[75px] py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          currentTab === 'home'
            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Home className="w-3.5 h-3.5" />
        <span>Inicio</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('wizard')}
        className={`flex-1 min-w-[125px] py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          currentTab === 'wizard'
            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <PlusCircle className="w-3.5 h-3.5" />
        <span>Solicitar servicio</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('orders')}
        className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          currentTab === 'orders'
            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Package className="w-3.5 h-3.5" />
        <span>Mis pedidos</span>
        {activeOrdersCount > 0 && (
          <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[10px] font-black flex items-center justify-center">
            {activeOrdersCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('tracking')}
        className={`flex-1 min-w-[105px] py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          currentTab === 'tracking'
            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Compass className="w-3.5 h-3.5" />
        <span>Seguimiento</span>
        {activeClientOrderId && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        )}
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('history')}
        className={`flex-1 min-w-[85px] py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          currentTab === 'history'
            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <Clock className="w-3.5 h-3.5" />
        <span>Historial</span>
      </button>

      <button
        type="button"
        onClick={() => handleTabClick('profile')}
        className={`flex-1 min-w-[75px] py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          currentTab === 'profile'
            ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
        }`}
      >
        <User className="w-3.5 h-3.5" />
        <span>Perfil</span>
      </button>

      {currentUser && (
        <button
          type="button"
          onClick={logout}
          className="flex-1 min-w-[105px] py-2 px-3 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
          title="Cerrar sesión de cliente"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar sesión</span>
        </button>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Clock, Package, X, LogOut, CheckCircle2, ChevronRight, ShoppingBag } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ClientProfileModal: React.FC = () => {
  const { isClientProfileOpen, setIsClientProfileOpen, currentUser, logout, orders, setActiveClientOrderId, navigateTo } = useApp();

  const [activeTab, setActiveTab] = useState<'perfil' | 'historial'>('perfil');

  if (!isClientProfileOpen || !currentUser) return null;

  // Filter orders created by this client (or all orders in demo)
  const clientOrders = orders.filter((o) =>
    o.customer.phone === currentUser.phone || o.customer.name.toLowerCase().includes(currentUser.name.split(' ')[0].toLowerCase())
  );
  const displayOrders = clientOrders.length > 0 ? clientOrders : orders.slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-11 h-11 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base font-extrabold text-white tracking-tight">
                  {currentUser.name}
                </h2>
                <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  Cliente
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {currentUser.phone} · Huánuco
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsClientProfileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="flex bg-slate-100 p-1 border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('perfil')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'perfil' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Mi Perfil
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historial')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'historial' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            <span>Historial de Servicios</span>
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {displayOrders.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'perfil' ? (
            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    Nombre Completo
                  </span>
                  <span className="font-bold text-slate-900">{currentUser.name}</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    Correo Electrónico
                  </span>
                  <span className="font-bold text-slate-900">{currentUser.email}</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    Teléfono Registrado
                  </span>
                  <span className="font-bold font-mono text-slate-900">{currentUser.phone}</span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    Dirección Habitual
                  </span>
                  <span className="font-bold text-slate-900 text-right max-w-[200px]">
                    {currentUser.address || 'Huánuco Centro'}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200/60 pt-2">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    Total de Pedidos Realizados
                  </span>
                  <span className="font-black text-amber-600 font-mono">14 pedidos</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsClientProfileOpen(false);
                    logout();
                  }}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          ) : (
            /* ================= HISTORIAL DE PEDIDOS ================= */
            <div className="space-y-3 text-xs">
              {displayOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 bg-slate-50 hover:bg-amber-50/40 border border-slate-200 rounded-2xl transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-slate-900">{ord.id}</span>
                      <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                        {ord.serviceType}
                      </span>
                    </div>

                    <span className="font-black text-slate-900 font-mono text-sm">
                      S/ {ord.pricing.total.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div className="truncate">
                      <span className="text-emerald-600 font-bold">Recojo:</span> {ord.pickup.address}
                    </div>
                    <div className="truncate">
                      <span className="text-amber-600 font-bold">Destino:</span> {ord.destination.address}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px]">
                    <span className="capitalize font-semibold text-slate-700">
                      Estado: <b className="text-slate-900">{ord.status.replace('_', ' ')}</b>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveClientOrderId(ord.id);
                        setIsClientProfileOpen(false);
                        navigateTo('/');
                      }}
                      className="text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver Seguimiento</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

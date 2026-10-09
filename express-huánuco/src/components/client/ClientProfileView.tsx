import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  LogOut,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  Edit2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ClientProfileViewProps {
  onStartOrder: () => void;
  onViewHistory: () => void;
}

export const ClientProfileView: React.FC<ClientProfileViewProps> = ({
  onStartOrder,
  onViewHistory,
}) => {
  const { currentUser, logout, orders } = useApp();

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [address, setAddress] = useState(currentUser?.address || 'Jr. Dos de Mayo 745, Huánuco Centro');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!currentUser) return null;

  const clientOrders = orders.filter((o) =>
    o.customer.phone === currentUser.phone ||
    o.customer.name.toLowerCase().includes(currentUser.name.split(' ')[0].toLowerCase())
  );

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingAddress(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Top Banner Card */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={currentUser.name}
            className="w-20 h-20 rounded-3xl object-cover border-2 border-amber-500 shadow-lg"
          />

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight">{currentUser.name}</h2>
              <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full uppercase">
                Cliente Verificado
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {currentUser.email} · {currentUser.phone}
            </p>
            <div className="text-xs text-red-400 font-medium pt-1">
              Miembro de NEGRITO DE HUÁNUCO desde {currentUser.createdAt || '2025'}
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 bg-slate-900 hover:bg-red-950 hover:text-red-400 text-slate-300 text-xs font-bold rounded-xl border border-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Dirección de entrega predeterminada actualizada con éxito.</span>
        </div>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Personal Details */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-600" />
              <span>Datos Personales</span>
            </h3>
            <span className="text-[10px] uppercase font-bold text-slate-400">Cuenta Cliente</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Nombre Completo</div>
              <div className="font-bold text-slate-900 mt-0.5">{currentUser.name}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Teléfono Registrado</div>
              <div className="font-mono font-bold text-slate-900 mt-0.5">{currentUser.phone}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Correo Electrónico</div>
              <div className="font-bold text-slate-900 mt-0.5">{currentUser.email}</div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Ciudad de Servicio</div>
              <div className="font-bold text-slate-900 mt-0.5">Huánuco, Amarilis y Pillco Marca</div>
            </div>
          </div>
        </div>

        {/* Saved Address & Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Dirección Habitual</span>
            </h3>
            <button
              type="button"
              onClick={() => setIsEditingAddress(!isEditingAddress)}
              className="text-xs text-amber-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditingAddress ? 'Cancelar' : 'Modificar'}</span>
            </button>
          </div>

          {isEditingAddress ? (
            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                  Nueva Dirección de Entrega
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:bg-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Guardar Dirección
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">Dirección Principal</div>
                <div className="font-bold text-slate-900 mt-0.5">{address}</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Esta dirección se sugerirá automáticamente en tus nuevos pedidos.
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">Total de pedidos realizados:</span>
                <span className="font-black text-slate-900">{clientOrders.length} pedidos</span>
              </div>

              <button
                type="button"
                onClick={onViewHistory}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-slate-600" />
                <span>Ver historial completo de pedidos</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-black text-amber-950 text-base">¿Necesitas enviar o pedir algo ahora?</div>
          <p className="text-xs text-amber-800 mt-0.5">
            Solicita delivery de paquetes, compras en tiendas o transporte en Moto/Mototaxi.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartOrder}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
        >
          Pedir Servicio
        </button>
      </div>
    </div>
  );
};

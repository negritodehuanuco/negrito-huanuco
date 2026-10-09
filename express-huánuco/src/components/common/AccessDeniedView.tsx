import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn, Bike, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AccessDeniedViewProps {
  attemptedArea: 'admin' | 'repartidor';
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ attemptedArea }) => {
  const { currentUser, navigateTo, logout, login } = useApp();

  const areaTitle = attemptedArea === 'admin' ? 'Consola Administrativa (/administracion)' : 'Portal de Repartidores (/repartidores)';
  const requiredRole = attemptedArea === 'admin' ? 'ADMINISTRADOR' : 'REPARTIDOR';

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 border border-red-200 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />

        {/* Shield Icon */}
        <div className="w-20 h-20 rounded-3xl bg-red-50 border-2 border-red-200 text-red-600 flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-red-600 bg-red-100 px-3 py-1 rounded-full">
            Control de Acceso Unificado · NEGRITO DE HUÁNUCO
          </span>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-3">
            Área Restringida: {areaTitle}
          </h2>
          <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
            Tu cuenta actual <span className="font-bold text-slate-900">({currentUser?.name || 'Usuario'})</span> tiene asignado el rol de{' '}
            <span className="font-extrabold uppercase text-red-600">
              {currentUser?.role === 'client' ? 'Cliente' : currentUser?.role === 'driver' ? 'Repartidor' : 'Usuario'}
            </span>.
            Esta sección está reservada exclusivamente para el personal con rol de{' '}
            <span className="font-bold text-slate-900">{requiredRole}</span> de NEGRITO DE HUÁNUCO.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {attemptedArea === 'admin' && (
            <button
              type="button"
              onClick={() => {
                login('admin@negritodehuanuco.com', '123456', 'admin');
                navigateTo('/administracion');
              }}
              className="w-full py-3.5 px-4 bg-black hover:bg-neutral-900 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg border border-red-600 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-red-500" />
              <span>Ver Panel como Dueño / Administrador (HQ)</span>
            </button>
          )}

          {attemptedArea === 'repartidor' && (
            <button
              type="button"
              onClick={() => {
                login('carlos.mendoza@negritodehuanuco.com', '123456', 'driver');
                navigateTo('/repartidores');
              }}
              className="w-full py-3.5 px-4 bg-black hover:bg-neutral-900 text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg border border-red-600 transition-all cursor-pointer"
            >
              <Bike className="w-4 h-4 text-red-500" />
              <span>Ver Portal como Repartidor Activo (Carlos Mendoza)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-red-600/20 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Ir al Sitio Público de Clientes (negritodehuanuco.com)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
            }}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Cerrar sesión actual</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          NEGRITO DE HUÁNUCO · negritodehuanuco.com · Sistema RBAC
        </div>
      </div>
    </div>
  );
};

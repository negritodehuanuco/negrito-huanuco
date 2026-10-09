import React from 'react';
import {
  Bike,
  Package,
  FileText,
  ShoppingCart,
  Zap,
  Truck,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  MessageCircle,
  CheckCircle2,
  ChevronRight,
  Star,
  Sparkles
} from 'lucide-react';
import { ServiceType } from '../../types';
import { useApp } from '../../context/AppContext';
import { TransportSection } from './TransportSection';

interface ClientHomeProps {
  onStartOrder: (service?: ServiceType) => void;
  onOpenTracking: (orderId: string) => void;
}

export const ClientHome: React.FC<ClientHomeProps> = ({
  onStartOrder,
  onOpenTracking,
}) => {
  const { orders, activeClientOrderId, setOpenRegistrationModal, setOpenWhatsAppModal } = useApp();

  const activeOrder = orders.find(
    (o) => o.id === activeClientOrderId && o.status !== 'entregado' && o.status !== 'cancelado'
  );

  const scrollToTransport = () => {
    const el = document.getElementById('seccion-transporte');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Active Order Banner if existing */}
      {activeOrder && (
        <div className="bg-slate-900 text-white p-4 rounded-3xl border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Bike className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  En curso
                </span>
                <span className="font-mono text-xs text-slate-300">Pedido {activeOrder.id}</span>
              </div>
              <div className="text-sm font-extrabold text-white mt-0.5">
                Estado: <span className="text-amber-400 capitalize">{activeOrder.status.replace('_', ' ')}</span>
              </div>
              <div className="text-xs text-slate-400 truncate max-w-xs">
                Destino: {activeOrder.destination.address}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenTracking(activeOrder.id)}
            className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-md"
          >
            <span>Ver Seguimiento en Vivo</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-black rounded-3xl p-6 sm:p-10 border-2 border-red-600/30 overflow-hidden text-white shadow-xl">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-bold mb-4 border border-red-600/40">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-red-400 font-mono">negritodehuanuco.com</span>
            <span className="text-neutral-400">· Huánuco, Amarilis y Pillco Marca</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            NEGRITO <span className="text-red-600">DE HUÁNUCO</span>
          </h1>

          <p className="text-base sm:text-lg text-neutral-300 mt-2 font-medium">
            Delivery oficial, mandados, mensajería y transporte en Huánuco. Rápido, seguro, confiable y con la tarifa justa.
          </p>

          {/* Main CTA Button & Transporte Button */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => onStartOrder('paquete')}
              className="px-7 py-4 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-black text-sm rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            >
              <span>SOLICITAR DELIVERY</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={scrollToTransport}
              className="px-6 py-4 bg-neutral-900 hover:bg-neutral-800 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer border border-neutral-700"
            >
              <span className="text-red-500">🏍️</span>
              <span>PEDIR TRANSPORTE</span>
            </button>

            <a
              href="https://wa.me/51976387226?text=Hola%20NEGRITO%20DE%20HU%C3%81NUCO%2C%20necesito%20soporte%20y%20asistencia."
              target="_blank"
              rel="noreferrer"
              className="px-5 py-4 bg-black hover:bg-neutral-900 text-white font-extrabold text-xs rounded-2xl border border-red-600/40 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-red-500 fill-red-500" />
              <span>📲 WhatsApp Oficial</span>
            </a>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-neutral-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-red-500" /> Tarifas desde S/ 4.00
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-red-500" /> Llegada en ~10-15 min
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-red-500" /> Flota de Moto y Mototaxi
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-red-500" /> Colores: Negro, Blanco y Rojo
            </span>
          </div>
        </div>
      </div>

      {/* Quick Service Access Grid (6 services including Transporte) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              ¿Qué necesitas hoy en Huánuco?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Elige entre delivery, encomiendas, mandados o transporte de pasajeros.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Service 0: Transporte (NEW) */}
          <button
            type="button"
            onClick={scrollToTransport}
            className="p-4 rounded-2xl bg-amber-50/70 hover:bg-amber-100/70 border-2 border-amber-400 text-left transition-all group shadow-sm flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform shadow-xs">
              🏍️
            </div>
            <div className="mt-3">
              <div className="font-extrabold text-sm text-slate-950 group-hover:text-amber-800 transition-colors flex items-center gap-1">
                <span>Transporte</span>
              </div>
              <div className="text-[11px] text-amber-900 mt-0.5 font-medium">
                Moto o Mototaxi
              </div>
            </div>
          </button>

          {/* Service 1 */}
          <button
            type="button"
            onClick={() => onStartOrder('paquete')}
            className="p-4 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 text-left transition-all group shadow-sm flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              📦
            </div>
            <div className="mt-3">
              <div className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                Enviar paquete
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Cajas y encomiendas
              </div>
            </div>
          </button>

          {/* Service 2 */}
          <button
            type="button"
            onClick={() => onStartOrder('documento')}
            className="p-4 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 text-left transition-all group shadow-sm flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              📄
            </div>
            <div className="mt-3">
              <div className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                Enviar documento
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Sobres y trámites
              </div>
            </div>
          </button>

          {/* Service 3 */}
          <button
            type="button"
            onClick={() => onStartOrder('compra')}
            className="p-4 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 text-left transition-all group shadow-sm flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              🛒
            </div>
            <div className="mt-3">
              <div className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                Hacer compra
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Farmacia y comida
              </div>
            </div>
          </button>

          {/* Service 4 */}
          <button
            type="button"
            onClick={() => onStartOrder('mandado')}
            className="p-4 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 text-left transition-all group shadow-sm flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              🏃
            </div>
            <div className="mt-3">
              <div className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                Hacer mandado
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Llaves y recados
              </div>
            </div>
          </button>

          {/* Service 5 */}
          <button
            type="button"
            onClick={() => onStartOrder('otro')}
            className="p-4 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200 hover:border-amber-400 text-left transition-all group shadow-sm flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
              🚚
            </div>
            <div className="mt-3">
              <div className="font-extrabold text-sm text-slate-900 group-hover:text-amber-700 transition-colors">
                Otro servicio
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Cargas especiales
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* SECCIÓN TRANSPORTE (INTEGRADA) */}
      <TransportSection onFinishOrder={onOpenTracking} />

      {/* Section: ¿Cómo funciona? */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="text-center max-w-md mx-auto mb-6">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">
            Fácil y Rápido
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1">
            ¿Cómo funciona?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tu delivery en Huánuco en 5 sencillos pasos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center relative group hover:bg-amber-50/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-sm mx-auto flex items-center justify-center mb-3 shadow-md">
              1
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Indica dónde recoger</h3>
            <p className="text-xs text-slate-500 mt-1">
              Dirección exacta o punto en el mapa de Huánuco.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center relative group hover:bg-amber-50/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-sm mx-auto flex items-center justify-center mb-3 shadow-md">
              2
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Indica dónde entregar</h3>
            <p className="text-xs text-slate-500 mt-1">
              Destino y referencias claras para la llegada.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center relative group hover:bg-amber-50/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-sm mx-auto flex items-center justify-center mb-3 shadow-md">
              3
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Elige el servicio</h3>
            <p className="text-xs text-slate-500 mt-1">
              Paquete, documento, compras o mandado.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center relative group hover:bg-amber-50/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-sm mx-auto flex items-center justify-center mb-3 shadow-md">
              4
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Confirma tu pedido</h3>
            <p className="text-xs text-slate-500 mt-1">
              Revisa la tarifa y elige Efectivo o Yape.
            </p>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center relative group hover:bg-amber-50/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm mx-auto flex items-center justify-center mb-3 shadow-md">
              5
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">Sigue a tu repartidor</h3>
            <p className="text-xs text-slate-500 mt-1">
              Rastreo en vivo hasta que llegue a tu puerta.
            </p>
          </div>
        </div>
      </div>

      {/* Section: Beneficios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Benefit 1 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Servicio rápido</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Repartidores motorizados en puntos estratégicos de Huánuco para despachos sin demoras.
          </p>
        </div>

        {/* Benefit 2 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Seguimiento del pedido</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Visualiza en tiempo real la ruta del repartidor desde el recojo hasta la entrega final.
          </p>
        </div>

        {/* Benefit 3 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">Repartidores verificados</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Personal con identidad validada por DNI, antecedentes, SOAT vigente y vehículo registrado.
          </p>
        </div>

        {/* Benefit 4 */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">Atención por WhatsApp</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Soporte humano directo para cotizaciones especiales, dudas y asistencia inmediata en Huánuco.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <a
              href="https://wa.me/51976387226?text=Hola%20NEGRITO%20DE%20HU%C3%81NUCO%2C%20necesito%20soporte%20y%20asistencia."
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3 bg-black hover:bg-neutral-900 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors border border-red-600/40"
            >
              <MessageCircle className="w-4 h-4 text-red-500 fill-red-500" />
              <span>📲 SOPORTE WHATSAPP</span>
            </a>
            <div className="text-[10px] text-neutral-400 font-mono text-center mt-1">
              976 387 226 · negritodehuanuco.com
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Zones in Huánuco */}
      <div className="p-6 rounded-3xl bg-black text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-neutral-800">
        <div className="space-y-1 text-center md:text-left">
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">
            Cobertura Oficial Garantizada
          </span>
          <h3 className="text-xl font-extrabold">Zonas de atención activa en Huánuco</h3>
          <p className="text-xs text-neutral-400">
            Huánuco Cercado · Amarilis · Paucarbamba · Pillco Marca · Cayhuayna · Las Moras · La Florida · Huayopampa
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onStartOrder('paquete')}
            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs transition-colors shadow-md shadow-red-600/30"
          >
            Pedir ahora mismo
          </button>
          <button
            type="button"
            onClick={() => setOpenRegistrationModal(true)}
            className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs transition-colors border border-neutral-700"
          >
            Postular como Repartidor
          </button>
        </div>
      </div>
    </div>
  );
};

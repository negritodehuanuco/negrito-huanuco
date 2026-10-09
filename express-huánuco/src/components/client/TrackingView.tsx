import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bike,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Share2,
  Play,
  RotateCcw,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { HuanucoMap } from '../common/HuanucoMap';
import { OffersReceivedView } from './OffersReceivedView';

const TRACKING_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'recibido', label: 'Pedido recibido', desc: 'Buscando el repartidor más cercano en Huánuco' },
  { status: 'asignado', label: 'Repartidor asignado', desc: 'El repartidor aceptó tu solicitud' },
  { status: 'en_recojo', label: 'Yendo al recojo', desc: 'Repartidor en camino al punto de recojo' },
  { status: 'recogido', label: 'Pedido recogido', desc: 'Paquete verificado y en custodia' },
  { status: 'en_camino', label: 'En camino al destino', desc: 'Repartidor en ruta hacia tu dirección' },
  { status: 'en_destino', label: 'Llegó al destino', desc: 'Repartidor en la puerta o dirección indicada' },
  { status: 'entregado', label: 'Entregado con éxito', desc: 'Servicio completado a satisfacción' },
];

export const TrackingView: React.FC<{ orderId: string; onBack: () => void }> = ({
  orderId,
  onBack,
}) => {
  const { orders, updateOrderStatus, setOpenWhatsAppModal, openChatModal } = useApp();
  const order = orders.find((o) => o.id === orderId) || orders[0];

  const currentStepIndex = Math.max(
    0,
    TRACKING_STEPS.findIndex((s) => s.status === order?.status)
  );

  // Simulated moving driver position along route
  const [driverOffset, setDriverOffset] = useState(0.4);

  // Auto-move driver slightly for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverOffset((prev) => (prev > 0.85 ? 0.2 : prev + 0.05));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!order) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
        <h3 className="text-lg font-bold text-slate-800">Pedido no encontrado</h3>
        <p className="text-xs text-slate-500 mt-1">El código no existe en los registros actuales.</p>
        <button
          type="button"
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
        >
          Volver al inicio
        </button>
      </div>
    );
  }

  // Handle advancing status for demo testing
  const handleNextStep = () => {
    if (currentStepIndex < TRACKING_STEPS.length - 1) {
      const nextStatus = TRACKING_STEPS[currentStepIndex + 1].status;
      updateOrderStatus(order.id, nextStatus, nextStatus === 'entregado' ? 'Entregado a cliente en mano' : undefined);
    }
  };

  const handleReset = () => {
    updateOrderStatus(order.id, 'recibido');
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 font-bold text-xs shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </button>

        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Código de Seguimiento
          </div>
          <div className="text-base font-mono font-extrabold text-slate-950">
            {order.id}
          </div>
        </div>
      </div>

      {/* Demo Controls Bar */}
      <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-amber-900 font-semibold">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          <span>Simulador de Seguimiento en Vivo:</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleNextStep}
            disabled={order.status === 'entregado'}
            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
          >
            <Play className="w-3 h-3 fill-slate-950" />
            <span>Avanzar Estado</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs border border-amber-300"
            title="Reiniciar a recibido"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live Map of Huánuco */}
      <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-md">
        <HuanucoMap
          pickup={order.pickup}
          destination={order.destination}
          interactiveMode="tracking"
          heightClass="h-72 sm:h-80"
          driverLocation={
            order.status !== 'recibido'
              ? {
                  lat: order.pickup.lat + (order.destination.lat - order.pickup.lat) * driverOffset,
                  lng: order.pickup.lng + (order.destination.lng - order.pickup.lng) * driverOffset,
                }
              : undefined
          }
        />

        {/* Status Callout Banner */}
        <div className="mt-3 p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Estado Actual
              </div>
              <div className="text-base font-extrabold text-white">
                {TRACKING_STEPS[currentStepIndex]?.label || order.status}
              </div>
              <div className="text-[11px] text-slate-400">
                {TRACKING_STEPS[currentStepIndex]?.desc}
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimado</div>
            <div className="text-sm font-extrabold text-amber-400 font-mono">
              {order.status === 'entregado' ? 'Completado' : `~${order.pricing.estimatedMinutes} min`}
            </div>
          </div>
        </div>
      </div>

      {/* Driver Card (if assigned) OR Offers Received View (if awaiting/negotiating) */}
      {order.driver ? (
        <div className="space-y-3">
          {/* Frozen Price Banner */}
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Lock className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-extrabold text-white block">
                  Precio Congelado: S/ {order.pricing.servicePrice.toFixed(2)}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {order.negotiation?.acceptedOffer
                    ? `Acordado con ${order.negotiation.acceptedOffer.driverName} (${order.negotiation.acceptedOffer.acceptedAt})`
                    : `Tarifa confirmada con ${order.driver.name}`}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Tarifa Fijada
            </span>
          </div>

          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              <img
                src={order.driver.photo}
                alt={order.driver.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-sm shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm">{order.driver.name}</span>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3" /> Verificado
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium mt-0.5">
                  {order.driver.vehicle} · Placa: <span className="font-bold text-slate-900">{order.driver.plate}</span>
                </div>
                <div className="text-xs text-amber-600 font-bold flex items-center gap-1 mt-0.5">
                  <span>⭐ {order.driver.rating}</span>
                  <span className="text-slate-400 font-normal">({order.driver.completedTrips} viajes en Huánuco)</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => openChatModal(order.id, 'client')}
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer relative"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>💬 MENSAJEAR</span>
                {order.chatMessages && order.chatMessages.length > 0 && (
                  <span className="w-2 h-2 rounded-full bg-red-600 absolute -top-1 -right-1" />
                )}
              </button>

              <a
                href={`tel:${order.driver.phone}`}
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <Phone className="w-4 h-4" />
                <span>Llamar</span>
              </a>

              <a
                href={`https://wa.me/51${order.driver.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(
                  `Hola ${order.driver.name}, te escribo por el pedido ${order.id} de NEGRITO DE HUÁNUCO.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      ) : (
        <OffersReceivedView order={order} />
      )}

      {/* Stepper Timeline */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Línea de tiempo del servicio
        </h4>

        <div className="relative pl-6 space-y-5">
          {/* Vertical line indicator */}
          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-200" />

          {TRACKING_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={idx} className="relative flex items-start gap-3">
                {/* Dot */}
                <div
                  className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20 shadow'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? '✓' : idx + 1}
                </div>

                <div className="text-xs">
                  <div className={`font-bold ${isCurrent ? 'text-slate-950 font-extrabold text-sm' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.label}
                  </div>
                  <div className={`text-[11px] ${isCurrent ? 'text-amber-700 font-semibold' : 'text-slate-500'}`}>
                    {step.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details Accordion Box */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Detalles de la entrega
        </h4>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Recojo:</span>
              <span className="text-slate-700">{order.pickup.address}</span>
              <span className="text-slate-500 block text-[11px]">{order.pickup.reference}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900 block">Destino:</span>
              <span className="text-slate-700">{order.destination.address}</span>
              <span className="text-slate-500 block text-[11px]">{order.destination.reference}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center font-mono">
            <span className="text-slate-600">Total a pagar ({order.payment.method.toUpperCase()}):</span>
            <span className="font-extrabold text-slate-900 text-sm">
              S/ {order.pricing.total.toFixed(2)}
            </span>
          </div>

          {order.details.description && (
            <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 text-[11px]">
              <span className="font-bold text-slate-800">Contenido: </span>
              {order.details.description}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Share and Support CTA */}
      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `Sigue el delivery en tiempo real de NEGRITO DE HUÁNUCO (negritodehuanuco.com) código ${order.id}: ${window.location.href}`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex-1 py-3 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm border border-neutral-800"
        >
          <Share2 className="w-4 h-4 text-red-500" />
          <span>Compartir enlace de rastreo</span>
        </a>

        <a
          href="https://wa.me/51976387226?text=Hola%20NEGRITO%20DE%20HU%C3%81NUCO%2C%20necesito%20soporte%20con%20mi%20pedido."
          target="_blank"
          rel="noreferrer"
          className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
          <span>📲 SOPORTE POR WHATSAPP (976 387 226)</span>
        </a>
      </div>
    </div>
  );
};

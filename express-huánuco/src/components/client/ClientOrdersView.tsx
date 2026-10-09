import React from 'react';
import {
  Package,
  Bike,
  Clock,
  MapPin,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowRight,
  PlusCircle,
  Receipt
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';

interface ClientOrdersViewProps {
  viewMode: 'orders' | 'history';
  onStartOrder: () => void;
  onOpenTracking: (orderId: string) => void;
}

export const ClientOrdersView: React.FC<ClientOrdersViewProps> = ({
  viewMode,
  onStartOrder,
  onOpenTracking,
}) => {
  const { orders, currentUser, openChatModal } = useApp();

  // Filter orders for the current user
  const userOrders = orders.filter((o) => {
    if (!currentUser) return true; // show demo orders if not logged in
    return (
      o.customer.phone === currentUser.phone ||
      o.customer.name.toLowerCase().includes(currentUser.name.split(' ')[0].toLowerCase())
    );
  });

  const activeOrders = userOrders.filter(
    (o) => o.status !== 'entregado' && o.status !== 'cancelado'
  );

  const historyOrders = userOrders.filter(
    (o) => o.status === 'entregado' || o.status === 'cancelado'
  );

  const displayList = viewMode === 'orders' ? activeOrders : historyOrders;

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'recibido':
        return { label: 'Buscando Repartidor', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 'asignado':
        return { label: 'Repartidor Asignado', color: 'bg-blue-100 text-blue-900 border-blue-300' };
      case 'en_recojo':
        return { label: 'En camino al recojo', color: 'bg-purple-100 text-purple-900 border-purple-300' };
      case 'recogido':
        return { label: 'Pedido recogido', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
      case 'en_camino':
        return { label: 'En camino a tu destino', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      case 'en_destino':
        return { label: 'Repartidor llegó a tu puerta', color: 'bg-emerald-200 text-emerald-950 border-emerald-400 font-black' };
      case 'entregado':
        return { label: 'Completado y Entregado', color: 'bg-slate-100 text-slate-800 border-slate-300' };
      case 'cancelado':
        return { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-300' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
            {viewMode === 'orders' ? 'Seguimiento de Servicios' : 'Registro Histórico'}
          </span>
          <h2 className="text-2xl font-black text-slate-950 tracking-tight mt-1">
            {viewMode === 'orders' ? 'Mis Pedidos en Curso' : 'Historial de Servicios'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {viewMode === 'orders'
              ? 'Monitorea tus entregas activas, ubicación del repartidor y chat en tiempo real.'
              : 'Detalle de todos los servicios solicitados en Huánuco, recibos y tarifas pagadas.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onStartOrder}
          className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Solicitar Nuevo Servicio</span>
        </button>
      </div>

      {displayList.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            {viewMode === 'orders' ? 'No tienes pedidos activos' : 'No tienes historial registrado'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {viewMode === 'orders'
              ? 'Cuando realices un pedido de delivery, mandado o transporte, aparecerá aquí con seguimiento en vivo.'
              : 'Tus pedidos completados y cancelados se archivarán aquí para tu control.'}
          </p>
          <button
            type="button"
            onClick={onStartOrder}
            className="mt-2 px-6 py-3 bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <span>Pedir Ahora</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayList.map((order) => {
            const badge = getStatusBadge(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-amber-400 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                      #{order.id}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {order.createdAt}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      S/ {order.pricing.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Body details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Punto de Recojo</div>
                        <div className="font-bold text-slate-800">{order.pickup.address}</div>
                        {order.pickup.reference && (
                          <div className="text-[11px] text-slate-500">Ref: {order.pickup.reference}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">Punto de Entrega</div>
                        <div className="font-bold text-slate-800">{order.destination.address}</div>
                        {order.destination.reference && (
                          <div className="text-[11px] text-slate-500">Ref: {order.destination.reference}</div>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600 border border-slate-200/60 mt-1">
                      <span className="font-bold text-slate-900">Detalle:</span> {order.details.description}
                    </div>
                  </div>

                  {/* Driver & Actions column */}
                  <div className="flex flex-col justify-between space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
                    {order.driver ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={order.driver.photo}
                          alt={order.driver.name}
                          className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500 shadow-xs"
                        />
                        <div>
                          <div className="text-[10px] font-bold text-amber-700 uppercase">Repartidor asignado</div>
                          <div className="font-extrabold text-slate-900">{order.driver.name}</div>
                          <div className="text-[11px] text-slate-600">
                            {order.driver.vehicle} · Placa: <span className="font-mono font-bold">{order.driver.plate}</span>
                          </div>
                          <div className="text-[11px] text-amber-600 font-bold">
                            ⭐ {order.driver.rating}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Bike className="w-5 h-5 text-amber-500 animate-pulse" />
                        <div>
                          <div className="font-bold text-slate-800">Buscando repartidor disponible...</div>
                          <div className="text-[11px] text-slate-500">Los repartidores cercanos están revisando tu pedido.</div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200/60">
                      <button
                        type="button"
                        onClick={() => onOpenTracking(order.id)}
                        className="flex-1 min-w-[120px] py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span>Ver Seguimiento</span>
                      </button>

                      {order.driver && order.status !== 'entregado' && order.status !== 'cancelado' && (
                        <button
                          type="button"
                          onClick={() => openChatModal(order.id, 'client')}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Chat</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

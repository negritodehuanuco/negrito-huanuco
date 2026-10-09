import React, { useState } from 'react';
import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  X,
  Sparkles,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DriverOffer, Order } from '../../types';

interface NegotiationOffersViewProps {
  orderId: string;
  onOfferAccepted: (orderId: string) => void;
  onCancelOrder?: () => void;
}

export const NegotiationOffersView: React.FC<NegotiationOffersViewProps> = ({
  orderId,
  onOfferAccepted,
  onCancelOrder,
}) => {
  const { orders, clientAcceptOffer, clientRejectOffer, submitCounterOffer } = useApp();
  const order = orders.find((o) => o.id === orderId);

  const [simulatedEta, setSimulatedEta] = useState(5);

  if (!order || !order.negotiation) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-slate-600 text-sm">No se encontró información de negociación para este pedido.</p>
      </div>
    );
  }

  const { proposedPrice, referencePrice, offers = [], status, acceptedOffer } = order.negotiation;
  const isAgreed = status === 'agreed' || order.status !== 'recibido';

  const handleAccept = (offer: DriverOffer) => {
    clientAcceptOffer(order.id, offer.id);
    onOfferAccepted(order.id);
  };

  const handleReject = (offerId: string) => {
    clientRejectOffer(order.id, offerId);
  };

  const handleSimulateExtraOffer = () => {
    const randomPrice = Math.max(4, proposedPrice + (Math.random() > 0.5 ? 1 : 0.5));
    submitCounterOffer(order.id, randomPrice, 'DRV-102', Math.floor(4 + Math.random() * 5));
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-12">
      {/* Negotiation Header Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Negociación en Vivo · Huánuco
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              OFERTAS RECIBIDAS
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Los conductores cercanos ven tu propuesta y envían sus precios en tiempo real.
            </p>
          </div>

          <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Tu propuesta</span>
            <span className="text-2xl font-black font-mono text-amber-400">
              S/ {proposedPrice.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Referencial: S/ {referencePrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Route Details Strip */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 truncate max-w-md">
            <span className="font-bold text-emerald-400">Origen:</span>
            <span className="truncate">{order.pickup.address}</span>
            <span className="text-slate-500">➔</span>
            <span className="font-bold text-amber-400">Destino:</span>
            <span className="truncate">{order.destination.address}</span>
          </div>

          <div className="text-[11px] text-slate-400 shrink-0">
            {order.details.transportVehicle
              ? `Transporte en ${order.details.transportVehicle === 'moto' ? 'Moto' : 'Mototaxi'}`
              : `Servicio: ${order.serviceType}`}
          </div>
        </div>
      </div>

      {/* Radar waiting status if 0 offers */}
      {offers.length === 0 && !isAgreed && (
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
            <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg">
              <Bike className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-slate-900">
              Esperando ofertas de repartidores y conductores...
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Notificando a unidades disponibles en Huánuco Centro, Amarilis y Pillco Marca con tu propuesta de S/ {proposedPrice.toFixed(2)}.
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="button"
              onClick={handleSimulateExtraOffer}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Simular oferta inmediata de chofer</span>
            </button>
          </div>
        </div>
      )}

      {/* Offers List */}
      {offers.length > 0 && !isAgreed && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wide">
                {offers.length} {offers.length === 1 ? 'oferta recibida' : 'ofertas recibidas'}
              </span>
              <span className="text-[11px] text-slate-500">
                · Elige la opción que prefieras
              </span>
            </div>

            <button
              type="button"
              onClick={handleSimulateExtraOffer}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Nueva oferta</span>
            </button>
          </div>

          <div className="space-y-3">
            {offers.map((offer) => {
              const isExactAccepted = offer.isClientPriceAccepted || offer.offeredPrice === proposedPrice;

              return (
                <div
                  key={offer.id}
                  className={`bg-white rounded-3xl p-5 border-2 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isExactAccepted
                      ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-amber-400'
                  }`}
                >
                  {/* Driver Info */}
                  <div className="flex items-center gap-3.5">
                    <img
                      src={offer.driverPhoto}
                      alt={offer.driverName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-500 shadow-sm shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-950">
                          {offer.driverName}
                        </span>
                        <span className="text-xs text-amber-600 font-bold flex items-center gap-0.5">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{offer.driverRating}</span>
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                        <span>{offer.vehicleType === 'moto' ? '🏍️ Moto' : '🛺 Mototaxi'}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-500 truncate">{offer.vehicleInfo}</span>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Llega aprox. <b>{offer.etaMinutes} min</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Price Banner & Actions */}
                  <div className="w-full sm:w-auto flex flex-col sm:items-end justify-between gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full">
                      {isExactAccepted ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Aceptó tu precio de S/ {proposedPrice.toFixed(2)}</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-extrabold flex items-center gap-1">
                          <span>Contraoferta propuesta</span>
                        </span>
                      )}

                      <div className="text-right">
                        <div className="text-xl sm:text-2xl font-black font-mono text-slate-950">
                          S/ {offer.offeredPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleReject(offer.id)}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-red-600 rounded-xl text-xs font-bold transition-colors"
                        title="Rechazar esta oferta"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAccept(offer)}
                        className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isExactAccepted
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/25'
                        }`}
                      >
                        <span>ACEPTAR S/ {offer.offeredPrice.toFixed(2)}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* If already agreed / price frozen */}
      {isAgreed && acceptedOffer && (
        <div className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-3xl text-center space-y-3 shadow-md">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <div>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">
              Precio Congelado & Asignado
            </span>
            <h3 className="text-xl font-black text-slate-950 mt-1">
              ¡Servicio asignado a {acceptedOffer.driverName}!
            </h3>
            <p className="text-xs text-slate-600 mt-1">
              Precio final pactado: <b className="font-mono text-emerald-700 text-sm">S/ {acceptedOffer.agreedPrice.toFixed(2)}</b> (Hora: {acceptedOffer.acceptedAt}).
            </p>
          </div>

          <button
            type="button"
            onClick={() => onOfferAccepted(order.id)}
            className="mt-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/25"
          >
            Ver Seguimiento en Vivo
          </button>
        </div>
      )}
    </div>
  );
};

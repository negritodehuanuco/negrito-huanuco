import React, { useState } from 'react';
import {
  Bike,
  Star,
  CheckCircle2,
  X,
  Clock,
  MapPin,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  Edit2,
  Check
} from 'lucide-react';
import { DriverOffer, Order } from '../../types';
import { useApp } from '../../context/AppContext';

interface OffersReceivedViewProps {
  order: Order;
  onOfferAccepted?: () => void;
  onCancelOrder?: () => void;
}

export const OffersReceivedView: React.FC<OffersReceivedViewProps> = ({
  order,
  onOfferAccepted,
  onCancelOrder,
}) => {
  const { clientAcceptOffer, clientRejectOffer, updateProposedPrice } = useApp();

  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editedPrice, setEditedPrice] = useState<string>(
    (order.negotiation?.proposedPrice || order.pricing.servicePrice).toFixed(1)
  );

  const proposedPrice = order.negotiation?.proposedPrice || order.pricing.servicePrice;
  const referencePrice = order.negotiation?.referencePrice || order.pricing.referencePrice || order.pricing.servicePrice;
  const offers = order.negotiation?.offers || [];

  // Check if any driver directly accepted client's exact price
  const directAcceptOffer = offers.find((o) => o.isClientPriceAccepted);

  const handleAccept = (offer: DriverOffer) => {
    clientAcceptOffer(order.id, offer.id);
    if (onOfferAccepted) onOfferAccepted();
  };

  const handleReject = (offerId: string) => {
    clientRejectOffer(order.id, offerId);
  };

  const handleSaveEditedPrice = () => {
    const val = parseFloat(editedPrice);
    if (val > 0) {
      updateProposedPrice(order.id, val);
      setIsEditingPrice(false);
    }
  };

  const handleQuickAdd = (increment: number) => {
    const newPrice = Math.round((proposedPrice + increment) * 10) / 10;
    updateProposedPrice(order.id, newPrice);
    setEditedPrice(newPrice.toFixed(1));
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto animate-in fade-in duration-300">
      {/* Negotiation Status Banner */}
      <div className="bg-slate-950 text-white rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Negociación en Vivo · InDrive Style
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            Pedido <span className="text-white font-bold">{order.id}</span>
          </div>
        </div>

        {/* Big Proposed Price Block */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Tu propuesta actual:
            </div>

            {isEditingPrice ? (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold font-mono text-amber-400">S/</span>
                <input
                  type="number"
                  step="0.5"
                  value={editedPrice}
                  onChange={(e) => setEditedPrice(e.target.value)}
                  className="w-24 px-2 py-1 bg-slate-800 border border-amber-500 rounded-lg font-mono text-lg font-black text-white focus:outline-hidden"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleSaveEditedPrice}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                  title="Guardar propuesta"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPrice(false)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                  title="Cancelar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400 tracking-tight">
                  S/ {proposedPrice.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingPrice(true)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold underline underline-offset-2 ml-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Modificar</span>
                </button>
              </div>
            )}

            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span>Precio referencial por distancia:</span>
              <span className="font-mono text-slate-300 font-semibold">
                S/ {referencePrice.toFixed(2)}
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-sans">
                ({order.pricing.distanceKm} km)
              </span>
            </div>
          </div>

          {/* Fast +S/1 quick button to attract drivers */}
          <div className="flex items-center gap-1.5 self-stretch sm:self-center">
            <button
              type="button"
              onClick={() => handleQuickAdd(1)}
              className="flex-1 sm:flex-none px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>+ S/ 1.00</span>
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
            </button>
            <button
              type="button"
              onClick={() => handleQuickAdd(2)}
              className="flex-1 sm:flex-none px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center cursor-pointer"
            >
              <span>+ S/ 2.00</span>
            </button>
          </div>
        </div>

        {/* Route mini pill */}
        <div className="text-xs text-slate-300 flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[150px] font-medium">{order.pickup.address}</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="truncate max-w-[150px] font-medium">{order.destination.address}</span>
          </div>
        </div>
      </div>

      {/* 5. Special Banner if someone accepted the customer's exact price */}
      {directAcceptOffer && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-5 shadow-lg border border-emerald-400/30 space-y-3 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎉</span>
              <span className="font-extrabold text-sm sm:text-base">
                ¡{directAcceptOffer.driverName} aceptó tu precio de S/ {directAcceptOffer.offeredPrice.toFixed(2)}!
              </span>
            </div>
            <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase">
              Precio exacto
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/15 p-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <img
                src={directAcceptOffer.driverPhoto}
                alt={directAcceptOffer.driverName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white/60 shadow-xs"
              />
              <div className="text-xs">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>{directAcceptOffer.driverName}</span>
                  <span className="text-amber-300 font-bold">⭐ {directAcceptOffer.driverRating}</span>
                </div>
                <div className="text-emerald-100 text-[11px] mt-0.5">
                  {directAcceptOffer.vehicleType === 'mototaxi' ? '🛺 Mototaxi' : '🏍️ Moto'} · {directAcceptOffer.vehicleInfo}
                </div>
                <div className="text-[11px] text-emerald-200 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  <span>Llega aprox. en {directAcceptOffer.etaMinutes} min</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleAccept(directAcceptOffer)}
              className="w-full sm:w-auto px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>CONFIRMAR ASIGNACIÓN</span>
            </button>
          </div>
        </div>
      )}

      {/* Screen Title & Counter */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>OFERTAS RECIBIDAS</span>
            {offers.length > 0 && (
              <span className="text-xs font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                {offers.length}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {offers.length === 0
              ? 'Esperando ofertas de nuestros conductores en Huánuco...'
              : 'Compara precios, calificaciones y tiempo de llegada para elegir.'}
          </p>
        </div>

        {offers.length === 0 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span className="font-bold">Buscando...</span>
          </div>
        )}
      </div>

      {/* Waiting Radar Simulation State (if no offers yet) */}
      {offers.length === 0 && (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-amber-500/20 animate-pulse" />
            <div className="relative w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Bike className="w-6 h-6" />
            </div>
          </div>

          <div>
            <h4 className="text-base font-extrabold text-slate-900">
              Esperando ofertas de conductores...
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              Hemos transmitido tu propuesta de <b className="text-slate-900">S/ {proposedPrice.toFixed(2)}</b> a los repartidores motorizados cercanos a tu zona.
            </p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-xs text-slate-600 flex items-center justify-between">
            <span className="text-slate-500">¿Tienes prisa?</span>
            <button
              type="button"
              onClick={() => handleQuickAdd(1)}
              className="text-amber-600 font-bold hover:underline flex items-center gap-1"
            >
              <span>Aumentar S/ 1.00 a tu propuesta</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Lista de Tarjetas de Ofertas Recibidas */}
      {offers.length > 0 && (
        <div className="space-y-3">
          {offers.map((offer) => {
            const isAcceptedPrice = offer.isClientPriceAccepted || offer.offeredPrice === proposedPrice;

            return (
              <div
                key={offer.id}
                className={`bg-white rounded-3xl p-4 sm:p-5 border-2 transition-all shadow-sm flex flex-col justify-between gap-4 ${
                  isAcceptedPrice
                    ? 'border-emerald-500 bg-emerald-50/20 ring-2 ring-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  {/* Left: Driver profile */}
                  <div className="flex items-center gap-3.5">
                    <img
                      src={offer.driverPhoto}
                      alt={offer.driverName}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-200 shadow-sm shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {offer.driverName}
                        </span>
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-0.5">
                          ⭐ {offer.driverRating}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1.5">
                        <span className="text-sm">
                          {offer.vehicleType === 'mototaxi' ? '🛺' : '🏍️'}
                        </span>
                        <span className="capitalize font-bold text-slate-800">
                          {offer.vehicleType === 'mototaxi' ? 'Mototaxi' : 'Moto lineal'}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 truncate max-w-[140px]">
                          {offer.vehicleInfo}
                        </span>
                      </div>

                      <div className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Llega aprox. en <b className="text-slate-800">{offer.etaMinutes} min</b></span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Price offered */}
                  <div className="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex sm:flex-col justify-between items-center sm:items-end">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        {isAcceptedPrice ? 'Precio aceptado' : 'Contraoferta'}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black font-mono text-slate-950">
                        S/ {offer.offeredPrice.toFixed(2)}
                      </span>
                    </div>

                    {!isAcceptedPrice && (
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-0.5">
                        +S/ {(offer.offeredPrice - proposedPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtext description according to prompt */}
                <div className="text-xs px-3 py-2 bg-slate-50 rounded-xl flex items-center justify-between text-slate-600">
                  <span>
                    {isAcceptedPrice ? (
                      <span className="text-emerald-800 font-bold">
                        ✓ {offer.driverName} aceptó tu propuesta de S/ {offer.offeredPrice.toFixed(2)}
                      </span>
                    ) : (
                      <span>
                        El repartidor <b className="text-slate-900">{offer.driverName}</b> te propone <b className="text-slate-900">S/ {offer.offeredPrice.toFixed(2)}</b>
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-slate-400">{offer.createdAt}</span>
                </div>

                {/* Buttons according to prompt:
                    - If counteroffer: [ACEPTAR S/9.00] [RECHAZAR]
                    - If accepted exact: [ACEPTAR S/7.00]
                */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleAccept(offer)}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ACEPTAR S/ {offer.offeredPrice.toFixed(2)}</span>
                  </button>

                  {!isAcceptedPrice && (
                    <button
                      type="button"
                      onClick={() => handleReject(offer.id)}
                      className="px-4 py-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
                      title="Rechazar esta contraoferta"
                    >
                      <span>RECHAZAR</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Notice about Frozen Price */}
      <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-1">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Garantía de Precio Congelado de NEGRITO DE HUÁNUCO:</span>
        </div>
        <p>
          Al aceptar una oferta, el servicio queda formalmente asignado, el precio queda congelado y ninguna otra oferta será admitida. Tu repartidor se pondrá en camino de inmediato.
        </p>
      </div>
    </div>
  );
};

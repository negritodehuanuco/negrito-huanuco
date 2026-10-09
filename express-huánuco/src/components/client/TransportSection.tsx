import React, { useState } from 'react';
import {
  Bike,
  MapPin,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  DollarSign,
  User,
  Phone
} from 'lucide-react';
import { LocationPoint } from '../../types';
import { useApp } from '../../context/AppContext';
import { HUANUCO_LANDMARKS } from '../../data/mockData';
import { HuanucoMap } from '../common/HuanucoMap';

interface TransportSectionProps {
  onFinishOrder: (orderId: string) => void;
}

export const TransportSection: React.FC<TransportSectionProps> = ({ onFinishOrder }) => {
  const { createOrder, commissionConfig, calculateFare } = useApp();

  // Selected vehicle type: Moto or Mototaxi (NO Auto/Taxi)
  const [vehicle, setVehicle] = useState<'moto' | 'mototaxi'>('moto');

  // Locations
  const [pickup, setPickup] = useState<LocationPoint>({
    address: 'Plaza de Armas de Huánuco',
    reference: 'Jr. General Prado, frente a Catedral',
    lat: -9.9306,
    lng: -76.2422,
    district: 'Huánuco Centro',
  });

  const [destination, setDestination] = useState<LocationPoint>({
    address: 'Real Plaza Huánuco',
    reference: 'Puerta Principal - Jr. Independencia',
    lat: -9.9392,
    lng: -76.2365,
    district: 'Huánuco',
  });

  // Passenger Contact
  const [passengerName, setPassengerName] = useState('Maycol Conde');
  const [passengerPhone, setPassengerPhone] = useState('962 451 892');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'yape'>('efectivo');

  // Proposed price for transport bidding
  const [proposedPriceInput, setProposedPriceInput] = useState<string>('');

  // Calculated distance & pricing
  const dist = Math.max(
    1.0,
    Math.round(
      Math.hypot(
        (pickup.lat - destination.lat) * 111,
        (pickup.lng - destination.lng) * 111 * Math.cos(pickup.lat * (Math.PI / 180))
      ) * 10
    ) / 10
  );

  const pricing = calculateFare(dist, 'transporte', 0, vehicle);
  const userProposedPrice = proposedPriceInput !== '' ? parseFloat(proposedPriceInput) : pricing.servicePrice;

  const handleUseMyLocation = (target: 'pickup' | 'dest') => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPt: LocationPoint = {
            address: 'Mi Ubicación Actual (Huánuco GPS)',
            reference: 'Coordenadas del celular',
            lat: Math.round(pos.coords.latitude * 10000) / 10000,
            lng: Math.round(pos.coords.longitude * 10000) / 10000,
            district: 'Huánuco',
          };
          if (target === 'pickup') setPickup(newPt);
          else setDestination(newPt);
        },
        () => {
          const fallback = HUANUCO_LANDMARKS[0];
          if (target === 'pickup') setPickup(fallback);
          else setDestination(fallback);
        }
      );
    }
  };

  const handleRequestTransport = () => {
    const finalServicePrice = userProposedPrice > 0 ? userProposedPrice : pricing.servicePrice;

    const newOrder = createOrder({
      serviceType: 'transporte',
      pickup,
      destination,
      customer: {
        name: passengerName,
        phone: passengerPhone,
      },
      details: {
        description: `Servicio de transporte de pasajeros en ${vehicle === 'moto' ? 'Moto lineal' : 'Mototaxi'}`,
        instructions: `Pasajero esperando en punto de recojo. Vehículo solicitado: ${vehicle === 'moto' ? 'Moto' : 'Mototaxi'}`,
        transportVehicle: vehicle,
      },
      pricing: {
        baseFare: commissionConfig.baseFare,
        distanceKm: dist,
        estimatedMinutes: pricing.estimatedMinutes,
        servicePrice: finalServicePrice,
        referencePrice: pricing.servicePrice,
        proposedPrice: finalServicePrice,
        total: finalServicePrice,
        platformFee: pricing.platformFee,
        driverEarnings: Math.max(0, finalServicePrice - pricing.platformFee),
      },
      negotiation: {
        status: 'bidding',
        proposedPrice: finalServicePrice,
        referencePrice: pricing.servicePrice,
        offers: [],
      },
      payment: {
        method: paymentMethod,
        isVerified: true,
      },
    });

    onFinishOrder(newOrder.id);
  };

  return (
    <div id="seccion-transporte" className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all">
      {/* Header Banner */}
      <div className="bg-black text-white p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-red-600">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-extrabold uppercase">
              Oficial
            </span>
            <span className="text-xs text-red-400 font-mono font-bold uppercase tracking-wider">
              negritodehuanuco.com
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            TRANSPORTE <span className="text-red-600">NEGRITO DE HUÁNUCO</span>
          </h2>
          <p className="text-xs text-neutral-300 mt-0.5">
            Pide tu moto o mototaxi en minutos. Choferes locales verificados y tarifa fija sin sorpresas.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-white bg-neutral-900 border border-neutral-700 px-3 py-1.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-red-500 shrink-0" />
          <span>Conductores verificados</span>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* 1. Selector de Vehículo (Solo Moto o Mototaxi - NO Auto/Taxi) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              1. Elige tu tipo de vehículo
            </label>
            <span className="text-[11px] text-slate-500 font-medium">
              Servicio urbano directo
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opcion Moto */}
            <button
              type="button"
              onClick={() => setVehicle('moto')}
              className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                vehicle === 'moto'
                  ? 'border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                  vehicle === 'moto' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-100'
                }`}>
                  🏍️
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>Moto</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      1 Pasajero
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Rápida, económica y para evitar el tráfico.
                  </div>
                </div>
              </div>

              <div className="text-right pl-2">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Desde</span>
                <span className="text-base font-black text-slate-950 font-mono">S/ 4.00</span>
              </div>
            </button>

            {/* Opcion Mototaxi */}
            <button
              type="button"
              onClick={() => setVehicle('mototaxi')}
              className={`text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                vehicle === 'mototaxi'
                  ? 'border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                  vehicle === 'mototaxi' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-100'
                }`}>
                  🛺
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <span>Mototaxi</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      1 - 2 Pasajeros
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Torito / Bajaj con toldo, mayor espacio y comodidad.
                  </div>
                </div>
              </div>

              <div className="text-right pl-2">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Desde</span>
                <span className="text-base font-black text-slate-950 font-mono">S/ 5.00</span>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Ruta: Punto de Recojo y Destino */}
        <div className="space-y-3">
          <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider block">
            2. Ruta del viaje
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Recojo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Punto de Recojo
                </span>
                <button
                  type="button"
                  onClick={() => handleUseMyLocation('pickup')}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3" /> Usar mi GPS
                </button>
              </div>

              <input
                type="text"
                value={pickup.address}
                onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
                placeholder="¿Dónde te recogemos?"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />

              <input
                type="text"
                value={pickup.reference}
                onChange={(e) => setPickup({ ...pickup, reference: e.target.value })}
                placeholder="Referencia (ej. Portón blanco, frente al parque)"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600"
              />
            </div>

            {/* Destino */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> Destino
                </span>
                <span className="text-[11px] text-slate-400">Huánuco y alrededores</span>
              </div>

              <input
                type="text"
                value={destination.address}
                onChange={(e) => setDestination({ ...destination, address: e.target.value })}
                placeholder="¿A dónde te diriges?"
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500"
              />

              <input
                type="text"
                value={destination.reference}
                onChange={(e) => setDestination({ ...destination, reference: e.target.value })}
                placeholder="Referencia de llegada"
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600"
              />
            </div>
          </div>

          {/* Quick Landmark Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">Destinos frecuentes:</span>
            {HUANUCO_LANDMARKS.slice(0, 5).map((l, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setDestination(l)}
                className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg shrink-0 transition-colors border border-slate-200"
              >
                {l.address.split('-')[0]}
              </button>
            ))}
          </div>

          {/* Map Preview */}
          <HuanucoMap
            pickup={pickup}
            destination={destination}
            heightClass="h-44 sm:h-52"
            interactiveMode="none"
          />
        </div>

        {/* 3. Datos del Pasajero */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Nombre del Pasajero
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={passengerName}
                onChange={(e) => setPassengerName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Teléfono de Contacto
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={passengerPhone}
                onChange={(e) => setPassengerPhone(e.target.value)}
                placeholder="999 999 999"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 4. Negociación InDrive: ¿CUÁNTO ESTÁS DISPUESTO A PAGAR? */}
        <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Negociación InDrive · Precio Libre
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {dist} km · ~{pricing.estimatedMinutes} min
              </span>
            </div>
            <h3 className="text-xl font-black text-white tracking-tight mt-1">
              ¿CUÁNTO ESTÁS DISPUESTO A PAGAR?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Propón un precio y recibe ofertas de nuestros repartidores y choferes en Huánuco.
            </p>
          </div>

          {/* Big Editable Input for Transport */}
          <div className="flex items-center justify-center gap-3 py-2 bg-slate-800/80 rounded-2xl border border-amber-500/40 p-3">
            <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
              S/
            </span>
            <input
              type="number"
              step="0.5"
              min="3"
              value={proposedPriceInput !== '' ? proposedPriceInput : pricing.servicePrice.toFixed(2)}
              onChange={(e) => setProposedPriceInput(e.target.value)}
              placeholder={pricing.servicePrice.toFixed(2)}
              className="w-36 sm:w-44 text-3xl sm:text-4xl font-black font-mono text-white bg-transparent border-b-2 border-amber-500 focus:outline-hidden focus:border-amber-400 text-center tracking-tight"
            />
          </div>

          {/* Quick Adjust Buttons */}
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                const cur = userProposedPrice;
                setProposedPriceInput(Math.max(3, cur - 1).toFixed(1));
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              - S/ 1.00
            </button>
            <button
              type="button"
              onClick={() => setProposedPriceInput(pricing.servicePrice.toFixed(1))}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              Sugerido S/ {pricing.servicePrice.toFixed(1)}
            </button>
            <button
              type="button"
              onClick={() => {
                const cur = userProposedPrice;
                setProposedPriceInput((cur + 1).toFixed(1));
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
            >
              + S/ 1.00
            </button>
          </div>

          {/* Discreet Reference Price vs Proposal */}
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/80 text-xs space-y-1">
            <div className="flex justify-between items-center text-slate-400">
              <span>Precio referencial ({vehicle === 'moto' ? 'Moto' : 'Mototaxi'}):</span>
              <span className="font-mono font-bold text-slate-300">
                S/ {pricing.servicePrice.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center text-amber-300 font-bold">
              <span>Tu propuesta:</span>
              <span className="font-mono text-base text-amber-400">
                S/ {userProposedPrice.toFixed(2)}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-700/60 text-center">
              El precio referencial por {dist} km es solo una guía para ayudarte. Tú propones lo que deseas pagar.
            </div>
          </div>

          {/* Payment Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <div className="text-xs text-slate-400 font-medium">Método de pago al conductor:</div>
            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPaymentMethod('efectivo')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  paymentMethod === 'efectivo'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                💵 Efectivo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('yape')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  paymentMethod === 'yape'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                📱 Yape
              </button>
            </div>
          </div>
        </div>

        {/* 5. Botón Principal SOLICITAR TRANSPORTE CON ESTE PRECIO */}
        <button
          type="button"
          onClick={handleRequestTransport}
          className="w-full py-4 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-black text-base rounded-2xl shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <span>SOLICITAR TRANSPORTE CON S/ {userProposedPrice.toFixed(2)}</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};

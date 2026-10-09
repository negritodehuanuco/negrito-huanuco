import React, { useState } from 'react';
import {
  Bike,
  User,
  Shield,
  Package,
  ShoppingCart,
  FileText,
  Clock,
  CheckCircle2,
  MapPin,
  TrendingUp,
  DollarSign,
  Phone,
  MessageCircle,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Maximize2,
  Eye,
  Columns3,
  Layers,
  ChevronRight,
  AlertCircle,
  Zap,
  Truck,
  Check,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ServiceType, Order } from '../../types';
import { HuanucoMap } from './HuanucoMap';

interface UnifiedThreeViewsProps {
  onNavigateSection?: (section: 'cliente' | 'repartidor' | 'admin') => void;
}

export const UnifiedThreeViews: React.FC<UnifiedThreeViewsProps> = ({ onNavigateSection }) => {
  const {
    orders,
    drivers,
    currentUser,
    commissionConfig,
    activeClientOrderId,
    setActiveClientOrderId,
    createOrder,
    acceptOrderAsDriver,
    updateOrderStatus,
    openChatModal,
    wallet,
    driverOnline,
    setDriverOnline,
    navigateTo,
  } = useApp();

  // Mode: 'all' (3 side by side) | 'client' | 'driver' | 'admin'
  const [activeLayout, setActiveLayout] = useState<'all' | 'client' | 'driver' | 'admin'>('all');

  // Simulated quick order form for the client
  const [selectedService, setSelectedService] = useState<ServiceType>('paquete');
  const [pickupAddr, setPickupAddr] = useState('Jr. Dos de Mayo 850, Huánuco Centro');
  const [destAddr, setDestAddr] = useState('Plaza Mayor de Amarilis, Paucarbamba');
  const [orderDesc, setOrderDesc] = useState('Caja con útiles de escritorio y documentos');
  const [orderPrice, setOrderPrice] = useState<number>(10.0);
  const [orderCreatedSuccess, setOrderCreatedSuccess] = useState(false);

  // Quick counter offer for drivers
  const [activeDriverTab, setActiveDriverTab] = useState<'disponibles' | 'activo' | 'ganancias'>('disponibles');

  // Percentage calculations
  const platformRate = commissionConfig.percentageValue || 20; // 20%
  const calculatedFee = Math.round((orderPrice * (platformRate / 100)) * 10) / 10;
  const calculatedDriverEarn = Math.max(0, orderPrice - calculatedFee);

  // Active / in-progress orders
  const inProgressOrders = orders.filter((o) => o.status !== 'entregado' && o.status !== 'cancelado');
  const activeOrder = orders.find((o) => o.id === activeClientOrderId) || orders[0];

  // Drivers daily metrics for the owner (Dueño)
  const driversDailyStats = [
    {
      id: 'DRV-101',
      name: 'Carlos Mendoza Rojas',
      phone: '962 458 912',
      vehicle: 'Moto Honda GLH 150',
      plate: '8492-7W',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      ordersToday: 8,
      revenueToday: 88.0,
      commission20: 17.6,
      netEarn80: 70.4,
      status: 'En ruta',
      statusColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      id: 'DRV-102',
      name: 'Javier Albornoz Peña',
      phone: '974 125 369',
      vehicle: 'Moto Bajaj Pulsar 125',
      plate: '5120-2U',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      ordersToday: 6,
      revenueToday: 64.0,
      commission20: 12.8,
      netEarn80: 51.2,
      status: 'Disponible',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'DRV-103',
      name: 'Maycol Conde Figueroa',
      phone: '983 741 852',
      vehicle: 'Moto Honda Wave 110',
      plate: '3941-8X',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      ordersToday: 5,
      revenueToday: 52.0,
      commission20: 10.4,
      netEarn80: 41.6,
      status: 'Disponible',
      statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      id: 'DRV-104',
      name: 'Juan Quispe Morales',
      phone: '962 119 832',
      vehicle: 'Mototaxi Torito Bajaj RE',
      plate: '6401-3W',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      ordersToday: 4,
      revenueToday: 46.0,
      commission20: 9.2,
      netEarn80: 36.8,
      status: 'En ruta',
      statusColor: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  const totalOrdersToday = driversDailyStats.reduce((acc, d) => acc + d.ordersToday, 0);
  const totalRevenueToday = driversDailyStats.reduce((acc, d) => acc + d.revenueToday, 0);
  const totalCommission20 = driversDailyStats.reduce((acc, d) => acc + d.commission20, 0);

  // Quick order submission handler
  const handleCreateQuickOrder = () => {
    const newOrderId = `HX-${Math.floor(1000 + Math.random() * 9000)}`;
    const fee = Math.round((orderPrice * 0.2) * 10) / 10;
    const newOrder: Order = {
      id: newOrderId,
      createdAt: 'Hace un momento',
      status: 'recibido',
      serviceType: selectedService,
      pickup: {
        address: pickupAddr,
        reference: 'Centro de Huánuco',
        district: 'Huánuco Centro',
        lat: -9.9312,
        lng: -76.2418,
      },
      destination: {
        address: destAddr,
        reference: 'Llegada Huánuco',
        district: 'Amarilis',
        lat: -9.9442,
        lng: -76.2335,
      },
      customer: {
        name: currentUser?.name || 'Cliente Huánuco',
        phone: currentUser?.phone || '962 451 892',
      },
      details: {
        description: orderDesc,
      },
      pricing: {
        baseFare: 6.0,
        distanceKm: 3.5,
        estimatedMinutes: 15,
        servicePrice: orderPrice,
        total: orderPrice,
        platformFee: fee, // 20%
        driverEarnings: orderPrice - fee, // 80%
      },
      payment: {
        method: 'yape',
        isVerified: true,
      },
    };

    createOrder(newOrder);
    setActiveClientOrderId(newOrderId);
    setOrderCreatedSuccess(true);
    setTimeout(() => setOrderCreatedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================================= */}
      {/* TOP BAR: MODO VISUALIZACIÓN DE LAS 3 SECCIONES JUNTAS */}
      {/* ========================================================================= */}
      <div className="bg-black rounded-3xl p-5 sm:p-6 text-white border-2 border-red-600/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full shadow-xs">
                Visualización Simultánea 3-en-1
              </span>
              <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 border border-red-600/40 px-2 py-0.5 rounded-md">
                negritodehuanuco.com
              </span>
              <span className="text-xs font-extrabold text-white bg-neutral-900 border border-neutral-700 px-2 py-0.5 rounded-md">
                Comisión 20% en todo servicio
              </span>
              <span className="text-xs text-neutral-400">
                Huánuco · Amarilis · Pillco Marca
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Las 3 Secciones de</span>
              <span className="text-red-600">NEGRITO DE HUÁNUCO</span>
              <span>Juntas</span>
            </h1>
            <p className="text-xs text-neutral-300 max-w-2xl leading-relaxed">
              Visualiza en tiempo real cómo interactúan las tres partes clave de la empresa: el <b>Cliente</b> que solicita el servicio, el <b>Repartidor / Trabajador</b> que realiza el viaje y gana el 80% neto, y el <b>Dueño</b> que supervisa el total de pedidos del día, cada persona a cargo y retiene el 20% de comisión oficial.
            </p>
          </div>

          {/* Quick Layout Selectors */}
          <div className="flex flex-wrap items-center gap-1.5 bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800 shrink-0">
            <button
              type="button"
              onClick={() => setActiveLayout('all')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeLayout === 'all'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Columns3 className="w-4 h-4" />
              <span>Ver las 3 Juntas</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayout('client')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeLayout === 'client'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>1. Cliente</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayout('driver')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeLayout === 'driver'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>2. Repartidor</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayout('admin')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeLayout === 'admin'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-neutral-300 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>3. Dueño / HQ</span>
            </button>
          </div>
        </div>

        {/* Global Highlight Banner for 20% Commission */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-neutral-300">
              Regla de negocio unificada: <b>20% de comisión fija</b> para cualquier solicitud.
            </span>
            <span className="font-mono text-white bg-red-950/80 px-2 py-0.5 rounded border border-red-600/40">
              Ejemplo: Pedido S/ 10.00 → Repartidor gana S/ 8.00 (80%) · Negrito de Huánuco retiene S/ 2.00 (20%)
            </span>
          </div>

          <div className="text-[11px] text-neutral-400">
            Total recaudado hoy: <b className="text-white font-mono">S/ {totalRevenueToday.toFixed(2)}</b> (Comisión empresa: <b className="text-red-400 font-mono">S/ {totalCommission20.toFixed(2)}</b>)
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3 COLUMNS / PANORAMIC GRID: CLIENTE | REPARTIDOR | DUEÑO */}
      {/* ========================================================================= */}
      <div
        className={`grid gap-6 items-start ${
          activeLayout === 'all'
            ? 'grid-cols-1 lg:grid-cols-3'
            : 'grid-cols-1 max-w-3xl mx-auto'
        }`}
      >
        {/* ===================================================================== */}
        {/* COLUMNA 1: CLIENTE */}
        {/* ===================================================================== */}
        {(activeLayout === 'all' || activeLayout === 'client') && (
          <div className="bg-white rounded-3xl border-2 border-neutral-200 hover:border-red-500 transition-all shadow-md overflow-hidden flex flex-col space-y-4">
            {/* Header Columna 1 */}
            <div className="bg-black text-white p-4 flex items-center justify-between border-b-2 border-red-600">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-xs">
                  <User className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider bg-neutral-900 text-red-400 px-1.5 py-0.5 rounded inline-block border border-red-600/30">
                    SECCIÓN 1
                  </div>
                  <h2 className="text-base font-black leading-tight text-white">
                    CLIENTE
                  </h2>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white text-black px-2 py-1 rounded-lg">
                Pide y sigue pedidos
              </span>
            </div>

            <div className="p-4 pt-0 space-y-4">
              {/* Formulario rápido para simular pedido del cliente */}
              <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-neutral-800 tracking-wider">
                    Solicitar un Servicio
                  </span>
                  <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    Tarifa Huánuco
                  </span>
                </div>

                {/* Service selector */}
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService('paquete');
                      setOrderPrice(10.0);
                      setOrderDesc('Caja con repostería artesanal');
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedService === 'paquete'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <Package className="w-4 h-4 mx-auto mb-0.5" />
                    <span className="text-[10px] block">Paquete</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService('compra');
                      setOrderPrice(12.0);
                      setOrderDesc('Comprar medicinas en Mifarma');
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedService === 'compra'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4 mx-auto mb-0.5" />
                    <span className="text-[10px] block">Compras</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService('documento');
                      setOrderPrice(9.0);
                      setOrderDesc('Documentos notariales sellados');
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedService === 'documento'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <FileText className="w-4 h-4 mx-auto mb-0.5" />
                    <span className="text-[10px] block">Trámites</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedService('transporte');
                      setOrderPrice(8.0);
                      setOrderDesc('Viaje rápido en moto a Amarilis');
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedService === 'transporte'
                        ? 'bg-red-600 text-white border-red-600 shadow-xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    <Bike className="w-4 h-4 mx-auto mb-0.5" />
                    <span className="text-[10px] block">Moto</span>
                  </button>
                </div>

                {/* Input description */}
                <div className="space-y-1.5 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-600 block">Detalle del pedido:</label>
                    <input
                      type="text"
                      value={orderDesc}
                      onChange={(e) => setOrderDesc(e.target.value)}
                      className="w-full p-2 bg-white border border-neutral-300 rounded-xl text-xs font-medium focus:border-red-500 focus:outline-hidden"
                      placeholder="Ej: Entrega de torta o documentos..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-neutral-600 block">Recojo:</label>
                      <input
                        type="text"
                        value={pickupAddr}
                        onChange={(e) => setPickupAddr(e.target.value)}
                        className="w-full p-1.5 bg-white border border-neutral-300 rounded-xl text-[11px] focus:border-red-500 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-neutral-600 block">Entrega:</label>
                      <input
                        type="text"
                        value={destAddr}
                        onChange={(e) => setDestAddr(e.target.value)}
                        className="w-full p-1.5 bg-white border border-neutral-300 rounded-xl text-[11px] focus:border-red-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Fare & Commission Breakdown */}
                <div className="bg-red-50/80 p-2.5 rounded-xl border border-red-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-red-900 font-bold uppercase">
                      Total a Pagar (Cliente)
                    </div>
                    <div className="text-lg font-black text-black font-mono">
                      S/ {orderPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-neutral-700">
                    <div>Repartidor: <b className="text-emerald-700 font-mono">S/ {calculatedDriverEarn.toFixed(2)} (80%)</b></div>
                    <div>Comisión: <b className="text-red-700 font-mono">S/ {calculatedFee.toFixed(2)} (20%)</b></div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateQuickOrder}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-black text-xs rounded-xl shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Solicitar Pedido Ahora</span>
                </button>

                {orderCreatedSuccess && (
                  <div className="p-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-pulse">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>¡Pedido generado y visible para repartidores!</span>
                  </div>
                )}
              </div>

              {/* Estado del pedido actual del cliente */}
              <div className="p-3.5 bg-white rounded-2xl border border-neutral-200 shadow-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase text-neutral-800 tracking-wider">
                    Seguimiento en Vivo (Cliente)
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-900 px-1.5 py-0.5 rounded border border-neutral-200">
                    {activeOrder.id}
                  </span>
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-extrabold text-black line-clamp-1">
                    {activeOrder.details.description}
                  </div>
                  <div className="text-[11px] text-neutral-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-red-600" />
                    <span className="truncate">{activeOrder.destination.address}</span>
                  </div>
                </div>

                {/* Driver card */}
                {activeOrder.driver ? (
                  <div className="p-2 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={activeOrder.driver.photo}
                        alt={activeOrder.driver.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-red-600"
                      />
                      <div>
                        <div className="font-bold text-black">{activeOrder.driver.name}</div>
                        <div className="text-[10px] text-neutral-600">{activeOrder.driver.vehicle} · {activeOrder.driver.plate}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openChatModal(activeOrder.id, 'driver')}
                      className="p-1.5 bg-black text-white hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Chatear con repartidor"
                    >
                      <MessageCircle className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <div className="p-2 bg-red-50 rounded-xl border border-red-200 text-red-900 text-xs font-bold text-center">
                    ⏳ Buscando repartidor de Negrito de Huánuco...
                  </div>
                )}

                {/* Progress bar */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[10px] text-neutral-600 font-semibold mb-1">
                    <span>Solicitado</span>
                    <span className="text-red-600 font-bold">En camino</span>
                    <span>Entregado</span>
                  </div>
                  <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-red-600 ${
                        activeOrder.status === 'entregado'
                          ? 'w-full'
                          : activeOrder.status === 'en_camino'
                          ? 'w-2/3'
                          : activeOrder.status === 'en_recojo'
                          ? 'w-1/3'
                          : 'w-1/4'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* COLUMNA 2: REPARTIDOR O TRABAJADOR */}
        {/* ===================================================================== */}
        {(activeLayout === 'all' || activeLayout === 'driver') && (
          <div className="bg-white rounded-3xl border-2 border-neutral-200 hover:border-neutral-900 transition-all shadow-md overflow-hidden flex flex-col space-y-4">
            {/* Header Columna 2 */}
            <div className="bg-neutral-950 text-white p-4 flex items-center justify-between border-b-2 border-neutral-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black border border-red-600/50 text-red-500 flex items-center justify-center font-black shadow-xs">
                  <Bike className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider bg-black text-red-400 px-1.5 py-0.5 rounded inline-block border border-red-600/30">
                    SECCIÓN 2
                  </div>
                  <h2 className="text-base font-black leading-tight text-white">
                    REPARTIDOR / TRABAJADOR
                  </h2>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDriverOnline(!driverOnline)}
                className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  driverOnline
                    ? 'bg-red-600 text-white'
                    : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${driverOnline ? 'bg-white animate-ping' : 'bg-neutral-400'}`} />
                <span>{driverOnline ? 'EN LÍNEA' : 'OFFLINE'}</span>
              </button>
            </div>

            <div className="p-4 pt-0 space-y-4">
              {/* Tarjeta de Ganancia y Comisión del 20% */}
              <div className="bg-black text-white p-3.5 rounded-2xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    Billetera & Comisiones
                  </span>
                  <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded">
                    Retención: 20%
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-black text-white font-mono">
                      S/ {wallet.balance.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      Ganancias acumuladas (80% neto para ti)
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-neutral-300">
                    <div>Comisión abonada: <b className="text-red-400 font-mono">20%</b></div>
                    <div className="text-[10px] text-neutral-400">Automático por pedido</div>
                  </div>
                </div>
              </div>

              {/* Sub-tabs for driver */}
              <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveDriverTab('disponibles')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    activeDriverTab === 'disponibles'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  Disponibles ({orders.filter((o) => o.status === 'recibido').length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDriverTab('activo')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                    activeDriverTab === 'activo'
                      ? 'bg-black text-white shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  En Ruta
                </button>
              </div>

              {/* Pedidos disponibles para tomar */}
              {activeDriverTab === 'disponibles' && (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-extrabold text-neutral-600 uppercase tracking-wider">
                    Nuevas Solicitudes en Huánuco
                  </div>

                  {orders.filter((o) => o.status === 'recibido').slice(0, 2).map((ord) => {
                    const price = ord.pricing.total;
                    const fee20 = Math.round((price * 0.2) * 10) / 10;
                    const earn80 = Math.max(0, price - fee20);

                    return (
                      <div
                        key={ord.id}
                        className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 hover:border-red-500 transition-all space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-black text-black bg-white px-2 py-0.5 rounded border border-neutral-200">
                            {ord.id}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                            {ord.serviceType}
                          </span>
                        </div>

                        <div className="font-extrabold text-neutral-900 line-clamp-1">
                          {ord.details.description}
                        </div>

                        <div className="text-[11px] text-neutral-600 space-y-0.5">
                          <div className="truncate">📍 <b className="text-black">De:</b> {ord.pickup.address}</div>
                          <div className="truncate">🎯 <b className="text-black">A:</b> {ord.destination.address}</div>
                        </div>

                        {/* Ganancia del 80% y Comisión del 20% */}
                        <div className="bg-white p-2 rounded-xl border border-neutral-200 flex items-center justify-between">
                          <div>
                            <div className="text-[10px] text-neutral-500 font-bold uppercase">Tu Pago Neto (80%)</div>
                            <div className="text-base font-black text-black font-mono">
                              S/ {earn80.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-neutral-500 font-bold uppercase">Comisión Empresa (20%)</div>
                            <div className="text-xs font-bold text-red-600 font-mono">
                              - S/ {fee20.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => acceptOrderAsDriver(ord.id)}
                          className="w-full py-2 bg-black hover:bg-neutral-900 active:bg-neutral-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-red-600/40"
                        >
                          <Check className="w-4 h-4 stroke-[3] text-red-500" />
                          <span>Aceptar Pedido (Ganas S/ {earn80.toFixed(2)})</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pedido activo en curso del repartidor */}
              {activeDriverTab === 'activo' && (
                <div className="p-3 bg-red-50/70 rounded-2xl border border-red-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-red-900 uppercase">
                      Servicio en Marcha
                    </span>
                    <span className="font-mono text-[10px] font-bold bg-red-200/80 text-red-900 px-1.5 py-0.5 rounded">
                      {activeOrder.id}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="font-extrabold text-black">{activeOrder.details.description}</div>
                    <div className="text-[11px] text-neutral-700">Cliente: <b>{activeOrder.customer.name}</b> (📞 {activeOrder.customer.phone})</div>
                    <div className="text-[11px] text-neutral-700">Entrega: <b>{activeOrder.destination.address}</b></div>
                  </div>

                  {/* Acciones de estado del repartidor */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(activeOrder.id, 'en_camino')}
                      className="py-2 bg-neutral-900 hover:bg-black text-white font-bold text-[11px] rounded-xl transition-colors cursor-pointer text-center"
                    >
                      En Camino
                    </button>
                    <button
                      type="button"
                      onClick={() => updateOrderStatus(activeOrder.id, 'entregado')}
                      className="py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Entregar (Cobrar)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* COLUMNA 3: DUEÑO / PERSONA A CARGO DE TODO (ADMINISTRADOR) */}
        {/* ===================================================================== */}
        {(activeLayout === 'all' || activeLayout === 'admin') && (
          <div className="bg-white rounded-3xl border-2 border-neutral-200 hover:border-red-600 transition-all shadow-md overflow-hidden flex flex-col space-y-4">
            {/* Header Columna 3 */}
            <div className="bg-red-600 text-white p-4 flex items-center justify-between border-b-2 border-red-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black shadow-xs">
                  <Shield className="w-5 h-5 stroke-[2.5] text-red-500" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider bg-black/40 text-white px-1.5 py-0.5 rounded inline-block">
                    SECCIÓN 3
                  </div>
                  <h2 className="text-base font-black leading-tight text-white">
                    DUEÑO / PERSONA A CARGO
                  </h2>
                </div>
              </div>
              <span className="text-[10px] font-black bg-black text-white px-2 py-1 rounded-lg">
                Gerencia Central
              </span>
            </div>

            <div className="p-4 pt-0 space-y-4">
              {/* KPIs de Control Diario */}
              <div className="bg-black text-white p-3.5 rounded-2xl border border-neutral-800 space-y-2.5">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-red-400 flex items-center justify-between">
                  <span>Resumen Global de Hoy · Huánuco</span>
                  <span className="text-[10px] font-mono text-neutral-400">negritodehuanuco.com</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 font-bold uppercase">Pedidos Hoy</div>
                    <div className="text-xl font-black text-white font-mono mt-0.5">
                      {totalOrdersToday}
                    </div>
                  </div>

                  <div className="p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 font-bold uppercase">Recaudado</div>
                    <div className="text-xs font-black text-white font-mono mt-1">
                      S/ {totalRevenueToday.toFixed(0)}
                    </div>
                  </div>

                  <div className="p-2 bg-red-950/80 rounded-xl border border-red-600/50">
                    <div className="text-[10px] text-red-300 font-bold uppercase">Comisión 20%</div>
                    <div className="text-xs font-black text-white font-mono mt-1">
                      S/ {totalCommission20.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* CUÁNTOS PEDIDOS HIZO CADA PERSONA (REPARTIDOR) HOY */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-neutral-800 uppercase tracking-wider">
                    ¿Cuántos pedidos hizo cada persona hoy?
                  </span>
                  <span className="text-[10px] font-bold text-neutral-500">
                    4 conductores
                  </span>
                </div>

                <div className="space-y-2">
                  {driversDailyStats.map((drv) => (
                    <div
                      key={drv.id}
                      className="p-2.5 bg-neutral-50 rounded-2xl border border-neutral-200 hover:border-red-500 transition-all text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={drv.photo}
                          alt={drv.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-red-600 shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-black leading-tight">
                            {drv.name}
                          </div>
                          <div className="text-[10px] text-neutral-500">
                            {drv.vehicle} · {drv.plate}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-black font-mono">
                          {drv.ordersToday} pedidos
                        </div>
                        <div className="text-[10px] text-red-600 font-bold">
                          Comisión 20%: S/ {drv.commission20.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SERVICIOS DEL DÍA Y QUIÉN LO SOLICITÓ */}
              <div className="space-y-2 pt-1 border-t border-neutral-100">
                <div className="text-[11px] font-extrabold text-neutral-800 uppercase tracking-wider">
                  Servicios y Personas en el Día
                </div>

                <div className="space-y-2">
                  {orders.slice(0, 3).map((ord) => (
                    <div
                      key={ord.id}
                      className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-black bg-white px-1.5 py-0.5 rounded border border-neutral-200 text-[10px]">
                          {ord.id}
                        </span>
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded uppercase">
                          {ord.serviceType}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-neutral-900 line-clamp-1">
                        {ord.details.description}
                      </div>
                      <div className="text-[10px] text-neutral-600 flex items-center justify-between">
                        <span>Cliente: <b>{ord.customer.name}</b></span>
                        <span className="font-mono font-bold text-red-600">Comisión 20%: S/ {(ord.pricing.total * 0.2).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón de acceso a panel administrativo completo */}
              <button
                type="button"
                onClick={() => navigateTo('/administracion')}
                className="w-full py-2.5 bg-black hover:bg-neutral-900 active:bg-neutral-800 text-white font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-red-600/40"
              >
                <Shield className="w-4 h-4 text-red-500" />
                <span>Abrir Consola Administrativa Completa (/administración)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

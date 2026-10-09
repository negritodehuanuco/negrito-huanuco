import React, { useState } from 'react';
import {
  Bike,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  ChevronRight,
  Power,
  Package,
  FileText,
  ShoppingCart,
  Zap,
  Truck,
  AlertCircle,
  Navigation,
  Camera,
  Home,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, DriverInfo } from '../../types';
import { HuanucoMap } from '../common/HuanucoMap';

type DriverTab = 'inicio' | 'disponibles' | 'activo' | 'ganancias' | 'historial' | 'perfil';

export const DriverPanel: React.FC = () => {
  const {
    orders,
    drivers,
    activeDriverId,
    driverOnline,
    setDriverOnline,
    acceptOrderAsDriver,
    acceptProposedPriceAsDriver,
    submitCounterOffer,
    ignoreOrderAsDriver,
    updateOrderStatus,
    wallet,
    requestWithdrawal,
    openChatModal,
  } = useApp();

  const [activeTab, setActiveTab] = useState<DriverTab>('inicio');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('30.00');
  const [withdrawPhone, setWithdrawPhone] = useState('962 458 912');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  // Counteroffer state per order
  const [counterInputs, setCounterInputs] = useState<{ [orderId: string]: string }>({});
  const [openCounterFor, setOpenCounterFor] = useState<{ [orderId: string]: boolean }>({});
  const [counterSentNotice, setCounterSentNotice] = useState<{ [orderId: string]: boolean }>({});
  const [acceptedNotice, setAcceptedNotice] = useState<{ [orderId: string]: boolean }>({});

  const [shareGps, setShareGps] = useState(true);
  const { logout, navigateTo, currentUser } = useApp();

  const currentDriver: DriverInfo = drivers.find((d) => d.id === currentUser?.driverProfileId || d.id === activeDriverId) || {
    id: currentUser?.driverProfileId || (currentUser?.id ? `DRV-${currentUser.id}` : 'DRV-101'),
    name: currentUser?.name || 'Repartidor',
    phone: currentUser?.phone || '976 387 226',
    photo: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    vehicle: currentUser?.vehicleInfo ? `${currentUser.vehicleInfo.brand} ${currentUser.vehicleInfo.model} (${currentUser.vehicleInfo.type})` : 'Moto Honda',
    plate: currentUser?.vehicleInfo?.plate || '8492-7W',
    rating: 5.0,
    completedTrips: 0,
    lat: -9.9306,
    lng: -76.2422,
    status: 'disponible',
  };

  // Orders available for drivers to take: status === 'recibido' AND not ignored by this driver
  const availableOrders = orders.filter(
    (o) =>
      o.status === 'recibido' &&
      !o.driver &&
      (!o.ignoredByDrivers || !o.ignoredByDrivers.includes(currentDriver.id)) &&
      (o.payment.method !== 'yape_anticipado' || o.payment.isVerified)
  );

  // Active order currently taken by this driver
  const activeOrder = orders.find(
    (o) =>
      o.driver?.id === currentDriver.id &&
      o.status !== 'entregado' &&
      o.status !== 'cancelado'
  );

  // Completed orders by this driver
  const completedOrders = orders.filter(
    (o) => o.driver?.id === currentDriver.id && o.status === 'entregado'
  );

  // Ganancias netas del repartidor (80% del servicio)
  const driverNetEarnings = completedOrders.reduce(
    (sum, o) =>
      sum +
      (o.pricing?.driverEarnings ||
        o.payment?.driverEarnings ||
        Math.round((o.pricing?.servicePrice || o.payment?.servicePrice || 0) * 0.8 * 10) / 10),
    0
  );

  const handleAccept = (orderId: string) => {
    acceptOrderAsDriver(orderId, currentDriver.id);
    setActiveTab('activo');
  };

  const handleAdvanceActiveOrder = () => {
    if (!activeOrder) return;
    if (activeOrder.status === 'asignado') {
      updateOrderStatus(activeOrder.id, 'en_recojo');
    } else if (activeOrder.status === 'en_recojo') {
      updateOrderStatus(activeOrder.id, 'recogido');
    } else if (activeOrder.status === 'recogido') {
      updateOrderStatus(activeOrder.id, 'en_camino');
    } else if (activeOrder.status === 'en_camino') {
      updateOrderStatus(activeOrder.id, 'en_destino');
    } else if (activeOrder.status === 'en_destino') {
      updateOrderStatus(
        activeOrder.id,
        'entregado',
        deliveryNote || 'Entregado al cliente con conformidad.'
      );
      setDeliveryNote('');
      setActiveTab('ganancias');
    }
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(withdrawAmount);
    if (val > 0 && val <= wallet.balance) {
      requestWithdrawal(val, `Yape (${withdrawPhone})`);
      setWithdrawSuccess(true);
      setTimeout(() => {
        setWithdrawSuccess(false);
        setShowWithdrawModal(false);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top Driver Header Profile Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img
            src={currentDriver.photo}
            alt={currentDriver.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-red-600 shadow-md shrink-0"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold text-white">{currentDriver.name}</h2>
              <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
                Repartidor
              </span>
              <span className="text-[10px] font-mono text-neutral-300 bg-black/60 px-2 py-0.5 rounded border border-neutral-700">
                /repartidor
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {currentDriver.vehicle} · Placa: <span className="font-mono text-white">{currentDriver.plate}</span>
            </div>
            <div className="text-xs text-amber-400 font-bold flex items-center gap-1 mt-0.5">
              <span>⭐ {currentDriver.rating}</span>
              <span className="text-slate-400 font-normal">({currentDriver.completedTrips} viajes en Huánuco)</span>
            </div>
          </div>
        </div>

        {/* Online / Offline Switch, GPS & Client site button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800">
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-neutral-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            title="Ir al sitio público de clientes"
          >
            ← Web Clientes
          </button>

          {/* GPS Toggle */}
          <button
            type="button"
            onClick={() => setShareGps(!shareGps)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              shareGps
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${shareGps ? 'animate-pulse text-emerald-400' : ''}`} />
            <span>{shareGps ? 'GPS Compartido (En vivo)' : 'GPS Pausado'}</span>
          </button>

          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Estado</div>
            <div className={`text-xs font-bold ${driverOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
              {driverOnline ? 'Conectado' : 'Desconectado'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDriverOnline(!driverOnline)}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
              driverOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{driverOnline ? 'Online' : 'Offline'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigateTo('/repartidor');
            }}
            className="px-3 py-2 rounded-xl font-bold text-xs bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 border border-slate-700 transition-colors cursor-pointer"
            title="Cerrar sesión de repartidor"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Driver Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('inicio')}
          className={`flex-1 min-w-[90px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'inicio'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Home className="w-3.5 h-3.5" />
          <span>Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disponibles')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'disponibles'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Pedidos disponibles</span>
          {availableOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {availableOrders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activo')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'activo'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Servicio activo</span>
          {activeOrder && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historial')}
          className={`flex-1 min-w-[95px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'historial'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Historial</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ganancias')}
          className={`flex-1 min-w-[100px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'ganancias'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Ganancias</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('perfil')}
          className={`flex-1 min-w-[85px] py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'perfil'
              ? 'bg-white text-slate-950 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>Perfil</span>
        </button>

        <button
          type="button"
          onClick={() => {
            logout();
          }}
          className="flex-1 min-w-[105px] py-2.5 px-3 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* ================= TAB 0: INICIO (PANEL PRINCIPAL DEL REPARTIDOR) ================= */}
      {activeTab === 'inicio' && (
        <div className="space-y-6">
          {/* Welcome & Online status card */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 rounded-3xl p-6 text-white border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30">
                <span className={`w-2 h-2 rounded-full ${driverOnline ? 'bg-emerald-400 animate-ping' : 'bg-slate-400'}`} />
                <span>{driverOnline ? 'En línea · Recibiendo solicitudes en tiempo real' : 'Desconectado · Activa tu estado para recibir pedidos'}</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                ¡Hola de nuevo, <span className="text-amber-400">{currentDriver.name.split(' ')[0]}</span>!
              </h2>
              <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                Vehículo compatible: <b className="text-white">{currentDriver.vehicle}</b> (Placa <span className="font-mono text-amber-300">{currentDriver.plate}</span>).
                Tu cuenta está activa y verificada para atender pedidos en Huánuco, Amarilis y Pillco Marca.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('disponibles')}
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Ver Pedidos ({availableOrders.length})</span>
                <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ganancias')}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>Billetera: S/ {wallet.balance.toFixed(2)}</span>
              </button>
            </div>
          </div>

          {/* Active order alert if exists */}
          {activeOrder && (
            <div className="bg-amber-500 text-slate-950 p-5 rounded-3xl shadow-lg border-2 border-amber-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-black shrink-0">
                  <Bike className="w-6 h-6 animate-bounce" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-white px-2 py-0.5 rounded-md">
                    Servicio Activo Asignado
                  </span>
                  <div className="text-base font-black mt-0.5">
                    Pedido #{activeOrder.id} · Estado: <span className="underline uppercase">{activeOrder.status.replace('_', ' ')}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-900 truncate max-w-md">
                    Entregar en: {activeOrder.destination.address}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('activo')}
                className="w-full sm:w-auto px-5 py-3 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <span>Gestionar Servicio Activo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Saldo en Billetera
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                S/ {wallet.balance.toFixed(2)}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                Disponible para retiro
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Pedidos Disponibles
              </div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {availableOrders.length}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Compatibles con tu vehículo
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Viajes Completados
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {completedOrders.length + currentDriver.completedTrips}
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Calificación: ⭐ {currentDriver.rating}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Tu Comisión Actual
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {currentDriver.commissionRate || 20}%
              </div>
              <div className="text-[11px] text-slate-500 font-semibold mt-0.5">
                Retención de plataforma
              </div>
            </div>
          </div>

          {/* Quick Access Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('disponibles')}
              className="bg-white hover:bg-amber-50/50 p-5 rounded-3xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer group shadow-xs space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                Pedidos Disponibles
              </div>
              <p className="text-xs text-slate-500">
                Revisa pedidos en tiempo real, acepta tarifas de clientes o envía contraofertas.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('historial')}
              className="bg-white hover:bg-slate-50 p-5 rounded-3xl border border-slate-200 hover:border-slate-400 transition-all cursor-pointer group shadow-xs space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                Historial de Servicios
              </div>
              <p className="text-xs text-slate-500">
                Consulta tus viajes anteriores realizados en Huánuco, montos cobrados y fechas.
              </p>
            </div>

            <div
              onClick={() => setActiveTab('perfil')}
              className="bg-white hover:bg-slate-50 p-5 rounded-3xl border border-slate-200 hover:border-slate-400 transition-all cursor-pointer group shadow-xs space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                Mi Perfil y Vehículo
              </div>
              <p className="text-xs text-slate-500">
                Verifica tus datos de conductor, documentos, SOAT y ficha técnica del vehículo.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 1: PEDIDOS DISPONIBLES ================= */}
      {activeTab === 'disponibles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-950 tracking-tight">
                Pedidos en Huánuco para aceptar
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                El primer repartidor que acepte el pedido se lo adjudica de inmediato.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
              {availableOrders.length} pedido{availableOrders.length === 1 ? '' : 's'} en espera
            </span>
          </div>

          {!driverOnline && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
              <div className="text-xs text-amber-900">
                <span className="font-bold">Estás desconectado.</span> Conéctate arriba a la derecha para poder aceptar pedidos y recibir notificaciones.
              </div>
            </div>
          )}

          {availableOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <div className="text-base font-bold text-slate-800">No hay pedidos disponibles en este momento</div>
              <div className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Los nuevos pedidos realizados por los clientes de Huánuco aparecerán aquí automáticamente.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Order Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold bg-slate-900 text-amber-400 px-2 py-0.5 rounded-md">
                          {order.id}
                        </span>
                        <span className="text-[11px] font-bold text-slate-500 capitalize">
                          {order.serviceType}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Tu Ganancia</span>
                        <span className="text-lg font-mono font-black text-emerald-600">
                          S/ {order.pricing.driverEarnings.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Route Details */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          A
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-slate-500 block text-[10px]">Origen / Recojo:</span>
                          <span className="font-bold text-slate-900">{order.pickup.address}</span>
                          <div className="text-[11px] text-slate-500 truncate">{order.pickup.reference}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          B
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-slate-500 block text-[10px]">Destino:</span>
                          <span className="font-bold text-slate-900">{order.destination.address}</span>
                          <div className="text-[11px] text-slate-500 truncate">{order.destination.reference}</div>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Client Proposed Price Banner */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-bold uppercase">
                          Precio propuesto por el cliente:
                        </span>
                        <span className="text-base font-black font-mono text-amber-600">
                          S/ {(order.negotiation?.proposedPrice || order.pricing.servicePrice).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Distancia: <b>{order.pricing.distanceKm} km</b> · ~<b>{order.pricing.estimatedMinutes} min</b></span>
                        <span>Referencial: S/ {(order.negotiation?.referencePrice || order.pricing.servicePrice).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Service Info */}
                    {order.details.description && (
                      <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200/60">
                        <span className="font-bold text-slate-800">Detalles: </span>
                        <span>{order.details.description}</span>
                        {order.details.transportVehicle && (
                          <span className="block text-[11px] font-bold text-amber-800 mt-0.5">
                            Vehículo solicitado: {order.details.transportVehicle === 'moto' ? '🏍️ Moto lineal' : '🛺 Mototaxi'}
                          </span>
                        )}
                      </div>
                    )}

                    {order.serviceType === 'compra' && (
                      <div className="p-2 bg-amber-50 text-amber-900 text-[11px] rounded-lg border border-amber-200">
                        <span className="font-bold">Compra en:</span> {order.details.storeName} · Monto productos: S/ {(order.details.estimatedItemCost || 0).toFixed(2)}
                      </div>
                    )}

                    {/* Accepted Notice Feedback */}
                    {acceptedNotice[order.id] && (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>¡Aceptaste S/ {(order.negotiation?.proposedPrice || order.pricing.servicePrice).toFixed(2)}! El cliente puede confirmar tu asignación.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            acceptOrderAsDriver(order.id, currentDriver.id);
                            setActiveTab('activo');
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shrink-0"
                        >
                          Asignar de inmediato
                        </button>
                      </div>
                    )}

                    {/* Counteroffer Sent Feedback */}
                    {counterSentNotice[order.id] && (
                      <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Contraoferta enviada al cliente. Esperando su decisión...</span>
                      </div>
                    )}

                    {/* Inline Counteroffer Input Box */}
                    {openCounterFor[order.id] && !counterSentNotice[order.id] && (
                      <div className="p-3 bg-slate-900 text-white rounded-2xl space-y-2.5 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                          <span>Tu contraoferta para este pedido:</span>
                          <button
                            type="button"
                            onClick={() => setOpenCounterFor({ ...openCounterFor, [order.id]: false })}
                            className="text-slate-400 hover:text-white"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold font-mono text-amber-400">S/</span>
                          <input
                            type="number"
                            step="0.5"
                            value={
                              counterInputs[order.id] ??
                              ((order.negotiation?.proposedPrice || order.pricing.servicePrice) + 1.5).toFixed(1)
                            }
                            onChange={(e) =>
                              setCounterInputs({ ...counterInputs, [order.id]: e.target.value })
                            }
                            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl font-mono text-sm font-bold text-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        {/* Quick increment buttons */}
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-slate-400 font-semibold">Sugerido:</span>
                          {[1, 2, 3].map((inc) => {
                            const val = (order.negotiation?.proposedPrice || order.pricing.servicePrice) + inc;
                            return (
                              <button
                                key={inc}
                                type="button"
                                onClick={() =>
                                  setCounterInputs({ ...counterInputs, [order.id]: val.toFixed(1) })
                                }
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded font-mono font-bold"
                              >
                                +S/{inc}.00
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const proposed = order.negotiation?.proposedPrice || order.pricing.servicePrice;
                            const amt = parseFloat(counterInputs[order.id] || (proposed + 1.5).toString());
                            if (amt > 0) {
                              submitCounterOffer(order.id, amt, currentDriver.id);
                              setCounterSentNotice({ ...counterSentNotice, [order.id]: true });
                            }
                          }}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors"
                        >
                          ENVIAR CONTRAOFERTA
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 3 Actions: ACEPTAR (Verde), HACER CONTRAOFERTA (Naranja), IGNORAR (Rojo) */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      {/* 🟢 ACEPTAR */}
                      <button
                        type="button"
                        disabled={!driverOnline || !!activeOrder}
                        onClick={() => {
                          acceptProposedPriceAsDriver(order.id, currentDriver.id);
                          setAcceptedNotice({ ...acceptedNotice, [order.id]: true });
                        }}
                        className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span>ACEPTAR S/ {(order.negotiation?.proposedPrice || order.pricing.servicePrice).toFixed(2)}</span>
                      </button>

                      {/* 🟠 HACER CONTRAOFERTA */}
                      <button
                        type="button"
                        disabled={!driverOnline || !!activeOrder}
                        onClick={() => {
                          const currentVal = counterInputs[order.id] || ((order.negotiation?.proposedPrice || order.pricing.servicePrice) + 1.5).toFixed(1);
                          setCounterInputs({ ...counterInputs, [order.id]: currentVal });
                          setOpenCounterFor({ ...openCounterFor, [order.id]: !openCounterFor[order.id] });
                        }}
                        className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>HACER CONTRAOFERTA</span>
                      </button>
                    </div>

                    {/* 🔴 IGNORAR */}
                    <button
                      type="button"
                      onClick={() => ignoreOrderAsDriver(order.id, currentDriver.id)}
                      className="w-full py-1.5 text-center text-xs text-slate-400 hover:text-red-600 font-bold transition-colors"
                    >
                      ✕ Ignorar esta solicitud
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: PEDIDO ACTIVO ================= */}
      {activeTab === 'activo' && (
        <div className="space-y-4">
          {!activeOrder ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <Bike className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <div className="text-base font-bold text-slate-800">No tienes un pedido activo en curso</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Ve a la pestaña de "Disponibles" para aceptar tu próximo viaje en Huánuco.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('disponibles')}
                className="mt-4 px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
              >
                Ver pedidos disponibles
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header of Active Order */}
              <div className="bg-slate-950 text-white rounded-3xl p-5 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded">
                      {activeOrder.id}
                    </span>
                    <span className="text-xs text-amber-400 font-bold capitalize">
                      {activeOrder.serviceType}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Ganancia Neta</span>
                    <span className="text-lg font-mono font-black text-amber-400 block">
                      S/ {activeOrder.pricing.driverEarnings.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Stepper Status Bar */}
                <div className="p-3 bg-slate-900 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Estado del despacho</span>
                    <span className="text-sm font-extrabold text-white capitalize">
                      {activeOrder.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Cobrar al cliente</span>
                    <span className="text-sm font-extrabold text-white">
                      {activeOrder.payment.method === 'efectivo'
                        ? `S/ ${activeOrder.pricing.total.toFixed(2)} (Efectivo)`
                        : 'Pagado por Yape ✓'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Map of Active Route */}
              <div className="bg-white rounded-3xl p-3 border border-slate-200 shadow-sm">
                <HuanucoMap
                  pickup={activeOrder.pickup}
                  destination={activeOrder.destination}
                  interactiveMode="tracking"
                  heightClass="h-64 sm:h-72"
                  driverLocation={{
                    lat: activeOrder.pickup.lat + (activeOrder.destination.lat - activeOrder.pickup.lat) * 0.5,
                    lng: activeOrder.pickup.lng + (activeOrder.destination.lng - activeOrder.pickup.lng) * 0.5,
                  }}
                />
              </div>

              {/* Customer Contact & Pickup/Delivery Details */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Cliente</span>
                    <div className="font-extrabold text-sm text-slate-900">{activeOrder.customer.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{activeOrder.customer.phone}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openChatModal(activeOrder.id, 'driver')}
                      className="p-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 fill-slate-950" />
                      <span>💬 MENSAJEAR</span>
                    </button>

                    <a
                      href={`tel:${activeOrder.customer.phone}`}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Llamar</span>
                    </a>
                    <a
                      href={`https://wa.me/51${activeOrder.customer.phone.replace(/\s+/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-emerald-800 font-bold mb-1">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Paso 1: Punto de Recojo</span>
                    </div>
                    <div className="font-bold text-slate-900">{activeOrder.pickup.address}</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">{activeOrder.pickup.reference}</div>
                  </div>

                  <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-2xl">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold mb-1">
                      <MapPin className="w-4 h-4 text-amber-600" />
                      <span>Paso 2: Punto de Entrega</span>
                    </div>
                    <div className="font-bold text-slate-900">{activeOrder.destination.address}</div>
                    <div className="text-slate-600 text-[11px] mt-0.5">{activeOrder.destination.reference}</div>
                  </div>
                </div>

                {activeOrder.status === 'en_destino' && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      Constancia o nota de entrega:
                    </label>
                    <input
                      type="text"
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="Ej. Recibido por el portero Juan, conforme."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                )}

                {/* Primary Action Button according to current state & Cancel Option */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAdvanceActiveOrder}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {activeOrder.status === 'asignado' && 'LLEGUÉ AL PUNTO DE RECOJO'}
                    {activeOrder.status === 'en_recojo' && 'CONFIRMAR RECOGIDA DEL PAQUETE'}
                    {activeOrder.status === 'recogido' && 'INICIAR RUTA HACIA EL DESTINO'}
                    {activeOrder.status === 'en_camino' && 'LLEGUÉ AL DESTINO (EN LA PUERTA)'}
                    {activeOrder.status === 'en_destino' && 'CONFIRMAR ENTREGA FINAL Y COBRAR'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      updateOrderStatus(activeOrder.id, 'cancelado', 'Cancelado por el conductor.');
                      setActiveTab('disponibles');
                    }}
                    className="px-4 py-3 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-700 font-bold text-xs rounded-2xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: GANANCIAS & BILLETERA ================= */}
      {activeTab === 'ganancias' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-950 tracking-tight">
                Mis Ganancias & Billetera
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Balance disponible para retiro inmediato a tu cuenta Yape en Huánuco.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
            >
              <ArrowDownLeft className="w-4 h-4 text-amber-400" />
              <span>Solicitar Retiro</span>
            </button>
          </div>

          {/* Wallet Card Hero */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Saldo Disponible
            </div>
            <div className="text-4xl font-mono font-black text-white mt-1">
              S/ {wallet.balance.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Retiro instantáneo vía Yape sin comisiones ocultas
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Hoy</div>
                <div className="font-extrabold text-white text-base font-mono">S/ 48.00</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Esta Semana</div>
                <div className="font-extrabold text-white text-base font-mono">S/ 245.00</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Mes Actual</div>
                <div className="font-extrabold text-white text-base font-mono">S/ 1,120.00</div>
              </div>
              <div>
                <div className="text-slate-400 text-[10px] uppercase font-bold">Viajes Hechos</div>
                <div className="font-extrabold text-amber-400 text-base font-mono">38 viajes</div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Historial de movimientos
            </h4>

            <div className="divide-y divide-slate-100">
              {wallet.transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        tx.amount > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {tx.amount > 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{tx.title}</div>
                      <div className="text-slate-400 text-[11px]">{tx.date} · {tx.id}</div>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span
                      className={`font-black text-sm ${
                        tx.amount > 0 ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.amount > 0 ? `+S/ ${tx.amount.toFixed(2)}` : `-S/ ${Math.abs(tx.amount).toFixed(2)}`}
                    </span>
                    <span className="text-[10px] text-slate-400 block capitalize">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: HISTORIAL ================= */}
      {activeTab === 'historial' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-black text-slate-950 tracking-tight">
              Historial de viajes completados
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro histórico de entregas exitosas en Huánuco.
            </p>
          </div>

          <div className="space-y-3">
            {completedOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                Aún no has completado pedidos en esta sesión demo. Acepta y completa uno para verlo registrado aquí.
              </div>
            ) : (
              completedOrders.map((ord) => (
                <div key={ord.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{ord.id}</span>
                      <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded text-[10px]">
                        Entregado
                      </span>
                    </div>
                    <div className="text-slate-600 mt-1">
                      {ord.pickup.address} ➔ {ord.destination.address}
                    </div>
                    {ord.deliveryProof && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Nota: {ord.deliveryProof.note} ({ord.deliveryProof.timestamp})
                      </div>
                    )}
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-extrabold text-emerald-600 text-sm block">
                      +S/ {ord.pricing.driverEarnings.toFixed(2)}
                    </span>
                    <span className="text-slate-400 text-[10px]">{ord.createdAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 5: PERFIL ================= */}
      {activeTab === 'perfil' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xl font-black text-slate-950 tracking-tight">
            Ficha del Repartidor
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold">Nombre y Apellidos</span>
              <span className="font-bold text-slate-900 text-sm">{currentDriver.name}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold">Teléfono Celular</span>
              <span className="font-bold text-slate-900 text-sm">{currentDriver.phone}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold">Vehículo Registrado</span>
              <span className="font-bold text-slate-900 text-sm">{currentDriver.vehicle}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold">Placa de Rodaje</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{currentDriver.plate}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold">Documentos y SOAT</span>
              <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-4 h-4" /> Aprobado y Vigente
              </span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-slate-500 block font-semibold">Zona Habitual</span>
              <span className="font-bold text-slate-900">Huánuco Centro / Amarilis / Pillco Marca</span>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-base text-slate-950">Solicitar Retiro a Yape</div>
              <button
                type="button"
                onClick={() => setShowWithdrawModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="p-4 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <div className="font-extrabold text-slate-900">¡Retiro Procesado!</div>
                <div className="text-xs text-slate-500">Se abonaron S/ {withdrawAmount} a tu número Yape.</div>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Monto a retirar (Saldo: S/ {wallet.balance.toFixed(2)})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    max={wallet.balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Número de Yape destino
                  </label>
                  <input
                    type="tel"
                    value={withdrawPhone}
                    onChange={(e) => setWithdrawPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors"
                >
                  CONFIRMAR RETIRO INMEDIATO
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

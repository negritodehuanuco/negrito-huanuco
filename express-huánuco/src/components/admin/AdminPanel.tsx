import React, { useState } from 'react';
import {
  Shield,
  LayoutDashboard,
  Package,
  Map,
  Users,
  Percent,
  CreditCard,
  Settings,
  CheckCircle2,
  XCircle,
  Eye,
  AlertTriangle,
  Clock,
  Bike,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Check,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Power,
  RotateCcw,
  Sparkles,
  ArrowRight,
  X,
  ShoppingCart,
  Zap,
  FileText,
  Truck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DriverInfo, DriverStatusState, Order, OrderStatus } from '../../types';
import { HuanucoMap } from '../common/HuanucoMap';

type AdminTab =
  | 'dashboard'
  | 'pedidos'
  | 'repartidores'
  | 'clientes'
  | 'finanzas'
  | 'configuracion'
  | 'auditoria'
  | 'mapa';

export const AdminPanel: React.FC = () => {
  const {
    orders,
    drivers,
    applications,
    clients,
    commissionConfig,
    updateCommissionConfig,
    updateOrderStatus,
    verifyYapePayment,
    updateApplicationStatus,
    updateDriverAdminStatus,
    updateDriverCommissionRate,
    wallet,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [orderFilter, setOrderFilter] = useState<string>('todos');
  const [driverFilter, setDriverFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected modals
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState<Order | null>(null);
  const [selectedDriverDetail, setSelectedDriverDetail] = useState<DriverInfo | null>(null);

  // KPIs
  const todayOrdersCount = orders.length + 18;
  const activeOrders = orders.filter((o) => o.status !== 'entregado' && o.status !== 'cancelado');
  const completedOrders = orders.filter((o) => o.status === 'entregado');
  const pendingOrders = orders.filter((o) => o.status === 'recibido');
  const cancelledOrders = orders.filter((o) => o.status === 'cancelado');

  const totalRevenue = orders.reduce((acc, o) => acc + o.pricing.total, 1420);
  const totalCommissions = orders.reduce((acc, o) => acc + o.pricing.platformFee, 284);
  const driverEarningsTotal = Math.max(0, totalRevenue - totalCommissions);
  const pendingPayments = orders.filter((o) => o.payment.method === 'yape_anticipado' && !o.payment.isVerified);
  const pendingApplications = applications.filter((a) => a.status === 'PENDIENTE');

  // Repartidores KPI metrics
  const activeDriversCount = drivers.filter((d) => d.status !== 'desconectado').length;
  const totalDriversRegistered = drivers.length + applications.length;

  // Simulation commission state
  const [simOrderPrice, setSimOrderPrice] = useState(25);
  const simCommission =
    commissionConfig.type === 'percentage'
      ? Math.round(simOrderPrice * (commissionConfig.percentageValue / 100) * 10) / 10
      : commissionConfig.fixedValue;
  const simDriverEarn = Math.max(0, simOrderPrice - simCommission);

  // Order Filters
  const filteredOrders = orders.filter((o) => {
    let matchesFilter = true;
    if (orderFilter === 'pendientes') matchesFilter = o.status === 'recibido' && !o.driver;
    else if (orderFilter === 'disponibles') matchesFilter = o.status === 'recibido';
    else if (orderFilter === 'en_curso') matchesFilter = o.status !== 'entregado' && o.status !== 'cancelado' && o.status !== 'recibido';
    else if (orderFilter === 'completados') matchesFilter = o.status === 'entregado';
    else if (orderFilter === 'cancelados') matchesFilter = o.status === 'cancelado';
    else if (orderFilter === 'pendientes_pago') matchesFilter = o.payment.method === 'yape_anticipado' && !o.payment.isVerified;

    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.pickup.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.destination.address.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Header & Context Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">
              Panel de Administración
            </h1>
            <span className="text-[10px] font-black bg-black text-red-500 border border-red-600/40 px-2 py-0.5 rounded uppercase tracking-wider">
              NEGRITO DE HUÁNUCO HQ
            </span>
            <span className="text-[10px] font-mono font-bold bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded border border-neutral-300">
              /administracion
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión completa de pedidos, repartidores, clientes, finanzas y configuración de la plataforma en Huánuco.
          </p>
        </div>

        {/* Quick notification pill */}
        {pendingPayments.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('pedidos');
              setOrderFilter('pendientes_pago');
            }}
            className="px-3 py-1.5 bg-purple-50 border border-purple-300 text-purple-800 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-purple-100 transition-colors shadow-xs cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            <span>{pendingPayments.length} pago(s) Yape por verificar</span>
          </button>
        )}
      </div>

      {/* Main Admin Navigation Tabs (6 Sections Required + Mapa) */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('pedidos')}
          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'pedidos' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Pedidos</span>
          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] flex items-center justify-center font-bold">
            {orders.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('repartidores')}
          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'repartidores' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Repartidores</span>
          {pendingApplications.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
              {pendingApplications.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('clientes')}
          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'clientes' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Clientes ({clients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('finanzas')}
          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'finanzas' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Finanzas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('configuracion')}
          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'configuracion' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configuración</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('auditoria')}
          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'auditoria' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Auditoría</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mapa')}
          className={`py-2.5 px-3.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'mapa' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Mapa en Vivo</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB: DASHBOARD (ALL 10 MANDATORY KPIS DISPLAYED) */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Persona a Cargo de Todo - Identidad de Administración */}
          <div className="bg-black text-white p-6 sm:p-7 rounded-3xl border-2 border-red-600 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center font-black shadow-lg shadow-red-600/40 shrink-0">
                <Shield className="w-9 h-9 stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2.5 py-0.5 rounded-full">
                    Persona a Cargo de Todo
                  </span>
                  <span className="text-[11px] font-bold text-red-400">Propietario / Gerencia Central</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentUser?.name || 'Administración General (Propietario)'}
                </h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-300">
                  <span className="font-mono text-red-400 font-semibold">✉ {currentUser?.email || 'admin@negritodehuanuco.com'}</span>
                  <span>📞 Supervisión: <b>976 387 226</b></span>
                  <span>🌐 <b>negritodehuanuco.com</b></span>
                  <span>📍 Huánuco, Amarilis y Pillco Marca</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shrink-0 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Estado del Panel</div>
                <div className="font-bold text-emerald-400">Supervisión en Tiempo Real Activa</div>
              </div>
            </div>
          </div>

          {/* ¿Cuántos pedidos se hicieron hoy en el día? */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                  Registro del Día · Huánuco
                </span>
                <h3 className="text-lg font-black text-slate-950 mt-1">
                  ¿Cuántos pedidos se hicieron hoy en el día?
                </h3>
                <p className="text-xs text-slate-500">
                  Balance consolidado de servicios solicitados en Huánuco, Amarilis y Pillco Marca durante la jornada.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-950 font-mono">
                  {todayOrdersCount} pedidos
                </span>
                <span className="text-xs text-white font-bold bg-black px-2.5 py-1 rounded-lg border border-red-600">
                  100% operativos
                </span>
              </div>
            </div>

            {/* Desglose por tipo de servicio */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 bg-slate-50 hover:bg-red-50/50 transition-colors rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
                  <Package className="w-4 h-4 text-red-600" />
                  <span>Delivery Paquete</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {orders.filter(o => o.serviceType === 'paquete').length + 8}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Repostería, cajas, ropa</div>
              </div>

              <div className="p-3.5 bg-slate-50 hover:bg-emerald-50/50 transition-colors rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
                  <ShoppingCart className="w-4 h-4 text-emerald-600" />
                  <span>Mandados/Compras</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {orders.filter(o => o.serviceType === 'compra' || o.serviceType === 'mandado').length + 6}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Farmacias, comida, flores</div>
              </div>

              <div className="p-3.5 bg-slate-50 hover:bg-blue-50/50 transition-colors rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Mensajería/Docs</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {orders.filter(o => o.serviceType === 'documento').length + 4}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Notarías, UNHEVAL, bancos</div>
              </div>

              <div className="p-3.5 bg-slate-50 hover:bg-purple-50/50 transition-colors rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
                  <Bike className="w-4 h-4 text-purple-600" />
                  <span>Transporte Moto</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {orders.filter(o => o.serviceType === 'transporte' && o.details?.transportVehicle === 'moto').length + 4}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Viajes rápidos en 2 ruedas</div>
              </div>

              <div className="p-3.5 bg-slate-50 hover:bg-red-50/50 transition-colors rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
                  <Truck className="w-4 h-4 text-red-600" />
                  <span>Transporte Mototaxi</span>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">
                  {orders.filter(o => o.serviceType === 'transporte' && o.details?.transportVehicle === 'mototaxi').length + 2}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Toritos con maletas/carga</div>
              </div>
            </div>
          </div>

          {/* 10 KPIs Grid */}
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
              Métricas Operativas & Financieras en Tiempo Real
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* 1. Pedidos de hoy */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">1. Pedidos de Hoy</div>
                <div className="text-2xl font-black text-slate-950 mt-1 font-mono">{todayOrdersCount}</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">+14% vs ayer</div>
              </div>

              {/* 2. Servicios activos */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">2. Servicios Activos</div>
                <div className="text-2xl font-black text-red-600 mt-1 font-mono">{activeOrders.length}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">En tránsito en Huánuco</div>
              </div>

              {/* 3. Servicios completados */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">3. Completados</div>
                <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">{completedOrders.length + 14}</div>
                <div className="text-[10px] text-emerald-600 font-bold mt-0.5">100% de entrega</div>
              </div>

              {/* 4. Clientes registrados */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">4. Clientes Reg.</div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{clients.length}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Usuarios frecuentes</div>
              </div>

              {/* 5. Repartidores registrados */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">5. Repartidores Totales</div>
                <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{totalDriversRegistered}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Flota registrada</div>
              </div>

              {/* 6. Repartidores pendientes */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">6. Rep. Pendientes</div>
                <div className="text-2xl font-black text-red-600 mt-1 font-mono">{pendingApplications.length}</div>
                <div className="text-[10px] text-red-700 font-bold mt-0.5">Por revisar</div>
              </div>

              {/* 7. Repartidores activos */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">7. Rep. Conectados</div>
                <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">{activeDriversCount}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Con GPS activo</div>
              </div>

              {/* 8. Ingresos */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">8. Ingresos Totales</div>
                <div className="text-xl font-black text-slate-950 mt-1 font-mono">S/ {totalRevenue.toFixed(0)}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Volumen procesado</div>
              </div>

              {/* 9. Comisiones */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[10px] text-slate-500 font-bold uppercase">9. Comisiones ({commissionConfig.percentageValue || 20}%)</div>
                <div className="text-xl font-black text-emerald-600 mt-1 font-mono">S/ {totalCommissions.toFixed(1)}</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Retenido en billetera (20%)</div>
              </div>

              {/* 10. Ganancias de la plataforma */}
              <div className="p-4 bg-black text-white rounded-2xl shadow-sm border border-neutral-800">
                <div className="text-[10px] text-red-400 font-bold uppercase">10. Ganancia Plataforma</div>
                <div className="text-xl font-black text-red-500 mt-1 font-mono">S/ {totalCommissions.toFixed(1)}</div>
                <div className="text-[10px] text-neutral-400 mt-0.5">Margen neto NEGRITO DE HUÁNUCO</div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts & Radar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Radar GPS en Vivo · Huánuco, Amarilis & Pillco Marca
                  </h3>
                  <p className="text-xs text-slate-500">
                    Supervisión satelital de conductores y pedidos en tiempo real.
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  ● En directo
                </span>
              </div>
              <HuanucoMap heightClass="h-64" interactiveMode="tracking" />
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Acciones Rápidas
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Operaciones inmediatas de gestión
                </p>

                <div className="space-y-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('repartidores');
                      setDriverFilter('pendientes');
                    }}
                    className="w-full p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-950 rounded-xl text-xs font-bold flex items-center justify-between border border-amber-200 transition-colors cursor-pointer"
                  >
                    <span>Revisar {pendingApplications.length} Solicitud(es) Repartidor</span>
                    <ChevronRight className="w-4 h-4 text-amber-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('pedidos');
                      setOrderFilter('pendientes_pago');
                    }}
                    className="w-full p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-950 rounded-xl text-xs font-bold flex items-center justify-between border border-purple-200 transition-colors cursor-pointer"
                  >
                    <span>Verificar {pendingPayments.length} Pago(s) Yape</span>
                    <ChevronRight className="w-4 h-4 text-purple-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('finanzas')}
                    className="w-full p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-between border border-slate-200 transition-colors cursor-pointer"
                  >
                    <span>Ver Resumen de Finanzas y Billetera</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
                Huánuco Centro · Central Operativa 24/7
              </div>
            </div>
          </div>

          {/* ¿Cuántos pedidos hizo cada persona (repartidor) hoy y recaudación del 20%? */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                  Rendimiento Individual · Persona a Cargo
                </span>
                <h3 className="text-lg font-black text-slate-950 mt-1">
                  ¿Cuántos pedidos hicieron en el día cada persona / repartidor?
                </h3>
                <p className="text-xs text-slate-500">
                  Detalle operativo para el dueño: número de viajes realizados hoy por conductor, recaudación y el 20% de comisión retenido para la empresa.
                </p>
              </div>

              <div className="text-right text-xs">
                <span className="text-slate-400">Total comisiones hoy: </span>
                <span className="font-mono font-black text-emerald-600 text-sm">S/ {totalCommissions.toFixed(2)} (20%)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {drivers.slice(0, 4).map((drv, idx) => {
                const todayCounts = [8, 6, 5, 4][idx] || 3;
                const revenues = [88.0, 64.0, 52.0, 46.0][idx] || 35.0;
                const comm = revenues * 0.2;
                const net = revenues - comm;

                return (
                  <div
                    key={drv.id}
                    className="p-4 bg-slate-50 hover:bg-red-50/40 rounded-2xl border border-slate-200/90 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={drv.photo}
                        alt={drv.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-red-600 shrink-0"
                      />
                      <div>
                        <div className="font-extrabold text-xs text-slate-900 leading-tight">
                          {drv.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {drv.vehicle}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-700">
                          Placa: {drv.plate}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px] font-semibold">Pedidos hoy:</span>
                        <span className="font-mono font-black text-slate-950 text-sm">{todayCounts} viajes</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 text-[11px] font-semibold">Recaudado:</span>
                        <span className="font-mono font-bold text-slate-900">S/ {revenues.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="text-emerald-700 text-[11px] font-bold">Comisión 20%:</span>
                        <span className="font-mono font-black text-emerald-600">S/ {comm.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        drv.status === 'en_pedido'
                          ? 'bg-red-100 text-red-900'
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {drv.status === 'en_pedido' ? '● En ruta activa' : '● Disponible'}
                      </span>
                      <span className="text-slate-500 font-mono text-[10px]">
                        Ganancia: S/ {net.toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed list of services, person who ordered, and driver */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-200">
                  Control de Servicios en Tiempo Real
                </span>
                <h3 className="text-lg font-black text-slate-950 mt-1">
                  Pedidos del Día: El Servicio, la Persona que lo Solicitó y el Conductor a Cargo
                </h3>
                <p className="text-xs text-slate-500">
                  Monitoreo directo para la administración: qué se transporta, quién es la persona que lo pidió y qué repartidor lo atiende.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('pedidos')}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todos en tabla completa ({orders.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {orders.map((ord) => {
                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedDetailOrder(ord)}
                    className="p-4 bg-slate-50/70 hover:bg-red-50/30 rounded-2xl border border-slate-200 hover:border-red-400 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    {/* 1. EL SERVICIO */}
                    <div className="flex items-start gap-3 min-w-[240px]">
                      <div className="w-11 h-11 rounded-2xl bg-black text-white flex items-center justify-center font-bold shrink-0 shadow-xs border border-red-600/40">
                        {ord.serviceType === 'paquete' && <Package className="w-5 h-5 text-red-500" />}
                        {ord.serviceType === 'compra' && <ShoppingCart className="w-5 h-5 text-red-500" />}
                        {ord.serviceType === 'mandado' && <Zap className="w-5 h-5 text-red-500" />}
                        {ord.serviceType === 'documento' && <FileText className="w-5 h-5 text-red-500" />}
                        {ord.serviceType === 'transporte' && <Bike className="w-5 h-5 text-red-500" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {ord.id}
                          </span>
                          <span className="text-[10px] uppercase font-bold text-red-700 bg-red-100/70 px-2 py-0.5 rounded">
                            {ord.serviceType === 'paquete' ? 'Delivery Paquete' : ord.serviceType === 'compra' ? 'Mandado / Compra' : ord.serviceType === 'documento' ? 'Mensajería' : 'Transporte'}
                          </span>
                        </div>
                        <div className="text-xs font-extrabold text-slate-900 mt-1 line-clamp-1">
                          {ord.details.description}
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                          <span>Tarifa: <b className="text-slate-900 font-mono">S/ {ord.pricing.total.toFixed(2)}</b></span>
                          <span>· Pago: {ord.payment.method === 'yape' ? 'Yape' : ord.payment.method === 'yape_anticipado' ? 'Yape (Anticipado)' : 'Efectivo'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. LA PERSONA (CLIENTE) */}
                    <div className="border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0 md:pl-4 min-w-[220px]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Persona que solicitó:
                      </div>
                      <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{ord.customer.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        📞 {ord.customer.phone}
                      </div>
                      <div className="text-[11px] text-slate-600 truncate max-w-[200px] mt-0.5">
                        <span className="font-bold text-slate-700">Destino:</span> {ord.destination.address}
                      </div>
                    </div>

                    {/* 3. LA PERSONA A CARGO (REPARTIDOR) */}
                    <div className="border-t md:border-t-0 md:border-l border-slate-200/80 pt-2 md:pt-0 md:pl-4 min-w-[220px]">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Repartidor asignado:
                      </div>
                      {ord.driver ? (
                        <div className="flex items-center gap-2 mt-0.5">
                          <img
                            src={ord.driver.photo}
                            alt={ord.driver.name}
                            className="w-8 h-8 rounded-full object-cover border border-amber-500 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-xs text-slate-900">
                              {ord.driver.name}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {ord.driver.vehicle} · <span className="font-mono font-bold text-slate-700">{ord.driver.plate}</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-amber-700 bg-amber-100/60 px-2 py-1 rounded-lg inline-block mt-0.5">
                          ⏳ En espera de asignación
                        </div>
                      )}
                    </div>

                    {/* 4. ESTADO Y ACCIONES */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-1 border-t md:border-t-0 pt-2 md:pt-0">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        ord.status === 'entregado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'en_camino'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        {ord.status === 'entregado' ? 'Entregado' : ord.status === 'en_camino' ? 'En camino' : ord.status === 'en_recojo' ? 'En recojo' : 'Recibido'}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDetailOrder(ord);
                        }}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Ver Ficha Completa</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: PEDIDOS (WITH MANDATORY FILTERS & DETAILED DRAWER/MODAL) */}
      {/* ========================================================================= */}
      {activeTab === 'pedidos' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, cliente o dirección..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium"
              />
            </div>

            {/* Requested Filters: Pendientes, Disponibles, En curso, Completados, Cancelados */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setOrderFilter('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  orderFilter === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Todos ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('pendientes')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  orderFilter === 'pendientes' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Pendientes ({pendingOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('disponibles')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  orderFilter === 'disponibles' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Disponibles
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('en_curso')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  orderFilter === 'en_curso' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'
                }`}
              >
                En curso ({activeOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('completados')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  orderFilter === 'completados' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Completados ({completedOrders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('cancelados')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer ${
                  orderFilter === 'cancelados' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Cancelados
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Código / Hora</th>
                    <th className="p-3.5">Cliente</th>
                    <th className="p-3.5">Repartidor</th>
                    <th className="p-3.5">Ruta (Origen → Destino)</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Precio Prop. / Final</th>
                    <th className="p-3.5">Comisión</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5 text-right">Detalle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((ord) => (
                    <tr
                      key={ord.id}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => setSelectedDetailOrder(ord)}
                    >
                      <td className="p-3.5">
                        <div className="font-mono font-black text-slate-900">{ord.id}</div>
                        <div className="text-[11px] text-slate-400">{ord.createdAt}</div>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{ord.customer.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{ord.customer.phone}</div>
                      </td>

                      <td className="p-3.5">
                        {ord.driver ? (
                          <div className="font-semibold text-slate-900">
                            {ord.driver.name.split(' ')[0]}
                            <div className="text-[10px] text-slate-500 font-mono">{ord.driver.plate}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                            Sin asignar
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 max-w-[190px]">
                        <div className="truncate text-slate-800 font-medium">
                          <span className="text-emerald-600 font-bold">A:</span> {ord.pickup.address}
                        </div>
                        <div className="truncate text-slate-600 mt-0.5">
                          <span className="text-amber-600 font-bold">B:</span> {ord.destination.address}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded uppercase">
                          {ord.serviceType}
                        </span>
                      </td>

                      <td className="p-3.5 font-mono">
                        <div className="font-black text-slate-900">S/ {ord.pricing.total.toFixed(2)}</div>
                        {ord.negotiation && (
                          <div className="text-[10px] text-slate-400">
                            Propuesto: S/ {ord.negotiation.proposedPrice.toFixed(2)}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-emerald-600 font-bold">
                        S/ {ord.pricing.platformFee.toFixed(2)}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`capitalize text-[10px] font-bold px-2 py-0.5 rounded ${
                            ord.status === 'entregado'
                              ? 'bg-emerald-50 text-emerald-700'
                              : ord.status === 'recibido'
                              ? 'bg-amber-50 text-amber-800'
                              : ord.status === 'cancelado'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-blue-50 text-blue-800'
                          }`}
                        >
                          {ord.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetailOrder(ord);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-[11px] transition-colors"
                        >
                          Ver ficha
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB: REPARTIDORES (WITH STATES: PENDIENTE, APROBADO, SUSPENDIDO, ETC.) */}
      {/* ========================================================================= */}
      {activeTab === 'repartidores' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-slate-950 tracking-tight">
                Gestión de Repartidores & Conductores
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Aprueba postulaciones, suspende o activa cuentas y gestiona comisiones individuales.
              </p>
            </div>

            {/* Filter by status */}
            <div className="flex gap-1.5 text-xs overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setDriverFilter('todos')}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  driverFilter === 'todos' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Todos ({drivers.length + applications.length})
              </button>
              <button
                type="button"
                onClick={() => setDriverFilter('pendientes')}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  driverFilter === 'pendientes' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-amber-50 text-amber-800'
                }`}
              >
                Pendientes ({pendingApplications.length})
              </button>
              <button
                type="button"
                onClick={() => setDriverFilter('aprobados')}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer ${
                  driverFilter === 'aprobados' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                Aprobados ({drivers.length})
              </button>
            </div>
          </div>

          {/* Pending Applications Section */}
          {(driverFilter === 'todos' || driverFilter === 'pendientes') && applications.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-black uppercase text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 flex items-center justify-between">
                <span>Solicitudes "Quiero ser repartidor" Pendientes de Revisión</span>
                <span>{pendingApplications.length} por aprobar</span>
              </div>

              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                        {app.id}
                      </span>
                      <span className="text-sm font-extrabold text-slate-900">{app.fullName}</span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                        {app.status === 'PENDIENTE' ? 'Pendiente de revisión' : app.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">DNI</span>
                        <b>{app.dni}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Teléfono</span>
                        <b>{app.phone}</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Vehículo</span>
                        <b>{app.model} ({app.vehicleType})</b>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Placa</span>
                        <b>{app.plate}</b>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">
                    {app.status === 'PENDIENTE' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => updateApplicationStatus(app.id, 'APROBADO')}
                          className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                        >
                          Aprobar Conductor
                        </button>
                        <button
                          type="button"
                          onClick={() => updateApplicationStatus(app.id, 'RECHAZADO')}
                          className="flex-1 md:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                        >
                          Rechazar
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-bold text-slate-500">Procesado</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active / Registered Drivers Grid */}
          {(driverFilter === 'todos' || driverFilter === 'aprobados') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {drivers.map((drv) => (
                <div
                  key={drv.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={drv.photo}
                      alt={drv.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500 shadow-xs shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-sm text-slate-900 truncate">{drv.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{drv.phone}</div>
                      <div className="text-xs text-amber-600 font-bold mt-0.5">
                        ⭐ {drv.rating} ({drv.completedTrips} viajes)
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div>
                      <span className="text-slate-500">Vehículo:</span>{' '}
                      <span className="font-bold text-slate-800">{drv.vehicle}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Placa:</span>{' '}
                      <span className="font-mono font-bold text-slate-900">{drv.plate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Estado Admin:</span>{' '}
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {drv.adminStatus || 'ACTIVO'}
                      </span>
                    </div>
                  </div>

                  {/* Driver Admin Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedDriverDetail(drv)}
                      className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-lg transition-colors cursor-pointer text-center"
                    >
                      Ver Perfil & Viajes
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const newStatus: DriverStatusState =
                          drv.adminStatus === 'SUSPENDIDO' ? 'ACTIVO' : 'SUSPENDIDO';
                        updateDriverAdminStatus(drv.id, newStatus);
                      }}
                      className={`py-1.5 px-2 font-bold text-[11px] rounded-lg transition-colors cursor-pointer text-center ${
                        drv.adminStatus === 'SUSPENDIDO'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      {drv.adminStatus === 'SUSPENDIDO' ? 'Reactivar' : 'Suspender'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: CLIENTES (REGISTERED CLIENTS & THEIR BASIC INFORMATION) */}
      {/* ========================================================================= */}
      {activeTab === 'clientes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-950 tracking-tight">
                Clientes Registrados en Huánuco
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Directorio oficial de usuarios que solicitan delivery, mensajería y transporte.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
              {clients.length} clientes registrados
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">ID / Registro</th>
                    <th className="p-3.5">Nombre Completo</th>
                    <th className="p-3.5">Teléfono / WhatsApp</th>
                    <th className="p-3.5">Correo Electrónico</th>
                    <th className="p-3.5">Dirección Habitual</th>
                    <th className="p-3.5">Pedidos</th>
                    <th className="p-3.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clients.map((cli) => (
                    <tr key={cli.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="font-mono font-bold text-slate-900">{cli.id}</div>
                        <div className="text-[11px] text-slate-400">{cli.registeredAt}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">{cli.name}</td>
                      <td className="p-3.5 font-mono text-slate-700">{cli.phone}</td>
                      <td className="p-3.5 text-slate-600">{cli.email}</td>
                      <td className="p-3.5 text-slate-800">{cli.address}</td>
                      <td className="p-3.5 font-mono font-black text-amber-600">{cli.totalOrders}</td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
                          {cli.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: FINANZAS (PLATFORM REVENUE, COMMISSIONS, MOVEMENTS, WITHDRAWALS) */}
      {/* ========================================================================= */}
      {activeTab === 'finanzas' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-950 tracking-tight">
              Finanzas & Liquidación de Comisiones
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Control de comisiones retenidas, ingresos globales y pagos a repartidores.
            </p>
          </div>

          {/* 3 Main Financial Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ingresos Totales Operados
              </span>
              <div className="text-3xl font-black text-slate-950 font-mono">
                S/ {totalRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">
                Volumen total de pedidos y compras pagados por clientes.
              </p>
            </div>

            <div className="p-5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white rounded-3xl shadow-sm space-y-2">
              <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">
                Comisiones Retenidas (Ganancia Empresa)
              </span>
              <div className="text-3xl font-black font-mono">
                S/ {totalCommissions.toFixed(2)}
              </div>
              <p className="text-xs text-emerald-100">
                {commissionConfig.percentageValue || 20}% retenido automáticamente por cada pedido realizado.
              </p>
            </div>

            <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ganancias Netas Repartidores
              </span>
              <div className="text-3xl font-black text-amber-600 font-mono">
                S/ {driverEarningsTotal.toFixed(2)}
              </div>
              <p className="text-xs text-slate-400">
                Total acumulado en billeteras virtuales de conductores.
              </p>
            </div>
          </div>

          {/* Wallet Movements & Withdrawals History */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  Movimientos Recientes & Historial de Pagos
                </h4>
                <p className="text-xs text-slate-500">
                  Desglose de retiros a Yape y liquidaciones a repartidores
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs font-mono">
              {wallet.transactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                      {tx.type === 'withdrawal' ? '📤' : '📥'}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 font-sans">{tx.title}</div>
                      <div className="text-[11px] text-slate-400">{tx.date}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-black ${
                        tx.amount < 0 ? 'text-slate-900' : 'text-emerald-600'
                      }`}
                    >
                      {tx.amount < 0 ? `- S/ ${Math.abs(tx.amount).toFixed(2)}` : `+ S/ ${tx.amount.toFixed(2)}`}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-sans">
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: CONFIGURACIÓN (GLOBAL COMMISSION, INDIVIDUAL DRIVER COMMISSION, ETC) */}
      {/* ========================================================================= */}
      {activeTab === 'configuracion' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-950 tracking-tight">
              Configuración General de la Plataforma
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Parámetros de comisiones globales e individuales, tarifas de referencia, WhatsApp y límites.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Comisiones Globales & Tarifas */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                1. Comisión Global & Tarifas de Referencia
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Tipo de Comisión
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateCommissionConfig({ type: 'percentage' })}
                      className={`flex-1 py-2 rounded-xl font-bold ${
                        commissionConfig.type === 'percentage'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Porcentaje (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateCommissionConfig({ type: 'fixed' })}
                      className={`flex-1 py-2 rounded-xl font-bold ${
                        commissionConfig.type === 'fixed'
                          ? 'bg-amber-500 text-slate-950 shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      Monto Fijo (S/)
                    </button>
                  </div>
                </div>

                {commissionConfig.type === 'percentage' ? (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Porcentaje Global de Comisión (%)
                    </label>
                    <input
                      type="number"
                      value={commissionConfig.percentageValue}
                      onChange={(e) => updateCommissionConfig({ percentageValue: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Comisión fija por servicio (S/)
                    </label>
                    <input
                      type="number"
                      value={commissionConfig.fixedValue}
                      onChange={(e) => updateCommissionConfig({ fixedValue: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Tarifa Base (S/)
                    </label>
                    <input
                      type="number"
                      value={commissionConfig.baseFare}
                      onChange={(e) => updateCommissionConfig({ baseFare: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Tarifa por Km (S/)
                    </label>
                    <input
                      type="number"
                      value={commissionConfig.perKmFare}
                      onChange={(e) => updateCommissionConfig({ perKmFare: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Tarifa Mínima (S/)
                    </label>
                    <input
                      type="number"
                      value={commissionConfig.minimumFare}
                      onChange={(e) => updateCommissionConfig({ minimumFare: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Límite de Compra (S/)
                    </label>
                    <input
                      type="number"
                      value={commissionConfig.purchaseLimit}
                      onChange={(e) => updateCommissionConfig({ purchaseLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: WhatsApp & Datos de la Empresa */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                2. WhatsApp, Cobro Yape & Datos Generales
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Número de WhatsApp Soporte (Oficial)
                  </label>
                  <input
                    type="text"
                    value={commissionConfig.whatsappNumber}
                    onChange={(e) => updateCommissionConfig({ whatsappNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Número asignado al botón "📲 SOPORTE POR WHATSAPP": 976 387 226
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Número de Yape Oficial para Pagos
                  </label>
                  <input
                    type="text"
                    value={commissionConfig.yapeNumber}
                    onChange={(e) => updateCommissionConfig({ yapeNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Titular de la Cuenta
                  </label>
                  <input
                    type="text"
                    value={commissionConfig.companyName}
                    onChange={(e) => updateCommissionConfig({ companyName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Dirección Oficial en Huánuco
                  </label>
                  <input
                    type="text"
                    value={commissionConfig.companyAddress}
                    onChange={(e) => updateCommissionConfig({ companyAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Comisión Individual por Repartidor */}
            <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-black text-sm text-slate-900 uppercase tracking-wide">
                3. Comisión Individual por Repartidor
              </h4>
              <p className="text-xs text-slate-500">
                Puedes asignar una tasa preferencial a conductores destacados o con mayor antigüedad.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {drivers.map((drv) => {
                  const currentRate = commissionConfig.driverCustomRates?.[drv.id] ?? commissionConfig.percentageValue;
                  return (
                    <div
                      key={drv.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{drv.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{drv.vehicle} · {drv.plate}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">Comisión:</span>
                        <input
                          type="number"
                          value={currentRate}
                          onChange={(e) => updateDriverCommissionRate(drv.id, Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-center font-mono font-bold text-amber-700"
                        />
                        <span className="font-bold text-slate-700">%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB: AUDITORÍA (SECURITY LOGS, SESSIONS, DISPATCHES & SYSTEM EVENTS) */}
      {/* ========================================================================= */}
      {activeTab === 'auditoria' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-slate-950 tracking-tight">
                Registro de Auditoría & Trazabilidad
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Historial inmutable de accesos, aprobaciones de repartidores, cambios de tarifas y despachos.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-xl">
              Sistema de Logs Activo
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Fecha / Hora</th>
                    <th className="p-3.5">Evento / Acción</th>
                    <th className="p-3.5">Operador / Usuario</th>
                    <th className="p-3.5">Detalles</th>
                    <th className="p-3.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-slate-400">Hoy 10:48</td>
                    <td className="p-3.5 font-sans font-bold text-slate-900">Inicio de Sesión Admin</td>
                    <td className="p-3.5 text-red-600 font-bold">admin@negritodehuanuco.com</td>
                    <td className="p-3.5 font-sans text-slate-600">Acceso a Consola HQ desde Huánuco Centro</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-emerald-50 text-emerald-700">Completado</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-slate-400">Hoy 10:35</td>
                    <td className="p-3.5 font-sans font-bold text-slate-900">Validación de Pago Yape</td>
                    <td className="p-3.5 text-slate-700">Sistema Automático</td>
                    <td className="p-3.5 font-sans text-slate-600">Comprobante verificado para pedido HX-8F42K</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-emerald-50 text-emerald-700">Verificado</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-slate-400">Hoy 09:15</td>
                    <td className="p-3.5 font-sans font-bold text-slate-900">Postulación de Conductor</td>
                    <td className="p-3.5 text-slate-700">Carlos Mendoza (Moto)</td>
                    <td className="p-3.5 font-sans text-slate-600">Registro con Honda GLH 150 (Placa 8492-7W)</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-blue-50 text-blue-700">Aprobado</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-slate-400">Ayer 18:20</td>
                    <td className="p-3.5 font-sans font-bold text-slate-900">Liquidación de Billetera</td>
                    <td className="p-3.5 text-slate-700">Finanzas NEGRITO DE HUÁNUCO</td>
                    <td className="p-3.5 font-sans text-slate-600">Retiro procesado a cuenta Yape: S/ 30.00</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-emerald-50 text-emerald-700">Completado</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 text-slate-400">Ayer 14:05</td>
                    <td className="p-3.5 font-sans font-bold text-slate-900">Actualización de Tarifa Base</td>
                    <td className="p-3.5 text-red-600 font-bold">admin@negritodehuanuco.com</td>
                    <td className="p-3.5 font-sans text-slate-600">Tarifa base confirmada en S/ 6.00 Huánuco</td>
                    <td className="p-3.5"><span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-slate-100 text-slate-700">Registrado</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TAB: MAPA EN VIVO */}
      {/* ========================================================================= */}
      {activeTab === 'mapa' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-black text-slate-950 tracking-tight">
              Mapa Operativo de Huánuco
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisión en tiempo real de viajes activos, puntos de entrega y unidades en ruta.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
            <HuanucoMap heightClass="h-96" interactiveMode="tracking" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER DETAIL MODAL (Cliente, Repartidor, Origen, Destino, Precio, etc.) */}
      {/* ========================================================================= */}
      {selectedDetailOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {selectedDetailOrder.id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                  {selectedDetailOrder.serviceType}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailOrder(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Status Header */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Estado</span>
                  <span className="font-extrabold text-sm capitalize text-slate-900">
                    {selectedDetailOrder.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] font-bold uppercase block">Fecha / Hora</span>
                  <span className="font-medium text-slate-700">{selectedDetailOrder.createdAt}</span>
                </div>
              </div>

              {/* Cliente & Repartidor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-700">Cliente</span>
                  <div className="font-bold text-sm text-slate-900">{selectedDetailOrder.customer.name}</div>
                  <div className="text-slate-500 font-mono">{selectedDetailOrder.customer.phone}</div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black uppercase text-amber-700">Repartidor Asignado</span>
                  {selectedDetailOrder.driver ? (
                    <div>
                      <div className="font-bold text-sm text-slate-900">{selectedDetailOrder.driver.name}</div>
                      <div className="text-slate-500">{selectedDetailOrder.driver.vehicle} · {selectedDetailOrder.driver.plate}</div>
                    </div>
                  ) : (
                    <div className="text-amber-800 font-bold">Sin repartidor asignado aún</div>
                  )}
                </div>
              </div>

              {/* Origen & Destino */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div>
                  <span className="text-emerald-600 font-bold block text-[10px] uppercase">Punto de Recojo (A)</span>
                  <div className="font-bold text-slate-900">{selectedDetailOrder.pickup.address}</div>
                  <div className="text-slate-500 text-[11px]">{selectedDetailOrder.pickup.reference}</div>
                </div>

                <div className="border-t border-slate-200 pt-2">
                  <span className="text-amber-600 font-bold block text-[10px] uppercase">Punto de Entrega (B)</span>
                  <div className="font-bold text-slate-900">{selectedDetailOrder.destination.address}</div>
                  <div className="text-slate-500 text-[11px]">{selectedDetailOrder.destination.reference}</div>
                </div>
              </div>

              {/* Negotiation & Pricing */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Precio de Referencia:</span>
                  <span>S/ {(selectedDetailOrder.pricing.referencePrice || selectedDetailOrder.pricing.servicePrice).toFixed(2)}</span>
                </div>

                {selectedDetailOrder.negotiation && (
                  <div className="flex justify-between text-amber-400 font-bold">
                    <span>Precio Propuesto por Cliente:</span>
                    <span>S/ {selectedDetailOrder.negotiation.proposedPrice.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-white font-black text-sm border-t border-slate-800 pt-2">
                  <span>Precio Final Congelado:</span>
                  <span className="text-amber-400">S/ {selectedDetailOrder.pricing.total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-emerald-400 text-xs">
                  <span>Comisión de la Plataforma:</span>
                  <span>S/ {selectedDetailOrder.pricing.platformFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Timeline of events */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Historial de Eventos</span>
                <div className="p-3 bg-slate-50 rounded-2xl text-[11px] space-y-1 text-slate-600">
                  <div>• Pedido emitido y registrado en Huánuco Centro.</div>
                  {selectedDetailOrder.negotiation && (
                    <div>• Oferta propuesta por el cliente aceptada y congelada.</div>
                  )}
                  {selectedDetailOrder.driver && (
                    <div>• Repartidor {selectedDetailOrder.driver.name} asignado al servicio.</div>
                  )}
                  {selectedDetailOrder.status === 'entregado' && (
                    <div className="text-emerald-700 font-bold">• Servicio completado y entregado al cliente.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DRIVER DETAIL MODAL */}
      {selectedDriverDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-auto">
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={selectedDriverDetail.photo}
                  alt={selectedDriverDetail.name}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-amber-500"
                />
                <div>
                  <h3 className="font-extrabold text-sm text-white">{selectedDriverDetail.name}</h3>
                  <div className="text-xs text-amber-400 font-mono">⭐ {selectedDriverDetail.rating} ({selectedDriverDetail.completedTrips} viajes)</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDriverDetail(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div><span className="text-slate-500">Teléfono:</span> <b className="font-mono">{selectedDriverDetail.phone}</b></div>
                <div><span className="text-slate-500">Vehículo:</span> <b>{selectedDriverDetail.vehicle}</b></div>
                <div><span className="text-slate-500">Placa:</span> <b className="font-mono">{selectedDriverDetail.plate}</b></div>
                <div><span className="text-slate-500">Ganancias acumuladas:</span> <b className="text-emerald-700">S/ {(selectedDriverDetail.completedTrips * 6.5).toFixed(2)}</b></div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    updateDriverAdminStatus(selectedDriverDetail.id, 'ACTIVO');
                    setSelectedDriverDetail(null);
                  }}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center"
                >
                  Activar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateDriverAdminStatus(selectedDriverDetail.id, 'SUSPENDIDO');
                    setSelectedDriverDetail(null);
                  }}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-center"
                >
                  Suspender
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

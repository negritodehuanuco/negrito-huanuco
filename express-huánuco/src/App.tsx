import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { ClientHome } from './components/client/ClientHome';
import { ClientSubNav, ClientTab } from './components/client/ClientSubNav';
import { ClientOrdersView } from './components/client/ClientOrdersView';
import { ClientProfileView } from './components/client/ClientProfileView';
import { OrderWizard } from './components/client/OrderWizard';
import { TrackingView } from './components/client/TrackingView';
import { DriverPanel } from './components/driver/DriverPanel';
import { DriverAuthView } from './components/driver/DriverAuthView';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminLoginView } from './components/admin/AdminLoginView';
import { AccessDeniedView } from './components/common/AccessDeniedView';
import { ClientAuthModal } from './components/client/ClientAuthModal';
import { ClientProfileModal } from './components/client/ClientProfileModal';
import { DriverRegistrationModal } from './components/driver/DriverRegistrationModal';
import { WhatsAppModal } from './components/common/WhatsAppModal';
import { ServiceChatModal } from './components/common/ServiceChatModal';
import { UnifiedThreeViews } from './components/common/UnifiedThreeViews';
import { ServiceType } from './types';
import {
  Bike,
  User,
  Shield,
  PlusCircle,
  Clock,
  Compass,
  MessageCircle,
  ShoppingBag,
  Package,
  ArrowRight
} from 'lucide-react';

function MainContent() {
  const {
    currentRoute,
    navigateTo,
    currentUser,
    activeClientOrderId,
    setActiveClientOrderId,
    setOpenRegistrationModal,
    setOpenWhatsAppModal,
    openAuthModal,
  } = useApp();

  // Client view navigation state: 'home' | 'wizard' | 'orders' | 'tracking' | 'history' | 'profile'
  const [clientTab, setClientTab] = useState<ClientTab>('home');
  const [selectedService, setSelectedService] = useState<ServiceType>('paquete');

  const handleStartOrder = (service: ServiceType = 'paquete') => {
    setSelectedService(service);
    setClientTab('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishOrder = (orderId: string) => {
    setActiveClientOrderId(orderId);
    setClientTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTracking = (orderId: string) => {
    setActiveClientOrderId(orderId);
    setClientTab('tracking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between selection:bg-red-600 selection:text-white pb-16 md:pb-0">
      <div>
        <Header />

        <main className={`${currentRoute === '/visualizacion' ? 'max-w-7xl' : 'max-w-5xl'} mx-auto px-4 py-6`}>
          {/* ========================================================================= */}
          {/* 0. MODO VISUALIZACIÓN: LAS 3 SECCIONES JUNTAS (/visualizacion)           */}
          {/* ========================================================================= */}
          {currentRoute === '/visualizacion' && (
            <UnifiedThreeViews />
          )}

          {/* ========================================================================= */}
          {/* 1. APARTADO CLIENTE / WEB PÚBLICA: negritodehuanuco.com (/)               */}
          {/* ========================================================================= */}
          {(currentRoute === '/' || currentRoute === '/cliente') && (
            <>
              {/* Dedicated Client Sub-Navigation (Inicio, Solicitar servicio, Mis pedidos, Seguimiento, Historial, Perfil, Cerrar sesión) */}
              <ClientSubNav
                currentTab={clientTab}
                onSelectTab={(tab) => {
                  setClientTab(tab);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              {clientTab === 'home' && (
                <ClientHome
                  onStartOrder={handleStartOrder}
                  onOpenTracking={handleOpenTracking}
                />
              )}

              {clientTab === 'wizard' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setClientTab('home')}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs cursor-pointer"
                    >
                      ← Volver al inicio
                    </button>
                    <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
                      Solicitud de Servicio en Huánuco
                    </span>
                  </div>

                  <OrderWizard
                    initialService={selectedService}
                    onFinishOrder={handleFinishOrder}
                    onClose={() => setClientTab('home')}
                  />
                </div>
              )}

              {clientTab === 'orders' && (
                <ClientOrdersView
                  viewMode="orders"
                  onStartOrder={() => handleStartOrder('paquete')}
                  onOpenTracking={handleOpenTracking}
                />
              )}

              {clientTab === 'tracking' && (
                <div>
                  {activeClientOrderId ? (
                    <TrackingView
                      orderId={activeClientOrderId}
                      onBack={() => setClientTab('home')}
                    />
                  ) : (
                    <ClientOrdersView
                      viewMode="orders"
                      onStartOrder={() => handleStartOrder('paquete')}
                      onOpenTracking={handleOpenTracking}
                    />
                  )}
                </div>
              )}

              {clientTab === 'history' && (
                <ClientOrdersView
                  viewMode="history"
                  onStartOrder={() => handleStartOrder('paquete')}
                  onOpenTracking={handleOpenTracking}
                />
              )}

              {clientTab === 'profile' && (
                <ClientProfileView
                  onStartOrder={() => handleStartOrder('paquete')}
                  onViewHistory={() => setClientTab('history')}
                />
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* 2. APARTADO REPARTIDORES: /repartidor (Privado con login y registro)      */}
          {/* ========================================================================= */}
          {(currentRoute === '/repartidor' || currentRoute === '/repartidores') && (
            <>
              {!currentUser || currentUser.role !== 'driver' ? (
                <DriverAuthView initialTab="login" />
              ) : (
                <DriverPanel />
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* 3. APARTADO ADMINISTRADOR: /admin (Oculto y protegido con contraseña)     */}
          {/* ========================================================================= */}
          {(currentRoute === '/admin' || currentRoute === '/administracion' || currentRoute === '/administración') && (
            <>
              {!currentUser || currentUser.role !== 'admin' ? (
                <AdminLoginView />
              ) : (
                <AdminPanel />
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-black text-neutral-400 py-10 border-t border-neutral-900 text-xs">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="sm:col-span-2 space-y-2">
            <div className="text-base font-black text-white tracking-tight flex items-center gap-2">
              <span className="text-red-600">NEGRITO</span> DE HUÁNUCO
            </div>
            <div className="inline-block bg-neutral-900 border border-neutral-800 text-red-400 font-mono text-[11px] px-2 py-0.5 rounded">
              🌐 negritodehuanuco.com
            </div>
            <p className="text-neutral-400 max-w-sm leading-relaxed">
              Plataforma oficial de delivery, mandados, mensajería y transporte en Huánuco, Amarilis y Pillco Marca. Colores oficiales de identidad: Negro, Blanco y Rojo.
            </p>
            <div className="text-neutral-400 text-[11px] pt-1">
              Huánuco, Perú · Atención continua 24/7 · Comisión estándar 20%
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              Servicios Oficiales
            </div>
            <ul className="space-y-1.5 text-neutral-400">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigateTo('/');
                    handleStartOrder('paquete');
                  }}
                  className="hover:text-red-500 cursor-pointer text-left transition-colors"
                >
                  Envío Inmediato de Paquetes
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigateTo('/');
                    handleStartOrder('compra');
                  }}
                  className="hover:text-red-500 cursor-pointer text-left transition-colors"
                >
                  Mandados y Compras
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigateTo('/');
                    handleStartOrder('documento');
                  }}
                  className="hover:text-red-500 cursor-pointer text-left transition-colors"
                >
                  Mensajería y Trámites
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    navigateTo('/');
                    handleStartOrder('transporte');
                  }}
                  className="hover:text-red-500 cursor-pointer text-left transition-colors"
                >
                  Transporte en Moto & Mototaxi
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-extrabold text-white uppercase tracking-wider text-[11px]">
              Subdominios & Apartados
            </div>
            <ul className="space-y-1.5 text-neutral-400">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('/')}
                  className="hover:text-red-500 font-semibold cursor-pointer text-left transition-colors flex items-center gap-1.5"
                >
                  <span>🛒 Clientes</span>
                  <span className="text-[10px] text-neutral-500 font-mono">(negritodehuanuco.com/)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('/repartidor')}
                  className="hover:text-red-500 font-semibold cursor-pointer text-left transition-colors flex items-center gap-1.5"
                >
                  <span>🏍️ Repartidores</span>
                  <span className="text-[10px] text-neutral-500 font-mono">(/repartidor)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('/admin')}
                  className="hover:text-red-500 font-semibold cursor-pointer text-left transition-colors flex items-center gap-1.5"
                >
                  <span>🛡️ Panel Administrador</span>
                  <span className="text-[10px] text-neutral-500 font-mono">(/admin)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setOpenRegistrationModal(true)}
                  className="hover:text-red-500 font-semibold cursor-pointer text-left transition-colors"
                >
                  📝 Postular como repartidor
                </button>
              </li>
              <li className="pt-2">
                <a
                  href="https://wa.me/51976387226?text=Hola%20NEGRITO%20DE%20HU%C3%81NUCO%2C%20necesito%20soporte%20y%20asistencia."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>📲 WhatsApp 976 387 226</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 mt-8 pt-4 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-500">
          <div>© {new Date().getFullYear()} NEGRITO DE HUÁNUCO (negritodehuanuco.com). Todos los derechos reservados.</div>
          <div className="flex items-center gap-1">
            <span>Rutas: Clientes (/) · Repartidores (/repartidor) · Administrador (/admin)</span>
          </div>
        </div>
      </footer>

      {/* Fixed Mobile Bottom Navigation Bar (Contextual to Active Area) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-2 py-1.5 shadow-lg">
        {currentRoute === '/visualizacion' && (
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-[11px] font-black text-red-600 uppercase">
              👁️ 3 Secciones Juntas
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2 py-1 rounded-lg cursor-pointer"
              >
                1. Clientes
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/repartidor')}
                className="text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2 py-1 rounded-lg cursor-pointer"
              >
                2. Repartidores
              </button>
              <button
                type="button"
                onClick={() => navigateTo('/admin')}
                className="text-[11px] font-bold text-neutral-700 bg-neutral-100 px-2 py-1 rounded-lg cursor-pointer"
              >
                3. Admin
              </button>
            </div>
          </div>
        )}

        {(currentRoute === '/' || currentRoute === '/cliente') && (
          <div className="grid grid-cols-5 items-center text-center">
            <button
              type="button"
              onClick={() => {
                setClientTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                clientTab === 'home' ? 'text-red-600 font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span className="text-[9px] tracking-tight mt-0.5">Inicio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setClientTab('home');
                const el = document.getElementById('servicios-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="min-h-[44px] flex flex-col items-center justify-center text-neutral-500 hover:text-black transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-[9px] tracking-tight mt-0.5">Servicios</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartOrder('paquete')}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                clientTab === 'wizard' ? 'text-red-600 font-bold' : 'text-neutral-500 hover:text-black'
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs">
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[9px] font-black tracking-tight mt-0.5 text-black">Pedir</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setClientTab('orders');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                clientTab === 'orders' || clientTab === 'tracking'
                  ? 'text-red-600 font-bold'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span className="text-[9px] tracking-tight mt-0.5">Pedidos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (currentUser) {
                  setClientTab('profile');
                } else {
                  openAuthModal('login');
                }
              }}
              className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
                clientTab === 'profile' ? 'text-red-600 font-bold' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="text-[9px] tracking-tight mt-0.5">
                {currentUser ? 'Mi Cuenta' : 'Ingresar'}
              </span>
            </button>
          </div>
        )}

        {(currentRoute === '/repartidor' || currentRoute === '/repartidores') && (
          <div className="flex items-center justify-between px-3 py-1">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="text-xs font-bold text-neutral-700 hover:text-red-600 py-1 cursor-pointer flex items-center gap-1"
            >
              ← Ir a Web Clientes
            </button>
            <span className="text-xs font-black text-red-600 uppercase tracking-wider">
              🏍️ Portal Repartidores
            </span>
          </div>
        )}

        {(currentRoute === '/admin' || currentRoute === '/administracion' || currentRoute === '/administración') && (
          <div className="flex items-center justify-between px-3 py-1">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="text-xs font-bold text-neutral-700 hover:text-red-600 py-1 cursor-pointer flex items-center gap-1"
            >
              ← Ir a Web Clientes
            </button>
            <span className="text-xs font-black text-red-600 uppercase tracking-wider">
              🛡️ Consola Administrador
            </span>
          </div>
        )}
      </div>

      {/* Global Modals */}
      <ClientAuthModal />
      <ClientProfileModal />
      <DriverRegistrationModal />
      <WhatsAppModal />
      <ServiceChatModal />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

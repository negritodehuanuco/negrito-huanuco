import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppUser,
  ClientProfile,
  CommissionConfig,
  DriverApplication,
  DriverInfo,
  DriverStatusState,
  Order,
  OrderStatus,
  WalletTransaction
} from '../types';
import {
  INITIAL_CONFIG,
  INITIAL_DRIVERS,
  INITIAL_ORDERS,
  INITIAL_APPLICATIONS,
  INITIAL_CLIENTS,
  INITIAL_USERS,
  INITIAL_WALLET_TRANSACTIONS
} from '../data/mockData';

export type UserRole = 'client' | 'driver' | 'admin';

export type AppRoute =
  | '/'
  | '/repartidor'
  | '/repartidores'
  | '/admin'
  | '/administracion'
  | '/administración'
  | '/cliente'
  | '/visualizacion';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentRoute: AppRoute;
  navigateTo: (route: AppRoute) => void;
  currentUser: AppUser | null;
  users: AppUser[];
  clients: ClientProfile[];
  login: (email: string, password?: string, intendedRole?: UserRole) => { success: boolean; message?: string };
  registerClient: (data: { name: string; email: string; phone: string; address?: string }) => { success: boolean; user: AppUser };
  registerDriver: (data: any) => { success: boolean; message: string; user?: AppUser };
  logout: () => void;
  updateDriverAdminStatus: (driverId: string, status: DriverStatusState) => void;
  updateDriverCommissionRate: (driverId: string, rate: number) => void;
  authModalOpen: boolean;
  authModalTab: 'login' | 'register' | 'forgot';
  openAuthModal: (tab?: 'login' | 'register' | 'forgot') => void;
  closeAuthModal: () => void;
  submitForgotPassword: (email: string) => { success: boolean; message: string };
  isClientProfileOpen: boolean;
  setIsClientProfileOpen: (open: boolean) => void;
  orders: Order[];
  drivers: DriverInfo[];
  applications: DriverApplication[];
  commissionConfig: CommissionConfig;
  activeClientOrderId: string | null;
  setActiveClientOrderId: (id: string | null) => void;
  activeDriverId: string;
  setActiveDriverId: (id: string) => void;
  driverOnline: boolean;
  setDriverOnline: (online: boolean) => void;
  wallet: {
    balance: number;
    transactions: WalletTransaction[];
  };
  // Acciones
  createOrder: (newOrder: Omit<Order, 'id' | 'createdAt' | 'status'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  acceptOrderAsDriver: (orderId: string, driverId?: string) => void;
  acceptProposedPriceAsDriver: (orderId: string, driverId?: string) => void;
  submitCounterOffer: (orderId: string, counterPrice: number, driverId?: string, etaMinutes?: number) => void;
  ignoreOrderAsDriver: (orderId: string, driverId?: string) => void;
  clientAcceptOffer: (orderId: string, offerId: string) => void;
  clientRejectOffer: (orderId: string, offerId: string) => void;
  updateProposedPrice: (orderId: string, newPrice: number) => void;
  verifyYapePayment: (orderId: string) => void;
  submitDriverApplication: (app: Omit<DriverApplication, 'id' | 'status' | 'submittedAt'>) => DriverApplication;
  updateApplicationStatus: (appId: string, status: 'APROBADO' | 'RECHAZADO') => void;
  updateCommissionConfig: (config: Partial<CommissionConfig>) => void;
  requestWithdrawal: (amount: number, destAccount: string) => boolean;
  calculateFare: (
    distanceKm: number,
    serviceType: string,
    estimatedCost?: number,
    transportVehicle?: 'moto' | 'mototaxi'
  ) => {
    servicePrice: number;
    platformFee: number;
    driverEarnings: number;
    total: number;
    estimatedMinutes: number;
  };
  openRegistrationModal: boolean;
  setOpenRegistrationModal: (open: boolean) => void;
  openWhatsAppModal: boolean;
  setOpenWhatsAppModal: (open: boolean) => void;
  activeChatOrderId: string | null;
  chatSenderRole: 'client' | 'driver';
  openChatModal: (orderId: string, senderRole?: 'client' | 'driver') => void;
  closeChatModal: () => void;
  sendChatMessage: (orderId: string, text: string, sender: 'client' | 'driver') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper para persistencia local sincronizada
const getStored = <T,>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = <T,>(key: string, value: T) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    // Notificar a otros listeners en la misma pestaña
    window.dispatchEvent(new Event('ndh_storage_sync'));
  } catch {
    // Manejo seguro de cuota
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialRoute = (): AppRoute => {
    if (typeof window !== 'undefined') {
      const pathname = decodeURIComponent(window.location.pathname).toLowerCase().trim();
      const hash = decodeURIComponent(window.location.hash).toLowerCase().trim().replace(/^#\/?/, '');
      const path = (pathname !== '/' && pathname !== '') ? pathname.replace(/^\//, '') : hash;

      if (path.startsWith('admin') || path.startsWith('administra')) {
        return '/admin';
      }
      if (path.startsWith('repartidor')) {
        return '/repartidor';
      }
      if (path.startsWith('visualizacion')) {
        return '/visualizacion';
      }
      return '/';
    }
    return '/';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);

  // Estados persistentes centralizados
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() =>
    getStored<AppUser | null>('ndh_currentUser', null)
  );

  const [users, setUsers] = useState<AppUser[]>(() =>
    getStored<AppUser[]>('ndh_users', INITIAL_USERS)
  );

  const [clients, setClients] = useState<ClientProfile[]>(() =>
    getStored<ClientProfile[]>('ndh_clients', INITIAL_CLIENTS)
  );

  const [orders, setOrders] = useState<Order[]>(() => {
    return getStored<Order[]>('ndh_orders', []);
  });

  const [drivers, setDrivers] = useState<DriverInfo[]>(() => {
    const list = getStored<DriverInfo[]>('ndh_drivers', INITIAL_DRIVERS);
    return list.filter((d) => !['DRV-101', 'DRV-102', 'DRV-103', 'DRV-01', 'DRV-02'].includes(d.id));
  });

  const [applications, setApplications] = useState<DriverApplication[]>(() =>
    getStored<DriverApplication[]>('ndh_applications', INITIAL_APPLICATIONS)
  );

  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig>(() =>
    getStored<CommissionConfig>('ndh_config', INITIAL_CONFIG)
  );

  const [wallet, setWallet] = useState<{ balance: number; transactions: WalletTransaction[] }>(() =>
    getStored('ndh_wallet', { balance: 0, transactions: INITIAL_WALLET_TRANSACTIONS })
  );

  // Estados de sesión UI
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [isClientProfileOpen, setIsClientProfileOpen] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>(() => currentUser?.role || 'client');

  const [activeClientOrderId, setActiveClientOrderId] = useState<string | null>(() => {
    const val = getStored<string | null>('ndh_activeClientOrderId', null);
    return val === 'HX-8F42K' ? null : val;
  });

  const [activeDriverId, setActiveDriverId] = useState<string>(() =>
    currentUser?.driverProfileId || ''
  );

  const [driverOnline, setDriverOnline] = useState<boolean>(true);
  const [openRegistrationModal, setOpenRegistrationModal] = useState<boolean>(false);
  const [openWhatsAppModal, setOpenWhatsAppModal] = useState<boolean>(false);
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [chatSenderRole, setChatSenderRole] = useState<'client' | 'driver'>('client');

  // Sincronización continua de localStorage
  useEffect(() => {
    setStored('ndh_orders', orders);
  }, [orders]);

  useEffect(() => {
    setStored('ndh_drivers', drivers);
  }, [drivers]);

  useEffect(() => {
    setStored('ndh_applications', applications);
  }, [applications]);

  useEffect(() => {
    setStored('ndh_users', users);
  }, [users]);

  useEffect(() => {
    setStored('ndh_clients', clients);
  }, [clients]);

  useEffect(() => {
    setStored('ndh_currentUser', currentUser);
  }, [currentUser]);

  useEffect(() => {
    setStored('ndh_wallet', wallet);
  }, [wallet]);

  useEffect(() => {
    setStored('ndh_config', commissionConfig);
  }, [commissionConfig]);

  useEffect(() => {
    setStored('ndh_activeClientOrderId', activeClientOrderId);
  }, [activeClientOrderId]);

  // Escucha cambios de almacenamiento (otra pestaña o ventana)
  useEffect(() => {
    const handleSync = () => {
      setOrders(getStored<Order[]>('ndh_orders', []).filter((o) => o.id !== 'HX-8F42K'));
      setDrivers(getStored<DriverInfo[]>('ndh_drivers', []).filter((d) => !['DRV-101', 'DRV-102', 'DRV-103', 'DRV-01', 'DRV-02'].includes(d.id)));
      setApplications(getStored('ndh_applications', []));
      setUsers(getStored('ndh_users', INITIAL_USERS));
      setClients(getStored('ndh_clients', []));
      setWallet(getStored('ndh_wallet', { balance: 0, transactions: [] }));
      setCommissionConfig(getStored('ndh_config', INITIAL_CONFIG));
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('ndh_storage_sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ndh_storage_sync', handleSync);
    };
  }, []);

  // Navegación limpia de rutas
  const navigateTo = (route: AppRoute) => {
    let canonical: AppRoute = route;
    if (route === '/cliente') canonical = '/';
    else if (route === '/repartidores') canonical = '/repartidor';
    else if (route === '/administracion' || route === '/administración') canonical = '/admin';

    setCurrentRoute(canonical);

    if (typeof window !== 'undefined') {
      try {
        const targetPath = canonical === '/' ? '/' : canonical;
        window.history.pushState({ route: canonical }, '', targetPath);
      } catch {
        // Fallback para sandbox
      }
    }
  };

  useEffect(() => {
    const handleRouteSync = () => {
      const pathname = decodeURIComponent(window.location.pathname).toLowerCase().trim();
      const hash = decodeURIComponent(window.location.hash).toLowerCase().trim().replace(/^#\/?/, '');
      const path = (pathname !== '/' && pathname !== '') ? pathname.replace(/^\//, '') : hash;

      if (path.startsWith('admin') || path.startsWith('administra')) {
        setCurrentRoute('/admin');
      } else if (path.startsWith('repartidor')) {
        setCurrentRoute('/repartidor');
      } else if (path.startsWith('visualizacion')) {
        setCurrentRoute('/visualizacion');
      } else {
        setCurrentRoute('/');
      }
    };

    window.addEventListener('popstate', handleRouteSync);
    window.addEventListener('hashchange', handleRouteSync);
    return () => {
      window.removeEventListener('popstate', handleRouteSync);
      window.removeEventListener('hashchange', handleRouteSync);
    };
  }, []);

  // REGLA DE NEGOCIO: 20% Comisión Empresa / 80% Ganancia Neta Repartidor
  const calculateFare = (
    distanceKm: number,
    serviceType: string,
    estimatedCost = 0,
    transportVehicle?: 'moto' | 'mototaxi'
  ) => {
    let base = commissionConfig.baseFare;
    let kmRate = commissionConfig.perKmFare;

    let typeExtra = 0;
    if (serviceType === 'compra') typeExtra = 2.0;
    if (serviceType === 'otro') typeExtra = 3.0;
    if (serviceType === 'transporte') {
      if (transportVehicle === 'moto') {
        base = Math.max(4.0, commissionConfig.baseFare - 1.0);
        kmRate = 1.2;
      } else {
        base = Math.max(5.0, commissionConfig.baseFare);
        kmRate = 1.4;
      }
    }

    const minFare = serviceType === 'transporte' && transportVehicle === 'moto' ? 4.0 : commissionConfig.minimumFare;
    const rawServicePrice = Math.max(minFare, base + distanceKm * kmRate + typeExtra);
    const servicePrice = Math.round(rawServicePrice * 10) / 10;

    // 20% retenido para la empresa, 80% neto para el repartidor
    const platformFee = Math.round(servicePrice * 0.20 * 10) / 10;
    const driverEarnings = Math.max(0, Math.round((servicePrice - platformFee) * 10) / 10);
    const total = servicePrice + (estimatedCost || 0);
    const estimatedMinutes = Math.max(6, Math.round(distanceKm * 3.5 + 4));

    return {
      servicePrice,
      platformFee,
      driverEarnings,
      total,
      estimatedMinutes,
    };
  };

  // Creación de pedidos por clientes
  const createOrder = (newOrderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newId = `HX-${randomHex}`;

    // Garantizar cálculo 20% / 80%
    const servicePrice = newOrderData.pricing.servicePrice;
    const platformFee = Math.round(servicePrice * 0.20 * 10) / 10;
    const driverEarnings = Math.max(0, Math.round((servicePrice - platformFee) * 10) / 10);

    const newOrder: Order = {
      ...newOrderData,
      id: newId,
      createdAt: 'Justo ahora',
      status: 'recibido',
      pricing: {
        ...newOrderData.pricing,
        platformFee,
        driverEarnings,
      },
      payment: {
        ...newOrderData.payment,
        servicePrice,
        platformFee,
        driverEarnings,
      },
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveClientOrderId(newId);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const updatedOrder: Order = {
          ...order,
          status,
          deliveryNote: note || order.deliveryNote,
        };

        // Si el pedido es entregado, acreditar el 80% al repartidor
        if (status === 'entregado') {
          const earnings = order.pricing?.driverEarnings || order.payment?.driverEarnings || Math.round(order.pricing.servicePrice * 0.8 * 10) / 10;

          setWallet((w) => ({
            balance: Math.round((w.balance + earnings) * 10) / 10,
            transactions: [
              {
                id: `TXN-${Date.now().toString().slice(-4)}`,
                type: 'order_payout',
                title: `Ganancia Pedido ${order.id} (80%)`,
                amount: earnings,
                date: 'Hoy ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                orderId: order.id,
                status: 'completado',
              },
              ...w.transactions,
            ],
          }));

          // Incrementar contador del repartidor
          if (order.driver?.id) {
            setDrivers((dList) =>
              dList.map((d) =>
                d.id === order.driver?.id ? { ...d, completedTrips: d.completedTrips + 1, status: 'disponible' } : d
              )
            );
          }
        }

        return updatedOrder;
      })
    );
  };

  const acceptOrderAsDriver = (orderId: string, driverId?: string) => {
    const targetDriverId = driverId || activeDriverId;
    const foundDriver = drivers.find((d) => d.id === targetDriverId) || {
      id: currentUser?.driverProfileId || targetDriverId,
      name: currentUser?.name || 'Repartidor',
      phone: currentUser?.phone || '976 387 226',
      photo: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      vehicle: currentUser?.vehicleInfo ? `${currentUser.vehicleInfo.brand} ${currentUser.vehicleInfo.model}` : 'Moto Honda',
      plate: currentUser?.vehicleInfo?.plate || '8492-7W',
      rating: 5.0,
      completedTrips: 0,
      lat: -9.9306,
      lng: -76.2422,
      status: 'en_pedido' as const,
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              driver: foundDriver,
              status: 'asignado',
            }
          : o
      )
    );
  };

  const acceptProposedPriceAsDriver = (orderId: string, driverId?: string) => {
    acceptOrderAsDriver(orderId, driverId);
  };

  const submitCounterOffer = (orderId: string, counterPrice: number, driverId?: string, etaMinutes = 15) => {
    const targetDriverId = driverId || activeDriverId;
    const foundDriver = drivers.find((d) => d.id === targetDriverId) || {
      id: currentUser?.driverProfileId || targetDriverId,
      name: currentUser?.name || 'Repartidor',
      phone: currentUser?.phone || '976 387 226',
      photo: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      vehicle: 'Moto',
      plate: '8492-7W',
      rating: 5.0,
      completedTrips: 0,
      lat: -9.9306,
      lng: -76.2422,
      status: 'disponible' as const,
    };

    const offerId = `OFF-${Date.now().toString().slice(-4)}`;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              counterOffers: [
                ...(o.counterOffers || []),
                {
                  id: offerId,
                  driver: foundDriver,
                  counterPrice,
                  etaMinutes,
                  status: 'pendiente',
                  timestamp: 'Justo ahora',
                },
              ],
            }
          : o
      )
    );
  };

  const ignoreOrderAsDriver = (orderId: string, driverId?: string) => {
    const dId = driverId || activeDriverId;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              ignoredByDrivers: [...(o.ignoredByDrivers || []), dId],
            }
          : o
      )
    );
  };

  const clientAcceptOffer = (orderId: string, offerId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const offer = o.counterOffers?.find((off) => off.id === offerId);
        if (!offer) return o;

        const newFare = offer.counterPrice;
        const platformFee = Math.round(newFare * 0.20 * 10) / 10;
        const driverEarnings = Math.max(0, Math.round((newFare - platformFee) * 10) / 10);

        return {
          ...o,
          status: 'asignado',
          driver: offer.driver,
          payment: {
            ...o.payment,
            servicePrice: newFare,
            total: newFare + (o.payment.productEstimatedCost || 0),
            platformFee,
            driverEarnings,
          },
          counterOffers: o.counterOffers?.map((off) =>
            off.id === offerId ? { ...off, status: 'aceptada' } : { ...off, status: 'rechazada' }
          ),
        };
      })
    );
  };

  const clientRejectOffer = (orderId: string, offerId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              counterOffers: o.counterOffers?.map((off) =>
                off.id === offerId ? { ...off, status: 'rechazada' } : off
              ),
            }
          : o
      )
    );
  };

  const updateProposedPrice = (orderId: string, newPrice: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const platformFee = Math.round(newPrice * 0.20 * 10) / 10;
        const driverEarnings = Math.max(0, Math.round((newPrice - platformFee) * 10) / 10);
        return {
          ...o,
          payment: {
            ...o.payment,
            servicePrice: newPrice,
            total: newPrice + (o.payment.productEstimatedCost || 0),
            platformFee,
            driverEarnings,
          },
        };
      })
    );
  };

  const verifyYapePayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              payment: {
                ...o.payment,
                isVerified: true,
                paymentStatus: 'pagado',
              },
            }
          : o
      )
    );
  };

  // Postulación a repartidor
  const submitDriverApplication = (appData: Omit<DriverApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApp: DriverApplication = {
      ...appData,
      id: `APP-${Date.now().toString().slice(-4)}`,
      status: 'PENDIENTE',
      submittedAt: 'Justo ahora',
    };
    setApplications((prev) => [newApp, ...prev]);
    return newApp;
  };

  // Aprobación de repartidor por el Administrador
  const updateApplicationStatus = (appId: string, status: 'APROBADO' | 'RECHAZADO') => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status } : a))
    );

    if (status === 'APROBADO') {
      const app = applications.find((a) => a.id === appId);
      if (app) {
        const newDriverId = `DRV-${Date.now().toString().slice(-4)}`;
        const newDriver: DriverInfo = {
          id: newDriverId,
          name: app.fullName,
          phone: app.phone,
          photo: app.documents?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          vehicle: `${app.brand || 'Honda'} ${app.model || 'Moto'} (${app.vehicleType})`,
          plate: app.plate || 'PENDIENTE',
          rating: 5.0,
          completedTrips: 0,
          lat: -9.9306,
          lng: -76.2422,
          status: 'disponible',
        };

        const newDriverUser: AppUser = {
          id: `USR-${newDriverId}`,
          name: app.fullName,
          email: app.email,
          phone: app.phone,
          role: 'driver',
          driverProfileId: newDriverId,
          driverStatus: 'APROBADO',
          address: app.address,
          createdAt: 'Hoy',
          avatar: newDriver.photo,
        };

        setDrivers((dList) => [...dList, newDriver]);
        setUsers((uList) => [...uList, newDriverUser]);
      }
    }
  };

  const updateCommissionConfig = (newConfig: Partial<CommissionConfig>) => {
    setCommissionConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Autenticación independiente y privada
  const login = (email: string, password?: string, intendedRole?: UserRole) => {
    const cleanEmail = email.trim().toLowerCase();

    // Verificación de credenciales de Dueño / Admin
    if (cleanEmail === 'maycolconde13@gmail.com' && password === 'shongmaycolriveracode') {
      const adminUser: AppUser = {
        id: 'USR-ADMIN-01',
        name: 'Administrador General',
        phone: '976 387 226',
        email: 'maycolconde13@gmail.com',
        role: 'admin',
        createdAt: '2025',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      };
      setCurrentUser(adminUser);
      setRole('admin');
      navigateTo('/admin');
      return { success: true };
    }

    // Verificación de repartidor
    let found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found && intendedRole === 'driver') {
      return {
        success: false,
        message: 'No existe una cuenta de repartidor registrada con este correo. Por favor postula o regístrate en "Quiero ser repartidor".',
      };
    }

    if (!found) {
      // Cliente nuevo o existente
      found = {
        id: `USR-${Date.now()}`,
        name: cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: '962 000 000',
        role: intendedRole || 'client',
        createdAt: 'Hoy',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      };
      setUsers((prev) => [...prev, found!]);
    }

    if (intendedRole && found.role !== intendedRole) {
      return {
        success: false,
        message: `Esta cuenta no tiene permisos para ingresar al área de ${intendedRole}.`,
      };
    }

    setCurrentUser(found);
    setRole(found.role);
    if (found.driverProfileId) {
      setActiveDriverId(found.driverProfileId);
    }

    if (found.role === 'admin') {
      navigateTo('/admin');
    } else if (found.role === 'driver') {
      navigateTo('/repartidor');
    } else {
      navigateTo('/');
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setRole('client');
    navigateTo('/');
  };

  const registerClient = (data: { name: string; email: string; phone: string; address?: string }) => {
    const newUser: AppUser = {
      id: `CLI-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address || 'Huánuco',
      role: 'client',
      createdAt: 'Hoy',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };
    setUsers((prev) => [...prev, newUser]);
    setClients((prev) => [
      {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        address: newUser.address || 'Huánuco',
        totalOrders: 0,
        registeredAt: 'Hoy',
        status: 'ACTIVO',
      },
      ...prev,
    ]);
    setCurrentUser(newUser);
    setRole('client');
    return { success: true, user: newUser };
  };

  const registerDriver = (data: any) => {
    const newApp = submitDriverApplication(data);
    const newDriverId = `DRV-${Date.now().toString().slice(-4)}`;

    const newDriverProfile: DriverInfo = {
      id: newDriverId,
      name: data.fullName,
      phone: data.phone,
      photo: data.documents?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      vehicle: `${data.brand || 'Honda'} ${data.model || '150'} (${data.vehicleType})`,
      plate: data.plate || 'PENDIENTE',
      rating: 5.0,
      completedTrips: 0,
      lat: -9.9306,
      lng: -76.2422,
      status: 'disponible',
    };

    const newDriverUser: AppUser = {
      id: `USR-${newDriverId}`,
      name: data.fullName,
      dni: data.dni,
      email: data.email,
      phone: data.phone,
      address: data.address,
      birthDate: data.birthDate,
      role: 'driver',
      driverProfileId: newDriverId,
      driverStatus: 'APROBADO',
      vehicleInfo: {
        type: data.vehicleType,
        brand: data.brand || 'Honda',
        model: data.model,
        year: data.year || '2023',
        plate: data.plate,
      },
      createdAt: 'Hoy',
      avatar: newDriverProfile.photo,
    };

    setDrivers((prev) => [...prev, newDriverProfile]);
    setUsers((prev) => [...prev, newDriverUser]);
    setCurrentUser(newDriverUser);
    setRole('driver');
    setActiveDriverId(newDriverId);
    navigateTo('/repartidor');

    return {
      success: true,
      message: 'Cuenta de repartidor creada exitosamente.',
      user: newDriverUser,
    };
  };

  const updateDriverAdminStatus = (driverId: string, status: DriverStatusState) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, adminStatus: status } : d))
    );
  };

  const updateDriverCommissionRate = (driverId: string, rate: number) => {
    setCommissionConfig((prev) => ({
      ...prev,
      driverCustomRates: {
        ...(prev.driverCustomRates || {}),
        [driverId]: rate,
      },
    }));
  };

  const openAuthModal = (tab: 'login' | 'register' | 'forgot' = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const submitForgotPassword = (email: string) => {
    return {
      success: true,
      message: `Se ha enviado el enlace de restablecimiento a: ${email}`,
    };
  };

  const requestWithdrawal = (amount: number, destAccount: string): boolean => {
    if (amount <= 0 || amount > wallet.balance) return false;
    setWallet((prev) => ({
      balance: Math.round((prev.balance - amount) * 10) / 10,
      transactions: [
        {
          id: `TXN-${Date.now().toString().slice(-4)}`,
          type: 'withdrawal',
          title: `Retiro a ${destAccount}`,
          amount: -amount,
          date: 'Hoy ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'completado',
        },
        ...prev.transactions,
      ],
    }));
    return true;
  };

  const openChatModal = (orderId: string, senderRole: 'client' | 'driver' = 'client') => {
    setActiveChatOrderId(orderId);
    setChatSenderRole(senderRole);
  };

  const closeChatModal = () => {
    setActiveChatOrderId(null);
  };

  const sendChatMessage = (orderId: string, text: string, sender: 'client' | 'driver') => {
    const newMessage = {
      id: `MSG-${Date.now()}`,
      sender,
      senderName: sender === 'client' ? (currentUser?.name || 'Cliente') : 'Repartidor',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              chatMessages: [...(o.chatMessages || []), newMessage],
            }
          : o
      )
    );
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        currentRoute,
        navigateTo,
        currentUser,
        users,
        clients,
        login,
        registerClient,
        registerDriver,
        logout,
        updateDriverAdminStatus,
        updateDriverCommissionRate,
        authModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        submitForgotPassword,
        isClientProfileOpen,
        setIsClientProfileOpen,
        orders,
        drivers,
        applications,
        commissionConfig,
        activeClientOrderId,
        setActiveClientOrderId,
        activeDriverId,
        setActiveDriverId,
        driverOnline,
        setDriverOnline,
        wallet,
        createOrder,
        updateOrderStatus,
        acceptOrderAsDriver,
        acceptProposedPriceAsDriver,
        submitCounterOffer,
        ignoreOrderAsDriver,
        clientAcceptOffer,
        clientRejectOffer,
        updateProposedPrice,
        verifyYapePayment,
        submitDriverApplication,
        updateApplicationStatus,
        updateCommissionConfig,
        requestWithdrawal,
        calculateFare,
        openRegistrationModal,
        setOpenRegistrationModal,
        openWhatsAppModal,
        setOpenWhatsAppModal,
        activeChatOrderId,
        chatSenderRole,
        openChatModal,
        closeChatModal,
        sendChatMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

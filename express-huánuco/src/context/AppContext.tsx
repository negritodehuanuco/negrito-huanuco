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
  INITIAL_APPLICATIONS,
  INITIAL_CLIENTS,
  INITIAL_CONFIG,
  INITIAL_DRIVERS,
  INITIAL_ORDERS,
  INITIAL_USERS,
  INITIAL_WALLET_TRANSACTIONS
} from '../data/mockData';

export type UserRole = 'client' | 'driver' | 'admin';

export type AppRoute =
  | '/'
  | '/repartidores'
  | '/repartidores/registro'
  | '/administracion'
  | '/administración'
  | '/visualizacion'
  | '/cliente'
  | '/delivery'
  | '/delivery/registro'
  | '/repartidor'
  | '/repartidor/registro'
  | '/admin';

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
  // Actions
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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitialRoute = (): AppRoute => {
    if (typeof window !== 'undefined') {
      const pathname = decodeURIComponent(window.location.pathname).toLowerCase().trim();
      const hash = decodeURIComponent(window.location.hash).toLowerCase().trim().replace(/^#\/?/, '');
      const path = (pathname !== '/' && pathname !== '') ? pathname.replace(/^\//, '') : hash;

      if (path.startsWith('administra') || path.startsWith('admin')) {
        return '/administracion';
      }
      if (path.startsWith('repartidor') || path.startsWith('delivery')) {
        if (path.includes('registro')) return '/repartidores/registro';
        return '/repartidores';
      }
      if (path.startsWith('visualizacion')) {
        return '/visualizacion';
      }
      return '/';
    }
    return '/';
  };

  const [currentRoute, setCurrentRoute] = useState<AppRoute>(getInitialRoute);
  const [currentUser, setCurrentUser] = useState<AppUser | null>(INITIAL_USERS[3]);
  const [users, setUsers] = useState<AppUser[]>(INITIAL_USERS);
  const [clients, setClients] = useState<ClientProfile[]>(INITIAL_CLIENTS);

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [isClientProfileOpen, setIsClientProfileOpen] = useState<boolean>(false);

  const [role, setRole] = useState<UserRole>('admin');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [drivers, setDrivers] = useState<DriverInfo[]>(INITIAL_DRIVERS);
  const [applications, setApplications] = useState<DriverApplication[]>(INITIAL_APPLICATIONS);
  const [commissionConfig, setCommissionConfig] = useState<CommissionConfig>(INITIAL_CONFIG);
  const [activeClientOrderId, setActiveClientOrderId] = useState<string | null>('HX-8F42K');
  const [activeDriverId, setActiveDriverId] = useState<string>('DRV-101');
  const [driverOnline, setDriverOnline] = useState<boolean>(true);
  const [openRegistrationModal, setOpenRegistrationModal] = useState<boolean>(false);
  const [openWhatsAppModal, setOpenWhatsAppModal] = useState<boolean>(false);
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [chatSenderRole, setChatSenderRole] = useState<'client' | 'driver'>('client');

  const [wallet, setWallet] = useState({
    balance: 88.5,
    transactions: INITIAL_WALLET_TRANSACTIONS,
  });

  const calculateFare = (distanceKm: number, serviceType: string, estimatedCost = 0, transportVehicle?: 'moto' | 'mototaxi') => {
    let base = commissionConfig.baseFare;
    let kmRate = commissionConfig.perKmFare;
    
    // Type multipliers or additions
    let typeExtra = 0;
    if (serviceType === 'compra') typeExtra = 2.0;
    if (serviceType === 'otro') typeExtra = 3.0;
    if (serviceType === 'transporte') {
      if (transportVehicle === 'moto') {
        base = Math.max(4.0, commissionConfig.baseFare - 1.0);
        kmRate = 1.2;
      } else {
        // mototaxi
        base = Math.max(5.0, commissionConfig.baseFare);
        kmRate = 1.4;
      }
    }

    const minFare = serviceType === 'transporte' && transportVehicle === 'moto' ? 4.0 : commissionConfig.minimumFare;
    const rawServicePrice = Math.max(minFare, base + (distanceKm * kmRate) + typeExtra);
    const servicePrice = Math.round(rawServicePrice * 10) / 10;
    
    // Commission calculation
    let platformFee = 0;
    if (commissionConfig.type === 'percentage') {
      platformFee = Math.round((servicePrice * (commissionConfig.percentageValue / 100)) * 10) / 10;
    } else {
      platformFee = commissionConfig.fixedValue;
    }

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

  const createOrder = (newOrderData: Omit<Order, 'id' | 'createdAt' | 'status'>): Order => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newId = `HX-${randomHex}`;
    
    const newOrder: Order = {
      ...newOrderData,
      id: newId,
      createdAt: 'Justo ahora',
      status: 'recibido',
    };

    setOrders((prev) => [newOrder, ...prev]);
    setActiveClientOrderId(newId);

    // If order has bidding negotiation active, trigger simulated driver responses
    if (newOrder.negotiation?.status === 'bidding') {
      const propPrice = newOrder.negotiation.proposedPrice;

      // Offer 1: Juan Quispe accepts client's exact proposed price after 2.5s
      setTimeout(() => {
        setOrders((current) =>
          current.map((o) => {
            if (o.id !== newId || o.negotiation?.status !== 'bidding') return o;
            const existingOffers = o.negotiation?.offers || [];
            if (existingOffers.some((off) => off.driverId === 'DRV-104')) return o;
            return {
              ...o,
              negotiation: {
                ...o.negotiation!,
                offers: [
                  ...existingOffers,
                  {
                    id: `OFF-${Date.now()}-1`,
                    driverId: 'DRV-104',
                    driverName: 'Juan Quispe Morales',
                    driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                    driverRating: 4.9,
                    vehicleType: (newOrder.details.transportVehicle === 'mototaxi' ? 'mototaxi' : 'moto') as 'moto' | 'mototaxi',
                    vehicleInfo: newOrder.details.transportVehicle === 'mototaxi' ? 'Bajaj RE Torito (Azul)' : 'Honda Wave 110',
                    offeredPrice: propPrice,
                    isClientPriceAccepted: true,
                    etaMinutes: 5,
                    createdAt: 'Justo ahora',
                  },
                ],
              },
            };
          })
        );
      }, 2500);

      // Offer 2: Carlos Mendoza sends a slight counteroffer (+S/ 1.00) after 5s
      setTimeout(() => {
        setOrders((current) =>
          current.map((o) => {
            if (o.id !== newId || o.negotiation?.status !== 'bidding') return o;
            const existingOffers = o.negotiation?.offers || [];
            if (existingOffers.some((off) => off.driverId === 'DRV-101')) return o;
            return {
              ...o,
              negotiation: {
                ...o.negotiation!,
                offers: [
                  ...existingOffers,
                  {
                    id: `OFF-${Date.now()}-2`,
                    driverId: 'DRV-101',
                    driverName: 'Carlos Mendoza Rojas',
                    driverPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                    driverRating: 4.9,
                    vehicleType: 'moto',
                    vehicleInfo: 'Honda GLH 150 (Negra)',
                    offeredPrice: propPrice + 1.0,
                    isClientPriceAccepted: false,
                    etaMinutes: 4,
                    createdAt: 'Justo ahora',
                  },
                ],
              },
            };
          })
        );
      }, 5000);

      // Offer 3: Luis Alvarado sends another offer (+S/ 0.50) after 7.5s
      setTimeout(() => {
        setOrders((current) =>
          current.map((o) => {
            if (o.id !== newId || o.negotiation?.status !== 'bidding') return o;
            const existingOffers = o.negotiation?.offers || [];
            if (existingOffers.some((off) => off.driverId === 'DRV-105')) return o;
            return {
              ...o,
              negotiation: {
                ...o.negotiation!,
                offers: [
                  ...existingOffers,
                  {
                    id: `OFF-${Date.now()}-3`,
                    driverId: 'DRV-105',
                    driverName: 'Luis Alvarado Cerna',
                    driverPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                    driverRating: 4.8,
                    vehicleType: 'mototaxi',
                    vehicleInfo: 'Bajaj RE Torito (Rojo)',
                    offeredPrice: Math.max(propPrice, propPrice + 0.5),
                    isClientPriceAccepted: false,
                    etaMinutes: 7,
                    createdAt: 'Justo ahora',
                  },
                ],
              },
            };
          })
        );
      }, 7500);
    }

    return newOrder;
  };

  const acceptProposedPriceAsDriver = (orderId: string, driverId = activeDriverId) => {
    const currentDriver = drivers.find((d) => d.id === driverId) || drivers[0];
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const proposed = ord.negotiation?.proposedPrice || ord.pricing.servicePrice;
        const existingOffers = ord.negotiation?.offers || [];
        const isMototaxi = currentDriver.vehicle.toLowerCase().includes('torito') || currentDriver.vehicle.toLowerCase().includes('mototaxi');

        const newOffer = {
          id: `OFF-${Date.now()}`,
          driverId: currentDriver.id,
          driverName: currentDriver.name,
          driverPhoto: currentDriver.photo,
          driverRating: currentDriver.rating,
          vehicleType: (isMototaxi ? 'mototaxi' : 'moto') as 'moto' | 'mototaxi',
          vehicleInfo: currentDriver.vehicle,
          offeredPrice: proposed,
          isClientPriceAccepted: true,
          etaMinutes: 5,
          createdAt: 'Justo ahora',
        };

        return {
          ...ord,
          negotiation: {
            status: ord.negotiation?.status || 'bidding',
            proposedPrice: proposed,
            referencePrice: ord.negotiation?.referencePrice || ord.pricing.servicePrice,
            offers: [...existingOffers.filter((o) => o.driverId !== currentDriver.id), newOffer],
          },
        };
      })
    );
  };

  const submitCounterOffer = (
    orderId: string,
    counterPrice: number,
    driverId = activeDriverId,
    etaMinutes = 6
  ) => {
    const currentDriver = drivers.find((d) => d.id === driverId) || drivers[0];
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const proposed = ord.negotiation?.proposedPrice || ord.pricing.servicePrice;
        const existingOffers = ord.negotiation?.offers || [];
        const isMototaxi = currentDriver.vehicle.toLowerCase().includes('torito') || currentDriver.vehicle.toLowerCase().includes('mototaxi');

        const newOffer = {
          id: `OFF-${Date.now()}`,
          driverId: currentDriver.id,
          driverName: currentDriver.name,
          driverPhoto: currentDriver.photo,
          driverRating: currentDriver.rating,
          vehicleType: (isMototaxi ? 'mototaxi' : 'moto') as 'moto' | 'mototaxi',
          vehicleInfo: currentDriver.vehicle,
          offeredPrice: counterPrice,
          isClientPriceAccepted: counterPrice === proposed,
          etaMinutes,
          createdAt: 'Justo ahora',
        };

        return {
          ...ord,
          negotiation: {
            status: ord.negotiation?.status || 'bidding',
            proposedPrice: proposed,
            referencePrice: ord.negotiation?.referencePrice || ord.pricing.servicePrice,
            offers: [...existingOffers.filter((o) => o.driverId !== currentDriver.id), newOffer],
          },
        };
      })
    );
  };

  const ignoreOrderAsDriver = (orderId: string, driverId = activeDriverId) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const ignored = ord.ignoredByDrivers || [];
        return {
          ...ord,
          ignoredByDrivers: [...ignored, driverId],
        };
      })
    );
  };

  const clientAcceptOffer = (orderId: string, offerId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const offer = ord.negotiation?.offers.find((o) => o.id === offerId);
        if (!offer) return ord;

        const assignedDriver =
          drivers.find((d) => d.id === offer.driverId) || {
            id: offer.driverId,
            name: offer.driverName,
            phone: '962 458 912',
            photo: offer.driverPhoto,
            vehicle: offer.vehicleInfo,
            plate: '4821-3W',
            rating: offer.driverRating,
            completedTrips: 180,
            lat: ord.pickup.lat,
            lng: ord.pickup.lng,
            status: 'en_pedido' as const,
          };

        const finalPrice = offer.offeredPrice;
        let platformFee = 0;
        if (commissionConfig.type === 'percentage') {
          platformFee = Math.round((finalPrice * (commissionConfig.percentageValue / 100)) * 10) / 10;
        } else {
          platformFee = commissionConfig.fixedValue;
        }
        const driverEarnings = Math.max(0, Math.round((finalPrice - platformFee) * 10) / 10);
        const itemCost = ord.pricing.itemPrice || 0;
        const total = finalPrice + itemCost;

        return {
          ...ord,
          status: 'asignado',
          driver: assignedDriver,
          pricing: {
            ...ord.pricing,
            servicePrice: finalPrice,
            platformFee,
            driverEarnings,
            total,
          },
          negotiation: {
            status: 'agreed',
            proposedPrice: ord.negotiation?.proposedPrice || finalPrice,
            referencePrice: ord.negotiation?.referencePrice || finalPrice,
            offers: ord.negotiation?.offers || [],
            acceptedOffer: {
              driverId: offer.driverId,
              driverName: offer.driverName,
              agreedPrice: finalPrice,
              acceptedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          },
        };
      })
    );
  };

  const clientRejectOffer = (orderId: string, offerId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId || !ord.negotiation) return ord;
        return {
          ...ord,
          negotiation: {
            ...ord.negotiation,
            offers: ord.negotiation.offers.filter((o) => o.id !== offerId),
          },
        };
      })
    );
  };

  const updateProposedPrice = (orderId: string, newPrice: number) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const itemCost = ord.pricing.itemPrice || 0;
        const total = newPrice + itemCost;
        return {
          ...ord,
          pricing: {
            ...ord.pricing,
            servicePrice: newPrice,
            proposedPrice: newPrice,
            total,
            driverEarnings: Math.max(0, newPrice - ord.pricing.platformFee),
          },
          negotiation: ord.negotiation
            ? {
                ...ord.negotiation,
                proposedPrice: newPrice,
              }
            : undefined,
        };
      })
    );
  };

  const openChatModal = (orderId: string, senderRole: 'client' | 'driver' = 'client') => {
    setActiveChatOrderId(orderId);
    setChatSenderRole(senderRole);
  };

  const closeChatModal = () => {
    setActiveChatOrderId(null);
  };

  const sendChatMessage = (orderId: string, text: string, sender: 'client' | 'driver') => {
    if (!text.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const currentMessages = ord.chatMessages || [];
        const senderName = sender === 'client' ? ord.customer.name : (ord.driver?.name || 'Repartidor');
        const newMsg = {
          id: `msg-${Date.now()}`,
          sender,
          senderName,
          text: text.trim(),
          timestamp: now,
        };
        return {
          ...ord,
          chatMessages: [...currentMessages, newMsg],
        };
      })
    );

    // If client sent a message and service is active with driver, simulate driver reply after 2.5s
    if (sender === 'client') {
      setTimeout(() => {
        setOrders((current) =>
          current.map((o) => {
            if (o.id !== orderId || o.status === 'entregado' || o.status === 'cancelado' || !o.driver) return o;
            const msgs = o.chatMessages || [];
            const driverReplies = [
              '¡Entendido! Ya voy en ruta hacia tu dirección en Huánuco.',
              'Listo, llego en aproximadamente 4 minutos.',
              'De acuerdo, gracias por la indicación. Ya estoy cerca.',
              'Recibido, te aviso apenas llegue a la puerta.',
            ];
            const randomReply = driverReplies[Math.floor(Math.random() * driverReplies.length)];
            return {
              ...o,
              chatMessages: [
                ...msgs,
                {
                  id: `msg-${Date.now()}-reply`,
                  sender: 'driver',
                  senderName: o.driver.name,
                  text: randomReply,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            };
          })
        );
      }, 2500);
    }
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const updated: Order = {
          ...ord,
          status,
        };
        if (status === 'entregado' && note) {
          updated.deliveryProof = {
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            note,
          };
          // Credit driver wallet
          if (ord.driver && ord.driver.id === activeDriverId) {
            setWallet((w) => ({
              balance: Math.round((w.balance + ord.pricing.driverEarnings) * 10) / 10,
              transactions: [
                {
                  id: `TXN-${Date.now().toString().slice(-4)}`,
                  type: 'order_payout',
                  title: `Ganancia Pedido ${ord.id}`,
                  amount: ord.pricing.driverEarnings,
                  date: 'Hoy ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  orderId: ord.id,
                  status: 'completado',
                },
                ...w.transactions,
              ],
            }));
          }
        }
        return updated;
      })
    );
  };

  const acceptOrderAsDriver = (orderId: string, driverId = activeDriverId) => {
    const currentDriver = drivers.find((d) => d.id === driverId) || drivers[0];
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          status: 'asignado',
          driver: currentDriver,
        };
      })
    );
  };

  const verifyYapePayment = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        return {
          ...ord,
          payment: {
            ...ord.payment,
            isVerified: true,
            paidAt: new Date().toISOString(),
          },
        };
      })
    );
  };

  const submitDriverApplication = (
    appData: Omit<DriverApplication, 'id' | 'status' | 'submittedAt'>
  ): DriverApplication => {
    const newId = `APP-${Math.floor(100 + Math.random() * 900)}`;
    const newApp: DriverApplication = {
      ...appData,
      id: newId,
      status: 'PENDIENTE',
      submittedAt: 'Justo ahora',
    };
    setApplications((prev) => [newApp, ...prev]);
    return newApp;
  };

  const updateApplicationStatus = (appId: string, status: 'APROBADO' | 'RECHAZADO') => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        return { ...app, status };
      })
    );

    // If approved, create driver profile automatically
    if (status === 'APROBADO') {
      const app = applications.find((a) => a.id === appId);
      if (app) {
        const newDriver: DriverInfo = {
          id: `DRV-${Math.floor(200 + Math.random() * 800)}`,
          name: app.fullName,
          phone: app.phone,
          photo: app.documents.profilePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          vehicle: `${app.model} (${app.color}, ${app.vehicleType})`,
          plate: app.plate || 'PENDIENTE',
          rating: 5.0,
          completedTrips: 0,
          lat: -9.9306,
          lng: -76.2422,
          status: 'disponible',
        };
        setDrivers((prev) => [...prev, newDriver]);
      }
    }
  };

  const updateCommissionConfig = (newConfig: Partial<CommissionConfig>) => {
    setCommissionConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const navigateTo = (route: AppRoute) => {
    let canonical: AppRoute = route;
    if (route === '/cliente') canonical = '/';
    else if (route === '/delivery' || route === '/repartidor' || route === '/repartidores') canonical = '/repartidores';
    else if (route === '/delivery/registro' || route === '/repartidor/registro' || route === '/repartidores/registro') canonical = '/repartidores/registro';
    else if (route === '/admin' || route === '/administración' || route === '/administracion') canonical = '/administracion';

    setCurrentRoute(canonical);

    if (typeof window !== 'undefined') {
      try {
        const targetPath = canonical === '/' ? '/' : canonical;
        window.history.pushState({ route: canonical }, '', targetPath);
      } catch {
        // Fallback for sandboxed iframe
      }
    }
  };

  useEffect(() => {
    const handleRouteSync = () => {
      const pathname = decodeURIComponent(window.location.pathname).toLowerCase().trim();
      const hash = decodeURIComponent(window.location.hash).toLowerCase().trim().replace(/^#\/?/, '');
      const path = (pathname !== '/' && pathname !== '') ? pathname.replace(/^\//, '') : hash;

      if (path.startsWith('administra') || path.startsWith('admin')) {
        setCurrentRoute('/administracion');
      } else if (path.startsWith('repartidor') || path.startsWith('delivery')) {
        if (path.includes('registro')) setCurrentRoute('/repartidores/registro');
        else setCurrentRoute('/repartidores');
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

  const login = (email: string, _password?: string, intendedRole?: UserRole) => {
    const cleanEmail = email.trim().toLowerCase();
    let found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      if (cleanEmail === 'admin@negritodehuanuco.com' || cleanEmail === 'admin@expresshuanuco.pe' || cleanEmail.includes('admin') || intendedRole === 'admin') {
        found = users.find((u) => u.role === 'admin') || INITIAL_USERS[3];
      } else if (cleanEmail.includes('driver') || cleanEmail.includes('conductor') || intendedRole === 'driver') {
        found = users.find((u) => u.role === 'driver') || INITIAL_USERS[1];
      } else {
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
    }

    if (intendedRole && found.role !== intendedRole) {
      return {
        success: false,
        message: `Esta cuenta está registrada como "${found.role}". Para acceder a esta zona debes usar una cuenta con rol "${intendedRole}".`,
      };
    }

    setCurrentUser(found);
    setRole(found.role);
    if (found.driverProfileId) {
      setActiveDriverId(found.driverProfileId);
    }

    if (found.role === 'client') {
      navigateTo('/');
    } else if (found.role === 'driver') {
      navigateTo('/repartidores');
    } else if (found.role === 'admin') {
      navigateTo('/administracion');
    }

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
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
    navigateTo('/');
    return { success: true, user: newUser };
  };

  const registerDriver = (data: any) => {
    submitDriverApplication(data);
    const newDriverUser: AppUser = {
      id: `USR-DRV-${Date.now()}`,
      name: `${data.fullName}`,
      dni: data.dni,
      email: data.email,
      phone: data.phone,
      address: data.address,
      birthDate: data.birthDate,
      role: 'driver',
      driverStatus: 'PENDIENTE',
      vehicleInfo: {
        type: data.vehicleType,
        brand: data.brand || 'Honda',
        model: data.model,
        year: data.year || '2023',
        plate: data.plate,
      },
      createdAt: 'Hoy',
      avatar: data.documents?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
    setUsers((prev) => [...prev, newDriverUser]);
    setCurrentUser(newDriverUser);
    setRole('driver');
    navigateTo('/repartidores');
    return {
      success: true,
      message: 'Postulación registrada exitosamente en estado: Solicitud pendiente de revisión',
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
      message: `Se ha enviado el enlace de restablecimiento seguro a: ${email}`,
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

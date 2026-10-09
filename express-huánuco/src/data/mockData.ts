import { CommissionConfig, DriverApplication, DriverInfo, LocationPoint, Order, WalletTransaction, AppUser, ClientProfile } from '../types';

export const HUANUCO_LANDMARKS: LocationPoint[] = [
  {
    address: 'Plaza de Armas de Huánuco',
    reference: 'Frente a la Catedral, Jr. General Prado',
    lat: -9.9306,
    lng: -76.2422,
    district: 'Huánuco Centro',
  },
  {
    address: 'Real Plaza Huánuco',
    reference: 'Puerta Principal - Jr. Independencia 1601',
    lat: -9.9392,
    lng: -76.2365,
    district: 'Huánuco',
  },
  {
    address: 'Mercado Modelo de Huánuco',
    reference: 'Jr. Huallayco cuadra 8',
    lat: -9.9328,
    lng: -76.2405,
    district: 'Huánuco Centro',
  },
  {
    address: 'Laguna Viña del Río',
    reference: 'Malecón Daniel Alomía Robles',
    lat: -9.9388,
    lng: -76.2482,
    district: 'Huánuco',
  },
  {
    address: 'Plaza Mayor de Paucarbamba',
    reference: 'Frente a la Municipalidad de Amarilis',
    lat: -9.9450,
    lng: -76.2320,
    district: 'Amarilis',
  },
  {
    address: 'Universidad UNHEVAL (Cayhuayna)',
    reference: 'Puerta 1 - Av. Universitaria',
    lat: -9.9545,
    lng: -76.2395,
    district: 'Pillco Marca',
  },
  {
    address: 'Hospital Hermilio Valdizán',
    reference: 'Área de Emergencia - Jr. Hermilio Valdizán',
    lat: -9.9248,
    lng: -76.2475,
    district: 'Huánuco',
  },
  {
    address: 'Puente Calicanto',
    reference: 'Paseo de la Alameda de la República',
    lat: -9.9265,
    lng: -76.2389,
    district: 'Huánuco',
  },
  {
    address: 'Óvalo de Cayhuayna',
    reference: 'Intersección Carretera Central y Av. Universitaria',
    lat: -9.9610,
    lng: -76.2380,
    district: 'Pillco Marca',
  },
  {
    address: 'Jr. Dos de Mayo 850',
    reference: 'A media cuadra de BCP Huánuco',
    lat: -9.9315,
    lng: -76.2415,
    district: 'Huánuco Centro',
  }
];

// Producción limpia: Sin repartidores ficticios
export const INITIAL_DRIVERS: DriverInfo[] = [];

// Producción limpia: Sin órdenes de prueba
export const INITIAL_ORDERS: Order[] = [];

// Producción limpia: Sin solicitudes simuladas
export const INITIAL_APPLICATIONS: DriverApplication[] = [];

// Configuración oficial de la empresa: Comisión fija del 20%
export const INITIAL_CONFIG: CommissionConfig = {
  type: 'percentage',
  percentageValue: 20, // 20% para la empresa, 80% para el repartidor
  fixedValue: 2.0,
  baseFare: 5.0,
  perKmFare: 1.5,
  nightSurcharge: 2.0,
  yapeNumber: '976 387 226',
  yapeHolder: 'NEGRITO DE HUÁNUCO',
  whatsappNumber: '+51976387226',
  minimumFare: 4.0,
  purchaseLimit: 200.0,
  companyName: 'NEGRITO DE HUÁNUCO',
  companyAddress: 'Huánuco, Amarilis y Pillco Marca',
  companyCity: 'Huánuco, Perú',
};

// Producción limpia: Clientes registrados
export const INITIAL_CLIENTS: ClientProfile[] = [];

// Usuarios del sistema: Únicamente cuenta administrativa oficial
export const INITIAL_USERS: AppUser[] = [
  {
    id: 'USR-ADMIN-01',
    name: 'Administración NEGRITO DE HUÁNUCO',
    phone: '976 387 226',
    email: 'admin@negritodehuanuco.com',
    role: 'admin',
    createdAt: '2025',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  },
];

// Producción limpia: Billetera sin transacciones simuladas
export const INITIAL_WALLET_TRANSACTIONS: WalletTransaction[] = [];

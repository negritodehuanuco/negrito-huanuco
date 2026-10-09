export type ServiceType = 'paquete' | 'documento' | 'compra' | 'mandado' | 'otro' | 'transporte';

export type UserRole = 'client' | 'driver' | 'admin';

export type DriverStatusState =
  | 'PENDIENTE'
  | 'EN_REVISION'
  | 'APROBADO'
  | 'RECHAZADO'
  | 'SUSPENDIDO'
  | 'ACTIVO'
  | 'INACTIVO';

export interface AppUser {
  id: string;
  name: string;
  lastName?: string;
  dni?: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar?: string;
  driverProfileId?: string;
  driverStatus?: DriverStatusState;
  vehicleInfo?: {
    type: 'moto' | 'mototaxi';
    brand: string;
    model: string;
    year: string;
    plate: string;
  };
  address?: string;
  birthDate?: string;
  createdAt: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
  registeredAt: string;
  status: 'ACTIVO' | 'INACTIVO';
}

export type OrderStatus =
  | 'recibido'
  | 'asignado'
  | 'en_recojo'
  | 'recogido'
  | 'en_camino'
  | 'en_destino'
  | 'entregado'
  | 'cancelado';

export type PaymentMethod = 'efectivo' | 'yape' | 'yape_anticipado';

export interface LocationPoint {
  address: string;
  reference: string;
  lat: number;
  lng: number;
  district?: string;
}

export interface DriverInfo {
  id: string;
  name: string;
  phone: string;
  photo: string;
  vehicle: string;
  plate: string;
  rating: number;
  completedTrips: number;
  lat: number;
  lng: number;
  status: 'disponible' | 'en_pedido' | 'desconectado';
  adminStatus?: DriverStatusState;
  vehicleType?: 'moto' | 'mototaxi';
  vehicleBrand?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  dni?: string;
  email?: string;
  address?: string;
  commissionRate?: number; // individual commission if custom
  totalEarnings?: number;
}

export interface DriverOffer {
  id: string;
  driverId: string;
  driverName: string;
  driverPhoto: string;
  driverRating: number;
  vehicleType: 'moto' | 'mototaxi';
  vehicleInfo: string;
  offeredPrice: number;
  isClientPriceAccepted: boolean;
  etaMinutes: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  sender: 'client' | 'driver';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;
  serviceType: ServiceType;
  pickup: LocationPoint;
  destination: LocationPoint;
  customer: {
    name: string;
    phone: string;
  };
  details: {
    description: string;
    weightKg?: string;
    instructions?: string;
    storeName?: string;
    shoppingList?: string;
    estimatedItemCost?: number;
    transportVehicle?: 'moto' | 'mototaxi';
  };
  pricing: {
    baseFare: number;
    distanceKm: number;
    estimatedMinutes: number;
    servicePrice: number;
    itemPrice?: number;
    total: number;
    platformFee: number;
    driverEarnings: number;
    referencePrice?: number;
    proposedPrice?: number;
  };
  negotiation?: {
    status: 'bidding' | 'agreed';
    proposedPrice: number;
    referencePrice: number;
    offers: DriverOffer[];
    acceptedOffer?: {
      driverId: string;
      driverName: string;
      agreedPrice: number;
      acceptedAt: string;
    };
  };
  ignoredByDrivers?: string[];
  payment: {
    method: PaymentMethod;
    isVerified: boolean;
    receiptUrl?: string;
    yapeNumber?: string;
    paidAt?: string;
  };
  driver?: DriverInfo;
  deliveryProof?: {
    timestamp: string;
    note?: string;
    photoUrl?: string;
  };
  chatMessages?: ChatMessage[];
}

export interface DriverApplication {
  id: string;
  fullName: string;
  dni: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  vehicleType: 'moto' | 'mototaxi';
  model: string;
  color: string;
  plate: string;
  documents: {
    profilePhoto?: string;
    dniFront?: string;
    dniBack?: string;
    selfie?: string;
  };
  status: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  submittedAt: string;
}

export interface CommissionConfig {
  type: 'percentage' | 'fixed';
  percentageValue: number; // e.g. 10%
  fixedValue: number; // e.g. S/ 2.00
  baseFare: number; // e.g. S/ 6.00
  perKmFare: number; // e.g. S/ 1.50
  nightSurcharge: number; // e.g. S/ 2.00
  yapeNumber: string;
  yapeHolder: string;
  whatsappNumber: string;
  minimumFare: number;
  purchaseLimit: number; // e.g. S/ 150.00
  driverCustomRates?: { [driverId: string]: number };
  companyName: string;
  companyAddress: string;
  companyCity: string;
}

export interface WalletTransaction {
  id: string;
  type: 'order_payout' | 'withdrawal' | 'bonus' | 'commission_fee';
  title: string;
  amount: number;
  date: string;
  orderId?: string;
  status: 'completado' | 'procesando' | 'rechazado';
}

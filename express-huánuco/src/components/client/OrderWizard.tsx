import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  ArrowRight,
  ArrowLeft,
  Package,
  FileText,
  ShoppingCart,
  Zap,
  Truck,
  Bike,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Copy,
  Check,
  QrCode,
  CreditCard,
  Banknote,
  Smartphone,
  Phone,
  User,
  Clock,
  ExternalLink,
  Share2
} from 'lucide-react';
import { LocationPoint, PaymentMethod, ServiceType } from '../../types';
import { useApp } from '../../context/AppContext';
import { HUANUCO_LANDMARKS } from '../../data/mockData';
import { HuanucoMap } from '../common/HuanucoMap';

interface OrderWizardProps {
  onClose?: () => void;
  onFinishOrder: (orderId: string) => void;
  initialService?: ServiceType;
}

export const OrderWizard: React.FC<OrderWizardProps> = ({
  onClose,
  onFinishOrder,
  initialService = 'paquete',
}) => {
  const { createOrder, commissionConfig, calculateFare } = useApp();

  // Step state: 1 to 7
  const [step, setStep] = useState<number>(1);

  // Form states
  const [pickup, setPickup] = useState<LocationPoint>({
    address: 'Plaza de Armas de Huánuco',
    reference: 'Frente a la Catedral, Jr. General Prado',
    lat: -9.9306,
    lng: -76.2422,
    district: 'Huánuco Centro',
  });

  const [destination, setDestination] = useState<LocationPoint>({
    address: 'Real Plaza Huánuco',
    reference: 'Puerta Principal - Jr. Independencia 1601',
    lat: -9.9392,
    lng: -76.2365,
    district: 'Huánuco',
  });

  const [serviceType, setServiceType] = useState<ServiceType>(initialService);
  const [transportVehicle, setTransportVehicle] = useState<'moto' | 'mototaxi'>('moto');

  // Order Details
  const [customerName, setCustomerName] = useState('Maycol Conde');
  const [customerPhone, setCustomerPhone] = useState('962 451 892');
  const [packageDescription, setPackageDescription] = useState('Documentos y encargo cerrado');
  const [packageWeight, setPackageWeight] = useState('1 kg');
  const [pickupRefDetail, setPickupRefDetail] = useState('');
  const [destRefDetail, setDestRefDetail] = useState('');
  const [instructions, setInstructions] = useState('Por favor llamar al llegar a la puerta');

  // If shopping
  const [storeName, setStoreName] = useState('Supermercado Plaza Vea / Mifarma');
  const [shoppingList, setShoppingList] = useState('1 Pack de bebidas, 1 bolsa de pan integral');
  const [estimatedItemCost, setEstimatedItemCost] = useState<number>(30);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    serviceType === 'compra' ? 'yape_anticipado' : 'yape'
  );
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [copiedNumber, setCopiedNumber] = useState(false);

  // Final created order ID
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Proposed price for bidding/negotiation (InDrive style)
  const [customProposedPrice, setCustomProposedPrice] = useState<string>('');

  // Calculated distance & pricing
  // Approximate distance using coords
  const dist = Math.max(
    1.2,
    Math.round(
      Math.hypot(
        (pickup.lat - destination.lat) * 111,
        (pickup.lng - destination.lng) * 111 * Math.cos(pickup.lat * (Math.PI / 180))
      ) * 10
    ) / 10
  );

  const pricing = calculateFare(
    dist,
    serviceType,
    serviceType === 'compra' ? Number(estimatedItemCost) || 0 : 0,
    transportVehicle
  );

  // Quick select helper
  const handleSelectPickupPreset = (preset: LocationPoint) => {
    setPickup(preset);
  };

  const handleSelectDestPreset = (preset: LocationPoint) => {
    setDestination(preset);
  };

  const handleUseMyLocation = (target: 'pickup' | 'dest') => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPt: LocationPoint = {
            address: 'Mi Ubicación Actual (Huánuco GPS)',
            reference: 'Coordenadas GPS de dispositivo',
            lat: Math.round(pos.coords.latitude * 10000) / 10000,
            lng: Math.round(pos.coords.longitude * 10000) / 10000,
            district: 'Huánuco',
          };
          if (target === 'pickup') setPickup(newPt);
          else setDestination(newPt);
        },
        () => {
          // Fallback if permission denied
          const fallback = HUANUCO_LANDMARKS[0];
          if (target === 'pickup') setPickup(fallback);
          else setDestination(fallback);
        }
      );
    }
  };

  const handleCopyYape = () => {
    navigator.clipboard?.writeText(commissionConfig.yapeNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
      setReceiptUploaded(true);
    }
  };

  const handleSubmitOrder = () => {
    const isYapeAnticipado = paymentMethod === 'yape_anticipado';
    const userProposed = parseFloat(customProposedPrice !== '' ? customProposedPrice : pricing.servicePrice.toString());
    const finalServicePrice = userProposed > 0 ? userProposed : pricing.servicePrice;
    const itemCost = serviceType === 'compra' ? Number(estimatedItemCost) || 0 : 0;
    const finalTotal = finalServicePrice + itemCost;

    const newOrder = createOrder({
      serviceType,
      pickup: {
        ...pickup,
        reference: pickupRefDetail ? `${pickup.reference} - ${pickupRefDetail}` : pickup.reference,
      },
      destination: {
        ...destination,
        reference: destRefDetail ? `${destination.reference} - ${destRefDetail}` : destination.reference,
      },
      customer: {
        name: customerName,
        phone: customerPhone,
      },
      details: {
        description: serviceType === 'transporte'
          ? `Viaje de transporte de pasajeros en ${transportVehicle === 'moto' ? 'Moto lineal' : 'Mototaxi'}`
          : packageDescription,
        weightKg: serviceType === 'transporte' ? undefined : packageWeight,
        instructions,
        transportVehicle: serviceType === 'transporte' ? transportVehicle : undefined,
        ...(serviceType === 'compra'
          ? {
              storeName,
              shoppingList,
              estimatedItemCost: Number(estimatedItemCost) || 0,
            }
          : {}),
      },
      pricing: {
        baseFare: commissionConfig.baseFare,
        distanceKm: dist,
        estimatedMinutes: pricing.estimatedMinutes,
        servicePrice: finalServicePrice,
        referencePrice: pricing.servicePrice,
        proposedPrice: finalServicePrice,
        itemPrice: serviceType === 'compra' ? Number(estimatedItemCost) || 0 : undefined,
        total: finalTotal,
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
        isVerified: !isYapeAnticipado, // If anticipado, needs admin verification
        receiptUrl: receiptPreview || undefined,
        yapeNumber: commissionConfig.yapeNumber,
      },
    });

    setCreatedOrderId(newOrder.id);
    setStep(7); // Jump to Confirmation
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden max-w-2xl mx-auto my-4 transition-all">
      {/* Wizard Header & Stepper */}
      <div className="bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-sm">
            {step < 7 ? step : '✓'}
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight text-white uppercase">
              {step === 1 && 'Paso 1 · Punto de Recojo'}
              {step === 2 && 'Paso 2 · Punto de Destino'}
              {step === 3 && 'Paso 3 · Tipo de Servicio'}
              {step === 4 && 'Paso 4 · Detalles del Pedido'}
              {step === 5 && 'Paso 5 · Resumen y Tarifa'}
              {step === 6 && 'Paso 6 · Método de Pago'}
              {step === 7 && '¡Pedido Solicitado con Éxito!'}
            </div>
            <div className="text-xs text-slate-400">
              {step < 7 ? `Progreso: Paso ${step} de 6` : 'Confirmación oficial NEGRITO DE HUÁNUCO'}
            </div>
          </div>
        </div>

        {step > 1 && step < 7 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold px-2 py-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver</span>
          </button>
        )}
      </div>

      {/* Step Progress Line */}
      {step < 7 && (
        <div className="w-full bg-slate-100 h-1.5 flex">
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      )}

      {/* Body Content based on Step */}
      <div className="p-5 sm:p-7">
        {/* ================= PASO 1: RECOJO ================= */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                ¿Dónde recogemos tu pedido?
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Indica la dirección exacta o toca en el mapa para marcar el punto en Huánuco.
              </p>
            </div>

            {/* Address Search & My Location Button */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  value={pickup.address}
                  onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
                  placeholder="Dirección o lugar de recojo..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => handleUseMyLocation('pickup')}
                className="px-4 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Usar mi ubicación</span>
              </button>
            </div>

            {/* Reference Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Referencia del lugar
              </label>
              <input
                type="text"
                value={pickup.reference}
                onChange={(e) => setPickup({ ...pickup, reference: e.target.value })}
                placeholder="Ej. Frente al BCP, portón verde, piso 2..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            {/* Interactive Map */}
            <HuanucoMap
              pickup={pickup}
              interactiveMode="pickup"
              onSelectLocation={(pt) => {
                setPickup({
                  ...pickup,
                  address: pt.address,
                  reference: pt.reference,
                  lat: pt.lat,
                  lng: pt.lng,
                });
              }}
            />

            {/* Quick Landmark Chips */}
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1.5">
                Lugares frecuentes de recojo:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {HUANUCO_LANDMARKS.slice(0, 5).map((l, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectPickupPreset(l)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200"
                  >
                    {l.address.split('-')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full mt-4 py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>CONFIRMAR PUNTO DE RECOJO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= PASO 2: DESTINO ================= */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                ¿Dónde lo entregamos?
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Indica el destino final para que el repartidor sepa la ruta exacta.
              </p>
            </div>

            {/* Address Search & My Location Button */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-600" />
                <input
                  type="text"
                  value={destination.address}
                  onChange={(e) => setDestination({ ...destination, address: e.target.value })}
                  placeholder="Dirección o punto de entrega..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => handleUseMyLocation('dest')}
                className="px-4 py-2.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Usar mi ubicación</span>
              </button>
            </div>

            {/* Reference Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Referencia de la entrega
              </label>
              <input
                type="text"
                value={destination.reference}
                onChange={(e) => setDestination({ ...destination, reference: e.target.value })}
                placeholder="Ej. Casa de 3 pisos amarilla, timbre 2, frente al colegio..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            {/* Interactive Map */}
            <HuanucoMap
              pickup={pickup}
              destination={destination}
              interactiveMode="destination"
              onSelectLocation={(pt) => {
                setDestination({
                  ...destination,
                  address: pt.address,
                  reference: pt.reference,
                  lat: pt.lat,
                  lng: pt.lng,
                });
              }}
            />

            {/* Quick Destination Chips */}
            <div>
              <div className="text-xs font-semibold text-slate-500 mb-1.5">
                Destinos sugeridos:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {HUANUCO_LANDMARKS.slice(1, 6).map((l, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectDestPreset(l)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors border border-slate-200"
                  >
                    {l.address.split('-')[0]}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full mt-4 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>CONFIRMAR DESTINO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= PASO 3: SERVICIO ================= */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Elige el servicio que necesitas
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Selecciona la modalidad para asignar el repartidor adecuado en Huánuco.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Card 1: Paquete */}
              <button
                type="button"
                onClick={() => {
                  setServiceType('paquete');
                  if (paymentMethod === 'yape_anticipado') setPaymentMethod('yape');
                }}
                className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 relative ${
                  serviceType === 'paquete'
                    ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-3 rounded-xl ${serviceType === 'paquete' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    <span>📦 Enviar paquete</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Cajas, ropa, regalos, repostería o productos de venta.
                  </div>
                </div>
              </button>

              {/* Card 2: Documento */}
              <button
                type="button"
                onClick={() => {
                  setServiceType('documento');
                  if (paymentMethod === 'yape_anticipado') setPaymentMethod('yape');
                }}
                className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 relative ${
                  serviceType === 'documento'
                    ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-3 rounded-xl ${serviceType === 'documento' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    <span>📄 Enviar documento</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Sobres, trámites, notarías, contratos o firmas urgentes.
                  </div>
                </div>
              </button>

              {/* Card 3: Compra por encargo */}
              <button
                type="button"
                onClick={() => {
                  setServiceType('compra');
                  setPaymentMethod('yape_anticipado');
                }}
                className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 relative ${
                  serviceType === 'compra'
                    ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-3 rounded-xl ${serviceType === 'compra' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    <span>🛒 Compra por encargo</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Farmacias, restaurantes, tiendas o mercado con pago anticipado.
                  </div>
                </div>
              </button>

              {/* Card 4: Mandado */}
              <button
                type="button"
                onClick={() => {
                  setServiceType('mandado');
                  if (paymentMethod === 'yape_anticipado') setPaymentMethod('yape');
                }}
                className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 relative ${
                  serviceType === 'mandado'
                    ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-3 rounded-xl ${serviceType === 'mandado' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    <span>🏃 Mandado</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Llaves olvidadas, recojo de ropa, pagos o favores rápidos.
                  </div>
                </div>
              </button>

              {/* Card 5: Otro servicio */}
              <button
                type="button"
                onClick={() => {
                  setServiceType('otro');
                  if (paymentMethod === 'yape_anticipado') setPaymentMethod('yape');
                }}
                className={`text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 relative ${
                  serviceType === 'otro'
                    ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className={`p-3 rounded-xl ${serviceType === 'otro' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                    <span>🚚 Otro servicio</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Carga especial, encomiendas de agencias o traslados.
                  </div>
                </div>
              </button>

              {/* Card 6: Transporte (Moto o Mototaxi) */}
              <button
                type="button"
                onClick={() => {
                  setServiceType('transporte');
                  if (paymentMethod === 'yape_anticipado') setPaymentMethod('efectivo');
                }}
                className={`sm:col-span-2 text-left p-4 rounded-2xl border-2 transition-all flex flex-col gap-3 relative ${
                  serviceType === 'transporte'
                    ? 'border-amber-500 bg-amber-50/70 shadow-md ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3.5 w-full">
                  <div className={`p-3 rounded-xl ${serviceType === 'transporte' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                    <Bike className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="font-extrabold text-slate-900 text-base flex items-center justify-between">
                      <span>🏍️ Transporte urbano (Pasajeros)</span>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                        Moto o Mototaxi
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Viajes rápidos y económicos en Huánuco, Amarilis y Pillco Marca.
                    </div>
                  </div>
                </div>

                {serviceType === 'transporte' && (
                  <div className="w-full pt-2 border-t border-amber-200/80 grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setTransportVehicle('moto')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        transportVehicle === 'moto'
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs ring-1 ring-amber-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      <span className="text-base">🏍️</span>
                      <span>Moto (1 pasajero)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransportVehicle('mototaxi')}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        transportVehicle === 'mototaxi'
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs ring-1 ring-amber-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      <span className="text-base">🛺</span>
                      <span>Mototaxi (1-2 pas.)</span>
                    </button>
                  </div>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="w-full mt-4 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>CONTINUAR CON DETALLES</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= PASO 4: INFORMACIÓN DEL PEDIDO ================= */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Información del pedido
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Datos de contacto e indicaciones para el repartidor.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nombre del cliente
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Tu nombre y apellido"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Teléfono / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="999 999 999"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* General package fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Descripción del paquete o encargo
                </label>
                <input
                  type="text"
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="¿Qué se va a transportar?"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Peso aproximado
                </label>
                <input
                  type="text"
                  value={packageWeight}
                  onChange={(e) => setPackageWeight(e.target.value)}
                  placeholder="Ej. 1.5 kg"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            {/* IF SHOPPING COMPRA POR ENCARGO: Mandatory fields and clear warning */}
            {serviceType === 'compra' && (
              <div className="p-4 bg-amber-50/70 border-2 border-amber-300 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-sm">
                  <ShoppingCart className="w-4 h-4 text-amber-700" />
                  <span>Datos de la compra por encargo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 uppercase mb-1">
                      Nombre de la tienda / local
                    </label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Ej. Inkafarma, Metro, Pollería..."
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 uppercase mb-1">
                      Monto estimado de los productos (S/)
                    </label>
                    <input
                      type="number"
                      value={estimatedItemCost}
                      onChange={(e) => setEstimatedItemCost(Number(e.target.value))}
                      placeholder="0.00"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-950 uppercase mb-1">
                    Productos que necesita comprar (Lista detallada)
                  </label>
                  <textarea
                    rows={2}
                    value={shoppingList}
                    onChange={(e) => setShoppingList(e.target.value)}
                    placeholder="Detalla cada producto, marca y cantidad..."
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-medium text-slate-900"
                  />
                </div>

                {/* Prominent Mandatory Warning from Brief */}
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-900 font-medium">
                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-red-800">
                      AVISO IMPORTANTE DE SEGURIDAD:
                    </span>
                    El repartidor no debe adelantar dinero propio para realizar compras. El cliente debe pagar anticipadamente el monto estimado de la compra + servicio mediante Yape anticipado.
                  </div>
                </div>
              </div>
            )}

            {/* Additional instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Instrucciones adicionales para el repartidor
              </label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ej. Tocar timbre 302, avisar por WhatsApp cuando llegue, etc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
            </div>

            <button
              type="button"
              onClick={() => setStep(5)}
              className="w-full mt-4 py-3.5 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>VER RESUMEN Y PRECIO</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= PASO 5: PRECIO PROPUESTO & COTIZACIÓN ================= */}
        {step === 5 && (
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
                Negociación InDrive · Precio Abierto
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                ¿CUÁNTO ESTÁS DISPUESTO A PAGAR?
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Propón un precio y recibe ofertas de nuestros repartidores.
              </p>
            </div>

            {/* Editable Proposed Price Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-amber-400 uppercase tracking-wider">
                  Tu oferta de pago por el servicio
                </span>
                <span className="text-slate-400 text-[11px]">
                  Tú decides cuánto pagar
                </span>
              </div>

              {/* Big Editable Input */}
              <div className="flex items-center justify-center gap-3 py-2 bg-slate-800/80 rounded-2xl border border-amber-500/40 p-3">
                <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
                  S/
                </span>
                <input
                  type="number"
                  step="0.5"
                  min="3"
                  value={customProposedPrice !== '' ? customProposedPrice : pricing.servicePrice.toFixed(2)}
                  onChange={(e) => setCustomProposedPrice(e.target.value)}
                  placeholder={pricing.servicePrice.toFixed(2)}
                  className="w-40 sm:w-48 text-3xl sm:text-4xl font-black font-mono text-white bg-transparent border-b-2 border-amber-500 focus:outline-hidden focus:border-amber-400 text-center tracking-tight"
                />
              </div>

              {/* Quick Adjust Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(customProposedPrice !== '' ? customProposedPrice : pricing.servicePrice.toString());
                    setCustomProposedPrice(Math.max(3, current - 1).toFixed(1));
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                >
                  - S/ 1.00
                </button>
                <button
                  type="button"
                  onClick={() => setCustomProposedPrice(pricing.servicePrice.toFixed(1))}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                >
                  Sugerido S/ {pricing.servicePrice.toFixed(1)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const current = parseFloat(customProposedPrice !== '' ? customProposedPrice : pricing.servicePrice.toString());
                    setCustomProposedPrice((current + 1).toFixed(1));
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
                >
                  + S/ 1.00
                </button>
              </div>

              {/* Discreet Referential Price vs Proposed Price comparison (as requested in brief) */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/80 text-xs space-y-1">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Precio referencial:</span>
                  <span className="font-mono font-bold text-slate-300">
                    S/ {pricing.servicePrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-amber-300 font-bold">
                  <span>Tu propuesta:</span>
                  <span className="font-mono text-base text-amber-400">
                    S/ {parseFloat(customProposedPrice !== '' ? customProposedPrice : pricing.servicePrice.toString()).toFixed(2)}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pt-0.5 border-t border-slate-700/60 text-center">
                  El precio referencial es solo una guía calculada por {dist} km. Los repartidores pueden aceptar tu precio o enviarte contraofertas.
                </div>
              </div>

              {/* Extra Shopping item cost if compra */}
              {serviceType === 'compra' && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-center text-amber-200 font-semibold">
                    <span>Monto de productos a comprar:</span>
                    <span className="font-mono font-bold text-white">
                      S/ {(Number(estimatedItemCost) || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-amber-400 font-bold pt-1 border-t border-amber-500/20">
                    <span>Total estimado a desembolsar:</span>
                    <span className="font-mono text-sm text-white">
                      S/ {(
                        parseFloat(customProposedPrice !== '' ? customProposedPrice : pricing.servicePrice.toString()) +
                        (Number(estimatedItemCost) || 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Route summary box */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  A
                </div>
                <div className="text-xs">
                  <div className="text-slate-500 font-semibold">Punto de Recojo:</div>
                  <div className="font-bold text-slate-900">{pickup.address}</div>
                  <div className="text-slate-500">{pickup.reference}</div>
                </div>
              </div>

              <div className="border-l-2 border-dashed border-slate-300 ml-3.5 h-3" />

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  B
                </div>
                <div className="text-xs">
                  <div className="text-slate-500 font-semibold">Punto de Entrega:</div>
                  <div className="font-bold text-slate-900">{destination.address}</div>
                  <div className="text-slate-500">{destination.reference}</div>
                </div>
              </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Distancia</div>
                <div className="text-base font-extrabold text-slate-900">{dist} km</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Tiempo aprox.</div>
                <div className="text-base font-extrabold text-slate-900">~{pricing.estimatedMinutes} min</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Modalidad</div>
                <div className="text-base font-extrabold text-amber-600 capitalize">
                  {serviceType === 'transporte' ? `${serviceType} (${transportVehicle})` : serviceType}
                </div>
              </div>
            </div>

            {/* Primary Action Button: SOLICITAR CON ESTE PRECIO */}
            <button
              type="button"
              onClick={() => setStep(6)}
              className="w-full mt-2 py-4 bg-amber-500 hover:bg-amber-600 active:scale-[0.99] text-slate-950 font-black text-base rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>SOLICITAR CON ESTE PRECIO</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* ================= PASO 6: MÉTODOS DE PAGO ================= */}
        {step === 6 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Método de pago
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Elige cómo pagar tu pedido en Huánuco con tu precio propuesto de{' '}
                <b className="text-amber-600 font-mono">
                  S/{' '}
                  {(
                    parseFloat(customProposedPrice !== '' ? customProposedPrice : pricing.servicePrice.toString()) +
                    (serviceType === 'compra' ? Number(estimatedItemCost) || 0 : 0)
                  ).toFixed(2)}
                </b>.
              </p>
            </div>

            <div className="space-y-2">
              {/* Option 1: Efectivo (disabled if compra) */}
              <label
                className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  serviceType === 'compra'
                    ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200'
                    : paymentMethod === 'efectivo'
                    ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    disabled={serviceType === 'compra'}
                    checked={paymentMethod === 'efectivo'}
                    onChange={() => setPaymentMethod('efectivo')}
                    className="w-4 h-4 text-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💵</span>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">Efectivo contra entrega</div>
                      <div className="text-xs text-slate-500">Pagas en mano directamente al repartidor</div>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-700">
                  S/{' '}
                  {(
                    parseFloat(customProposedPrice !== '' ? customProposedPrice : pricing.servicePrice.toString()) +
                    (serviceType === 'compra' ? Number(estimatedItemCost) || 0 : 0)
                  ).toFixed(2)}
                </span>
              </label>

              {/* Option 2: Yape */}
              <label
                className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'yape'
                    ? 'border-purple-600 bg-purple-50/40 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'yape'}
                    onChange={() => setPaymentMethod('yape')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900">Yape al recibir</div>
                      <div className="text-xs text-slate-500">Yapeas al repartidor en el momento de la entrega</div>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700">Yape</span>
              </label>

              {/* Option 3: Yape anticipado */}
              <label
                className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                  paymentMethod === 'yape_anticipado'
                    ? 'border-purple-600 bg-purple-50/50 shadow-xs ring-2 ring-purple-600/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'yape_anticipado'}
                    onChange={() => setPaymentMethod('yape_anticipado')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📱</span>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>Yape anticipado</span>
                        {serviceType === 'compra' && (
                          <span className="text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded">
                            Requerido para compras
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">Con verificación de comprobante previa</div>
                    </div>
                  </div>
                </div>
                <span className="text-xs font-bold text-purple-700">Verificado</span>
              </label>
            </div>

            {/* Details when YAPE ANTICIPADO is selected */}
            {paymentMethod === 'yape_anticipado' && (
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold text-purple-950 uppercase tracking-wide">
                    Datos de pago Yape oficial
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    Negrito de Huánuco S.A.C.
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3.5 rounded-xl border border-purple-200">
                  {/* Mock Yape QR */}
                  <div className="w-24 h-24 bg-purple-900 rounded-xl p-2 flex flex-col items-center justify-center text-white shrink-0 shadow-inner">
                    <QrCode className="w-16 h-16 text-amber-400" />
                    <span className="text-[9px] font-bold tracking-tight text-white mt-0.5">YAPE HUÁNUCO</span>
                  </div>

                  <div className="flex-1 space-y-1.5 text-center sm:text-left">
                    <div className="text-xs text-slate-500 font-medium">Número Yape:</div>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-lg font-mono font-extrabold text-purple-900">
                        {commissionConfig.yapeNumber}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyYape}
                        className="p-1.5 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Copiar número"
                      >
                        {copiedNumber ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-xs text-slate-700">
                      Titular: <span className="font-bold">{commissionConfig.yapeHolder}</span>
                    </div>
                    <div className="text-xs font-bold text-purple-800">
                      Monto a transferir: S/{' '}
                      {(
                        parseFloat(customProposedPrice !== '' ? customProposedPrice : pricing.servicePrice.toString()) +
                        (serviceType === 'compra' ? Number(estimatedItemCost) || 0 : 0)
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Upload proof button / simulation */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">Subir comprobante de pago:</div>
                  <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-xl bg-white cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {receiptPreview ? (
                      <div className="flex items-center gap-3">
                        <img
                          src={receiptPreview}
                          alt="Comprobante"
                          className="w-12 h-12 object-cover rounded-lg border border-purple-300"
                        />
                        <div className="text-left text-xs">
                          <span className="font-bold text-emerald-700 block">✓ Comprobante adjuntado</span>
                          <span className="text-slate-500">Toca para cambiar captura</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-purple-700 font-semibold text-xs">
                        <Upload className="w-4 h-4" />
                        <span>Adjuntar captura de pantalla o voucher de Yape</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Status notice */}
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Estado: Esperando verificación.</span> El pedido no quedará disponible para un repartidor hasta que el pago anticipado sea verificado por el administrador.
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmitOrder}
              className="w-full mt-4 py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>
                {serviceType === 'transporte'
                  ? `SOLICITAR TRANSPORTE CON S/ ${parseFloat(customProposedPrice !== '' ? customProposedPrice : pricing.servicePrice.toString()).toFixed(2)}`
                  : `SOLICITAR CON ESTE PRECIO (S/ ${(
                      parseFloat(customProposedPrice !== '' ? customProposedPrice : pricing.servicePrice.toString()) +
                      (serviceType === 'compra' ? Number(estimatedItemCost) || 0 : 0)
                    ).toFixed(2)})`}
              </span>
            </button>
          </div>
        )}

        {/* ================= PASO 7: CONFIRMACIÓN ================= */}
        {step === 7 && (
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
                ¡Solicitud Registrada!
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                ¡Pedido solicitado!
              </h2>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Tu pedido ha sido recibido en la central de NEGRITO DE HUÁNUCO.
              </p>
            </div>

            {/* Order Code Box */}
            <div className="p-4 bg-slate-950 text-white rounded-2xl max-w-sm mx-auto shadow-md">
              <div className="text-xs text-slate-400 uppercase font-semibold">Código del pedido</div>
              <div className="text-2xl font-mono font-extrabold text-amber-400 tracking-wider my-1">
                {createdOrderId}
              </div>
              <div className="text-[11px] text-slate-300">
                Guarda este código para consultar el estado en cualquier momento.
              </div>
            </div>

            {/* Quick summary grid */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Servicio:</span>
                <span className="font-bold text-slate-900 capitalize">{serviceType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Punto de Recojo:</span>
                <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">{pickup.address}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Punto de Destino:</span>
                <span className="font-bold text-slate-900 text-right truncate max-w-[200px]">{destination.address}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Total a pagar:</span>
                <span className="font-bold text-amber-600">S/ {pricing.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Método de pago:</span>
                <span className="font-bold text-slate-900 uppercase">{paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Estado inicial:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {paymentMethod === 'yape_anticipado' ? 'Esperando verificación' : 'Buscando repartidor'}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-2 max-w-sm mx-auto pt-2">
              <button
                type="button"
                onClick={() => {
                  if (createdOrderId) onFinishOrder(createdOrderId);
                }}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <span>VER MI PEDIDO EN VIVO</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/51962123456?text=${encodeURIComponent(
                  `Hola NEGRITO DE HUÁNUCO, acabo de solicitar el pedido *${createdOrderId}* (${serviceType}). Recojo: ${pickup.address} -> Destino: ${destination.address}. Total: S/ ${pricing.total.toFixed(2)}.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>COMPARTIR POR WHATSAPP</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

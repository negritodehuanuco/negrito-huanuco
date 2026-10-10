import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Navigation, Phone, User, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';

interface OrderWizardProps {
  initialService?: string;
  onClose?: () => void;
}

export const OrderWizard: React.FC<OrderWizardProps> = ({
  initialService = 'paquete',
  onClose,
}) => {
  const { createOrder, commissionConfig, calculateFare, currentUser, openAuthModal } = useApp();

  const [step, setStep] = useState<number>(1);
  const [serviceType, setServiceType] = useState<string>(initialService);

  // Ubicaciones
  const [pickup, setPickup] = useState({
    address: '',
    reference: '',
    lat: -9.9306,
    lng: -76.2422,
  });
  const [destination, setDestination] = useState({
    address: '',
    reference: '',
    lat: -9.935,
    lng: -76.248,
  });

  const [pickupRefDetail, setPickupRefDetail] = useState('');
  const [destRefDetail, setDestRefDetail] = useState('');

  // Detalles del encargo
  const [packageDescription, setPackageDescription] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');

  // Precios y negociación
  const [estimatedItemCost, setEstimatedItemCost] = useState('');
  const [customProposedPrice, setCustomProposedPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'yape' | 'yape_anticipado'>('efectivo');

  // Tarifa calculada
  const distanceKm = 2.5; // Estimado base en Huánuco
  const pricing = calculateFare(
    distanceKm,
    serviceType,
    serviceType === 'compra' ? Number(estimatedItemCost) || 0 : 0
  );

  const handleSubmitOrder = () => {
    const isYapeAnticipado = paymentMethod === 'yape_anticipado';
    const userProposed = parseFloat(customProposedPrice !== '' ? customProposedPrice : String(pricing.servicePrice));
    const finalServicePrice = userProposed > 0 ? userProposed : pricing.servicePrice;
    const itemCost = serviceType === 'compra' ? Number(estimatedItemCost) || 0 : 0;
    const finalTotal = finalServicePrice + itemCost;

    // BLOQUEO OBLIGATORIO: El usuario debe tener cuenta creada / sesión iniciada
    if (!currentUser) {
      openAuthModal('register');
      return;
    }

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
      packageDetails: {
        description: packageDescription || 'Encargo general',
        recipientName: recipientName || currentUser.name || 'Cliente',
        recipientPhone: recipientPhone || currentUser.phone || '',
      },
      pricing: {
        distanceKm,
        servicePrice: finalServicePrice,
        platformFee: Math.round(finalServicePrice * 0.20 * 10) / 10,
        driverEarnings: Math.round(finalServicePrice * 0.80 * 10) / 10,
        total: finalTotal,
        estimatedMinutes: pricing.estimatedMinutes,
      },
      payment: {
        method: paymentMethod === 'yape_anticipado' ? 'yape' : paymentMethod,
        isAdvancePayment: isYapeAnticipado,
        productEstimatedCost: itemCost,
        servicePrice: finalServicePrice,
        platformFee: Math.round(finalServicePrice * 0.20 * 10) / 10,
        driverEarnings: Math.round(finalServicePrice * 0.80 * 10) / 10,
        total: finalTotal,
        isVerified: false,
        paymentStatus: 'pendiente',
      },
      client: {
        id: currentUser.id,
        name: currentUser.name,
        phone: currentUser.phone,
      },
    });

    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 max-w-xl mx-auto">
      {/* Encabezado */}
      <div className="flex items-center justify-between border-b pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Solicitar Delivery</h2>
          <p className="text-sm text-gray-500">Paso {step} de 3</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
          >
            Cerrar
          </button>
        )}
      </div>

      {/* Paso 1: Tipo de servicio y ruta */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio</label>
            <div className="grid grid-cols-3 gap-2">
              {['paquete', 'compra', 'transporte'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setServiceType(t)}
                  className={`py-2 px-3 rounded-xl border text-sm font-medium capitalize transition ${
                    serviceType === t
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Punto de Recojo (Origen)</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-emerald-600 w-5 h-5" />
              <input
                type="text"
                value={pickup.address}
                onChange={(e) => setPickup({ ...pickup, address: e.target.value })}
                placeholder="Ej. Jr. Dos de Mayo 450, Huánuco"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referencia de Origen (Opcional)</label>
            <input
              type="text"
              value={pickupRefDetail}
              onChange={(e) => setPickupRefDetail(e.target.value)}
              placeholder="Frente a la botica, puerta verde..."
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Punto de Entrega (Destino)</label>
            <div className="relative">
              <Navigation className="absolute left-3 top-3 text-red-500 w-5 h-5" />
              <input
                type="text"
                value={destination.address}
                onChange={(e) => setDestination({ ...destination, address: e.target.value })}
                placeholder="Ej. Av. Alameda de la República 120"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referencia de Destino (Opcional)</label>
            <input
              type="text"
              value={destRefDetail}
              onChange={(e) => setDestRefDetail(e.target.value)}
              placeholder="Casa de 2 pisos, portón negro..."
              className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            disabled={!pickup.address || !destination.address}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-4"
          >
            Continuar <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Paso 2: Detalles del encargo */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">¿Qué vamos a llevar o comprar?</label>
            <textarea
              value={packageDescription}
              onChange={(e) => setPackageDescription(e.target.value)}
              placeholder="Describe el encargo, paquete o lo que necesita que compremos..."
              rows={3}
              className="w-full p-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {serviceType === 'compra' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo estimado del producto (S/)</label>
              <input
                type="number"
                value={estimatedItemCost}
                onChange={(e) => setEstimatedItemCost(e.target.value)}
                placeholder="Ej. 25.00"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre quien recibe</label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono receptor</label>
              <input
                type="tel"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="Ej. 962000000"
                className="w-full px-4 py-2 rounded-xl border border-gray-200 text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-1/3 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-2/3 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              Ver Tarifa <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Paso 3: Tarifa y Confirmación */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Tarifa de envío sugerida:</span>
              <span className="text-lg font-bold text-emerald-800">S/ {pricing.servicePrice.toFixed(2)}</span>
            </div>
            {serviceType === 'compra' && Number(estimatedItemCost) > 0 && (
              <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                <span>Costo del producto:</span>
                <span>S/ {Number(estimatedItemCost).toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-emerald-200 pt-2 flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total aproximado:</span>
              <span className="text-xl font-black text-emerald-900">
                S/ {(pricing.servicePrice + (Number(estimatedItemCost) || 0)).toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ¿Deseas proponer otro precio de envío? (Opcional)
            </label>
            <input
              type="number"
              value={customProposedPrice}
              onChange={(e) => setCustomProposedPrice(e.target.value)}
              placeholder={`S/ ${pricing.servicePrice}`}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'efectivo', label: 'Efectivo' },
                { id: 'yape', label: 'Yape / Plin' },
                { id: 'yape_anticipado', label: 'Yape por adelantado' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition ${
                    paymentMethod === m.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {!currentUser && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800">
              ⚠️ Se te pedirá registrarte o iniciar sesión al presionar confirmar para registrar tu pedido con tu cuenta.
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-1/3 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
            >
              Atrás
            </button>
            <button
              type="button"
              onClick={handleSubmitOrder}
            

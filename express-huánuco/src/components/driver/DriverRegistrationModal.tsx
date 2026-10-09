import React, { useState } from 'react';
import {
  Bike,
  CheckCircle2,
  Upload,
  Camera,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  X,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DriverRegistrationModal: React.FC = () => {
  const { openRegistrationModal, setOpenRegistrationModal, submitDriverApplication, setRole } = useApp();

  const [step, setStep] = useState<1 | 2>(1);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [dni, setDni] = useState('');
  const [birthDate, setBirthDate] = useState('1998-04-12');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Vehicle
  const [vehicleType, setVehicleType] = useState<'moto' | 'mototaxi'>('moto');
  const [model, setModel] = useState('Honda Wave 110');
  const [color, setColor] = useState('Rojo');
  const [plate, setPlate] = useState('4821-3W');

  // Documents
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [dniFront, setDniFront] = useState<string | null>(null);
  const [dniBack, setDniBack] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<string | null>(null);

  if (!openRegistrationModal) return null;

  const handleSimulateUpload = (type: 'profile' | 'front' | 'back' | 'selfie') => {
    const mockUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
    if (type === 'profile') setProfilePhoto(mockUrl);
    if (type === 'front') setDniFront(mockUrl);
    if (type === 'back') setDniBack(mockUrl);
    if (type === 'selfie') setSelfie(mockUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitDriverApplication({
      fullName: fullName || 'Maycol Conde Figueroa',
      dni: dni || '74829103',
      birthDate,
      phone: phone || '962 458 912',
      email: email || 'repartidor@negritodehuanuco.com',
      address: address || 'Jr. Dos de Mayo 740, Huánuco',
      vehicleType,
      model,
      color,
      plate,
      documents: {
        profilePhoto: profilePhoto || undefined,
        dniFront: dniFront || undefined,
        dniBack: dniBack || undefined,
        selfie: selfie || undefined,
      },
    });

    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-black text-white p-5 flex items-center justify-between border-b-2 border-red-600 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                QUIERO SER REPARTIDOR
              </h2>
              <p className="text-xs text-neutral-300">
                Únete al equipo oficial de NEGRITO DE HUÁNUCO (negritodehuanuco.com)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setOpenRegistrationModal(false);
              setIsSubmitted(false);
              setStep(1);
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {isSubmitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">
                  Estado de Solicitud
                </span>
                <span className="inline-block mt-1 px-3 py-1 bg-red-100 text-red-900 font-extrabold text-xs rounded-full">
                  PENDIENTE DE VERIFICACIÓN
                </span>
                <h3 className="text-xl font-black text-neutral-950 tracking-tight mt-3">
                  ¡Postulación Enviada con Éxito!
                </h3>
                <p className="text-xs text-neutral-600 mt-2 max-w-md mx-auto leading-relaxed">
                  El equipo de administración de NEGRITO DE HUÁNUCO revisará tus documentos en las próximas 2 horas. Puedes ver tu solicitud en el Panel de Administración demo.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-2 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setOpenRegistrationModal(false);
                    setRole('admin');
                  }}
                  className="w-full py-3 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Ver Solicitud en Panel Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenRegistrationModal(false);
                    setIsSubmitted(false);
                  }}
                  className="w-full py-3 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Paso 1: Datos Personales y Vehículo
                    </h3>
                    <p className="text-xs text-slate-500">
                      Información para tu registro en Huánuco.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Nombres y Apellidos
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Ej. Juan Carlos Pérez"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        DNI
                      </label>
                      <input
                        type="text"
                        maxLength={8}
                        required
                        value={dni}
                        onChange={(e) => setDni(e.target.value)}
                        placeholder="8 dígitos"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="999 999 999"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                        Dirección en Huánuco
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Jr. Dos de Mayo / Amarilis / Pillco Marca..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                      />
                    </div>
                  </div>

                  {/* Vehicle Selector: Only Moto & Mototaxi */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Tipo de Vehículo
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setVehicleType('moto')}
                        className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2.5 ${
                          vehicleType === 'moto'
                            ? 'border-amber-500 bg-amber-50 text-slate-950 font-bold shadow-xs ring-2 ring-amber-500/20'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">🏍️</span>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-900">Moto Lineal</div>
                          <div className="text-[10px] text-slate-500">Para envíos rápidos</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVehicleType('mototaxi')}
                        className={`p-3 rounded-2xl border text-center transition-all flex items-center justify-center gap-2.5 ${
                          vehicleType === 'mototaxi'
                            ? 'border-amber-500 bg-amber-50 text-slate-950 font-bold shadow-xs ring-2 ring-amber-500/20'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-2xl">🛺</span>
                        <div className="text-left">
                          <div className="text-xs font-bold text-slate-900">Mototaxi</div>
                          <div className="text-[10px] text-slate-500">Bajaj / Torito</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Datos del vehículo: Modelo, Color, Placa */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Modelo</label>
                      <input
                        type="text"
                        required
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="Ej. Honda GLH 150 / Bajaj Pulsar"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Color</label>
                      <input
                        type="text"
                        required
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        placeholder="Ej. Rojo / Negro / Azul"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Placa</label>
                      <input
                        type="text"
                        required
                        value={plate}
                        onChange={(e) => setPlate(e.target.value)}
                        placeholder="Ej. 8492-7W"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>CONTINUAR A DOCUMENTOS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="border-b border-slate-100 pb-2">
                    <h3 className="font-extrabold text-sm text-slate-900">
                      Paso 2: Carga de Documentos
                    </h3>
                    <p className="text-xs text-slate-500">
                      Fotos de tu DNI y selfie para verificar tu cuenta en Huánuco.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* DNI Front */}
                    <div
                      onClick={() => handleSimulateUpload('front')}
                      className="p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl text-center cursor-pointer bg-slate-50 hover:bg-amber-50/40 transition-colors"
                    >
                      <Camera className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                      <div className="text-xs font-bold text-slate-800">DNI Frontal</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {dniFront ? '✓ Foto cargada' : 'Toca para simular carga'}
                      </div>
                    </div>

                    {/* DNI Back */}
                    <div
                      onClick={() => handleSimulateUpload('back')}
                      className="p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl text-center cursor-pointer bg-slate-50 hover:bg-amber-50/40 transition-colors"
                    >
                      <Camera className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                      <div className="text-xs font-bold text-slate-800">DNI Posterior</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {dniBack ? '✓ Foto cargada' : 'Toca para simular carga'}
                      </div>
                    </div>

                    {/* Selfie */}
                    <div
                      onClick={() => handleSimulateUpload('selfie')}
                      className="p-4 border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl text-center cursor-pointer bg-slate-50 hover:bg-amber-50/40 transition-colors"
                    >
                      <User className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
                      <div className="text-xs font-bold text-slate-800">Selfie de Rostro</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {selfie ? '✓ Foto cargada' : 'Toca para simular selfie'}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>
                      Tus datos son tratados bajo estricta confidencialidad para fines de seguridad y despacho.
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
                    >
                      ENVIAR SOLICITUD DE REPARTIDOR
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

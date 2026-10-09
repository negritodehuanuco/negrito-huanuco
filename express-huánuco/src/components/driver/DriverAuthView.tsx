import React, { useState } from 'react';
import {
  Bike,
  Lock,
  Mail,
  User,
  Phone,
  Calendar,
  CreditCard,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DriverAuthViewProps {
  initialTab?: 'login' | 'register';
}

export const DriverAuthView: React.FC<DriverAuthViewProps> = ({ initialTab = 'login' }) => {
  const { login, registerDriver, navigateTo } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Registration Form
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [birthDate, setBirthDate] = useState('1998-05-14');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  // Vehicle
  const [vehicleType, setVehicleType] = useState<'moto' | 'mototaxi'>('moto');
  const [marca, setMarca] = useState('Honda');
  const [modelo, setModelo] = useState('GLH 150');
  const [year, setYear] = useState('2023');
  const [placa, setPlaca] = useState('8492-7W');

  // Submission State
  const [isRegistered, setIsRegistered] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = login(loginEmail || 'carlos.conductor@negritodehuanuco.com', loginPassword, 'driver');
      if (!res.success) {
        setLoginError(res.message || 'Error al iniciar sesión.');
      }
    }, 400);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      registerDriver({
        fullName: `${nombre || 'Maycol'} ${apellido || 'Conde Figueroa'}`.trim(),
        dni: dni || '74829103',
        birthDate,
        phone: telefono || '962 458 912',
        email: correo || usuario || 'repartidor@negritodehuanuco.com',
        address: direccion || 'Jr. Dos de Mayo 740, Huánuco',
        vehicleType,
        brand: marca,
        model: modelo,
        year,
        plate: placa || '8492-7W',
        documents: {
          profilePhoto: fotoPerfil || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
      });
      setIsRegistered(true);
    }, 400);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-black text-white p-6 text-center relative overflow-hidden border-b-2 border-red-600">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-red-600/30">
            <Bike className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-white bg-neutral-900 px-3 py-1 rounded-full border border-neutral-700">
              Portal Oficial de Repartidores & Conductores
            </span>
            <span className="text-[10px] font-mono text-red-400 bg-red-950/80 px-2 py-0.5 rounded border border-red-600/40">
              negritodehuanuco.com
            </span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight mt-2">
            NEGRITO <span className="text-red-600">DE HUÁNUCO</span>
          </h1>
          <p className="text-xs text-neutral-300 mt-1 max-w-sm mx-auto">
            Conduce tu Moto o Mototaxi, genera ingresos diarios y atiende servicios en Huánuco, Amarilis y Pillco Marca. Ganas el 80% neto de cada viaje.
          </p>

          {/* Tab Selector */}
          {!isRegistered && (
            <div className="flex bg-neutral-900 p-1 rounded-2xl max-w-xs mx-auto mt-5 border border-neutral-800">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'login'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'register'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Quiero ser repartidor
              </button>
            </div>
          )}
        </div>

        {/* ================= POST-REGISTRATION SUCCESS ================= */}
        {isRegistered ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-red-100 text-red-900 font-extrabold text-xs rounded-full uppercase tracking-wider mb-2">
                Estado: Pendiente de revisión
              </span>
              <h2 className="text-2xl font-black text-neutral-950 tracking-tight">
                ¡Tu cuenta ha sido creada exitosamente!
              </h2>
              <p className="text-xs text-neutral-600 mt-2 max-w-md mx-auto leading-relaxed">
                Tu solicitud está en estado <b className="text-red-700">"Pendiente de revisión"</b>. El administrador de NEGRITO DE HUÁNUCO verificará tu información y vehículo para activar tu cuenta.
              </p>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl text-xs text-neutral-700 space-y-1.5 max-w-md mx-auto text-left">
              <div className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Datos recibidos para verificación:
              </div>
              <div className="text-[11px] text-neutral-600">
                • Conductor: <b>{nombre || 'Conductor'} {apellido}</b> · DNI: <b>{dni || 'Verificado'}</b>
              </div>
              <div className="text-[11px] text-neutral-600">
                • Vehículo: <b>{marca} {modelo} ({vehicleType === 'moto' ? 'Moto' : 'Mototaxi'})</b> · Placa: <b>{placa}</b>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  setIsRegistered(false);
                  setActiveTab('login');
                }}
                className="flex-1 py-3 bg-black hover:bg-neutral-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer border border-neutral-800"
              >
                Ir a Iniciar Sesión
              </button>

              <button
                type="button"
                onClick={() => navigateTo('/')}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Volver a la Web Principal (negritodehuanuco.com)
              </button>
            </div>
          </div>
        ) : activeTab === 'login' ? (
          /* ================= TAB 1: INICIAR SESIÓN ================= */
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-7 space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Correo Electrónico / Usuario
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="carlos.conductor@negritodehuanuco.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs font-medium focus:bg-white focus:border-red-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Accediendo...' : 'Iniciar Sesión como Repartidor'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick Autofill Helper Buttons */}
            <div className="pt-3 border-t border-neutral-100 space-y-2">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block text-center">
                Autocompletar credenciales de conductor registrado:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('carlos.conductor@negritodehuanuco.com');
                    setLoginPassword('123456');
                  }}
                  className="p-2 bg-neutral-50 hover:bg-red-50 border border-neutral-200 hover:border-red-400 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <div className="font-extrabold text-[11px] text-neutral-900">Carlos Mendoza (Moto)</div>
                  <div className="text-[9px] text-neutral-500 font-mono">carlos.conductor@...</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('juan.mototaxi@negritodehuanuco.com');
                    setLoginPassword('123456');
                  }}
                  className="p-2 bg-neutral-50 hover:bg-red-50 border border-neutral-200 hover:border-red-400 rounded-xl text-left transition-colors cursor-pointer"
                >
                  <div className="font-extrabold text-[11px] text-neutral-900">Juan Quispe (Mototaxi)</div>
                  <div className="text-[9px] text-neutral-500 font-mono">juan.mototaxi@...</div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="w-full py-2 text-center text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                ¿Aún no tienes cuenta? Regístrate aquí: "Quiero ser repartidor"
              </button>
            </div>
          </form>
        ) : (
          /* ================= TAB 2: QUIERO SER REPARTIDOR (REGISTRO) ================= */
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-7 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Formulario de Postulación de Repartidor
              </h2>
              <p className="text-xs text-slate-500">
                Completa tus datos personales y de tu vehículo (Moto o Mototaxi).
              </p>
            </div>

            {/* Personal Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Carlos"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Ej: Mendoza Rojas"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  DNI (8 dígitos)
                </label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="74829103"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Teléfono / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="962 458 912"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="mi.correo@gmail.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Dirección en Huánuco, Amarilis o Pillco Marca
              </label>
              <input
                type="text"
                required
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Jr. Dos de Mayo 740, Huánuco Centro"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white"
              />
            </div>

            {/* Profile Photo simulation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Foto de Perfil
              </label>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {fotoPerfil ? (
                    <img src={fotoPerfil} alt="Perfil" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-5 h-5 text-slate-500" />
                  )}
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-bold text-slate-800">
                    {fotoPerfil ? 'Foto cargada correctamente' : 'Adjuntar foto clara de rostro'}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFotoPerfil(
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                      )
                    }
                    className="text-amber-600 font-bold hover:underline text-[11px] mt-0.5"
                  >
                    Simular carga de foto ➔
                  </button>
                </div>
              </div>
            </div>

            {/* User & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Usuario para Iniciar Sesión
                </label>
                <input
                  type="text"
                  required
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="carlos_repartidor"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:bg-white font-mono"
                />
              </div>
            </div>

            {/* VEHICLE SECTION */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md inline-block">
                Datos del Vehículo
              </span>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Tipo de Vehículo
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVehicleType('moto')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      vehicleType === 'moto'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>🏍️ Motocicleta</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehicleType('mototaxi')}
                    className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      vehicleType === 'mototaxi'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>🛺 Mototaxi Torito</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marca</label>
                  <input
                    type="text"
                    required
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Honda / Bajaj"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modelo</label>
                  <input
                    type="text"
                    required
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    placeholder="GLH 150 / Torito"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Año</label>
                  <input
                    type="text"
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder="2023"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Placa</label>
                  <input
                    type="text"
                    required
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    placeholder="8492-7W"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-slate-950 hover:bg-slate-900 active:scale-[0.99] text-amber-400 font-extrabold text-xs rounded-2xl shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{isLoading ? 'Enviando postulación...' : 'QUIERO SER REPARTIDOR · ENVIAR POSTULACIÓN'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setActiveTab('login')}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium"
              >
                ¿Ya tienes una cuenta aprobada? Inicia sesión aquí
              </button>
            </div>
          </form>
        )}

        <div className="bg-neutral-50 px-6 py-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-600">
          <span>NEGRITO DE HUÁNUCO (negritodehuanuco.com) · Flota Oficial</span>
          <button
            type="button"
            onClick={() => navigateTo('/')}
            className="text-red-600 font-bold hover:underline"
          >
            ← Ir a Web Clientes (negritodehuanuco.com)
          </button>
        </div>
      </div>
    </div>
  );
};

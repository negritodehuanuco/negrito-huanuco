import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Layers, Bike } from 'lucide-react';
import { LocationPoint } from '../../types';

interface HuanucoMapProps {
  pickup?: LocationPoint;
  destination?: LocationPoint;
  driverLocation?: { lat: number; lng: number };
  interactiveMode?: 'pickup' | 'destination' | 'tracking' | 'none';
  onSelectLocation?: (point: { address: string; reference: string; lat: number; lng: number }) => void;
  heightClass?: string;
}

// Coordinate mapping boundaries for Huánuco urban area
// Lat: -9.9200 (North, Calicanto/Hospital) to -9.9650 (South, Cayhuayna)
// Lng: -76.2550 (West, Viña del Río hills) to -76.2280 (East, Amarilis hills)
const MAP_BOUNDS = {
  minLat: -9.9650,
  maxLat: -9.9200,
  minLng: -76.2550,
  maxLng: -76.2280,
};

function latLngToPercent(lat: number, lng: number) {
  const y = ((MAP_BOUNDS.maxLat - lat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  return {
    x: Math.max(5, Math.min(95, x)),
    y: Math.max(5, Math.min(95, y)),
  };
}

function percentToLatLng(x: number, y: number) {
  const lat = MAP_BOUNDS.maxLat - (y / 100) * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
  const lng = MAP_BOUNDS.minLng + (x / 100) * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
  return { lat, lng };
}

// Known points for reverse geocoding approximation on map tap
const QUICK_POINTS = [
  { name: 'Plaza de Armas Huánuco', ref: 'Jr. General Prado', x: 47, y: 23 },
  { name: 'Mercado Modelo Huánuco', ref: 'Jr. Huallayco cda 8', x: 53, y: 28 },
  { name: 'Real Plaza Huánuco', ref: 'Jr. Independencia 1601', x: 68, y: 42 },
  { name: 'Laguna Viña del Río', ref: 'Malecón Alomía Robles', x: 25, y: 41 },
  { name: 'Puente Calicanto', ref: 'Alameda de la República', x: 59, y: 14 },
  { name: 'Plaza Paucarbamba', ref: 'Amarilis Centro', x: 85, y: 55 },
  { name: 'UNHEVAL Cayhuayna', ref: 'Av. Universitaria', x: 58, y: 76 },
  { name: 'Óvalo Cayhuayna', ref: 'Carretera Central', x: 63, y: 91 },
  { name: 'Jr. Dos de Mayo', ref: 'Centro Financiero', x: 49, y: 25 },
];

export const HuanucoMap: React.FC<HuanucoMapProps> = ({
  pickup,
  destination,
  driverLocation,
  interactiveMode = 'none',
  onSelectLocation,
  heightClass = 'h-64 sm:h-72',
}) => {
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('streets');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const pickupPos = pickup ? latLngToPercent(pickup.lat, pickup.lng) : null;
  const destPos = destination ? latLngToPercent(destination.lat, destination.lng) : null;
  
  // Calculate driver position or interpolate along route
  const driverPos = driverLocation
    ? latLngToPercent(driverLocation.lat, driverLocation.lng)
    : pickupPos && destPos
    ? {
        x: pickupPos.x * 0.45 + destPos.x * 0.55,
        y: pickupPos.y * 0.45 + destPos.y * 0.55,
      }
    : null;

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSelectLocation || interactiveMode === 'none' || interactiveMode === 'tracking') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const { lat, lng } = percentToLatLng(clickX, clickY);

    // Find closest landmark name or generate realistic street
    let closest = QUICK_POINTS[0];
    let minDist = 999999;
    QUICK_POINTS.forEach((pt) => {
      const d = Math.hypot(pt.x - clickX, pt.y - clickY);
      if (d < minDist) {
        minDist = d;
        closest = pt;
      }
    });

    const isVeryClose = minDist < 12;
    const address = isVeryClose
      ? closest.name
      : `Ubicación en Huánuco (${clickX > 65 ? 'Amarilis' : clickX < 40 ? 'San Luis / Huánuco' : 'Huánuco Centro'})`;
    const reference = isVeryClose
      ? closest.ref
      : `Punto marcado en el mapa (cerca a ${closest.name})`;

    onSelectLocation({
      address,
      reference,
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
    });
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-2xl overflow-hidden border border-slate-200 shadow-inner select-none transition-all`}>
      {/* Map Surface Render */}
      <div
        onClick={handleMapClick}
        className={`w-full h-full relative cursor-${interactiveMode !== 'none' && interactiveMode !== 'tracking' ? 'crosshair' : 'default'} ${
          mapStyle === 'satellite' ? 'bg-slate-900' : 'bg-[#e5e9ec]'
        } transition-colors duration-300`}
      >
        {/* River Huallaga running north-south through Huánuco */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="huallagaRiver" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={mapStyle === 'satellite' ? '#1e3a5f' : '#85b8e2'} />
              <stop offset="100%" stopColor={mapStyle === 'satellite' ? '#172d47' : '#6ba6d6'} />
            </linearGradient>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Mountains/Hills surrounding Huánuco Valley */}
          <path
            d="M 0 0 L 25 15 L 20 45 L 10 90 L 0 100 Z"
            fill={mapStyle === 'satellite' ? '#1e293b' : '#d8deda'}
            opacity="0.6"
          />
          <path
            d="M 85 0 L 100 0 L 100 100 L 92 80 L 88 30 Z"
            fill={mapStyle === 'satellite' ? '#1e293b' : '#d8deda'}
            opacity="0.6"
          />

          {/* Huallaga River Path */}
          <path
            d="M 68 0 Q 64 20, 60 40 T 70 70 T 65 100"
            fill="none"
            stroke="url(#huallagaRiver)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />

          {/* Calicanto Bridge */}
          <line
            x1="57"
            y1="14"
            x2="63"
            y2="14"
            stroke={mapStyle === 'satellite' ? '#94a3b8' : '#78716c'}
            strokeWidth="4"
          />

          {/* Major Urban Grid / Avenues */}
          {/* Jr. 2 de Mayo / Jr. General Prado / Jr. Ayacucho (Huánuco Centro) */}
          <line x1="30" y1="20" x2="58" y2="20" stroke={mapStyle === 'satellite' ? '#334155' : '#cbd5e1'} strokeWidth="3" />
          <line x1="30" y1="26" x2="58" y2="26" stroke={mapStyle === 'satellite' ? '#475569' : '#f8fafc'} strokeWidth="5" />
          <line x1="30" y1="32" x2="58" y2="32" stroke={mapStyle === 'satellite' ? '#334155' : '#cbd5e1'} strokeWidth="3" />
          <line x1="35" y1="12" x2="35" y2="40" stroke={mapStyle === 'satellite' ? '#334155' : '#cbd5e1'} strokeWidth="3" />
          <line x1="45" y1="12" x2="45" y2="40" stroke={mapStyle === 'satellite' ? '#334155' : '#cbd5e1'} strokeWidth="3" />
          <line x1="55" y1="12" x2="55" y2="40" stroke={mapStyle === 'satellite' ? '#475569' : '#f8fafc'} strokeWidth="4" />

          {/* Carretera Central / Av. Universitaria (Huánuco to Pillco Marca) */}
          <path
            d="M 55 35 Q 58 50, 62 65 T 60 95"
            fill="none"
            stroke={mapStyle === 'satellite' ? '#f59e0b' : '#fef08a'}
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Amarilis (Paucarbamba) Grid */}
          <line x1="68" y1="50" x2="88" y2="50" stroke={mapStyle === 'satellite' ? '#334155' : '#e2e8f0'} strokeWidth="3" />
          <line x1="68" y1="58" x2="90" y2="58" stroke={mapStyle === 'satellite' ? '#334155' : '#e2e8f0'} strokeWidth="3" />
          <line x1="80" y1="42" x2="80" y2="70" stroke={mapStyle === 'satellite' ? '#334155' : '#e2e8f0'} strokeWidth="3" />

          {/* Route Line if Pickup and Destination exist */}
          {pickupPos && destPos && (
            <>
              {/* Route shadow/border */}
              <path
                d={`M ${pickupPos.x} ${pickupPos.y} Q ${(pickupPos.x + destPos.x) / 2 + 5} ${(pickupPos.y + destPos.y) / 2 - 4}, ${destPos.x} ${destPos.y}`}
                fill="none"
                stroke="#0f172a"
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.3"
              />
              {/* Route glowing line */}
              <path
                d={`M ${pickupPos.x} ${pickupPos.y} Q ${(pickupPos.x + destPos.x) / 2 + 5} ${(pickupPos.y + destPos.y) / 2 - 4}, ${destPos.x} ${destPos.y}`}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="6 4"
                className="animate-pulse"
              />
            </>
          )}
        </svg>

        {/* Huánuco Labels on Map */}
        <div className="absolute top-[16%] left-[36%] text-[10px] font-bold text-slate-500 uppercase tracking-wider pointer-events-none">
          Huánuco Centro
        </div>
        <div className="absolute top-[52%] left-[75%] text-[10px] font-bold text-slate-500 uppercase tracking-wider pointer-events-none">
          Amarilis
        </div>
        <div className="absolute top-[78%] left-[45%] text-[10px] font-bold text-slate-500 uppercase tracking-wider pointer-events-none">
          Pillco Marca
        </div>
        <div className="absolute top-[38%] left-[16%] text-[9px] font-medium text-sky-600 pointer-events-none">
          Laguna Viña del Río
        </div>
        <div className="absolute top-[8%] left-[62%] text-[9px] font-medium text-slate-500 pointer-events-none">
          Río Huallaga
        </div>

        {/* Quick Landmarks dots */}
        {QUICK_POINTS.map((pt, i) => (
          <div
            key={i}
            style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 group pointer-events-none"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:bg-amber-500 transition-colors" />
          </div>
        ))}

        {/* Pickup Pin (A) */}
        {pickupPos && (
          <div
            style={{ left: `${pickupPos.x}%`, top: `${pickupPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 z-20 pointer-events-none"
          >
            <div className="flex flex-col items-center">
              <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded shadow-md whitespace-nowrap mb-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Recojo (A)
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white ring-2 ring-emerald-500/20">
                A
              </div>
              <div className="w-1.5 h-2 bg-emerald-600 rounded-b-full shadow-sm" />
            </div>
          </div>
        )}

        {/* Destination Pin (B) */}
        {destPos && (
          <div
            style={{ left: `${destPos.x}%`, top: `${destPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-full transition-all duration-300 z-20 pointer-events-none"
          >
            <div className="flex flex-col items-center">
              <span className="px-2 py-0.5 bg-amber-600 text-white text-[10px] font-bold rounded shadow-md whitespace-nowrap mb-0.5 flex items-center gap-1">
                Destino (B)
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-lg border-2 border-white ring-2 ring-amber-500/20">
                B
              </div>
              <div className="w-1.5 h-2 bg-amber-600 rounded-b-full shadow-sm" />
            </div>
          </div>
        )}

        {/* Active Driver Bike Icon (Animated movement) */}
        {driverPos && (
          <div
            style={{ left: `${driverPos.x}%`, top: `${driverPos.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 z-30 pointer-events-none"
          >
            <div className="relative flex items-center justify-center">
              {/* Radar pulse ring */}
              <div className="absolute w-12 h-12 bg-red-600/30 rounded-full animate-ping" />
              <div className="w-10 h-10 rounded-full bg-black border-2 border-red-500 text-red-500 shadow-xl flex items-center justify-center">
                <Bike className="w-5 h-5 animate-pulse" />
              </div>
              <div className="absolute -bottom-5 bg-black/90 text-[9px] text-white font-semibold px-1.5 py-0.5 rounded shadow whitespace-nowrap border border-red-500/40">
                Repartidor Negrito
              </div>
            </div>
          </div>
        )}

        {/* Tap instructions overlay if interactive */}
        {interactiveMode !== 'none' && interactiveMode !== 'tracking' && (
          <div className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Toca el mapa para seleccionar {interactiveMode === 'pickup' ? 'punto de recojo' : 'punto de entrega'}</span>
          </div>
        )}

        {/* Map Style Controls */}
        <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-xl shadow border border-slate-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMapStyle(mapStyle === 'streets' ? 'satellite' : 'streets');
            }}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-[10px] font-semibold flex items-center gap-1"
            title="Cambiar capa de mapa"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{mapStyle === 'streets' ? 'Satélite' : 'Calles'}</span>
          </button>
        </div>

        {/* Mapbox Readiness Badge */}
        <div className="absolute bottom-2 left-2 z-10 text-[9px] font-medium text-slate-500 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs border border-slate-200">
          Huánuco GPS Engine · Preparado para Mapbox
        </div>
      </div>
    </div>
  );
};

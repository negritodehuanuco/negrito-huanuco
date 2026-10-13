import React, { useState } from 'react';
import { MapPin, Layers, Bike } from 'lucide-react';
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

  const pickupPos = pickup ? latLngToPercent(pickup.lat, pickup.lng) : null;
  const destPos = destination ? latLngToPercent(destination.lat, destination.lng) : null;
  
  // La moto SOLO existe si se pasa explícitamente una ubicación real de conductor
  const driverPos = driverLocation
    ? latLngToPercent(driverLocation.lat, driverLocation.lng)
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
            d="M 0 0

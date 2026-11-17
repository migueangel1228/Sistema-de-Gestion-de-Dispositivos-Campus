import React from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet'
import L from 'leaflet'
import { useApp } from '../context/AppContext'
import {
  Battery,
  Bot,
  Plane,
  Eye,
  KeyRound,
  Video,
  Navigation,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target
} from 'lucide-react'

// Icono vectorial minimalista para Drones y Robots (Cero Emojis)
const createCustomIcon = (type, code, status, isMoving) => {
  const isDrone = type === 'UAV'
  const brandColor = isDrone ? '#D97706' : '#002855'
  const accentFill = isDrone ? 'rgba(217, 119, 6, 0.12)' : 'rgba(0, 40, 85, 0.12)'

  // Minimalist SVG Vector for Drone (Quadcopter)
  const droneSvg = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${brandColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" fill="${brandColor}" fill-opacity="0.2"/>
      <path d="M10 10L6 6"/>
      <path d="M14 10L18 6"/>
      <path d="M10 14L6 18"/>
      <path d="M14 14L18 18"/>
      <circle cx="5" cy="5" r="2.5" stroke-dasharray="1.5 1.5"/>
      <circle cx="19" cy="5" r="2.5" stroke-dasharray="1.5 1.5"/>
      <circle cx="5" cy="19" r="2.5" stroke-dasharray="1.5 1.5"/>
      <circle cx="19" cy="19" r="2.5" stroke-dasharray="1.5 1.5"/>
      <path d="M12 7.5V9.5" stroke-width="2"/>
    </svg>
  `

  // Minimalist SVG Vector for Ground Robot (UGV Rover)
  const roverSvg = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${brandColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="5" y="8" width="14" height="8" rx="2" fill="${brandColor}" fill-opacity="0.2"/>
      <rect x="3" y="6" width="3" height="4" rx="1" fill="${brandColor}"/>
      <rect x="18" y="6" width="3" height="4" rx="1" fill="${brandColor}"/>
      <rect x="3" y="14" width="3" height="4" rx="1" fill="${brandColor}"/>
      <rect x="18" y="14" width="3" height="4" rx="1" fill="${brandColor}"/>
      <path d="M12 8V5" stroke-width="1.5"/>
      <circle cx="12" cy="4" r="1.5" fill="${brandColor}"/>
    </svg>
  `

  const svgMarkup = `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      ${
        isMoving
          ? `<div style="position: absolute; top: -4px; width: 44px; height: 44px; border-radius: 50%; border: 2px solid ${brandColor}; opacity: 0.6; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ''
      }
      <div style="width: 36px; height: 36px; border-radius: 12px; background: #ffffff; border: 2px solid ${brandColor}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15); z-index: 10;">
        ${isDrone ? droneSvg : roverSvg}
      </div>
      <div style="margin-top: 4px; background: #002855; color: #ffffff; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; padding: 1.5px 6px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2); white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.18);">
        ${code}
      </div>
    </div>
  `

  return L.divIcon({
    html: svgMarkup,
    className: 'custom-leaflet-marker',
    iconSize: [42, 54],
    iconAnchor: [21, 27],
    popupAnchor: [0, -28]
  })
}

// Icono vectorial minimalista para Puntos de Encuentro
const createMeetingPointIcon = (isStation, name) => {
  const bg = isStation ? '#059669' : '#0284C7'
  const border = isStation ? '#047857' : '#0369A1'

  const stationSvg = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  `

  const nodeSvg = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="10" r="3"/>
      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
    </svg>
  `

  const html = `
    <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
      <div style="width: 26px; height: 26px; border-radius: 50%; background: ${bg}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 8px rgba(15, 23, 42, 0.2);">
        ${isStation ? stationSvg : nodeSvg}
      </div>
      <div style="background: rgba(255,255,255,0.96); backdrop-filter: blur(4px); color: #0F172A; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 9px; font-weight: 600; padding: 1.5px 6px; border-radius: 6px; margin-top: 3px; white-space: nowrap; border: 1px solid #CBD5E1; box-shadow: 0 2px 4px rgba(0,0,0,0.08);">
        ${name.split('(')[0].trim()}
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'meeting-point-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 21],
    popupAnchor: [0, -22]
  })
}

export default function MapView({ onSelectMission, onOpenHandover, onOpenVideo }) {
  const { meetingPoints, devices, missions } = useApp()
  const campusCenter = [3.342150, -76.530200] // Centro oficial Campus PUJ Cali

  const activeMissions = missions.filter(
    m => m.status === 'En camino' || m.status === 'En camino - bateria baja'
  )

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-stitch-card bg-slate-50">
      {/* Map Legend Overlay - Minimalist Google Stitch HUD */}
      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-stitch-dropdown text-xs space-y-2 hidden sm:block min-w-[210px]">
        <div className="font-bold text-slate-900 flex items-center justify-between pb-1.5 border-b border-slate-100">
          <div className="flex items-center space-x-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#002855]" />
            <span className="tracking-tight">Campus PUJ Cali</span>
          </div>
          <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
            GCS Live
          </span>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <div className="flex items-center space-x-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block shrink-0"></span>
            <span className="font-medium">Dron Aéreo (UAV)</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#002855] inline-block shrink-0"></span>
            <span className="font-medium">Robot Terrestre (UGV)</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block shrink-0"></span>
            <span className="font-medium">Estación de Recarga</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-700">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block shrink-0"></span>
            <span className="font-medium">Puntos de Entrega</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={campusCenter}
        zoom={17}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px]"
      >
        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Campus PUJ Cali'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Polígono geocerca aproximado del Campus PUJ Cali (RR-06) */}
        <Circle
          center={campusCenter}
          radius={380}
          pathOptions={{
            color: '#002855',
            fillColor: '#002855',
            fillOpacity: 0.03,
            weight: 1.5,
            dashArray: '5, 5'
          }}
        />

        {/* Puntos de Encuentro Oficiales */}
        {meetingPoints.map(point => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={createMeetingPointIcon(point.is_charging_station, point.name)}
          >
            <Popup>
              <div className="p-3 space-y-1.5 min-w-[200px]">
                <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#002855]" />
                  <span>{point.name}</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{point.description}</p>
                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-100">
                  {point.latitude.toFixed(6)}°N, {point.longitude.toFixed(6)}°W
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Rutas de misiones activas (Polylines) */}
        {activeMissions.map(m => {
          if (!m.waypoints || m.waypoints.length === 0) return null
          const positions = m.waypoints.map(wp => [wp.lat, wp.lng])
          const color = m.device_type === 'UAV' ? '#D97706' : '#002855'

          return (
            <Polyline
              key={'poly-' + m.id}
              positions={positions}
              pathOptions={{
                color: color,
                weight: 3.5,
                opacity: 0.85,
                dashArray: m.device_type === 'UAV' ? '6, 6' : undefined
              }}
            />
          )
        })}

        {/* Dispositivos en el Mapa (RF-20, RF-21) */}
        {devices.map(device => {
          const lat = parseFloat(device.latitude) || campusCenter[0]
          const lng = parseFloat(device.longitude) || campusCenter[1]
          const isMoving = device.status === 'En servicio'

          const activeMission = missions.find(
            m => m.device_id === device.id && (m.status === 'En camino' || m.status === 'En camino - bateria baja')
          )

          return (
            <Marker
              key={device.id}
              position={[lat, lng]}
              icon={createCustomIcon(device.type, device.code, device.status, isMoving)}
            >
              <Popup>
                <div className="p-3 space-y-2.5 min-w-[220px]">
                  {/* Title & Status */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="font-bold text-xs text-slate-900 font-mono">
                      {device.code} ({device.type})
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider bg-slate-100 text-[#002855] border border-slate-200">
                      {device.status}
                    </span>
                  </div>

                  {/* Telemetry Grid (RF-20) */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div className="text-slate-500">Modelo:</div>
                    <div className="text-slate-900 font-medium text-right truncate">{device.model}</div>

                    <div className="text-slate-500">Batería:</div>
                    <div className="font-mono text-right font-bold text-amber-700">
                      {device.battery_level}%
                    </div>

                    <div className="text-slate-500">Carga Útil:</div>
                    <div className="text-right text-slate-800">{device.max_payload_kg} kg máx</div>

                    <div className="text-slate-500">Cámara:</div>
                    <div className="text-right text-slate-700 font-mono">{device.camera_resolution}</div>

                    <div className="text-slate-500">Sensores:</div>
                    <div className="text-right text-emerald-700 font-medium">OK / Operativo</div>
                  </div>

                  {/* Action buttons if in active mission */}
                  {activeMission && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-[10px] text-slate-600 font-mono truncate">
                        Destino: {activeMission.destination_name}
                      </div>
                      <div className="flex space-x-1.5">
                        <button
                          onClick={() => onOpenHandover && onOpenHandover(activeMission)}
                          className="flex-1 py-1.5 px-2 bg-[#002855] hover:bg-[#001f42] text-white font-semibold text-[10px] rounded-lg flex items-center justify-center space-x-1 transition shadow-stitch-sm"
                        >
                          <KeyRound className="w-3 h-3" />
                          <span>Validar OTP</span>
                        </button>
                        <button
                          onClick={() => onOpenVideo && onOpenVideo(activeMission)}
                          className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg flex items-center justify-center transition border border-slate-200"
                          title="Ver Streaming de Cámara"
                        >
                          <Video className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}

import React, { useState, useEffect, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMapEvents, useMap } from 'react-leaflet'
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
  Target,
  Wrench,
  Move,
  Copy,
  RotateCcw,
  Check,
  MousePointerClick,
  X,
  Crosshair,
  Sliders,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

// Icono vectorial minimalista para Drones y Robots
const createCustomIcon = (type, code, status, isMoving) => {
  const isDrone = type === 'UAV'
  const brandColor = isDrone ? '#D97706' : '#002855'

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

// Icono vectorial minimalista para Puntos de Encuentro (con soporte de selección y arrastre en Debug)
const createMeetingPointIcon = (isStation, name, isSelected = false, isDebug = false) => {
  const bg = isStation ? '#059669' : (isSelected ? '#EA580C' : '#0284C7')
  const border = isSelected ? '#F97316' : (isStation ? '#047857' : '#0369A1')

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
    <div style="display: flex; flex-direction: column; align-items: center; cursor: ${isDebug ? 'grab' : 'pointer'};">
      <div style="width: ${isSelected ? '32px' : '26px'}; height: ${isSelected ? '32px' : '26px'}; border-radius: 50%; background: ${bg}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: ${
        isSelected
          ? '0 0 0 3.5px #F97316, 0 4px 14px rgba(249, 115, 22, 0.45)'
          : '0 3px 8px rgba(15, 23, 42, 0.2)'
      }; transition: all 0.2s ease;">
        ${isStation ? stationSvg : nodeSvg}
      </div>
      <div style="background: ${isSelected ? '#FFEDD5' : 'rgba(255,255,255,0.96)'}; backdrop-filter: blur(4px); color: ${
        isSelected ? '#9A3412' : '#0F172A'
      }; font-family: 'Plus Jakarta Sans', sans-serif; font-size: ${isSelected ? '10px' : '9px'}; font-weight: ${
        isSelected ? '800' : '600'
      }; padding: 1.5px 6px; border-radius: 6px; margin-top: 3px; white-space: nowrap; border: 1px solid ${
        isSelected ? '#F97316' : '#CBD5E1'
      }; box-shadow: 0 2px 4px rgba(0,0,0,0.08); display: flex; align-items: center; gap: 3px;">
        ${isDebug ? '<span style="font-size: 8px;">✋</span>' : ''}
        <span>${name.split('(')[0].trim()}</span>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: 'meeting-point-marker',
    iconSize: [isSelected ? 42 : 32, isSelected ? 52 : 42],
    iconAnchor: [isSelected ? 21 : 16, isSelected ? 26 : 21],
    popupAnchor: [0, -22]
  })
}

// Subcomponente de eventos para el mapa en modo Debug
function MapEventsHandler({ isDebugMode, activePointId, onMapClick, onMouseMove }) {
  useMapEvents({
    click(e) {
      if (isDebugMode && activePointId && onMapClick) {
        onMapClick(e.latlng)
      }
    },
    mousemove(e) {
      if (isDebugMode && onMouseMove) {
        onMouseMove(e.latlng)
      }
    }
  })
  return null
}

// Subcomponente para centrar el mapa suavemente
function MapCenterFlyer({ targetCoords }) {
  const map = useMap()
  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, map.getZoom(), { duration: 0.6 })
    }
  }, [targetCoords, map])
  return null
}

export default function MapView({ onSelectMission, onOpenHandover, onOpenVideo }) {
  const {
    meetingPoints,
    devices,
    missions,
    updateMeetingPointLocation,
    resetMeetingPointsToDefault,
    campusCenter: contextCenter,
    campusRadius: contextRadius,
    setCampusCenter,
    isDebugMode,
    setIsDebugMode
  } = useApp()

  const campusCenter = contextCenter || [3.347200, -76.532300]
  const campusRadius = contextRadius || 480

  // Estado para el Modo Debug / Calibración Manual
  const [selectedPointId, setSelectedPointId] = useState(null)
  const [cursorPos, setCursorPos] = useState(null)
  const [copiedCode, setCopiedCode] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
  const [flyTarget, setFlyTarget] = useState(null)

  // Seleccionar por defecto el primer punto al activar Debug
  useEffect(() => {
    if (isDebugMode && !selectedPointId && meetingPoints.length > 0) {
      setSelectedPointId(meetingPoints[0].id)
    }
  }, [isDebugMode, selectedPointId, meetingPoints])

  const showToast = useCallback((msg) => {
    setToastMessage(msg)
    const t = setTimeout(() => setToastMessage(''), 3000)
    return () => clearTimeout(t)
  }, [])

  const selectedPoint = meetingPoints.find(p => p.id === selectedPointId) || meetingPoints[0]

  const activeMissions = missions.filter(
    m => m.status === 'En camino' || m.status === 'En camino - bateria baja'
  )

  // Clic en el mapa para colocar el punto activo
  const handleMapClick = (latlng) => {
    if (!selectedPointId) return
    const success = updateMeetingPointLocation(selectedPointId, latlng.lat, latlng.lng)
    if (success) {
      const p = meetingPoints.find(item => item.id === selectedPointId)
      showToast(`📍 "${p?.name || 'Punto'}" ubicado en [${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}]`)
    }
  }

  // Copiar código JavaScript de puntos de encuentro al portapapeles
  const handleCopyJsCode = () => {
    const code = `export const CAMPUS_MEETING_POINTS = ${JSON.stringify(meetingPoints, null, 2)}`
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true)
      showToast('📋 ¡Código JS de puntos de encuentro copiado al portapapeles!')
      setTimeout(() => setCopiedCode(false), 2500)
    }).catch(() => {
      showToast('⚠️ No se pudo copiar automáticamente')
    })
  }

  return (
    <div className="relative z-0 isolate w-full h-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-stitch-card bg-slate-50">
      {/* Toast flotante de confirmación */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900/90 backdrop-blur-md text-white text-xs px-4 py-2 rounded-full shadow-stitch-dropdown flex items-center space-x-2 animate-fadeIn border border-slate-700">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Botón de Activación del Modo Debug / Calibrador dentro del mapa */}
      <div className="absolute top-3 left-14 z-[400] flex flex-col space-y-2">
        <button
          onClick={() => {
            const next = !isDebugMode
            setIsDebugMode(next)
            if (next && !selectedPointId && meetingPoints.length > 0) {
              setSelectedPointId(meetingPoints[0].id)
              showToast('🛠️ Modo Calibración Activo: Arrastra marcadores o haz clic en el mapa')
            }
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-stitch-dropdown transition flex items-center space-x-2 border ${
            isDebugMode
              ? 'bg-amber-600 border-amber-700 text-white shadow-amber-500/25 ring-2 ring-amber-400'
              : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-stitch-sm'
          }`}
          title="Herramienta para mover y calibrar las posiciones exactas de cada edificio o estación en el mapa"
        >
          <Wrench className="w-4 h-4" />
          <span>{isDebugMode ? 'Calibración: ACTIVA' : 'Calibrar Ubicaciones (Debug)'}</span>
        </button>
      </div>

      {/* Map Legend Overlay - Minimalist Google Stitch HUD */}
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/90 shadow-stitch-dropdown text-xs space-y-2 hidden sm:block min-w-[210px]">
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

      {/* Panel Flotante del Modo Calibración / Debug */}
      {isDebugMode && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:w-96 z-30 bg-white/98 backdrop-blur-md border border-amber-400 rounded-2xl p-4 shadow-stitch-dropdown space-y-3 animate-fadeIn">
          {/* Header del Panel */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                <span>Calibrador de Ubicaciones</span>
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
                title={isPanelCollapsed ? 'Expandir panel' : 'Minimizar panel'}
              >
                {isPanelCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsDebugMode(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition"
                title="Cerrar modo calibración"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isPanelCollapsed && (
            <>
              {/* Instrucción clara */}
              <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-[11px] text-amber-900 leading-snug flex items-start space-x-2">
                <MousePointerClick className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-semibold text-amber-950">2 Formas de mover ubicaciones:</p>
                  <p>1. <strong>Arrastra directamente</strong> el marcador con el mouse.</p>
                  <p>2. Selecciona el punto abajo y <strong>haz clic en el mapa</strong>.</p>
                </div>
              </div>

              {/* Selector de punto de encuentro */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">
                  Punto de encuentro a calibrar:
                </label>
                <select
                  value={selectedPointId || ''}
                  onChange={(e) => {
                    setSelectedPointId(e.target.value)
                    const pt = meetingPoints.find(p => p.id === e.target.value)
                    if (pt) setFlyTarget([pt.latitude, pt.longitude])
                  }}
                  className="w-full text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-stitch-sm"
                >
                  {meetingPoints.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.is_charging_station ? '⚡ [Estación Recarga] ' : '📍 '}
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Inputs numéricos manuales de Lat / Lng */}
              {selectedPoint && (
                <div className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Latitud GPS</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={selectedPoint.latitude}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          if (!isNaN(val)) {
                            updateMeetingPointLocation(selectedPoint.id, val, selectedPoint.longitude)
                          }
                        }}
                        className="w-full text-xs font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Longitud GPS</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={selectedPoint.longitude}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          if (!isNaN(val)) {
                            updateMeetingPointLocation(selectedPoint.id, selectedPoint.latitude, val)
                          }
                        }}
                        className="w-full text-xs font-mono font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 focus:bg-white focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>Guardado local: <strong className="text-emerald-700">Automático</strong></span>
                    <button
                      onClick={() => setCampusCenter([selectedPoint.latitude, selectedPoint.longitude])}
                      className="text-[#002855] hover:underline font-semibold"
                    >
                      Fijar como centro de campus
                    </button>
                  </div>
                </div>
              )}

              {/* Coordenadas en tiempo real bajo el cursor */}
              {cursorPos && (
                <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between px-1 bg-slate-50 py-1 rounded-lg border border-slate-200">
                  <span className="flex items-center space-x-1">
                    <Crosshair className="w-3 h-3 text-slate-400" />
                    <span>Cursor:</span>
                  </span>
                  <span className="text-amber-800 font-semibold font-mono">
                    {cursorPos.lat.toFixed(6)}°N, {cursorPos.lng.toFixed(6)}°W
                  </span>
                </div>
              )}

              {/* Botones de acción */}
              <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (selectedPoint) {
                      setFlyTarget([selectedPoint.latitude, selectedPoint.longitude])
                    }
                  }}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg transition flex items-center justify-center space-x-1"
                  title="Centrar mapa en este punto"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Centrar</span>
                </button>

                <button
                  onClick={handleCopyJsCode}
                  className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg transition flex items-center justify-center space-x-1 shadow-stitch-sm"
                  title="Copiar código JavaScript formateado con las nuevas coordenadas"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? '¡Copiado!' : 'Copiar JS'}</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('¿Deseas restablecer todos los puntos a los valores por defecto iniciales?')) {
                      resetMeetingPointsToDefault()
                      showToast('Puntos restablecidos a los valores por defecto')
                    }
                  }}
                  className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] rounded-lg transition border border-rose-200 flex items-center justify-center"
                  title="Restablecer puntos por defecto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <MapContainer
        center={campusCenter}
        zoom={17}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[500px]"
      >
        {/* Manejador de eventos en el mapa para el Modo Debug */}
        <MapEventsHandler
          isDebugMode={isDebugMode}
          activePointId={selectedPointId}
          onMapClick={handleMapClick}
          onMouseMove={(latlng) => setCursorPos(latlng)}
        />

        {/* Vuelo al objetivo cuando se centra */}
        {flyTarget && <MapCenterFlyer targetCoords={flyTarget} />}

        {/* OpenStreetMap Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Campus PUJ Cali'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Polígono geocerca del Campus PUJ Cali (RR-06) */}
        <Circle
          center={campusCenter}
          radius={campusRadius}
          pathOptions={{
            color: '#002855',
            fillColor: '#002855',
            fillOpacity: 0.03,
            weight: 1.5,
            dashArray: '5, 5'
          }}
        />

        {/* Puntos de Encuentro Oficiales (Draggables en Modo Debug) */}
        {meetingPoints.map(point => {
          const isSelected = isDebugMode && selectedPointId === point.id

          return (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              draggable={isDebugMode}
              icon={createMeetingPointIcon(
                point.is_charging_station,
                point.name,
                isSelected,
                isDebugMode
              )}
              eventHandlers={{
                dragend: (e) => {
                  const latlng = e.target.getLatLng()
                  updateMeetingPointLocation(point.id, latlng.lat, latlng.lng)
                  setSelectedPointId(point.id)
                  showToast(`📍 "${point.name}" movido a [${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}]`)
                },
                click: () => {
                  if (isDebugMode) {
                    setSelectedPointId(point.id)
                  }
                }
              }}
            >
              <Popup>
                <div className="p-3 space-y-1.5 min-w-[210px]">
                  <div className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#002855]" />
                    <span>{point.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{point.description}</p>
                  <div className="text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>{point.latitude.toFixed(6)}°N, {point.longitude.toFixed(6)}°W</span>
                    {point.is_charging_station && (
                      <span className="text-emerald-700 font-semibold">Base de Carga</span>
                    )}
                  </div>
                  {isDebugMode && (
                    <div className="pt-2">
                      <button
                        onClick={() => setSelectedPointId(point.id)}
                        className="w-full py-1 px-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-semibold rounded-md transition shadow-stitch-sm"
                      >
                        Seleccionar para calibrar
                      </button>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}

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

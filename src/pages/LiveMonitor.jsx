import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import MapView from '../components/MapView'
import EmergencyControl from '../components/EmergencyControl'
import WeatherControl from '../components/WeatherControl'
import {
  Navigation,
  Battery,
  KeyRound,
  Video,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Clock,
  Compass,
  Radio,
  MapPin,
  BatteryCharging,
  Target,
  Wrench
} from 'lucide-react'
import { DroneMinimalIcon, RoverMinimalIcon, LivePulseDot } from '../components/MinimalLogos'

export default function LiveMonitor({ onOpenHandover, onOpenVideo }) {
  const { currentUser } = useAuth()
  const { missions, devices, alerts, resolveAlert, isDebugMode, setIsDebugMode } = useApp()
  const [selectedMissionId, setSelectedMissionId] = useState(null)

  const activeMissions = missions.filter(
    m => m.status === 'En camino' || m.status === 'En camino - bateria baja'
  )

  const selectedMission =
    missions.find(m => m.id === selectedMissionId) || activeMissions[0] || missions[0]

  const activeAlerts = alerts.filter(a => a.status === 'Activa')

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto h-[calc(100vh-65px)] flex flex-col">
      {/* Top Header - Stitch GCS Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center space-x-2.5">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Telemetría en Tiempo Real y Mapa de Operaciones
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200/80 font-medium">
              RF-20 / RF-21 / RF-30
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Frecuencia de refresco telemétrico: <strong className="text-emerald-700 font-mono font-semibold">&le; 5.0 segundos</strong> (RNF-03) · Retención de video en nube (RF-26).
          </p>
        </div>

        {/* Status Badge & Debug Toggle */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsDebugMode(!isDebugMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shadow-stitch-sm transition flex items-center space-x-2 border ${
              isDebugMode
                ? 'bg-amber-600 border-amber-700 text-white shadow-amber-500/25 ring-2 ring-amber-400'
                : 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-stitch-sm'
            }`}
            title="Activar calibración para arrastrar edificios y estaciones en el mapa"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{isDebugMode ? 'Calibración: ACTIVA' : 'Calibrar Ubicaciones (Debug)'}</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs text-slate-700 font-mono shadow-stitch-sm flex items-center space-x-2">
            <LivePulseDot status={activeMissions.length > 0 ? "transit" : "neutral"} size="xs" />
            <span className="font-semibold">{activeMissions.length} Misión(es) Activa(s)</span>
          </span>
        </div>
      </div>

      {/* Banner Informativo cuando Debug está activo */}
      {isDebugMode && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl px-4 py-2.5 text-xs text-amber-950 flex items-center justify-between shadow-stitch-sm">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
            <span>
              <strong>Modo Calibración Activo:</strong> Puedes <strong>arrastrar los marcadores con el mouse</strong> directamente sobre el mapa, o seleccionar un edificio en el panel flotante inferior y hacer clic sobre el mapa para ubicarlo.
            </span>
          </div>
          <button
            onClick={() => setIsDebugMode(false)}
            className="text-amber-800 hover:text-amber-950 font-bold underline text-[11px] shrink-0 ml-3"
          >
            Finalizar Calibración
          </button>
        </div>
      )}

      {/* Main Grid: Map (Left) + Telemetry & Controls (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0">
        {/* Left: Interactive Leaflet Map (RF-21) */}
        <div className="lg:col-span-8 flex flex-col h-full space-y-3 min-h-[420px]">
          <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200/90 shadow-stitch-card relative z-0 isolate bg-white">
            <MapView
              onOpenHandover={onOpenHandover}
              onOpenVideo={onOpenVideo}
            />
          </div>

          {/* Emergency Incident Simulator Buttons (RF-30) */}
          <div className="shrink-0">
            <EmergencyControl mission={selectedMission} />
          </div>
        </div>

        {/* Right Sidebar: Active Telemetry & Missions Detail (RF-20) */}
        <div className="lg:col-span-4 flex flex-col space-y-4 overflow-y-auto pr-1">
          {/* Active Missions Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-stitch-card space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
                <Navigation className="w-3.5 h-3.5 text-[#002855]" />
                <span>Misiones en Seguimiento ({missions.length})</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono font-medium">GCS Live</span>
            </div>

            {missions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-normal">
                No hay misiones despachadas aún. Ve al módulo "Reservas y Despacho".
              </p>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto">
                {missions.map(m => {
                  const isDrone = m.device_type === 'UAV'
                  const isSelected = selectedMission?.id === m.id
                  const isMoving = m.status === 'En camino' || m.status === 'En camino - bateria baja'

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMissionId(m.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-slate-50 border-[#002855] shadow-stitch-sm ring-1 ring-[#002855]/30'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                            isDrone
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-blue-50 border-blue-200 text-[#002855]'
                          }`}>
                            {isDrone ? (
                              <DroneMinimalIcon className="w-3.5 h-3.5" />
                            ) : (
                              <RoverMinimalIcon className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {m.device_code}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">({m.id})</span>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                            m.status === 'Entregado'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isMoving
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 space-y-1">
                        <div className="truncate flex items-center space-x-1.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{m.destination_name}</span>
                        </div>
                        <div className="flex items-center justify-between font-mono text-[10px] text-slate-700 pt-1">
                          <span className="flex items-center space-x-1">
                            <Battery className="w-3 h-3 text-slate-400" />
                            <span>{m.current_battery || 85}% Batería</span>
                          </span>
                          <span className="text-[#002855] font-bold">PIN: {m.otp_pin}</span>
                        </div>
                      </div>

                      {/* Quick Handover Button */}
                      {m.status !== 'Entregado' && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onOpenHandover && onOpenHandover(m)
                            }}
                            className="flex-1 py-1.5 px-2 bg-[#002855] hover:bg-[#001f42] text-white font-semibold text-[10px] rounded-lg transition shadow-stitch-sm flex items-center justify-center space-x-1"
                          >
                            <KeyRound className="w-3 h-3" />
                            <span>Validar Entrega OTP (RF-23)</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onOpenVideo && onOpenVideo(m)
                            }}
                            className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg transition border border-slate-200"
                            title="Ver Streaming de Cámara"
                          >
                            <Video className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Detailed Telemetry Specs of Selected Mission (RF-20) */}
          {selectedMission && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-stitch-card space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 border-b border-slate-100 pb-2">
                <Compass className="w-3.5 h-3.5 text-[#002855]" />
                <span>Telemetría de Navegación ({selectedMission.device_code})</span>
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Latitud GPS</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedMission.current_lat ? Number(selectedMission.current_lat).toFixed(6) : '3.347500'}°N
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Longitud GPS</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedMission.current_lng ? Number(selectedMission.current_lng).toFixed(6) : '-76.532500'}°W
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Nivel de Batería</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedMission.current_battery || 85}%
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/80">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Enlace Telemetría</span>
                  <span className="font-mono font-semibold text-emerald-700 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                    <span>HDOP 0.8 / Óptimo</span>
                  </span>
                </div>
              </div>

              {/* Botón de Validación de Entrega directo desde Telemetría */}
              {selectedMission.status !== 'Entregado' && (
                <div className="pt-2 border-t border-slate-100 flex items-center space-x-2">
                  <button
                    onClick={() => onOpenHandover && onOpenHandover(selectedMission)}
                    className="flex-1 py-2 px-3 bg-[#002855] hover:bg-[#001f42] text-white font-semibold text-xs rounded-xl transition shadow-stitch-sm flex items-center justify-center space-x-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Validar Entrega OTP (RF-23)</span>
                  </button>
                  <button
                    onClick={() => onOpenVideo && onOpenVideo(selectedMission)}
                    className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition border border-slate-200 flex items-center space-x-1"
                    title="Ver Streaming de Cámara"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Cámara</span>
                  </button>
                </div>
              )}

              {/* Contingency battery note (RF-32) */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start space-x-2">
                <BatteryCharging className="w-4 h-4 text-[#002855] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Contingencia Energética (RF-32):</strong> Si la batería desciende al 20%, el sistema evalúa si proyecta &ge;10% residual. En caso contrario, aborta la entrega y activa retorno inmediato a base (RTH).
                </div>
              </div>
            </div>
          )}

          {/* Active Security Alerts for Incident Closure (RF-31) */}
          {activeAlerts.length > 0 && (
            <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-4 shadow-stitch-card space-y-3">
              <div className="flex items-center space-x-2 text-rose-800">
                <LivePulseDot status="danger" size="xs" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  Atención de Alertas (RF-31)
                </h4>
              </div>

              <div className="space-y-2">
                {activeAlerts.map(alt => (
                  <div key={alt.id} className="p-3 rounded-xl bg-white border border-rose-200/90 text-xs space-y-2 shadow-stitch-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-rose-700 font-bold">{alt.type}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{alt.device_code}</span>
                    </div>
                    <button
                      onClick={() =>
                        resolveAlert(
                          alt.id,
                          'Verificación en campo completada por Vigilancia PUJ.',
                          currentUser?.full_name || 'Operador de Seguridad'
                        )
                      }
                      className="w-full py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-semibold uppercase tracking-wider shadow-stitch-sm transition"
                    >
                      Cerrar Incidente (RF-31)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

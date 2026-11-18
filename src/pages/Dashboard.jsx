import React from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import {
  Battery,
  AlertTriangle,
  CalendarCheck,
  CheckCircle,
  Wind,
  CloudRain,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Activity,
  Navigation,
  Compass
} from 'lucide-react'
import WeatherControl from '../components/WeatherControl'
import {
  DroneMinimalIcon,
  RoverMinimalIcon,
  PujAeroEmblem,
  LivePulseDot,
  StationMinimalIcon
} from '../components/MinimalLogos'

export default function Dashboard({ onNavigate }) {
  const { currentUser } = useAuth()
  const { devices, missions, reservations, alerts, weather, resolveAlert } = useApp()

  const totalDevices = devices.length
  const availableDevices = devices.filter(d => d.status === 'Disponible').length
  const chargingDevices = devices.filter(d => d.status === 'En carga').length
  const inServiceDevices = devices.filter(d => d.status === 'En servicio').length
  const outOfServiceDevices = devices.filter(d => d.status === 'Fuera de servicio').length
  const maintenanceDevices = devices.filter(d => d.status === 'En mantenimiento').length
  const operationalDevices = availableDevices + inServiceDevices + chargingDevices

  const activeMissions = missions.filter(
    m => m.status === 'En camino' || m.status === 'En camino - bateria baja'
  )
  const completedMissions = reservations.filter(r => r.status === 'Entregado').length
  const activeAlerts = alerts.filter(a => a.status === 'Activa')

  const isFlightBlocked = weather.windSpeedKmh > 25 || weather.isRaining || !weather.apiHealthy

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner - Google Stitch Mission Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-6 rounded-2xl shadow-stitch-card">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
            <PujAeroEmblem className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Consola Central GCS &amp; FMS
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-[#002855] border border-slate-200/80">
                Campus PUJ Cali
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Operador activo: <strong className="text-slate-800 font-semibold">{currentUser?.full_name}</strong> · Supervisión de flota autónoma UGV + UAV en ventana operativa.
            </p>
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('reservations')}
            className="px-4 py-2.5 rounded-xl bg-[#002855] hover:bg-[#001f42] text-white text-xs font-semibold transition shadow-stitch-sm flex items-center space-x-2"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Nueva Reserva / Despacho</span>
          </button>
          <button
            onClick={() => onNavigate('monitor')}
            className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-semibold transition flex items-center space-x-1.5 shadow-stitch-sm"
          >
            <span>Mapa en Vivo</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Clean Google Stitch Surfaces */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Devices / Operational Devices */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-stitch-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Flota en Operación</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              outOfServiceDevices > 0 ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-100/80 border-slate-200/60 text-slate-700'
            }`}>
              <DroneMinimalIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold font-mono tracking-tight ${
                outOfServiceDevices > 0 ? 'text-amber-800' : 'text-slate-900'
              }`}>
                {operationalDevices}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ {totalDevices} registrados</span>
            </div>
            {/* Visual utilization bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  outOfServiceDevices > 0 ? 'bg-amber-600' : 'bg-[#002855]'
                }`}
                style={{ width: `${(operationalDevices / totalDevices) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-emerald-700 font-semibold">{availableDevices} Disponibles</span>
            {outOfServiceDevices > 0 ? (
              <span className="text-rose-600 font-bold">{outOfServiceDevices} Fuera de servicio</span>
            ) : (
              <span className="text-blue-700 font-semibold">{inServiceDevices} En Servicio</span>
            )}
          </div>
        </div>

        {/* Active Missions in Route */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-stitch-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Misiones en Ruta</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{activeMissions.length}</span>
              <span className="text-xs font-semibold text-amber-800 flex items-center space-x-1">
                {activeMissions.length > 0 && <LivePulseDot status="transit" size="xs" />}
                <span>{activeMissions.length > 0 ? 'En navegación' : 'En espera'}</span>
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (activeMissions.length / 5) * 100)}%` }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Telemetría continua</span>
            <span className="font-mono text-slate-500">&le; 5 seg (RNF-03)</span>
          </div>
        </div>

        {/* Completed Deliveries */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-stitch-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Entregas Validadas</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{completedMissions}</span>
              <span className="text-xs text-emerald-700 font-semibold">OTP QR/PIN</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full w-full" />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Video indexado</span>
            <span className="font-mono text-slate-500">30 días (RF-26)</span>
          </div>
        </div>

        {/* Security Alerts */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-stitch-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alertas y Seguridad</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
              activeAlerts.length > 0
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-slate-100 border-slate-200/60 text-slate-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl font-bold font-mono tracking-tight ${activeAlerts.length > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {activeAlerts.length}
              </span>
              <span className="text-xs text-slate-500">activas</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${activeAlerts.length > 0 ? 'bg-rose-500' : 'bg-slate-300'}`}
                style={{ width: activeAlerts.length > 0 ? '100%' : '0%' }}
              />
            </div>
          </div>
          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span>Desvío / Batería / Caída</span>
            <span className="font-mono text-slate-500">(RF-30)</span>
          </div>
        </div>
      </div>

      {/* Interactive Weather Controller for Demo (RF-16) */}
      <WeatherControl />

      {/* Active Alerts Banner if any */}
      {activeAlerts.length > 0 && (
        <div className="bg-rose-50/90 border border-rose-200 rounded-2xl p-5 shadow-stitch-card space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-rose-900">
              <LivePulseDot status="danger" size="sm" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                Incidentes y Alertas de Emergencia en Campus (RF-30 / RF-31)
              </h3>
            </div>
            <span className="text-[11px] font-medium text-rose-700 font-mono">
              Protocolo de Atención de Vigilancia
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeAlerts.map(alt => (
              <div
                key={alt.id}
                className="bg-white border border-rose-200/90 p-4 rounded-xl flex items-center justify-between shadow-stitch-sm"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-rose-100 text-rose-900">
                      {alt.type}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      Dispositivo: {alt.device_code}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Misión {alt.mission_id} · Detectado a las {new Date(alt.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <button
                  onClick={() =>
                    resolveAlert(
                      alt.id,
                      'Inspección presencial realizada por vigilancia. Corredor verificado sin novedades.',
                      currentUser?.full_name || 'Vigilante de Turno'
                    )
                  }
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-stitch-sm transition"
                >
                  Atender y Cerrar (RF-31)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Fleet Status Summary (RF-05) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-stitch-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Estado Operativo de la Flota Inicial (RF-05 · 5 Estados Excluyentes)
            </h3>
            <p className="text-xs text-slate-500">
              Parque de 6 dispositivos base: 3 UGV (Robots) y 3 UAV (Drones) en Campus PUJ Cali
            </p>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs text-[#002855] hover:underline font-semibold flex items-center space-x-1"
          >
            <span>Ver Inventario Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {devices.map(dev => {
            const isDrone = dev.type === 'UAV'
            return (
              <div
                key={dev.id}
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 transition flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                      isDrone
                        ? 'bg-amber-50/80 border-amber-200/60 text-amber-800'
                        : 'bg-blue-50/80 border-blue-200/60 text-[#002855]'
                    }`}
                  >
                    {isDrone ? (
                      <DroneMinimalIcon className="w-4 h-4" />
                    ) : (
                      <RoverMinimalIcon className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">{dev.code}</span>
                      <span className="text-[10px] text-slate-500 font-mono">({dev.type})</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate max-w-[140px]">
                      {dev.model}
                    </p>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                      dev.status === 'Disponible'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : dev.status === 'En servicio'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : dev.status === 'En carga'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {dev.status}
                  </span>
                  <div className="flex items-center justify-end space-x-1 text-xs font-mono font-medium text-slate-700">
                    <Battery className="w-3.5 h-3.5 text-slate-400" />
                    <span>{dev.battery_level}%</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

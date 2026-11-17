import React from 'react'
import {
  LayoutDashboard,
  Navigation,
  Bot,
  CalendarCheck,
  FileSpreadsheet,
  Wrench,
  ShieldAlert,
  Radio,
  Layers
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { LivePulseDot, DroneMinimalIcon, RoverMinimalIcon } from './MinimalLogos'

export default function Sidebar({ currentTab, setCurrentTab }) {
  const { currentUser } = useAuth()
  const { alerts, devices, missions, isDebugMode, setIsDebugMode } = useApp()

  const activeAlerts = alerts.filter(a => a.status === 'Activa').length
  const activeMissions = missions.filter(m => m.status === 'En camino' || m.status === 'En camino - bateria baja').length

  const navItems = [
    {
      id: 'dashboard',
      label: 'Consola Principal',
      icon: LayoutDashboard,
      roles: ['AdminPrincipal', 'AdminOperativo', 'OperadorSeguridad']
    },
    {
      id: 'monitor',
      label: 'Mapa y Telemetría',
      icon: Navigation,
      badge: activeMissions > 0 ? `${activeMissions} en ruta` : null,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200/80',
      roles: ['AdminPrincipal', 'AdminOperativo', 'OperadorSeguridad']
    },
    {
      id: 'inventory',
      label: 'Inventario de Flota',
      icon: Bot,
      badge: `${devices.length}`,
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      roles: ['AdminPrincipal', 'AdminOperativo']
    },
    {
      id: 'reservations',
      label: 'Reservas y Despacho',
      icon: CalendarCheck,
      roles: ['AdminPrincipal', 'AdminOperativo']
    },
    {
      id: 'audit',
      label: 'Bitácora y Reportes',
      icon: FileSpreadsheet,
      roles: ['AdminPrincipal', 'AdminOperativo', 'OperadorSeguridad']
    },
    {
      id: 'maintenance',
      label: 'Mantenimiento (HW)',
      icon: Wrench,
      roles: ['AdminPrincipal', 'AdminOperativo']
    }
  ]

  const allowedItems = navItems.filter(item =>
    item.roles.includes(currentUser?.role || 'AdminOperativo')
  )

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 h-[calc(100vh-57px)]">
      <div className="p-4 space-y-6">
        <div>
          <div className="flex items-center justify-between px-3 mb-2.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Módulos del Sistema
            </p>
            <span className="flex items-center space-x-1 text-[10px] text-emerald-600 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              <span>Online</span>
            </span>
          </div>

          <nav className="space-y-1">
            {allowedItems.map(item => {
              const Icon = item.icon
              const isActive = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                    isActive
                      ? 'bg-[#002855] text-white shadow-stitch-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-md font-mono border transition ${
                        isActive
                          ? 'bg-white/20 text-white border-white/20'
                          : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Acceso Rápido Calibración de Ubicaciones Debug */}
          <div className="pt-2">
            <button
              onClick={() => {
                setIsDebugMode(true)
                setCurrentTab('monitor')
              }}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                isDebugMode && currentTab === 'monitor'
                  ? 'bg-amber-600 border-amber-700 text-white shadow-amber-500/25 ring-2 ring-amber-400'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 shadow-stitch-sm'
              }`}
              title="Abre el mapa con la herramienta de calibración y arrastre de edificios"
            >
              <div className="flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-amber-700" />
                <span>Calibrar Ubicaciones</span>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-amber-200/80 text-amber-950 font-bold uppercase">
                Debug
              </span>
            </button>
          </div>
        </div>

        {/* Security Alert Operational Box */}
        {activeAlerts > 0 && (
          <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-950 space-y-2.5 shadow-stitch-sm">
            <div className="flex items-center space-x-2 text-xs font-bold text-rose-800">
              <LivePulseDot status="danger" size="xs" />
              <span>Incidentes Activos ({activeAlerts})</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-relaxed font-normal">
              Vigilancia debe inspeccionar en campus anomalías o desvíos detectados (RF-30).
            </p>
            <button
              onClick={() => setCurrentTab('monitor')}
              className="w-full text-center py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-stitch-sm transition"
            >
              Inspeccionar en Mapa
            </button>
          </div>
        )}
      </div>

      {/* Footer System Specs */}
      <div className="p-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 bg-slate-50/40">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Regulación:</span>
          <span className="font-semibold text-slate-700 font-mono">RAC 100 Aerocivil</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Ubicación:</span>
          <span className="text-slate-700 font-mono">3.3475°N, -76.5325°W</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Ventana SLA:</span>
          <span className="text-emerald-700 font-semibold font-mono">99.0% (RNF-05)</span>
        </div>
      </div>
    </aside>
  )
}

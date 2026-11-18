import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useApp } from '@/context/AppContext'
import {
  Shield,
  ShieldCheck,
  Wind,
  CloudRain,
  Clock,
  LogOut,
  AlertTriangle,
  ChevronDown,
  Truck,
  Check,
  Database,
  Wrench
} from 'lucide-react'
import { PujAeroEmblem, LivePulseDot } from '@/components/common/MinimalLogos'
import ComplianceModal from '@/components/modals/ComplianceModal'
import { isSupabaseConfigured } from '@/services/supabaseClient'

export default function Navbar({ onNavigate }) {
  const { currentUser, logout, inactivityTimer, quickLoginAs } = useAuth()
  const { weather, alerts, isDebugMode, setIsDebugMode } = useApp()
  const [showRoleMenu, setShowRoleMenu] = useState(false)
  const [showComplianceModal, setShowComplianceModal] = useState(false)

  const activeAlertsCount = alerts.filter(a => a.status === 'Activa').length

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60)
    const s = secs % 60
    return `${mins}:${s < 10 ? '0' : ''}${s}`
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'AdminPrincipal':
        return { label: 'Admin Principal', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80' }
      case 'AdminOperativo':
        return { label: 'Admin Operativo', bg: 'bg-blue-50 text-[#002855] border-blue-200/80' }
      case 'OperadorSeguridad':
        return { label: 'Operador Seguridad', bg: 'bg-amber-50 text-amber-900 border-amber-200/80' }
      default:
        return { label: role, bg: 'bg-slate-100 text-slate-700 border-slate-200' }
    }
  }

  const roleInfo = getRoleBadge(currentUser?.role)

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-40 px-4 lg:px-6 py-2.5 shadow-stitch-sm">
      <div className="flex items-center justify-between">
        {/* Brand / Minimalist Institutional Identity */}
        <div className="flex items-center space-x-3.5">
          <div className="relative group cursor-pointer">
            <PujAeroEmblem className="w-9 h-9 transition-transform duration-200 group-hover:scale-105" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight text-slate-900">GCS &amp; FMS</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-slate-100 text-[#002855] border border-slate-200/80">
                PUJ Cali
              </span>
              <div className="hidden xl:flex items-center space-x-1.5 pl-2 text-[11px] text-slate-400 font-mono">
                <span>•</span>
                <span>RAC 100 / ISO 29148</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-normal hidden sm:block">
              Pontificia Universidad Javeriana · Centro de Operaciones Autónomas
            </p>
          </div>
        </div>

        {/* Status Bar / Weather / Telemetry / Alerts */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Weather Widget Pill (RF-16) */}
          <div
            title="Telemetría meteorológica Campus PUJ Cali (RF-16: Límite RAC 100 de 25 km/h)"
            className={`hidden md:flex items-center space-x-2.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
              weather.windSpeedKmh > 25 || weather.isRaining
                ? 'bg-rose-50/80 border-rose-200 text-rose-700'
                : 'bg-slate-50 border-slate-200/80 text-slate-700'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Wind className="w-3.5 h-3.5 text-slate-400" />
              <span>{weather.windSpeedKmh} km/h</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center space-x-1.5">
              <CloudRain className="w-3.5 h-3.5 text-slate-400" />
              <span>{weather.isRaining ? 'Lluvia' : 'Despejado'}</span>
            </div>
            {weather.windSpeedKmh > 25 && (
              <span className="text-[9px] px-1.5 py-0.5 bg-rose-200/80 text-rose-900 rounded font-bold uppercase tracking-wider">
                Vuelo Bloqueado
              </span>
            )}
          </div>

          {/* Active Alerts Badge (RF-30) */}
          {activeAlertsCount > 0 && (
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <LivePulseDot status="danger" size="xs" />
              <span>{activeAlertsCount} Alerta{activeAlertsCount > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Botón Calibrador / Debug del Mapa */}
          <button
            onClick={() => {
              setIsDebugMode(!isDebugMode)
              onNavigate && onNavigate('monitor')
            }}
            title="Abrir el mapa en Modo Calibración para arrastrar o mover edificios y estaciones"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-stitch-sm border ${
              isDebugMode
                ? 'bg-amber-600 border-amber-700 text-white shadow-amber-500/25 ring-2 ring-amber-400'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Calibrar Mapa</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-amber-200/80 text-amber-950 font-bold">Debug</span>
          </button>

          {/* Compliance Modal Button (Audit 16 Subrequisitos SRS) */}
          <button
            onClick={() => setShowComplianceModal(true)}
            title="Trazabilidad estricta de los 16 Subrequisitos del SRS (ISO/IEC/IEEE 29148:2018)"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-medium transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#002855]" />
            <span className="hidden sm:inline">SRS Audit</span>
            <span className="font-mono text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold">16/16</span>
          </button>

          {/* Indicador de conexión Supabase Cloud & S3 Bucket */}
          {isSupabaseConfigured && (
            <div
              title="PostgreSQL & S3 Storage Bucket 'drone-videos' activos en Supabase Cloud (us-west-2)"
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/90 text-emerald-800 text-xs font-medium"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden xl:inline">Supabase</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
          )}

          {/* Inactivity countdown badge (RNF-01: 15 min timeout) */}
          <div
            title="Cierre de sesión automático por inactividad tras 15 minutos (RNF-01)"
            className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-600 text-xs font-mono"
          >
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatTime(inactivityTimer)}</span>
          </div>

          {/* User & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-stitch-sm transition"
            >
              <div className="w-7 h-7 rounded-lg bg-[#002855] text-white flex items-center justify-center text-xs font-bold font-mono">
                {currentUser?.full_name ? currentUser.full_name[0] : 'U'}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-slate-900 leading-tight">
                  {currentUser?.full_name || 'Usuario'}
                </div>
                <div className={`text-[9px] inline-block px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider border ${roleInfo.bg}`}>
                  {roleInfo.label}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Role Switcher Menu */}
            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200/90 rounded-2xl shadow-stitch-dropdown p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Conmutador de Rol (Demo RBAC)
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Permite evaluar permisos y accesos operativos del sistema
                  </p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      quickLoginAs('AdminPrincipal')
                      setShowRoleMenu(false)
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                      currentUser?.role === 'AdminPrincipal'
                        ? 'bg-slate-100/80 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Shield className="w-4 h-4 text-indigo-600" />
                      <span>Admin Principal</span>
                    </div>
                    {currentUser?.role === 'AdminPrincipal' && <Check className="w-3.5 h-3.5 text-slate-700" />}
                  </button>

                  <button
                    onClick={() => {
                      quickLoginAs('AdminOperativo')
                      setShowRoleMenu(false)
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                      currentUser?.role === 'AdminOperativo'
                        ? 'bg-slate-100/80 text-[#002855] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Truck className="w-4 h-4 text-[#002855]" />
                      <span>Admin Operativo</span>
                    </div>
                    {currentUser?.role === 'AdminOperativo' && <Check className="w-3.5 h-3.5 text-slate-700" />}
                  </button>

                  <button
                    onClick={() => {
                      quickLoginAs('OperadorSeguridad')
                      setShowRoleMenu(false)
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium flex items-center justify-between transition ${
                      currentUser?.role === 'OperadorSeguridad'
                        ? 'bg-slate-100/80 text-amber-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span>Operador de Seguridad</span>
                    </div>
                    {currentUser?.role === 'OperadorSeguridad' && <Check className="w-3.5 h-3.5 text-slate-700" />}
                  </button>
                </div>

                <div className="border-t border-slate-100 mt-2 pt-2">
                  <button
                    onClick={() => {
                      setShowRoleMenu(false)
                      logout()
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compliance Modal */}
      {showComplianceModal && (
        <ComplianceModal onClose={() => setShowComplianceModal(false)} />
      )}
    </header>
  )
}

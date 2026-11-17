import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Shield,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Clock,
  ChevronRight,
  ShieldCheck,
  Truck
} from 'lucide-react'
import { PujAeroEmblem, DroneMinimalIcon, RoverMinimalIcon } from '../components/MinimalLogos'

export default function Login() {
  const { login, quickLoginAs } = useAuth()
  const [email, setEmail] = useState('operativo@puj.edu.co')
  const [password, setPassword] = useState('puj2026')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!email || !password) {
      setErrorMsg('Por favor completa todos los campos obligatorios.')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      const res = login(email, password)
      setIsLoading(false)
      if (!res.success) {
        setErrorMsg(res.error)
      }
    }, 400)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding - Institutional PUJ Cali */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-white border border-slate-200/90 shadow-stitch-card mb-1">
            <PujAeroEmblem className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            GCS &amp; FMS Campus PUJ
          </h1>
          <p className="text-xs text-slate-500">
            Pontificia Universidad Javeriana Cali · Control Central de Flota Autónoma
          </p>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/80 text-[10px] text-slate-600 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-[#002855]" />
            <span>Estándar ISO/IEC/IEEE 29148:2018</span>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-stitch-card space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Correo Institucional
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@puj.edu.co"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#002855] font-medium transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Contraseña (Hash bcrypt)
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  Demo: <code className="text-[#002855] font-semibold">puj2026</code>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#002855] font-mono transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#002855] hover:bg-[#001f42] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition shadow-stitch-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Validando Credenciales...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Iniciar Sesión (RBAC)</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Login Role Shortcuts */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Acceso Rápido para Demostración (3 Roles)
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => quickLoginAs('AdminPrincipal')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-slate-800 text-xs font-medium text-left flex items-center justify-between transition shadow-stitch-sm"
              >
                <span className="flex items-center space-x-2.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. Administrador Principal (Superadmin)</span>
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                  Full
                </span>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('AdminOperativo')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-slate-800 text-xs font-medium text-left flex items-center justify-between transition shadow-stitch-sm"
              >
                <span className="flex items-center space-x-2.5">
                  <Truck className="w-3.5 h-3.5 text-[#002855]" />
                  <span>2. Administrador Operativo (Despacho / Flota)</span>
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                  Demo
                </span>
              </button>

              <button
                type="button"
                onClick={() => quickLoginAs('OperadorSeguridad')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 text-slate-800 text-xs font-medium text-left flex items-center justify-between transition shadow-stitch-sm"
              >
                <span className="flex items-center space-x-2.5">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>3. Operador de Seguridad (Vigilancia Campus)</span>
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                  Alertas
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Disclaimers - Minimalist Google Stitch */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-[11px] text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Bloqueo 15 min tras 5 intentos fallidos (RNF-02)</span>
          </div>
          <span className="hidden sm:inline text-slate-300">•</span>
          <div className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Timeout de inactividad 15 min (RNF-01)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

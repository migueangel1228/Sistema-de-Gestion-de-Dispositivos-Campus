import React from 'react'
import { useApp } from '../context/AppContext'
import { Wind, CloudRain, ShieldCheck, AlertOctagon, RefreshCw } from 'lucide-react'

export default function WeatherControl() {
  const { weather, setWeather, addAuditLog } = useApp()

  const isFlightBlocked = weather.windSpeedKmh > 25 || weather.isRaining || !weather.apiHealthy

  const updateWind = (speed) => {
    setWeather(prev => ({ ...prev, windSpeedKmh: speed }))
    addAuditLog(
      'CAMBIO_METEOROLOGIA_SIMULADA',
      `Velocidad de viento ajustada a ${speed} km/h (Umbral RAC 100: 25 km/h)`
    )
  }

  const toggleRain = () => {
    const nextRain = !weather.isRaining
    setWeather(prev => ({ ...prev, isRaining: nextRain }))
    addAuditLog(
      'CAMBIO_METEOROLOGIA_SIMULADA',
      `Condición de lluvia ajustada a: ${nextRain ? 'Con Lluvia' : 'Despejado'}`
    )
  }

  const toggleApiHealth = () => {
    const nextStatus = !weather.apiHealthy
    setWeather(prev => ({ ...prev, apiHealthy: nextStatus }))
    addAuditLog(
      'CAMBIO_METEOROLOGIA_SIMULADA',
      `Estado API meteorológica externa simulada: ${nextStatus ? 'Online' : 'Falla de conexión (Fail-secure)'}`
    )
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-stitch-card space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#002855] shrink-0">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Control Meteorológico Campus (RF-16)
            </h4>
            <p className="text-[11px] text-slate-500">
              Validación meteorológica previa al despegue con política de falla segura
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isFlightBlocked ? (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200">
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Despacho Aéreo Bloqueado</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>VMC Vuelo Apto</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Wind Speed Control */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600">Velocidad del Viento:</span>
            <span className={`font-mono font-bold ${weather.windSpeedKmh > 25 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {weather.windSpeedKmh} km/h
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="45"
            value={weather.windSpeedKmh}
            onChange={(e) => updateWind(parseInt(e.target.value))}
            className="w-full accent-[#002855] cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[10px]">
            <button
              onClick={() => updateWind(12)}
              className="px-2 py-0.5 rounded bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-medium shadow-stitch-sm transition"
            >
              12 km/h (Normal)
            </button>
            <button
              onClick={() => updateWind(28)}
              className="px-2 py-0.5 rounded bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 font-semibold shadow-stitch-sm transition"
            >
              28 km/h (&gt;25 km/h)
            </button>
          </div>
        </div>

        {/* Rain Precipitation Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600">Precipitación Pluvial:</span>
            <span className={`font-semibold ${weather.isRaining ? 'text-rose-600' : 'text-emerald-700'}`}>
              {weather.isRaining ? 'Lluvia Detectada' : 'Sin Lluvia'}
            </span>
          </div>
          <button
            onClick={toggleRain}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center space-x-2 ${
              weather.isRaining
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <CloudRain className="w-4 h-4" />
            <span>{weather.isRaining ? 'Simular Cese de Lluvia' : 'Simular Lluvia'}</span>
          </button>
          <p className="text-[10px] text-slate-400">
            Lluvia activa bloqueo inmediato de misiones con drones UAV.
          </p>
        </div>

        {/* API Health / Fail-secure Toggle */}
        <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600">API Meteorológica:</span>
            <span className={`font-mono text-[11px] font-bold ${weather.apiHealthy ? 'text-emerald-700' : 'text-rose-600'}`}>
              {weather.apiHealthy ? 'Conexión OK' : 'Falla de Conexión'}
            </span>
          </div>
          <button
            onClick={toggleApiHealth}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center space-x-2 ${
              !weather.apiHealthy
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${!weather.apiHealthy ? 'text-rose-600' : 'text-slate-500'}`} />
            <span>{weather.apiHealthy ? 'Simular Caída de API' : 'Restablecer Conexión'}</span>
          </button>
          <p className="text-[10px] text-slate-400">
            Política Fail-Secure: Sin datos meteorológicos, los vuelos se bloquean.
          </p>
        </div>
      </div>
    </div>
  )
}

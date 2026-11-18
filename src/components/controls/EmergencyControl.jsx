import React from 'react'
import { useApp } from '@/context/AppContext'
import { AlertTriangle, Compass, BatteryLow, WifiOff, ShieldAlert, Zap } from 'lucide-react'
import { LivePulseDot } from '@/components/common/MinimalLogos'

export default function EmergencyControl({ mission }) {
  const { triggerEmergency } = useApp()

  if (!mission) {
    return (
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 text-center text-xs text-slate-500 shadow-stitch-card">
        Selecciona o despacha una misión activa para simular eventos de emergencia en tiempo real (RF-30).
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-stitch-card space-y-3">
      <div className="flex items-center space-x-2.5 pb-2 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Simulador de Incidentes y Protocolos de Emergencia (RF-30)
          </h4>
          <p className="text-[11px] text-slate-500">
            Forzar anomalías en misión activa ({mission.id} · <span className="font-mono text-slate-800 font-semibold">{mission.device_code}</span>)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Desvío > 10m */}
        <button
          onClick={() => triggerEmergency(mission.id, 'DESVIO_RUTA_10M')}
          className="p-3 rounded-xl bg-slate-50/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-left transition group shadow-stitch-sm"
        >
          <div className="flex items-center space-x-2 text-amber-800 group-hover:text-rose-700 mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Desvío &gt; 10m</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Alerta y notificación a Vigilancia del campus
          </p>
        </button>

        {/* Batería < 15% */}
        <button
          onClick={() => triggerEmergency(mission.id, 'BATERIA_MENOR_15')}
          className="p-3 rounded-xl bg-slate-50/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-left transition group shadow-stitch-sm"
        >
          <div className="flex items-center space-x-2 text-rose-700 mb-1">
            <BatteryLow className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Batería &lt; 15%</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Nivel crítico residual con protocolo RTH
          </p>
        </button>

        {/* Pérdida de Telemetría > 15s */}
        <button
          onClick={() => triggerEmergency(mission.id, 'PERDIDA_TELEMETRIA_15S')}
          className="p-3 rounded-xl bg-slate-50/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-left transition group shadow-stitch-sm"
        >
          <div className="flex items-center space-x-2 text-amber-800 group-hover:text-rose-700 mb-1">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Sin Enlace &gt; 15s</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Pérdida de señal telemétrica y corte de enlace
          </p>
        </button>

        {/* Impacto / Caída */}
        <button
          onClick={() => triggerEmergency(mission.id, 'IMPACTO_CAIDA')}
          className="p-3 rounded-xl bg-slate-50/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 text-left transition group shadow-stitch-sm"
        >
          <div className="flex items-center space-x-2 text-rose-700 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Impacto / Caída</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Sensor de colisión; pasa a 'Fuera de servicio'
          </p>
        </button>
      </div>
    </div>
  )
}

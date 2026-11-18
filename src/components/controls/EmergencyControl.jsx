import React, { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { AlertTriangle, Compass, BatteryLow, WifiOff, ShieldAlert, Zap, CheckCircle2 } from 'lucide-react'
import { LivePulseDot } from '@/components/common/MinimalLogos'

export default function EmergencyControl({ mission: propMission }) {
  const { triggerEmergency, devices, missions } = useApp()
  const [lastTriggered, setLastTriggered] = useState(null)

  const activeMissions = missions.filter(
    m => m.status === 'En camino' || m.status === 'En camino - bateria baja'
  )

  // Dispositivo o misión objetivo
  const availableTargets = [
    ...activeMissions.map(m => ({
      id: m.id,
      label: `Misión ${m.id} (${m.device_code} - ${m.device_type}) [En ruta]`,
      isMission: true,
      deviceCode: m.device_code
    })),
    ...devices.map(d => ({
      id: d.id,
      label: `Dispositivo ${d.code} (${d.type} - ${d.status})`,
      isMission: false,
      deviceCode: d.code
    }))
  ]

  const defaultTargetId = propMission?.id || activeMissions[0]?.id || devices[0]?.id
  const [selectedTargetId, setSelectedTargetId] = useState(defaultTargetId)

  const currentTarget = availableTargets.find(t => t.id === (selectedTargetId || defaultTargetId)) || availableTargets[0]

  const handleTrigger = (type) => {
    const targetId = selectedTargetId || defaultTargetId
    const res = triggerEmergency(targetId, type)
    if (res?.success) {
      setLastTriggered({
        type,
        deviceCode: res.alert?.device_code || currentTarget?.deviceCode,
        time: new Date().toLocaleTimeString()
      })
      setTimeout(() => setLastTriggered(null), 4000)
    }
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-stitch-card space-y-3">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Simulador de Incidentes y Protocolos de Emergencia (RF-30)
            </h4>
            <p className="text-[11px] text-slate-500">
              Forzar anomalías: detiene el robot, reduce la flota en operación y activa alerta de seguridad.
            </p>
          </div>
        </div>

        {/* Target Selector */}
        <div className="w-full sm:w-auto flex items-center space-x-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Objetivo:
          </span>
          <select
            value={selectedTargetId || defaultTargetId || ''}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            className="text-xs font-mono font-semibold bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500 max-w-[260px] truncate"
          >
            {availableTargets.map(t => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {lastTriggered && (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
            <span>
              <strong>¡Incidente [{lastTriggered.type}] disparado!</strong> Dispositivo <strong className="font-mono">{lastTriggered.deviceCode}</strong> pasó a <span className="bg-rose-200 text-rose-900 font-bold px-1.5 py-0.5 rounded text-[10px]">Fuera de servicio</span>.
            </span>
          </div>
          <span className="text-[10px] font-mono text-rose-600">{lastTriggered.time}</span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Desvío > 10m */}
        <button
          onClick={() => handleTrigger('DESVIO_RUTA_10M')}
          className="p-3 rounded-xl bg-slate-50/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-300 text-left transition group shadow-stitch-sm"
        >
          <div className="flex items-center space-x-2 text-amber-800 group-hover:text-rose-700 mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Desvío &gt; 10m</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Freno preventivo por geocerca; robot sale de operación
          </p>
        </button>

        {/* Batería < 15% */}
        <button
          onClick={() => handleTrigger('BATERIA_MENOR_15')}
          className="p-3 rounded-xl bg-slate-50/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-300 text-left transition group shadow-stitch-sm"
        >
          <div className="flex items-center space-x-2 text-rose-700 mb-1">
            <BatteryLow className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Batería &lt; 15%</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Agotamiento crítico; aborta misión y pasa a Fuera de Servicio
          </p>
        </button>

        {/* Pérdida de Telemetría > 15s */}
        <button
          onClick={() => handleTrigger('PERDIDA_TELEMETRIA_15S')}
          className="p-3 rounded-xl bg-slate-50/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-300 text-left transition group shadow-stitch-sm"
        >
          <div className="flex items-center space-x-2 text-amber-800 group-hover:text-rose-700 mb-1">
            <WifiOff className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Sin Enlace &gt; 15s</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Corte total de enlace; parada remota de seguridad
          </p>
        </button>

        {/* Impacto / Caída */}
        <button
          onClick={() => handleTrigger('IMPACTO_CAIDA')}
          className="p-3 rounded-xl bg-slate-50/80 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-300 text-left transition group shadow-stitch-sm"
        >
          <div className="flex items-center space-x-2 text-rose-700 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">Impacto / Caída</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Colisión física o choque; pasa a Fuera de Servicio
          </p>
        </button>
      </div>
    </div>
  )
}

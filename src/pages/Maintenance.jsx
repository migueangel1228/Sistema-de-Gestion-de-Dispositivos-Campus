import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Wrench,
  CheckCircle,
  Clock,
  FileText,
  AlertCircle,
  ShieldCheck,
  Check,
  X
} from 'lucide-react'
import { LivePulseDot } from '../components/MinimalLogos'

export default function Maintenance() {
  const { maintenanceOrders, closeMaintenanceOrder, devices } = useApp()
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [techReport, setTechReport] = useState(
    'Mantenimiento concluido satisfactoriamente. Se calibraron sensores IMU y se verificaron celdas de batería LiPo. Dispositivo apto para operar.'
  )
  const [showCloseModal, setShowCloseModal] = useState(false)

  const handleClose = (e) => {
    e.preventDefault()
    if (!selectedOrderId || !techReport) return

    closeMaintenanceOrder(selectedOrderId, techReport)
    setShowCloseModal(false)
    setSelectedOrderId(null)
  }

  const openOrders = maintenanceOrders.filter(o => o.status !== 'Cerrada')
  const closedOrders = maintenanceOrders.filter(o => o.status === 'Cerrada')

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-200/90 pb-4">
        <div className="flex items-center space-x-2.5">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Gestión de Órdenes de Mantenimiento de Hardware
          </h2>
          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200/80 font-medium">
            RF-33.1 / RF-33.2
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          Bloqueo de seguridad en estado 'En mantenimiento' y restitución a 'Disponible' mediante informe técnico del proveedor externo.
        </p>
      </div>

      {/* Orders in Progress */}
      <div className="space-y-3.5">
        <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Órdenes Activas en Taller Externo ({openOrders.length})</span>
        </h3>

        {openOrders.length === 0 ? (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 text-center text-xs text-slate-500 shadow-stitch-card font-normal">
            No hay dispositivos en mantenimiento en este momento. Puedes enviar uno a mantenimiento desde el módulo de <strong>Inventario</strong>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openOrders.map(order => (
              <div
                key={order.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-stitch-card space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-bold text-slate-900">{order.device_code}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200/80">
                      {order.id}
                    </span>
                  </div>
                  <span className="text-xs text-amber-800 font-semibold flex items-center space-x-1.5">
                    <LivePulseDot status="warning" size="xs" />
                    <span>En Proceso</span>
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <div><strong className="text-slate-800">Motivo:</strong> {order.issue_description}</div>
                  <div><strong className="text-slate-800">Proveedor Técnico:</strong> {order.provider_name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Apertura: {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedOrderId(order.id)
                    setShowCloseModal(true)
                  }}
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl transition shadow-stitch-sm flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Cerrar Orden con Informe Técnico (RF-33.2)</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closed Orders History (RF-33.2) */}
      {closedOrders.length > 0 && (
        <div className="space-y-3.5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Historial de Órdenes Concluidas e Informes Radicados ({closedOrders.length})</span>
          </h3>

          <div className="space-y-3">
            {closedOrders.map(order => (
              <div
                key={order.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 text-xs space-y-2 shadow-stitch-sm"
              >
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-mono font-bold text-slate-900">
                    {order.device_code} · {order.id}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Restituido a 'Disponible'</span>
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 font-mono">
                  <strong className="text-slate-900">Informe Técnico del Proveedor:</strong> {order.technical_report}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Close Maintenance Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-md w-full p-6 shadow-stitch-dropdown space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Registrar Informe y Liberar Dispositivo (RF-33.2)</span>
              </h3>
              <button
                onClick={() => setShowCloseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Al radicar el informe técnico del proveedor externo, el dispositivo saldrá del estado{' '}
              <strong className="text-amber-800">'En mantenimiento'</strong> y volverá automáticamente a{' '}
              <strong className="text-emerald-700">'Disponible'</strong> para nuevos despachos.
            </p>

            <form onSubmit={handleClose} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Dictamen / Informe Técnico Final:
                </label>
                <textarea
                  rows={4}
                  required
                  value={techReport}
                  onChange={(e) => setTechReport(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-xl transition shadow-stitch-sm"
              >
                Radicar Informe y Restituir a 'Disponible' (RF-33.2)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  CalendarCheck,
  Plus,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Navigation,
  Scale,
  ShieldCheck,
  AlertOctagon,
  KeyRound,
  Info,
  X,
  Check
} from 'lucide-react'
import { DroneMinimalIcon, RoverMinimalIcon, LivePulseDot } from '../components/MinimalLogos'
import WeatherControl from '../components/WeatherControl'

export default function Reservations({ onNavigate, onOpenHandover }) {
  const {
    reservations,
    meetingPoints,
    devices,
    createReservation,
    dispatchMission,
    weather,
    missions
  } = useApp()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form state (RF-08, RF-09)
  const [formData, setFormData] = useState({
    requester_id: 'SIU-394821',
    requester_name: 'Dr. Alejandro Posada',
    recipient_email: 'a.posada@javerianacali.edu.co',
    recipient_phone: '+57 312 456 7890',
    service_type: 'Transporte',
    priority: 'Alta', // Alta o Normal
    payload_weight_kg: '1.5', // 1.5kg (Dron) vs 6.0kg (Robot)
    origin_point_id: 'mp-001', // Edificio Samán
    destination_point_id: 'mp-003' // Biblioteca
  })

  // Simulated SIU verification state
  const isSiuValid = formData.requester_id.startsWith('SIU-') && formData.requester_id.length >= 7

  const handleCreateReservation = (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (formData.origin_point_id === formData.destination_point_id) {
      setErrorMsg('El punto de origen y el punto de destino no pueden coincidir (RF-11).')
      return
    }

    const res = createReservation(formData)
    if (res.success) {
      setSuccessMsg(`Reserva ${res.reservation.id} creada con éxito y validada ante SIU (RF-08/09).`)
      setTimeout(() => {
        setShowCreateModal(false)
        setSuccessMsg('')
      }, 1000)
    } else {
      setErrorMsg(res.error)
    }
  }

  const handleDispatch = (reservationId) => {
    setErrorMsg('')
    const res = dispatchMission(reservationId)
    if (res.success) {
      // Abre modal de Handover con QR y PIN (RF-22)
      if (onOpenHandover) {
        onOpenHandover(res.mission)
      }
    } else {
      alert(`Bloqueo de Despacho: ${res.error}`)
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Programación de Reservas y Despacho Algorítmico
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200/80 font-medium">
              RF-08 / RF-09 / RF-14
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Validación federada en tiempo real SIU, asignación autónoma de dispositivo y política climática segura.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#002855] hover:bg-[#001f42] text-white text-xs font-semibold transition shadow-stitch-sm flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nueva Reserva (RF-09)</span>
        </button>
      </div>

      {/* Decision Engine Explain Banner (RF-14.1 / RF-16) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-stitch-card space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
          <Info className="w-4 h-4 text-[#002855]" />
          <span>Lógica del Motor de Asignación Automática (RF-14.1 / RF-16)</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-slate-700">
          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-amber-800">
              <DroneMinimalIcon className="w-4 h-4 text-amber-700" />
              <span>Dron Aéreo (UAV):</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Asignación preferente si la masa es &le; 2.0 kg y la prioridad es <strong className="text-slate-800">Alta</strong>. Requiere condiciones VMC: viento &le; 25 km/h y ausencia de lluvia (RF-16).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-[#002855]">
              <RoverMinimalIcon className="w-4 h-4 text-[#002855]" />
              <span>Robot Terrestre (UGV):</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Asignado cuando la masa es &gt; 2.0 kg (hasta 10.0 kg), prioridad normal, o como <strong className="text-slate-800">falla segura</strong> si el clima no es apto para vuelo.
            </p>
          </div>
        </div>
      </div>

      {/* Reservation List Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-stitch-card">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Solicitudes y Reservas Registradas</h3>
          <span className="text-xs text-slate-500 font-mono">{reservations.length} total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-medium uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">ID / Solicitante</th>
                <th className="py-3 px-4">Servicio &amp; Prioridad</th>
                <th className="py-3 px-4">Peso Carga</th>
                <th className="py-3 px-4">Ruta (Origen &rarr; Destino)</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción de Despacho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {reservations.map(res => {
                const origin = meetingPoints.find(p => p.id === res.origin_point_id)?.name || 'Origen'
                const dest = meetingPoints.find(p => p.id === res.destination_point_id)?.name || 'Destino'
                const isPending = res.status === 'Programada' || res.status === 'Asignada'

                // Algoritmo proyectado para feedback visual
                const willBeDrone = res.payload_weight_kg <= 2.0 && res.priority === 'Alta' && weather.windSpeedKmh <= 25 && !weather.isRaining

                return (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{res.id}</div>
                      <div className="text-[11px] text-slate-600 font-medium">{res.requester_name}</div>
                      <div className="text-[10px] text-emerald-700 font-mono flex items-center space-x-1 mt-0.5">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{res.requester_id}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{res.service_type}</div>
                      <span
                        className={`inline-block text-[10px] px-2 py-0.5 rounded font-semibold ${
                          res.priority === 'Alta'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {res.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-slate-900">{res.payload_weight_kg} kg</div>
                      <div className="text-[10px] text-slate-400">
                        {res.payload_weight_kg <= 2.0 ? 'Ligero (≤2kg)' : 'Pesado (>2kg)'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <div className="text-[11px] font-medium text-slate-800 flex items-center space-x-1.5 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{origin.split('(')[0].trim()}</span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 flex items-center space-x-1.5 truncate max-w-[200px]">
                        <Navigation className="w-3 h-3 text-[#002855] shrink-0" />
                        <span className="truncate">{dest.split('(')[0].trim()}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded font-semibold uppercase tracking-wider ${
                          res.status === 'Programada'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200'
                            : res.status === 'Despachado'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : res.status === 'Entregado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isPending ? (
                        <button
                          onClick={() => handleDispatch(res.id)}
                          className="px-3.5 py-1.5 bg-[#002855] hover:bg-[#001f42] text-white font-semibold text-xs rounded-xl shadow-stitch-sm transition flex items-center space-x-1.5 ml-auto"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Despachar ({willBeDrone ? 'Dron' : 'Robot'})</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 text-[11px] text-slate-600 font-mono">
                          {res.status === 'Despachado' ? (
                            <>
                              <LivePulseDot status="transit" size="xs" />
                              <span>En Tránsito</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Completado</span>
                            </>
                          )}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Crear Reserva (RF-08 / RF-09 / RF-10) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 shadow-stitch-dropdown space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <CalendarCheck className="w-4 h-4 text-[#002855]" />
                <span>Nueva Solicitud de Reserva (RF-09)</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateReservation} className="space-y-3.5 text-xs">
              {/* SIU Requester Check (RF-08, RR-05) */}
              <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800">
                    ID Institucional del Solicitante (SIU):
                  </label>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold flex items-center space-x-1 ${
                      isSiuValid
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {isSiuValid ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Vinculación SIU Activa</span>
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" />
                        <span>ID Inválido</span>
                      </>
                    )}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={formData.requester_id}
                  onChange={(e) => setFormData({ ...formData, requester_id: e.target.value })}
                  placeholder="ej. SIU-892314"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
                <div className="grid grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Nombre solicitante"
                    value={formData.requester_name}
                    onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Correo destinatario"
                    value={formData.recipient_email}
                    onChange={(e) => setFormData({ ...formData, recipient_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                </div>
              </div>

              {/* Service & Weight */}
              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Servicio:</label>
                  <select
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  >
                    <option value="Transporte">Transporte</option>
                    <option value="Grabacion">Grabación</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Prioridad:</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  >
                    <option value="Alta">Alta (Dron si ≤2kg)</option>
                    <option value="Normal">Normal (Robot UGV)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Masa (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10.0"
                    required
                    value={formData.payload_weight_kg}
                    onChange={(e) => setFormData({ ...formData, payload_weight_kg: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                </div>
              </div>

              {/* Meeting Points: Origin & Destination (RF-11) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Punto Origen:</label>
                  <select
                    value={formData.origin_point_id}
                    onChange={(e) => setFormData({ ...formData, origin_point_id: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  >
                    {meetingPoints.map(p => (
                      <option key={'orig-' + p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Punto Destino:</label>
                  <select
                    value={formData.destination_point_id}
                    onChange={(e) => setFormData({ ...formData, destination_point_id: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-[11px] focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  >
                    {meetingPoints.map(p => (
                      <option key={'dest-' + p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Antelación Check Note (RF-10) */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-[11px] text-blue-900 flex items-start space-x-2">
                <Clock className="w-4 h-4 text-[#002855] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Ventana Temporal:</strong> Validado para despacho inmediato o programado (antelación permitida entre 30 min y 15 días calendario - RF-10).
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#002855] hover:bg-[#001f42] text-white font-semibold rounded-xl transition shadow-stitch-sm text-xs"
              >
                Guardar Reserva y Validar SIU (RF-08 / RF-09)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

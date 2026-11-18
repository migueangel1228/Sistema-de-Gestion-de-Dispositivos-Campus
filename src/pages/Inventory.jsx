import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  Plus,
  Battery,
  Shield,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Wrench,
  Camera,
  Gauge,
  ArrowUpRight,
  X
} from 'lucide-react'
import { DroneMinimalIcon, RoverMinimalIcon, LivePulseDot } from '../components/MinimalLogos'

export default function Inventory() {
  const { devices, registerDevice, updateDevice, decommissionDevice, openMaintenanceOrder } = useApp()
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showMaintModal, setShowMaintModal] = useState(false)

  // Form states for new device (RF-04.1)
  const [formData, setFormData] = useState({
    code: '',
    type: 'UGV',
    model: '',
    max_payload_kg: '',
    max_speed_kmh: 20,
    max_altitude_m: 0,
    camera_resolution: '1080p'
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Maintenance form
  const [maintReason, setMaintReason] = useState('Inspección preventiva de hélices y tren motriz')
  const [providerName, setProviderName] = useState('Robotics Solutions Colombia S.A.S.')

  // Edit form states (RF-04.3)
  const [editFormData, setEditFormData] = useState({
    model: '',
    max_payload_kg: '',
    max_speed_kmh: 20,
    max_altitude_m: 0,
    camera_resolution: '1080p'
  })
  const [editErrorMsg, setEditErrorMsg] = useState('')
  const [editSuccessMsg, setEditSuccessMsg] = useState('')

  const handleOpenEdit = (device) => {
    setSelectedDevice(device)
    setEditFormData({
      model: device.model,
      max_payload_kg: device.max_payload_kg.toString(),
      max_speed_kmh: device.max_speed_kmh || (device.type === 'UAV' ? 35 : 15),
      max_altitude_m: device.max_altitude_m || (device.type === 'UAV' ? 60 : 0),
      camera_resolution: device.camera_resolution || '1080p'
    })
    setEditErrorMsg('')
    setEditSuccessMsg('')
    setShowEditModal(true)
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    setEditErrorMsg('')
    setEditSuccessMsg('')

    if (!editFormData.model || !editFormData.max_payload_kg) {
      setEditErrorMsg('El modelo y la capacidad de carga son obligatorios.')
      return
    }

    const payload = parseFloat(editFormData.max_payload_kg)
    if (selectedDevice.type === 'UAV' && (payload <= 0 || payload > 0.5)) {
      setEditErrorMsg('Los drones (UAV) tienen una capacidad máxima de hasta 0.5 kg (RF-04.1 / RF-04.3 - Nuevo SRS).')
      return
    }
    if (selectedDevice.type === 'UGV' && (payload <= 0 || payload > 1.0)) {
      setEditErrorMsg('Los robots terrestres (UGV) tienen una capacidad máxima de hasta 1.0 kg (RF-04.1 / RF-04.3 - Nuevo SRS).')
      return
    }

    const updates = {
      model: editFormData.model.trim(),
      max_payload_kg: payload,
      max_speed_kmh: parseInt(editFormData.max_speed_kmh),
      max_altitude_m: parseInt(editFormData.max_altitude_m),
      camera_resolution: editFormData.camera_resolution
    }

    const res = updateDevice(selectedDevice.id, updates)
    if (res.success) {
      setEditSuccessMsg(`Dispositivo ${selectedDevice.code} modificado exitosamente (RF-04.3).`)
      setTimeout(() => {
        setShowEditModal(false)
        setSelectedDevice(null)
        setEditSuccessMsg('')
      }, 1000)
    } else {
      setEditErrorMsg(res.error)
    }
  }

  const handleRegister = (e) => {
    e.preventDefault()
    setErrorMsg('')
    setSuccessMsg('')

    if (!formData.code || !formData.model || !formData.max_payload_kg) {
      setErrorMsg('Todos los campos son obligatorios.')
      return
    }

    const res = registerDevice(formData)
    if (res.success) {
      setSuccessMsg(`Dispositivo ${res.device.code} registrado exitosamente en el inventario.`)
      setFormData({
        code: '',
        type: 'UGV',
        model: '',
        max_payload_kg: '',
        max_speed_kmh: 20,
        max_altitude_m: 0,
        camera_resolution: '1080p'
      })
      setTimeout(() => {
        setShowAddModal(false)
        setSuccessMsg('')
      }, 1200)
    } else {
      setErrorMsg(res.error)
    }
  }

  const handleDecommission = (device) => {
    if (window.confirm(`¿Confirmas la baja lógica del dispositivo ${device.code}? Pasará a 'Fuera de servicio' conservando su bitácora íntegra (RF-04.4).`)) {
      const res = decommissionDevice(device.id)
      if (!res.success) {
        alert(res.error)
      }
    }
  }

  const handleStartMaintenance = (e) => {
    e.preventDefault()
    if (!selectedDevice) return
    openMaintenanceOrder(selectedDevice.id, maintReason, providerName)
    setShowMaintModal(false)
    setSelectedDevice(null)
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Inventario y Parámetros Operativos de Flota
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200/80 font-medium">
              RF-04 / RF-05 / RF-07
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Parque base de 6 dispositivos (RR-09) con arquitectura escalable hasta 20 dispositivos concurrentes (RNF-06).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#002855] hover:bg-[#001f42] text-white text-xs font-semibold transition shadow-stitch-sm flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Dispositivo (RF-04.1)</span>
        </button>
      </div>

      {/* Device List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {devices.map(device => {
          const isDrone = device.type === 'UAV'
          return (
            <div
              key={device.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-stitch-card space-y-4 hover:border-slate-300 transition duration-150"
            >
              {/* Header Card */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                      isDrone
                        ? 'bg-amber-50/80 border-amber-200/60 text-amber-800'
                        : 'bg-blue-50/80 border-blue-200/60 text-[#002855]'
                    }`}
                  >
                    {isDrone ? (
                      <DroneMinimalIcon className="w-5 h-5" />
                    ) : (
                      <RoverMinimalIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-bold text-slate-900">{device.code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-slate-100 text-slate-700 border border-slate-200">
                        {device.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium truncate max-w-[170px] mt-0.5">
                      {device.model}
                    </p>
                  </div>
                </div>

                {/* Status Pill (RF-05) */}
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                    device.status === 'Disponible'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : device.status === 'En servicio'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : device.status === 'En carga'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {device.status}
                </span>
              </div>

              {/* Specs & Telemetry Grid (RF-07) */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Capacidad Máx</span>
                  <span className="font-semibold text-slate-800">{device.max_payload_kg} kg</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Batería Actual</span>
                  <span className="font-mono font-bold text-slate-900">{device.battery_level}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Velocidad Máx</span>
                  <span className="font-mono text-slate-700">{device.max_speed_kmh} km/h</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">Cámara / Altura</span>
                  <span className="font-mono text-slate-700">
                    {device.camera_resolution} · {isDrone ? `${device.max_altitude_m}m` : '0m'}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="text-[10px] text-slate-400 font-mono">
                  Misiones hoy: {device.daily_missions_count || 0}
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Edit button (RF-04.3) */}
                  {device.status !== 'En servicio' && (
                    <button
                      onClick={() => handleOpenEdit(device)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 transition"
                      title="Modificar Parámetros de Dispositivo (RF-04.3)"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Maintenance button */}
                  {device.status !== 'En mantenimiento' && device.status !== 'En servicio' && (
                    <button
                      onClick={() => {
                        setSelectedDevice(device)
                        setShowMaintModal(true)
                      }}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 text-slate-700 hover:text-amber-800 transition"
                      title="Enviar a Mantenimiento Técnico (RF-33.1)"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Decommission button (RF-04.4) */}
                  {device.status !== 'Fuera de servicio' && device.status !== 'En servicio' && (
                    <button
                      onClick={() => handleDecommission(device)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-700 transition"
                      title="Dar de Baja Lógica (RF-04.4)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal: Registrar Dispositivo en Vivo (RF-04.1) */}
      {showAddModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-md w-full p-6 shadow-stitch-dropdown space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-[#002855]" />
                <span>Registrar Nuevo Dispositivo (RF-04.1)</span>
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
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

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Código Alfanumérico Único:
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. UAV-04 o UGV-04"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Tipo de Dispositivo:
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        type: e.target.value,
                        max_payload_kg: e.target.value === 'UAV' ? '1.5' : '8.0',
                        max_altitude_m: e.target.value === 'UAV' ? 60 : 0
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  >
                    <option value="UGV">UGV (Robot Terrestre)</option>
                    <option value="UAV">UAV (Dron Aéreo)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Carga Útil Máx (kg):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder={formData.type === 'UAV' ? 'Máx 0.5 kg' : 'Máx 1.0 kg'}
                    value={formData.max_payload_kg}
                    onChange={(e) => setFormData({ ...formData, max_payload_kg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                  <span className="text-[10px] text-slate-500">
                    {formData.type === 'UAV' ? 'Dron <= 0.5 kg' : 'Robot <= 1.0 kg (SRS)'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Modelo del Fabricante:
                </label>
                <input
                  type="text"
                  required
                  placeholder="ej. DJI Matrice 300 o AgileX Scout"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Resolución de Cámara:
                  </label>
                  <select
                    value={formData.camera_resolution}
                    onChange={(e) => setFormData({ ...formData, camera_resolution: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p (FHD)</option>
                    <option value="4K">4K UHD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Velocidad Máx (km/h):
                  </label>
                  <input
                    type="number"
                    value={formData.max_speed_kmh}
                    onChange={(e) => setFormData({ ...formData, max_speed_kmh: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-[#002855] hover:bg-[#001f42] text-white font-semibold rounded-xl transition shadow-stitch-sm"
              >
                Guardar en Inventario (RF-04.1)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Apertura de Mantenimiento Técnico (RF-33.1) */}
      {showMaintModal && selectedDevice && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-md w-full p-6 shadow-stitch-dropdown space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-amber-600" />
                <span>Orden de Mantenimiento (RF-33.1)</span>
              </h3>
              <button
                onClick={() => setShowMaintModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Generar orden formal para <strong className="text-slate-900 font-mono">{selectedDevice.code}</strong>. Su estado cambiará inmediatamente a{' '}
              <span className="text-amber-800 font-semibold">'En mantenimiento'</span> bloqueando nuevas misiones.
            </p>

            <form onSubmit={handleStartMaintenance} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Motivo / Causa:</label>
                <textarea
                  rows={3}
                  value={maintReason}
                  onChange={(e) => setMaintReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Proveedor Externo:</label>
                <input
                  type="text"
                  value={providerName}
                  onChange={(e) => setProviderName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition shadow-stitch-sm"
              >
                Confirmar y Bloquear en Mantenimiento (RF-33.1)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Modificación de Dispositivo Existente (RF-04.3) */}
      {showEditModal && selectedDevice && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-md w-full p-6 shadow-stitch-dropdown space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Edit2 className="w-4 h-4 text-[#002855]" />
                <span>Modificar Parámetros de Dispositivo (RF-04.3)</span>
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setSelectedDevice(null)
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inmutable Code & Type Notice (RF-04.3) */}
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Código Único (Inmutable):</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{selectedDevice.code}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Tipo:</span>
                <span className="px-2 py-0.5 rounded font-mono font-semibold bg-white text-slate-800 border border-slate-200">
                  {selectedDevice.type}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Estado:</span>
                <span className="text-emerald-700 font-semibold">{selectedDevice.status}</span>
              </div>
            </div>

            {editErrorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{editErrorMsg}</span>
              </div>
            )}

            {editSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Modelo del Fabricante (RF-04.3):
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.model}
                  onChange={(e) => setEditFormData({ ...editFormData, model: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Carga Útil Máx (kg):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={editFormData.max_payload_kg}
                    onChange={(e) => setEditFormData({ ...editFormData, max_payload_kg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                  <span className="text-[10px] text-slate-500">
                    {selectedDevice.type === 'UAV' ? 'Dron <= 0.5 kg' : 'Robot <= 1.0 kg (SRS)'}
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Velocidad Máx (km/h):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={editFormData.max_speed_kmh}
                    onChange={(e) => setEditFormData({ ...editFormData, max_speed_kmh: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Resolución Cámara:
                  </label>
                  <select
                    value={editFormData.camera_resolution}
                    onChange={(e) => setEditFormData({ ...editFormData, camera_resolution: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p (FHD)</option>
                    <option value="4K">4K UHD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Altura Vuelo Máx (m):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    disabled={selectedDevice.type === 'UGV'}
                    value={selectedDevice.type === 'UGV' ? 0 : editFormData.max_altitude_m}
                    onChange={(e) => setEditFormData({ ...editFormData, max_altitude_m: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#002855] disabled:opacity-50"
                  />
                  <span className="text-[10px] text-slate-500">
                    {selectedDevice.type === 'UAV' ? 'Máx 120m (RAC 100)' : '0m (Terrestre)'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-2 bg-[#002855] hover:bg-[#001f42] text-white font-semibold rounded-xl transition shadow-stitch-sm"
              >
                Guardar Modificaciones (RF-04.3)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

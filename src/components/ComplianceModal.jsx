import React, { useState } from 'react'
import {
  X,
  CheckCircle,
  ShieldCheck,
  Search,
  ExternalLink,
  Bot,
  Plane,
  Truck,
  Zap,
  CalendarCheck,
  Compass,
  FileSpreadsheet
} from 'lucide-react'

export const COMPLIANCE_ITEMS = [
  // 1. RF-01 (Total: 2 subrequisitos)
  {
    id: 'RF-01',
    parentRequirement: 'RF-01',
    name: 'Autenticación de Usuario Registrado (RBAC)',
    standard: 'ISO/IEC/IEEE 29148:2018',
    category: 'RF-01: Usuarios y Acceso',
    status: 'Cumplido',
    description: 'Autentica usuarios en roles AdminPrincipal, AdminOperativo u OperadorSeguridad validando contraseña con hash bcrypt (RNF-16), bloqueo tras 5 intentos fallidos en 10 min (RNF-02) y timeout por inactividad a los 15 min (RNF-01).'
  },
  {
    id: 'RF-01.1',
    parentRequirement: 'RF-01',
    name: 'Manejo de Credenciales Inválidas o Cuenta Inactiva',
    standard: 'RF-01.1 / RNF-02',
    category: 'RF-01: Usuarios y Acceso',
    status: 'Cumplido',
    description: 'Deniega el acceso mostrando el mensaje genérico "Credenciales inválidas" sin revelar cuál campo falló cuando usuario/contraseña son incorrectos o la cuenta está "Inactiva". Incrementa contador de fallos.'
  },

  // 2. RF-04 (Total: 4 subrequisitos)
  {
    id: 'RF-04.1',
    parentRequirement: 'RF-04',
    name: 'Registro de Nuevo Dispositivo en Inventario',
    standard: 'RF-04.1 / RR-09',
    category: 'RF-04: Inventario de Flota',
    status: 'Cumplido',
    description: 'Permite registrar un nuevo dispositivo capturando código alfanumérico único, tipo (UGV o UAV), modelo y carga nominal (hasta 2.0 kg drones y 10.0 kg robots), inicializando en "Disponible".'
  },
  {
    id: 'RF-04.2',
    parentRequirement: 'RF-04',
    name: 'Validación de Unicidad y Campos Obligatorios en Inventario',
    standard: 'RF-04.2',
    category: 'RF-04: Inventario de Flota',
    status: 'Cumplido',
    description: 'Rechaza el registro y notifica el motivo específico cuando el código alfanumérico ya existe en el inventario o se omite algún campo obligatorio (código, modelo, carga útil).'
  },
  {
    id: 'RF-04.3',
    parentRequirement: 'RF-04',
    name: 'Modificación de Dispositivo Existente',
    standard: 'RF-04.3',
    category: 'RF-04: Inventario de Flota',
    status: 'Cumplido',
    description: 'Permite modificar modelo, límites operativos y capacidad de carga útil manteniendo su código único bloqueado/inmutable, e impidiendo edición si está en estado "En servicio".'
  },
  {
    id: 'RF-04.4',
    parentRequirement: 'RF-04',
    name: 'Baja Lógica de Dispositivo',
    standard: 'RF-04.4',
    category: 'RF-04: Inventario de Flota',
    status: 'Cumplido',
    description: 'Permite dar de baja un dispositivo que no tenga servicios activos, pasando su estado a "Fuera de servicio" y conservando su historial íntegro en la bitácora inmutable.'
  },

  // 3. RF-09 (Total: 1 subrequisito)
  {
    id: 'RF-09',
    parentRequirement: 'RF-09',
    name: 'Creación de Reserva de Servicio',
    standard: 'RF-09 / RF-10 / RF-11',
    category: 'RF-09: Reservas',
    status: 'Cumplido',
    description: 'Permite crear una reserva capturando tipo de servicio (transporte o grabación), fecha/hora, punto de encuentro de origen y punto de destino sobre el catálogo del campus PUJ, validando solicitante SIU (RF-08).'
  },

  // 4. RF-14 (Total: 2 subrequisitos)
  {
    id: 'RF-14.1',
    parentRequirement: 'RF-14',
    name: 'Regla Algorítmica de Selección de Dispositivo',
    standard: 'RF-14.1',
    category: 'RF-14: Asignación y Despacho',
    status: 'Cumplido',
    description: 'Selecciona automáticamente: asigna Dron (UAV) si masa <= 2.0 kg y prioridad Alta; asigna Robot Terrestre (UGV) si masa > 2.0 kg (hasta 10.0 kg), prioridad Normal o clima adverso.'
  },
  {
    id: 'RF-14.2',
    parentRequirement: 'RF-14',
    name: 'Verificación Previa de Estado y Batería (Reserva >= 20%)',
    standard: 'RF-14.2 / RF-17',
    category: 'RF-14: Asignación y Despacho',
    status: 'Cumplido',
    description: 'Verifica antes de formalizar la asignación que el dispositivo esté en estado "Disponible" y cuente con un nivel de batería que garantice una reserva residual >= 20% tras cubrir ida y vuelta a la estación de recarga.'
  },

  // 5. RF-16 (Total: 1 subrequisito)
  {
    id: 'RF-16',
    parentRequirement: 'RF-16',
    name: 'Validación Meteorológica Previa al Despegue con Falla Segura',
    standard: 'RAC 100 / RF-16',
    category: 'RF-16: Meteorología',
    status: 'Cumplido',
    description: 'Consulta condiciones climáticas en tiempo real antes de autorizar despegue de dron. Si viento > 25 km/h, lluvia o caída de API, aborta vuelo por falla segura y reasigna a robot terrestre.'
  },

  // 6. RF-20 (Total: 1 subrequisito)
  {
    id: 'RF-20',
    parentRequirement: 'RF-20',
    name: 'Panel de Telemetría en Tiempo Real',
    standard: 'RNF-03 / RF-20',
    category: 'RF-20: Telemetría',
    status: 'Cumplido',
    description: 'Despliega en el panel de control: coordenadas geográficas GPS actuales, porcentaje de carga de batería, estado de enlace de sensores (proximidad y cámara) y estado operativo con refresco <= 5s.'
  },

  // 7. RF-21 (Total: 1 subrequisito)
  {
    id: 'RF-21',
    parentRequirement: 'RF-21',
    name: 'Visualización Cartográfica en Mapa del Campus',
    standard: 'RR-06 / RF-21',
    category: 'RF-21: Mapa Campus',
    status: 'Cumplido',
    description: 'Grafica sobre el mapa de Leaflet del Campus PUJ Cali (3.3475°N, -76.5325°W) la posición geográfica, geocercas, puntos de encuentro y vector de ruta de los dispositivos "En servicio".'
  },

  // 8. RF-22 (Total: 2 subrequisitos)
  {
    id: 'RF-22.1',
    parentRequirement: 'RF-22',
    name: 'Generación Criptográfica de Código QR y PIN de Entrega',
    standard: 'RNF-08 / RF-22.1',
    category: 'RF-22: Entrega y OTP',
    status: 'Cumplido',
    description: 'Genera mediante algoritmo CSPRNG un código QR y un PIN numérico de 6 dígitos de un solo uso con vigencia de 120 minutos en el instante en que el servicio pasa a "Despachado".'
  },
  {
    id: 'RF-22.2',
    parentRequirement: 'RF-22',
    name: 'Transmisión Multicanal de QR y PIN al Destinatario',
    standard: 'RF-22.2 / RF-24',
    category: 'RF-22: Entrega y OTP',
    status: 'Cumplido',
    description: 'Transmite el código QR y el PIN generados al correo institucional y vía SMS al número móvil registrado del destinatario para la autenticación en el punto de encuentro.'
  },

  // 9. RF-23 (Total: 1 subrequisito)
  {
    id: 'RF-23',
    parentRequirement: 'RF-23',
    name: 'Confirmación de Entrega Validada por QR o PIN',
    standard: 'RF-23 / RF-26',
    category: 'RF-23: Handover',
    status: 'Cumplido',
    description: 'Cambia el estado a "Entregado" únicamente tras validar que el PIN de 6 dígitos ingresado o QR leído coincide con el token OTP activo; libera el compartimento e indexa video en Supabase Storage.'
  },

  // 10. RF-30 (Total: 1 subrequisito)
  {
    id: 'RF-30',
    parentRequirement: 'RF-30',
    name: 'Emisión de Alertas de Emergencia por Desvío, Desconexión, Impacto o Batería',
    standard: 'RF-30 / RF-31',
    category: 'RF-30: Emergencias',
    status: 'Cumplido',
    description: 'Emite alerta sonora y visual en el panel y mensaje de emergencia a Administrador y Vigilancia ante: a) desvío > 10m, b) pérdida telemetría > 15s, c) sensor impacto/caída, d) batería < 15%.'
  }
]

export default function ComplianceModal({ onClose, onSelectRequirement }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const filtered = COMPLIANCE_ITEMS.filter(item => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory

    return matchesSearch && matchesCat
  })

  const categories = ['ALL', ...Array.from(new Set(COMPLIANCE_ITEMS.map(i => i.category)))]

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-4xl w-full p-6 shadow-stitch-dropdown space-y-4 max-h-[90vh] flex flex-col text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#002855] shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#002855]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Auditoría de Subrequisitos SRS (ISO/IEC/IEEE 29148:2018)
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {COMPLIANCE_ITEMS.length}/{COMPLIANCE_ITEMS.length} Cumplidos (100%)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Trazabilidad oficial de requisitos funcionales, no funcionales y restrictivos del proyecto.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 shrink-0">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código (ej. RF-04.3, RF-14, RF-16, RF-30)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#002855]"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#002855]"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c === 'ALL' ? 'Todas las categorías' : c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requirements Grid */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtered.map(item => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2.5">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-200 text-slate-800">
                    {item.id}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900">{item.name}</h4>
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">
                    [{item.category}]
                  </span>
                </div>

                <span className="shrink-0 flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3 h-3" />
                  <span>{item.status}</span>
                </span>
              </div>

              <p className="text-[11px] text-slate-600 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Pontificia Universidad Javeriana Cali · Procesos y Diseño de Software</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#002855] hover:bg-[#001f42] text-white rounded-xl font-semibold transition text-xs shadow-stitch-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

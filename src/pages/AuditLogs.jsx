import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  ShieldCheck,
  Clock,
  Globe,
  User,
  Database
} from 'lucide-react'
import { exportAuditLogsToCSV, exportFleetMetricsToCSV } from '../utils/reportGenerator'

export default function AuditLogs() {
  const { auditLogs, devices, missions, reservations } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('ALL')

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter

    return matchesSearch && matchesAction
  })

  const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action)))

  const getActionBadge = (action) => {
    if (action.includes('EMERGENCIA') || action.includes('CRITICA') || action.includes('FALLA')) {
      return 'bg-rose-50 text-rose-800 border-rose-200'
    }
    if (action.includes('ENTREGA') || action.includes('RECARGADO')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    }
    if (action.includes('DESPACHO') || action.includes('CREACION')) {
      return 'bg-blue-50 text-[#002855] border-blue-200'
    }
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/90 pb-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Bitácora Histórica Inmutable y Reportes
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono bg-slate-100 text-slate-700 border border-slate-200/80 font-medium">
              RF-28 / RF-29 / RNF-13
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Marcas de tiempo UTC · Retención legal de 365 días (RNF-13) · Cumplimiento de trazabilidad RAC 100.
          </p>
        </div>

        {/* CSV Export Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => exportAuditLogsToCSV(auditLogs)}
            className="px-4 py-2.5 rounded-xl bg-[#002855] hover:bg-[#001f42] text-white text-xs font-semibold transition shadow-stitch-sm flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Bitácora CSV (RF-29)</span>
          </button>

          <button
            onClick={() => exportFleetMetricsToCSV(devices, missions, reservations)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-semibold transition flex items-center space-x-2 shadow-stitch-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Métricas de Flota CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por usuario, acción, detalle o IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#002855] shadow-stitch-sm transition"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#002855] shadow-stitch-sm transition"
          >
            <option value="ALL">Todas las acciones ({auditLogs.length})</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-stitch-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200/80 font-medium uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Fecha y Hora (UTC)</th>
                <th className="py-3 px-4">Acción Auditada</th>
                <th className="py-3 px-4">Usuario Responsable</th>
                <th className="py-3 px-4">Detalles Operacionales</th>
                <th className="py-3 px-4">IP Origen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                    No se encontraron registros de auditoría que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(log.timestamp_utc).toUTCString()}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-900 font-medium text-[11px] font-sans">
                      {log.user_email || 'Sistema Automático'}
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-[11px] font-sans max-w-md leading-relaxed">
                      {log.details}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[10px]">
                      {log.ip_address || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

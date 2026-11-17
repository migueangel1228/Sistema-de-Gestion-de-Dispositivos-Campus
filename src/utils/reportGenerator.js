// Generador de Reportes CSV (RF-29)

export function exportAuditLogsToCSV(logs, filename = 'bitacora_auditoria_puj.csv') {
  if (!logs || !logs.length) {
    alert('No hay registros de auditoría para exportar.')
    return
  }

  const headers = ['ID', 'Fecha y Hora (UTC)', 'Usuario', 'Acción', 'Dirección IP', 'Detalles']
  const rows = logs.map(l => [
    `"${l.id}"`,
    `"${l.timestamp_utc}"`,
    `"${l.user_email || 'Sistema'}"`,
    `"${l.action}"`,
    `"${l.ip_address || '127.0.0.1'}"`,
    `"${(l.details || '').replace(/"/g, '""')}"`
  ])

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;')
}

export function exportFleetMetricsToCSV(devices, missions, reservations) {
  const headers = [
    'Código Dispositivo',
    'Tipo',
    'Modelo',
    'Carga Máxima (kg)',
    'Nivel Batería (%)',
    'Estado Actual',
    'Misiones Diarias',
    'Última Latitud',
    'Última Longitud'
  ]

  const rows = devices.map(d => [
    `"${d.code}"`,
    `"${d.type}"`,
    `"${d.model}"`,
    d.max_payload_kg,
    d.battery_level,
    `"${d.status}"`,
    d.daily_missions_count || 0,
    d.latitude,
    d.longitude
  ])

  const filename = `metricas_flota_puj_${new Date().toISOString().slice(0, 10)}.csv`
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadBlob(csvContent, filename, 'text/csv;charset=utf-8;')
}

function downloadBlob(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

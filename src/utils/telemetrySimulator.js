// Simulador de Telemetría, Movimiento GPS y Contingencias de Batería (RF-20, RF-21, RF-30, RF-32)
// Cumple con la latencia de actualización <= 5 segundos (RNF-03)

// Cálculo de distancia en metros entre dos coordenadas (Fórmula de Haversine)
export function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// Genera una serie de puntos interpolados con micro-variaciones realistas
export function generateRouteWaypoints(origin, destination, steps = 15) {
  const waypoints = []
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps
    // Interpolación lineal con ligero jitter de sendero/vuelo
    const jitterLat = (Math.random() - 0.5) * 0.00003
    const jitterLng = (Math.random() - 0.5) * 0.00003
    const lat = origin.latitude + (destination.latitude - origin.latitude) * fraction + jitterLat
    const lng = origin.longitude + (destination.longitude - origin.longitude) * fraction + jitterLng
    waypoints.push({ lat, lng, stepIndex: i, totalSteps: steps })
  }
  return waypoints
}

// Evalúa si un dispositivo en ruta cumple el umbral energético al descender a <= 20% (RF-32.1)
export function evaluateEnergyFeasibility(currentLat, currentLng, destLat, destLng, stationLat, stationLng, currentBattery) {
  const distToDest = getDistanceMeters(currentLat, currentLng, destLat, destLng)
  const distDestToStation = getDistanceMeters(destLat, destLng, stationLat, stationLng)
  const totalMeters = distToDest + distDestToStation

  // Consumo estimado: ~1% de batería por cada 50 metros en promedio
  const estimatedBatteryNeeded = Math.ceil(totalMeters / 50)
  const projectedResidual = currentBattery - estimatedBatteryNeeded

  return {
    distToDest: Math.round(distToDest),
    distDestToStation: Math.round(distDestToStation),
    estimatedBatteryNeeded,
    projectedResidual,
    canDeliverWithReserve: projectedResidual >= 10 // RF-32.2: >= 10%
  }
}

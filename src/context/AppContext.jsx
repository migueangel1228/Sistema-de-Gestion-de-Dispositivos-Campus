import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import {
  INITIAL_DEVICES,
  CAMPUS_MEETING_POINTS,
  INITIAL_RESERVATIONS,
  INITIAL_AUDIT_LOGS
} from '../services/mockData'
import { generateRouteWaypoints, evaluateEnergyFeasibility, getDistanceMeters } from '../utils/telemetrySimulator'
import { createHandoverOtp } from '../utils/cryptoOtp'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // 1. Estado de Dispositivos (RF-04, RF-05, RF-07, RR-09)
  const [devices, setDevices] = useState(() => {
    const saved = localStorage.getItem('puj_devices')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Migrar dispositivos a la base de carga oficial calibrada en la cancha / zona verde
        return parsed.map(d => {
          if (d.status === 'Disponible' || d.status === 'En carga') {
            return {
              ...d,
              latitude: 3.345846,
              longitude: -76.532882
            }
          }
          return d
        })
      } catch (e) {}
    }
    return INITIAL_DEVICES
  })

  // 2. Puntos de Encuentro Calibrados Oficiales (RF-11, RR-06)
  const [meetingPoints, setMeetingPoints] = useState(() => {
    const saved = localStorage.getItem('puj_meeting_points_v3')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Si ya tiene los nuevos edificios, usar los guardados
        if (parsed.length >= 12) return parsed
      } catch (e) {}
    }
    localStorage.setItem('puj_meeting_points_v3', JSON.stringify(CAMPUS_MEETING_POINTS))
    return CAMPUS_MEETING_POINTS
  })

  // 2.1 Centro y Radio de Geocerca del Campus
  const [campusCenter, setCampusCenter] = useState(() => {
    const saved = localStorage.getItem('puj_campus_center_v3')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {}
    }
    return [3.347200, -76.532300]
  })

  const [campusRadius, setCampusRadius] = useState(() => {
    const saved = localStorage.getItem('puj_campus_radius')
    return saved ? parseInt(saved, 10) : 480
  })

  // 3. Reservas (RF-08, RF-09, RF-10)
  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem('puj_reservations')
    return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS
  })

  // 4. Misiones Activas (RF-14, RF-20, RF-22)
  const [missions, setMissions] = useState(() => {
    const saved = localStorage.getItem('puj_missions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return parsed.map(m => {
          if (m.current_lat && parseFloat(m.current_lat) < 3.344) {
            return {
              ...m,
              current_lat: 3.347500,
              current_lng: -76.532500
            }
          }
          return m
        })
      } catch (e) {}
    }
    return []
  })

  // 5. Bitácora de Auditoría Inmutable (RF-28, RNF-13)
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('puj_audit_logs')
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS
  })

  // 6. Órdenes de Mantenimiento (RF-33)
  const [maintenanceOrders, setMaintenanceOrders] = useState(() => {
    const saved = localStorage.getItem('puj_maintenance_orders')
    return saved ? JSON.parse(saved) : []
  })

  // 7. Condiciones Meteorológicas (RF-16: Viento <= 25 km/h, Lluvia, API viva)
  const [weather, setWeather] = useState({
    windSpeedKmh: 12,
    isRaining: false,
    apiHealthy: true,
    temperatureC: 27,
    lastChecked: new Date().toISOString()
  })

  // 8. Alertas Activas de Emergencia (RF-30, RF-31)
  const [alerts, setAlerts] = useState([])

  // Modal de Entrega OTP activo
  const [activeHandoverModal, setActiveHandoverModal] = useState(null)

  // Modo Calibración / Debug de Ubicaciones en el Mapa
  const [isDebugMode, setIsDebugMode] = useState(false)

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem('puj_devices', JSON.stringify(devices))
  }, [devices])

  useEffect(() => {
    localStorage.setItem('puj_reservations', JSON.stringify(reservations))
  }, [reservations])

  useEffect(() => {
    localStorage.setItem('puj_missions', JSON.stringify(missions))
  }, [missions])

  useEffect(() => {
    localStorage.setItem('puj_audit_logs', JSON.stringify(auditLogs))
  }, [auditLogs])

  useEffect(() => {
    localStorage.setItem('puj_maintenance_orders', JSON.stringify(maintenanceOrders))
  }, [maintenanceOrders])

  useEffect(() => {
    localStorage.setItem('puj_meeting_points_v3', JSON.stringify(meetingPoints))
  }, [meetingPoints])

  useEffect(() => {
    localStorage.setItem('puj_campus_center_v3', JSON.stringify(campusCenter))
  }, [campusCenter])

  useEffect(() => {
    localStorage.setItem('puj_campus_radius', campusRadius.toString())
  }, [campusRadius])

  // Carga inicial y sincronización con Supabase Cloud
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return
    async function loadCloudData() {
      try {
        const [devRes, mpRes, resRes, misRes, audRes, manRes] = await Promise.all([
          supabase.from('devices').select('*'),
          supabase.from('meeting_points').select('*'),
          supabase.from('reservations').select('*').order('created_at', { ascending: false }),
          supabase.from('missions').select('*').order('started_at', { ascending: false }),
          supabase.from('audit_logs').select('*').order('timestamp_utc', { ascending: false }).limit(50),
          supabase.from('maintenance_orders').select('*').order('created_at', { ascending: false })
        ])

        if (devRes.data && devRes.data.length > 0) setDevices(devRes.data)
        if (mpRes.data && mpRes.data.length > 0) setMeetingPoints(mpRes.data)
        if (resRes.data && resRes.data.length > 0) setReservations(resRes.data)
        if (misRes.data && misRes.data.length > 0) setMissions(misRes.data)
        if (audRes.data && audRes.data.length > 0) setAuditLogs(audRes.data)
        if (manRes.data && manRes.data.length > 0) setMaintenanceOrders(manRes.data)
      } catch (err) {
        console.warn('[Supabase Sync] Error al sincronizar:', err)
      }
    }
    loadCloudData()
  }, [])

  // Helper para registrar en bitácora inmutable (RF-28, RNF-13)
  const addAuditLog = (action, details, userEmail = 'operador@puj.edu.co') => {
    const newLog = {
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      user_email: userEmail,
      action,
      details,
      ip_address: '192.168.1.' + Math.floor(100 + Math.random() * 50),
      timestamp_utc: new Date().toISOString()
    }
    setAuditLogs(prev => [newLog, ...prev])

    if (isSupabaseConfigured && supabase) {
      supabase.from('audit_logs').insert([{
        user_email: userEmail,
        action,
        details,
        ip_address: newLog.ip_address,
        timestamp_utc: newLog.timestamp_utc
      }]).then(() => {}).catch(err => console.warn('[Supabase Audit Log]:', err))
    }

    return newLog
  }

  // =========================================================================
  // LOOP DE TELEMETRÍA CADA 5 SEGUNDOS (RNF-03, RF-20, RF-21, RF-32, RF-34)
  // =========================================================================
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Simulación de avance de misiones en vuelo/ruta
      setMissions(prevMissions => {
        if (!prevMissions.length) return prevMissions

        return prevMissions.map(mission => {
          if (mission.status !== 'En camino' && mission.status !== 'En camino - bateria baja') {
            return mission
          }

          const currentStep = (mission.currentStepIndex || 0) + 1
          const waypoints = mission.waypoints || []

          if (currentStep >= waypoints.length) {
            // Arribó al punto de destino: esperar validación OTP
            return {
              ...mission,
              currentStepIndex: waypoints.length - 1,
              isArrived: true
            }
          }

          const nextPoint = waypoints[currentStep]
          const newBattery = Math.max(5, (mission.current_battery || 100) - 1)

          // Actualizar posición y batería en el dispositivo correspondiente
          setDevices(prevDevs =>
            prevDevs.map(d =>
              d.id === mission.device_id
                ? {
                    ...d,
                    latitude: nextPoint.lat,
                    longitude: nextPoint.lng,
                    battery_level: newBattery
                  }
                : d
            )
          )

          // EVALUACIÓN DE CONTINGENCIA DE BATERÍA AL 20% (RF-32.1 a RF-32.3)
          let updatedStatus = mission.status
          if (newBattery <= 20 && mission.status === 'En camino') {
            const destPoint = meetingPoints.find(p => p.id === mission.destination_point_id) || meetingPoints[0]
            const chargingStation = meetingPoints.find(p => p.is_charging_station) || meetingPoints[0]

            const feasibility = evaluateEnergyFeasibility(
              nextPoint.lat,
              nextPoint.lng,
              destPoint.latitude,
              destPoint.longitude,
              chargingStation.latitude,
              chargingStation.longitude,
              newBattery
            )

            if (feasibility.canDeliverWithReserve) {
              // Caso A: Reserva >= 10% -> Continúa como 'En camino - bateria baja' (RF-32.2)
              updatedStatus = 'En camino - bateria baja'
              addAuditLog(
                'CONTINGENCIA_BATERIA_CONTINUA',
                `Misión ${mission.id}: Batería al ${newBattery}%. Factibilidad positiva (reserva proyectada ${feasibility.projectedResidual}% >= 10%). Misión continúa hacia destino.`
              )
            } else {
              // Caso B: Reserva < 10% -> Aborta misión y RTH (RF-32.3)
              updatedStatus = 'Abortado'
              addAuditLog(
                'CONTINGENCIA_BATERIA_ABORTADA',
                `Misión ${mission.id}: Batería crítica al ${newBattery}%. Reserva proyectada ${feasibility.projectedResidual}% < 10%. Retorno a base activado (RTH).`
              )
              // Disparar alerta visual y sonora
              triggerEmergency(mission.id, 'BATERIA_CRITICA_RETORNO')
            }
          }

          // Alerta crítica si cae a < 15% (RF-30)
          if (newBattery < 15 && !mission.alert15Fired) {
            triggerEmergency(mission.id, 'BATERIA_MENOR_15')
            mission.alert15Fired = true
          }

          return {
            ...mission,
            currentStepIndex: currentStep,
            current_lat: nextPoint.lat,
            current_lng: nextPoint.lng,
            current_battery: newBattery,
            status: updatedStatus
          }
        })
      })

      // 2. Simulación de recarga de dispositivos "En carga" (RF-34)
      setDevices(prevDevices =>
        prevDevices.map(device => {
          if (device.status === 'En carga') {
            const charged = Math.min(100, device.battery_level + 3)
            // Si alcanza >= 80%, se libera a Disponible (RF-34)
            if (charged >= 80 && device.battery_level < 80) {
              addAuditLog(
                'DISPOSITIVO_RECARGADO',
                `Dispositivo ${device.code} alcanzó el 80% de batería. Sale de estación de carga a estado 'Disponible' (RF-34).`
              )
              return {
                ...device,
                battery_level: charged,
                status: 'Disponible'
              }
            }
            return {
              ...device,
              battery_level: charged
            }
          }
          return device
        })
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [meetingPoints])

  // =========================================================================
  // GESTIÓN DE DISPOSITIVOS (RF-04, RF-05, RF-07, RR-09)
  // =========================================================================
  const registerDevice = (deviceData) => {
    // Validar campos obligatorios (RF-04.2)
    if (!deviceData.code || !deviceData.code.trim()) {
      return { success: false, error: 'El código alfanumérico es un campo obligatorio (RF-04.2).' }
    }
    if (!deviceData.model || !deviceData.model.trim()) {
      return { success: false, error: 'El modelo del fabricante es un campo obligatorio (RF-04.2).' }
    }
    if (!deviceData.max_payload_kg) {
      return { success: false, error: 'La capacidad máxima de carga útil nominal es obligatoria (RF-04.2).' }
    }

    // Validar unicidad de código (RF-04.2)
    const exists = devices.some(d => d.code.toUpperCase() === deviceData.code.trim().toUpperCase())
    if (exists) {
      return { success: false, error: `El código alfanumérico '${deviceData.code.trim().toUpperCase()}' ya existe en el inventario. Debe ser único (RF-04.2).` }
    }

    // Validar carga útil nominal (Dron <= 2.0 kg, Robot <= 10.0 kg - RF-04.1)
    const payload = parseFloat(deviceData.max_payload_kg)
    if (deviceData.type === 'UAV' && (payload <= 0 || payload > 2.0)) {
      return { success: false, error: 'Los drones (UAV) tienen una capacidad máxima de hasta 2.0 kg (RF-04.1).' }
    }
    if (deviceData.type === 'UGV' && (payload <= 0 || payload > 10.0)) {
      return { success: false, error: 'Los robots terrestres (UGV) tienen una capacidad de hasta 10.0 kg (RF-04.1).' }
    }

    const newDevice = {
      id: 'dev-' + Math.random().toString(36).substring(2, 9),
      code: deviceData.code.trim().toUpperCase(),
      type: deviceData.type,
      model: deviceData.model.trim(),
      max_payload_kg: payload,
      battery_level: 100,
      status: 'Disponible', // RF-04.1: inicializado en Disponible
      latitude: 3.345846,
      longitude: -76.532882,
      max_speed_kmh: parseInt(deviceData.max_speed_kmh || (deviceData.type === 'UAV' ? 35 : 15)),
      max_altitude_m: parseInt(deviceData.max_altitude_m || (deviceData.type === 'UAV' ? 60 : 0)),
      camera_resolution: deviceData.camera_resolution || '1080p',
      daily_missions_count: 0,
      proximity_sensor: 'OK',
      camera_sensor: 'Conectada',
      created_at: new Date().toISOString()
    }

    setDevices(prev => [...prev, newDevice])
    addAuditLog(
      'REGISTRO_DISPOSITIVO',
      `Nuevo dispositivo registrado: ${newDevice.code} (${newDevice.type} - ${newDevice.model}), Capacidad: ${newDevice.max_payload_kg} kg.`
    )

    return { success: true, device: newDevice }
  }

  const updateDevice = (deviceId, updates) => {
    const dev = devices.find(d => d.id === deviceId)
    if (!dev) return { success: false, error: 'Dispositivo no encontrado.' }
    if (dev.status === 'En servicio') {
      return { success: false, error: 'No se puede modificar un dispositivo en servicio (RF-04.3).' }
    }

    setDevices(prev =>
      prev.map(d => (d.id === deviceId ? { ...d, ...updates } : d))
    )

    addAuditLog(
      'ACTUALIZACION_DISPOSITIVO',
      `Parámetros actualizados para ${dev.code}: ${JSON.stringify(updates)}`
    )
    return { success: true }
  }

  const decommissionDevice = (deviceId) => {
    const dev = devices.find(d => d.id === deviceId)
    if (!dev) return { success: false, error: 'Dispositivo no encontrado.' }

    if (dev.status === 'En servicio') {
      return { success: false, error: 'No se puede dar de baja un dispositivo que tiene servicios activos (RF-04.4).' }
    }

    setDevices(prev =>
      prev.map(d => (d.id === deviceId ? { ...d, status: 'Fuera de servicio' } : d))
    )

    addAuditLog(
      'BAJA_LOGICA_DISPOSITIVO',
      `Dispositivo ${dev.code} dado de baja lógica ('Fuera de servicio'). Historial preservado (RF-04.4).`
    )
    return { success: true }
  }

  // =========================================================================
  // GESTIÓN DE RESERVAS Y SOLICITUDES (RF-08, RF-09, RF-10)
  // =========================================================================
  const createReservation = (data) => {
    // Validación federada simulada SIU (RF-08, RR-05)
    if (!data.requester_id || !data.requester_id.startsWith('SIU-')) {
      return {
        success: false,
        error: 'Identificador institucional inválido. Debe provenir del SIU (ej. SIU-123456) (RF-08).'
      }
    }

    const newRes = {
      id: 'res-' + Math.floor(100 + Math.random() * 900),
      requester_id: data.requester_id.trim(),
      requester_name: data.requester_name.trim(),
      recipient_email: data.recipient_email.trim(),
      recipient_phone: data.recipient_phone.trim(),
      service_type: data.service_type, // 'Transporte' | 'Grabacion'
      priority: data.priority || 'Normal',
      payload_weight_kg: parseFloat(data.payload_weight_kg || 0),
      origin_point_id: data.origin_point_id,
      destination_point_id: data.destination_point_id,
      scheduled_time: data.scheduled_time || new Date(Date.now() + 35 * 60000).toISOString(),
      status: 'Programada',
      created_at: new Date().toISOString()
    }

    setReservations(prev => [newRes, ...prev])
    addAuditLog(
      'CREACION_RESERVA',
      `Nueva reserva ${newRes.id} creada por ${newRes.requester_name} (${newRes.service_type}, Carga: ${newRes.payload_weight_kg} kg).`
    )

    return { success: true, reservation: newRes }
  }

  // =========================================================================
  // ALGORITMO DE ASIGNACIÓN Y DESPACHO (RF-14, RF-15, RF-16, RF-17, RF-22)
  // =========================================================================
  const dispatchMission = (reservationId) => {
    const res = reservations.find(r => r.id === reservationId)
    if (!res) return { success: false, error: 'Reserva no encontrada.' }

    const origin = meetingPoints.find(p => p.id === res.origin_point_id)
    const destination = meetingPoints.find(p => p.id === res.destination_point_id)
    if (!origin || !destination) {
      return { success: false, error: 'Puntos de encuentro no válidos en catálogo (RF-11).' }
    }

    // Regla de Selección Algorítmica (RF-14.1):
    // Dron si peso <= 2.0 kg y prioridad alta; Robot si peso > 2.0 kg o prioridad normal o clima adverso
    let preferredType = (res.payload_weight_kg <= 2.0 && res.priority === 'Alta') ? 'UAV' : 'UGV'

    // VALIDACIÓN METEOROLÓGICA CON FALLA SEGURA (RF-16)
    const isBadWeatherForFlight = weather.windSpeedKmh > 25 || weather.isRaining || !weather.apiHealthy
    let weatherReason = null

    if (preferredType === 'UAV' && isBadWeatherForFlight) {
      if (weather.windSpeedKmh > 25) weatherReason = `Viento excesivo (${weather.windSpeedKmh} km/h > 25 km/h)`
      else if (weather.isRaining) weatherReason = 'Presencia de lluvia en el campus'
      else if (!weather.apiHealthy) weatherReason = 'Falla de conexión con API meteorológica (Falla segura)'

      // Reasignación automática a Robot Terrestre si la masa lo permite (RF-14.1, CU-14 E5)
      if (res.payload_weight_kg <= 10.0) {
        preferredType = 'UGV'
        addAuditLog(
          'FALLA_SEGURA_METEOROLOGIA',
          `Despacho aéreo bloqueado por: ${weatherReason}. Reasignación automática a Robot Terrestre (UGV) (RF-16).`
        )
      } else {
        return {
          success: false,
          error: `Despacho cancelado: ${weatherReason} y la carga (${res.payload_weight_kg} kg) no puede ser transportada (RF-16).`
        }
      }
    }

    // VERIFICACIÓN PREVIA DE ESTADO Y BATERÍA RESIDUAL >= 20% (RF-14.2)
    // El sistema verifica que el dispositivo tenga estado "Disponible" y que su nivel de
    // batería garantice una reserva residual >= 20% tras cubrir la distancia total de ida y vuelta a la estación.
    const chargingStation = meetingPoints.find(p => p.is_charging_station) || meetingPoints[0]
    const tripMeters = getDistanceMeters(origin.latitude, origin.longitude, destination.latitude, destination.longitude)
    const returnMeters = getDistanceMeters(destination.latitude, destination.longitude, chargingStation.latitude, chargingStation.longitude)
    const totalRoundTripMeters = tripMeters + returnMeters
    const estimatedBatteryConsumption = Math.ceil(totalRoundTripMeters / 60) // ~1% cada 60 metros

    const eligibleDevices = devices.filter(d => {
      if (d.type !== preferredType) return false
      // RF-14.2: Debe tener estado 'Disponible'
      if (d.status !== 'Disponible') return false
      // Carga útil suficiente
      if (d.max_payload_kg < res.payload_weight_kg) return false
      // RF-14.2: Reserva residual >= 20% tras ida y vuelta
      const projectedResidual = d.battery_level - estimatedBatteryConsumption
      return projectedResidual >= 20 && d.battery_level >= 20
    })

    if (!eligibleDevices.length) {
      return {
        success: false,
        error: `No hay dispositivos ${preferredType} en estado 'Disponible' con reserva residual >= 20% tras ida y vuelta (${totalRoundTripMeters.toFixed(0)}m, consumo est. ${estimatedBatteryConsumption}%) (RF-14.2).`
      }
    }

    // Elegir el de mayor batería
    const chosenDevice = eligibleDevices.sort((a, b) => b.battery_level - a.battery_level)[0]

    // Generar OTP con CSPRNG (PIN de 6 dígitos y QR - RF-22.1, RNF-08)
    const missionId = 'mis-' + Math.floor(1000 + Math.random() * 9000)
    const otpData = createHandoverOtp(missionId, res.id)

    // Generar ruta de waypoints
    const waypoints = generateRouteWaypoints(origin, destination, 15)

    const newMission = {
      id: missionId,
      reservation_id: res.id,
      device_id: chosenDevice.id,
      device_code: chosenDevice.code,
      device_type: chosenDevice.type,
      origin_name: origin.name,
      destination_name: destination.name,
      destination_point_id: destination.id,
      otp_pin: otpData.pin,
      otp_qr_code: otpData.qrPayload,
      otp_expires_at: otpData.expiresAt,
      waypoints: waypoints,
      currentStepIndex: 0,
      current_lat: origin.latitude,
      current_lng: origin.longitude,
      current_battery: chosenDevice.battery_level,
      started_at: new Date().toISOString(),
      status: 'En camino',
      video_url: `${(import.meta.env.VITE_SUPABASE_URL || 'https://mnjlidnbhtcrbtnwsqof.supabase.co')}/storage/v1/object/public/drone-videos/${missionId}.mp4`,
      weatherNote: weatherReason
    }

    // Actualizar estado del dispositivo a 'En servicio' (RF-05)
    setDevices(prev =>
      prev.map(d => (d.id === chosenDevice.id ? { ...d, status: 'En servicio' } : d))
    )

    // Actualizar estado de la reserva a 'Despachado' (RF-22.1)
    setReservations(prev =>
      prev.map(r => (r.id === res.id ? { ...r, status: 'Despachado' } : r))
    )

    setMissions(prev => [newMission, ...prev])

    addAuditLog(
      'DESPACHO_MISION',
      `Misión ${newMission.id} despachada con ${chosenDevice.code} (${chosenDevice.type}). PIN OTP generado: ${otpData.pin}. Ruta: ${origin.name} -> ${destination.name}.`
    )

    // Transmisión multicanal de QR y PIN al destinatario (RF-22.2)
    addAuditLog(
      'TRANSMISION_MULTICANAL_OTP',
      `Transmisión multicanal completada (RF-22.2): Código QR y PIN [${otpData.pin}] transmitidos vía SMS al móvil ${res.recipient_phone} y vía correo a ${res.recipient_email} (Vigencia: 120 min).`
    )

    return {
      success: true,
      mission: newMission,
      device: chosenDevice,
      otp: otpData
    }
  }

  // =========================================================================
  // VALIDACIÓN DE ENTREGA FÍSICA HANDOVER (RF-23, RNF-08)
  // =========================================================================
  const verifyHandover = (missionId, inputPin) => {
    const mission = missions.find(m => m.id === missionId)
    if (!mission) return { success: false, error: 'Misión no encontrada.' }

    if (mission.status === 'Entregado') {
      return { success: false, error: 'Esta entrega ya fue realizada previamente.' }
    }

    // Validar PIN de 6 dígitos
    if (mission.otp_pin !== inputPin.trim()) {
      addAuditLog(
        'INTENTO_ENTREGA_FALLIDO',
        `Intento de confirmación con PIN erróneo (${inputPin}) en misión ${mission.id}.`
      )
      return { success: false, error: 'Código PIN de 6 dígitos inválido. Verifique el SMS o Correo (RF-23).' }
    }

    // Exito en entrega
    const completedAt = new Date().toISOString()

    setMissions(prev =>
      prev.map(m =>
        m.id === missionId
          ? { ...m, status: 'Entregado', completed_at: completedAt }
          : m
      )
    )

    // Cambiar estado de la reserva a 'Entregado' (RF-23)
    setReservations(prev =>
      prev.map(r =>
        r.id === mission.reservation_id
          ? { ...r, status: 'Entregado' }
          : r
      )
    )

    // Liberar dispositivo a 'Disponible'
    setDevices(prev =>
      prev.map(d =>
        d.id === mission.device_id
          ? { ...d, status: 'Disponible', daily_missions_count: (d.daily_missions_count || 0) + 1 }
          : d
      )
    )

    addAuditLog(
      'ENTREGA_CONFIRMADA_HANDOVER',
      `Entrega confirmada exitosamente en misión ${mission.id} con PIN ${inputPin}. Video indexado en Supabase Storage (retención 30 días - RF-26).`
    )

    return { success: true }
  }

  // =========================================================================
  // GESTIÓN DE ALERTAS Y EMERGENCIAS (RF-30, RF-31)
  // =========================================================================
  const triggerEmergency = (missionId, emergencyType) => {
    const mission = missions.find(m => m.id === missionId)
    const newAlert = {
      id: 'alt-' + Math.random().toString(36).substring(2, 7),
      mission_id: missionId,
      device_code: mission ? mission.device_code : 'DEV-?',
      type: emergencyType, // 'DESVIO_RUTA_10M' | 'BATERIA_MENOR_15' | 'PERDIDA_TELEMETRIA_15S' | 'IMPACTO_CAIDA'
      status: 'Activa',
      created_at: new Date().toISOString()
    }

    setAlerts(prev => [newAlert, ...prev])

    addAuditLog(
      'ALERTA_EMERGENCIA',
      `EMERGENCIA [${emergencyType}] detectada en misión ${missionId}. Notificación sonora y visual enviada a Administrador y Seguridad (RF-30).`
    )

    // Si es impacto o caída, detener y poner en Fuera de servicio (CU-23 Rama 3)
    if (emergencyType === 'IMPACTO_CAIDA' && mission) {
      setDevices(prev =>
        prev.map(d => (d.id === mission.device_id ? { ...d, status: 'Fuera de servicio' } : d))
      )
      setMissions(prev =>
        prev.map(m => (m.id === missionId ? { ...m, status: 'Abortado' } : m))
      )
    }
  }

  const resolveAlert = (alertId, notes, securityOfficerName) => {
    setAlerts(prev =>
      prev.map(a =>
        a.id === alertId
          ? { ...a, status: 'Atendida', resolutionNotes: notes, resolvedBy: securityOfficerName, resolvedAt: new Date().toISOString() }
          : a
      )
    )

    addAuditLog(
      'CIERRE_INCIDENTE_SEGURIDAD',
      `Incidente ${alertId} atendido y cerrado por Operador de Seguridad (${securityOfficerName}). Observaciones: ${notes} (RF-31).`
    )
  }

  // =========================================================================
  // ÓRDENES DE MANTENIMIENTO (RF-33.1, RF-33.2)
  // =========================================================================
  const openMaintenanceOrder = (deviceId, issueDescription, providerName) => {
    const dev = devices.find(d => d.id === deviceId)
    if (!dev) return { success: false, error: 'Dispositivo no encontrado.' }

    const newOrder = {
      id: 'maint-' + Math.floor(100 + Math.random() * 900),
      device_id: deviceId,
      device_code: dev.code,
      issue_description: issueDescription,
      provider_name: providerName,
      status: 'En proceso',
      created_at: new Date().toISOString()
    }

    setMaintenanceOrders(prev => [newOrder, ...prev])
    // Cambiar estado a 'En mantenimiento' bloqueando nuevas asignaciones (RF-33.1)
    setDevices(prev =>
      prev.map(d => (d.id === deviceId ? { ...d, status: 'En mantenimiento' } : d))
    )

    addAuditLog(
      'ORDEN_MANTENIMIENTO_ABIERTA',
      `Orden ${newOrder.id} abierta para ${dev.code}. Proveedor: ${providerName}. Estado cambiado a 'En mantenimiento' (RF-33.1).`
    )

    return { success: true, order: newOrder }
  }

  const closeMaintenanceOrder = (orderId, technicalReport) => {
    const order = maintenanceOrders.find(o => o.id === orderId)
    if (!order) return { success: false, error: 'Orden no encontrada.' }

    setMaintenanceOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, status: 'Cerrada', technical_report: technicalReport, closed_at: new Date().toISOString() }
          : o
      )
    )

    // Restituir automáticamente a 'Disponible' (RF-33.2)
    setDevices(prev =>
      prev.map(d => (d.id === order.device_id ? { ...d, status: 'Disponible' } : d))
    )

    addAuditLog(
      'ORDEN_MANTENIMIENTO_CERRADA',
      `Orden ${orderId} cerrada con informe técnico. Dispositivo ${order.device_code} restituido a estado 'Disponible' (RF-33.2).`
    )

    return { success: true }
  }

  // =========================================================================
  // CALIBRACIÓN Y MODO DEBUG DE UBICACIONES DEL MAPA
  // =========================================================================
  const updateMeetingPointLocation = (pointId, newLat, newLng) => {
    const lat = parseFloat(newLat)
    const lng = parseFloat(newLng)
    if (isNaN(lat) || isNaN(lng)) return { success: false, error: 'Coordenadas numéricas inválidas.' }

    setMeetingPoints(prev =>
      prev.map(p => (p.id === pointId ? { ...p, latitude: lat, longitude: lng } : p))
    )

    const updatedPoint = meetingPoints.find(p => p.id === pointId)
    // Si se mueve la estación de carga principal, reubicar los dispositivos disponibles
    if (updatedPoint?.is_charging_station) {
      setDevices(prev =>
        prev.map(d =>
          d.status === 'Disponible' || d.status === 'En carga'
            ? { ...d, latitude: lat, longitude: lng }
            : d
        )
      )
    }

    addAuditLog(
      'CALIBRACION_MANUAL_UBICACION',
      `Ubicación de "${updatedPoint?.name || pointId}" ajustada a [${lat.toFixed(6)}, ${lng.toFixed(6)}].`
    )
    return { success: true }
  }

  const resetMeetingPointsToDefault = () => {
    setMeetingPoints(CAMPUS_MEETING_POINTS)
    setCampusCenter([3.347200, -76.532300])
    setCampusRadius(480)
    localStorage.removeItem('puj_meeting_points_v3')
    localStorage.removeItem('puj_campus_center_v3')
    localStorage.removeItem('puj_campus_radius')
    addAuditLog('CALIBRACION_RESTABLECIDA', 'Ubicaciones de puntos de encuentro restablecidas a valores iniciales oficiales.')
    return { success: true }
  }

  return (
    <AppContext.Provider
      value={{
        devices,
        meetingPoints,
        setMeetingPoints,
        campusCenter,
        setCampusCenter,
        campusRadius,
        setCampusRadius,
        updateMeetingPointLocation,
        resetMeetingPointsToDefault,
        isDebugMode,
        setIsDebugMode,
        reservations,
        missions,
        auditLogs,
        maintenanceOrders,
        weather,
        setWeather,
        alerts,
        activeHandoverModal,
        setActiveHandoverModal,
        registerDevice,
        updateDevice,
        decommissionDevice,
        createReservation,
        dispatchMission,
        verifyHandover,
        triggerEmergency,
        resolveAlert,
        openMaintenanceOrder,
        closeMaintenanceOrder,
        addAuditLog
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp debe ser usado dentro de AppProvider')
  return context
}

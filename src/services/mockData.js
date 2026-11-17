// Datos iniciales de la Pontificia Universidad Javeriana Cali
// Cumpliendo con el estándar ISO/IEC/IEEE 29148:2018 y las especificaciones del SRS

export const INITIAL_PROFILES = [
  {
    id: 'usr-001',
    email: 'admin@puj.edu.co',
    full_name: 'Dr. Fernando Echeverri (Admin Principal)',
    role: 'AdminPrincipal',
    status: 'Activa',
    passwordHash: '$2b$10$demoHashAdminPrincipal1234567890', // bcrypt sim
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'usr-002',
    email: 'operativo@puj.edu.co',
    full_name: 'Ing. Carlos Mendoza (Admin Operativo)',
    role: 'AdminOperativo',
    status: 'Activa',
    passwordHash: '$2b$10$demoHashAdminOperativo1234567890',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'usr-003',
    email: 'seguridad@puj.edu.co',
    full_name: 'Oficial Rómulo Rojas (Operador Seguridad)',
    role: 'OperadorSeguridad',
    status: 'Activa',
    passwordHash: '$2b$10$demoHashOperadorSeguridad123456',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
]

export const CAMPUS_MEETING_POINTS = [
  {
    id: 'mp-000',
    name: 'Estación Central de Carga (Docking)',
    description: 'Hangares centrales, base operativa y estación de recarga de batería (>=80%)',
    latitude: 3.345846,
    longitude: -76.532882,
    is_charging_station: true
  },
  {
    id: 'mp-001',
    name: 'Edificio El Samán (Facultad de Ingeniería)',
    description: 'Plazoleta central y laboratorios de sistemas, electrónica y robótica',
    latitude: 3.346730,
    longitude: -76.532676,
    is_charging_station: false
  },
  {
    id: 'mp-002',
    name: 'Auditorio Alfonso Borrero Cabal, S.J.',
    description: 'Auditorio magno institucional y explanada de eventos culturales',
    latitude: 3.348446,
    longitude: -76.531342,
    is_charging_station: false
  },
  {
    id: 'mp-003',
    name: 'Biblioteca General PUJ Cali',
    description: 'Entrada principal, salas de estudio y mediateca central',
    latitude: 3.347710,
    longitude: -76.532137,
    is_charging_station: false
  },
  {
    id: 'mp-004',
    name: 'Edificio Los Guayacanes (Ciencias Económicas)',
    description: 'Facultad de Ciencias Económicas y Administrativas, posgrados y decanatura',
    latitude: 3.348811,
    longitude: -76.532196,
    is_charging_station: false
  },
  {
    id: 'mp-005',
    name: 'Cafetería Central La Troja',
    description: 'Plazoleta gastronómica universitaria y terrazas al aire libre',
    latitude: 3.348484,
    longitude: -76.531951,
    is_charging_station: false
  },
  {
    id: 'mp-006',
    name: 'Laboratorios de Diseño y Robótica',
    description: 'Edificio Almendros: talleres de manufactura, artes visuales, diseño y prototipado',
    latitude: 3.346501,
    longitude: -76.532064,
    is_charging_station: false
  },
  {
    id: 'mp-007',
    name: 'Polideportivo y Canchas',
    description: 'Acceso Deportivo Loyola sobre Calle 17A, canchas múltiples y gimnasio',
    latitude: 3.345280,
    longitude: -76.531801,
    is_charging_station: false
  },
  {
    id: 'mp-008',
    name: 'Cedro Rosado',
    description: 'Edificio Cedro Rosado - Laboratorios y aulas académicas',
    latitude: 3.345798,
    longitude: -76.533713,
    is_charging_station: false
  },
  {
    id: 'mp-009',
    name: 'Edificio El Lago',
    description: 'Edificio El Lago - Decanaturas y aulas junto a la zona ecológica',
    latitude: 3.348236,
    longitude: -76.532806,
    is_charging_station: false
  },
  {
    id: 'mp-010',
    name: 'Edificio Administrativo',
    description: 'Oficinas institucionales, registro académico y servicios universitarios',
    latitude: 3.347395,
    longitude: -76.532356,
    is_charging_station: false
  },
  {
    id: 'mp-011',
    name: 'Edificio Las Palmas',
    description: 'Campus Nova, innovación, emprendimiento y educación continua',
    latitude: 3.348970,
    longitude: -76.531533,
    is_charging_station: false
  },
  {
    id: 'mp-012',
    name: 'Edificio Las Acacias (Salud)',
    description: 'Facultad de Ciencias de la Salud y centros de simulación médica',
    latitude: 3.347334,
    longitude: -76.534132,
    is_charging_station: false
  },
  {
    id: 'mp-013',
    name: 'Capilla Central',
    description: 'Capilla San Francisco Javier sobre Calle 17A',
    latitude: 3.347802,
    longitude: -76.531669,
    is_charging_station: false
  }
]

// Parque inicial de 6 dispositivos conforme a RR-09 (3 UGV y 3 UAV)
export const INITIAL_DEVICES = [
  {
    id: 'dev-001',
    code: 'UGV-01',
    type: 'UGV',
    model: 'Scout Rover X4 (Terrestre)',
    max_payload_kg: 8.0,
    battery_level: 95,
    status: 'Disponible', // 'Disponible' | 'En servicio' | 'En carga' | 'En mantenimiento' | 'Fuera de servicio'
    latitude: 3.345846,
    longitude: -76.532882,
    max_speed_kmh: 15,
    max_altitude_m: 0,
    camera_resolution: '1080p',
    daily_missions_count: 2,
    proximity_sensor: 'OK',
    camera_sensor: 'Conectada',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString()
  },
  {
    id: 'dev-002',
    code: 'UGV-02',
    type: 'UGV',
    model: 'Titan Hauler Pro (Terrestre)',
    max_payload_kg: 10.0,
    battery_level: 88,
    status: 'Disponible',
    latitude: 3.345846,
    longitude: -76.532882,
    max_speed_kmh: 12,
    max_altitude_m: 0,
    camera_resolution: '1080p',
    daily_missions_count: 1,
    proximity_sensor: 'OK',
    camera_sensor: 'Conectada',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString()
  },
  {
    id: 'dev-003',
    code: 'UGV-03',
    type: 'UGV',
    model: 'Carrier Lite (Terrestre)',
    max_payload_kg: 5.0,
    battery_level: 42,
    status: 'En carga', // En carga hasta alcanzar >= 80% (RF-34)
    latitude: 3.345846,
    longitude: -76.532882,
    max_speed_kmh: 18,
    max_altitude_m: 0,
    camera_resolution: '720p',
    daily_missions_count: 4,
    proximity_sensor: 'OK',
    camera_sensor: 'Conectada',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'dev-004',
    code: 'UAV-01',
    type: 'UAV',
    model: 'SkyCourier Hexacopter (Dron)',
    max_payload_kg: 1.8,
    battery_level: 100,
    status: 'Disponible',
    latitude: 3.345846,
    longitude: -76.532882,
    max_speed_kmh: 35,
    max_altitude_m: 60,
    camera_resolution: '4K',
    daily_missions_count: 3,
    proximity_sensor: 'OK',
    camera_sensor: 'Conectada',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  },
  {
    id: 'dev-005',
    code: 'UAV-02',
    type: 'UAV',
    model: 'Falcon Express Quad (Dron)',
    max_payload_kg: 2.0,
    battery_level: 90,
    status: 'Disponible',
    latitude: 3.345846,
    longitude: -76.532882,
    max_speed_kmh: 40,
    max_altitude_m: 80,
    camera_resolution: '1080p',
    daily_missions_count: 2,
    proximity_sensor: 'OK',
    camera_sensor: 'Conectada',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString()
  },
  {
    id: 'dev-006',
    code: 'UAV-03',
    type: 'UAV',
    model: 'Aerocam Surveyor (Dron)',
    max_payload_kg: 1.2,
    battery_level: 82,
    status: 'Disponible',
    latitude: 3.345846,
    longitude: -76.532882,
    max_speed_kmh: 30,
    max_altitude_m: 120, // Altitud máx RAC 100
    camera_resolution: '4K',
    daily_missions_count: 1,
    proximity_sensor: 'OK',
    camera_sensor: 'Conectada',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  }
]

export const INITIAL_RESERVATIONS = [
  {
    id: 'res-101',
    requester_id: 'SIU-892314',
    requester_name: 'Dra. Laura Morales',
    recipient_email: 'l.morales@javerianacali.edu.co',
    recipient_phone: '+57 315 889 4521',
    service_type: 'Transporte',
    priority: 'Alta',
    payload_weight_kg: 1.2, // Ligero -> UAV-01
    origin_point_id: 'mp-001', // Samán
    destination_point_id: 'mp-003', // Biblioteca
    scheduled_time: new Date(Date.now() + 45 * 60000).toISOString(),
    status: 'Programada', // 'Programada' | 'Asignada' | 'Despachado' | 'Entregado' | 'Interrumpido' | 'Cancelado'
    created_at: new Date(Date.now() - 20 * 60000).toISOString()
  },
  {
    id: 'res-102',
    requester_id: 'SIU-774120',
    requester_name: 'Ing. Mateo Gómez',
    recipient_email: 'mateo.gomez@javerianacali.edu.co',
    recipient_phone: '+57 300 456 7890',
    service_type: 'Transporte',
    priority: 'Normal',
    payload_weight_kg: 5.5, // Pesado (>2kg) -> UGV-01 o UGV-02
    origin_point_id: 'mp-006', // Lab Robótica
    destination_point_id: 'mp-001', // Samán
    scheduled_time: new Date(Date.now() + 90 * 60000).toISOString(),
    status: 'Programada',
    created_at: new Date(Date.now() - 15 * 60000).toISOString()
  }
]

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'log-001',
    user_email: 'admin@puj.edu.co',
    action: 'INICIALIZACION_SISTEMA',
    details: 'Arranque del Sistema FMS/GCS con 6 dispositivos activos en Campus PUJ Cali (RAC 100 verificado).',
    ip_address: '192.168.1.105',
    timestamp_utc: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    id: 'log-002',
    user_email: 'operativo@puj.edu.co',
    action: 'CREACION_RESERVA',
    details: 'Reserva res-101 registrada: transporte de 1.2 kg de Edificio Samán a Biblioteca.',
    ip_address: '192.168.1.112',
    timestamp_utc: new Date(Date.now() - 20 * 60000).toISOString()
  }
]

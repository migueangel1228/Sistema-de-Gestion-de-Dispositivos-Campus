-- =========================================================================
-- SISTEMA CENTRALIZADO DE GESTIÓN DE ROBOTS Y DRONES (CAMPUS PUJ CALI)
-- Script de Creación y Poblamiento de Base de Datos PostgreSQL / Supabase
-- Estándar ISO/IEC/IEEE 29148:2018 | Entregable 3 Demo
-- =========================================================================

-- 0. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- 1. Tabla de Perfiles de Usuario / Roles (RBAC: RF-01, RF-03, RNF-07)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  role text check (role in ('AdminPrincipal', 'AdminOperativo', 'OperadorSeguridad')) not null,
  status text check (status in ('Activa', 'Inactiva')) default 'Activa',
  failed_attempts integer default 0,
  locked_until timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabla de Dispositivos (UGV y UAV: RF-04, RF-05, RF-07, RR-09)
create table if not exists public.devices (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null, -- ej. UGV-01, UAV-01
  type text check (type in ('UGV', 'UAV')) not null,
  model text not null,
  max_payload_kg numeric(5,2) not null, -- Dron <= 2.0, Robot <= 10.0
  battery_level integer check (battery_level between 0 and 100) default 100,
  status text check (status in ('Disponible', 'En servicio', 'En carga', 'En mantenimiento', 'Fuera de servicio')) default 'Disponible',
  latitude numeric(10, 6) default 3.342150, -- Coordenada base PUJ Cali
  longitude numeric(10, 6) default -76.530200,
  max_speed_kmh integer default 25,
  max_altitude_m integer default 60,
  camera_resolution text default '1080p',
  daily_missions_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabla de Puntos de Encuentro (Campus PUJ Cali: RF-11, RR-06)
create table if not exists public.meeting_points (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  description text,
  latitude numeric(10, 6) not null,
  longitude numeric(10, 6) not null,
  is_charging_station boolean default false
);

-- 4. Tabla de Reservas y Solicitudes (RF-08, RF-09, RF-10)
create table if not exists public.reservations (
  id uuid default uuid_generate_v4() primary key,
  requester_id text not null, -- Identificador institucional SIU
  requester_name text not null,
  recipient_email text not null,
  recipient_phone text not null,
  service_type text check (service_type in ('Transporte', 'Grabacion')) not null,
  priority text check (priority in ('Alta', 'Normal')) default 'Normal',
  payload_weight_kg numeric(5,2) default 0.0,
  origin_point_id uuid references public.meeting_points(id),
  destination_point_id uuid references public.meeting_points(id),
  scheduled_time timestamp with time zone not null,
  status text check (status in ('Programada', 'Asignada', 'Despachado', 'Entregado', 'Interrumpido', 'Cancelado')) default 'Programada',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabla de Misiones y Despachos activos (RF-14, RF-20, RF-22, RF-23, RF-32)
create table if not exists public.missions (
  id uuid default uuid_generate_v4() primary key,
  reservation_id uuid references public.reservations(id) on delete cascade,
  device_id uuid references public.devices(id),
  otp_qr_code text,
  otp_pin text, -- PIN de 6 dígitos CSPRNG
  otp_expires_at timestamp with time zone,
  video_url text, -- Supabase Storage URL
  started_at timestamp with time zone default timezone('utc'::text, now()),
  completed_at timestamp with time zone,
  current_lat numeric(10, 6),
  current_lng numeric(10, 6),
  current_battery integer,
  emergency_code text,
  status text check (status in ('En camino', 'En camino - bateria baja', 'Entregado', 'Abortado', 'En alerta')) default 'En camino'
);

-- 6. Tabla de Bitácora Histórica e Inmutable de Auditoría (RF-28, RNF-13)
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_email text,
  action text not null,
  details text,
  ip_address text default '127.0.0.1',
  timestamp_utc timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Tabla de Órdenes de Mantenimiento (RF-33)
create table if not exists public.maintenance_orders (
  id uuid default uuid_generate_v4() primary key,
  device_id uuid references public.devices(id),
  issue_description text not null,
  provider_name text not null,
  status text check (status in ('Abierta', 'En proceso', 'Cerrada')) default 'Abierta',
  technical_report text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  closed_at timestamp with time zone
);

-- =========================================================================
-- POBLAMIENTO INICIAL DE DATOS (SEED DATA - CAMPUS PUJ CALI)
-- =========================================================================

-- Puntos de Encuentro Oficiales PUJ Cali
insert into public.meeting_points (name, description, latitude, longitude, is_charging_station) values
('Estación Central de Carga (Docking)', 'Base de operaciones y hangares de drones/robots', 3.342500, -76.530700, true),
('Edificio Samán (Ingeniería)', 'Plazoleta central y aulas de laboratorios', 3.342150, -76.530200, false),
('Auditorio Alfonso Borrero Cabal', 'Sótano 1 y explanada principal de eventos', 3.342800, -76.531200, false),
('Biblioteca General PUJ Cali', 'Entrada principal y plazoleta de estudio', 3.341400, -76.530900, false),
('Edificio Guayacanes', 'Aulas de postgrados y decanaturas', 3.343500, -76.529800, false),
('Cafetería Central La Troja', 'Zona de restaurantes y cafetería abierta', 3.341800, -76.531600, false),
('Laboratorios de Diseño y Robótica', 'Edificio Almendros y talleres de prototipado', 3.340900, -76.530000, false),
('Polideportivo y Canchas', 'Canchas múltiples y complejo deportivo', 3.343900, -76.531800, false)
on conflict (name) do nothing;

-- Flota Inicial de 6 Dispositivos (3 UGV + 3 UAV - RR-09)
insert into public.devices (code, type, model, max_payload_kg, battery_level, status, latitude, longitude, max_speed_kmh, max_altitude_m, camera_resolution) values
('UGV-01', 'UGV', 'Scout Rover X4 (Terrestre)', 8.00, 95, 'Disponible', 3.342500, -76.530700, 15, 0, '1080p'),
('UGV-02', 'UGV', 'Titan Hauler Pro (Terrestre)', 10.00, 88, 'Disponible', 3.342500, -76.530700, 12, 0, '1080p'),
('UGV-03', 'UGV', 'Carrier Lite (Terrestre)', 5.00, 75, 'Disponible', 3.342500, -76.530700, 18, 0, '720p'),
('UAV-01', 'UAV', 'SkyCourier Hexacopter (Dron)', 1.80, 100, 'Disponible', 3.342500, -76.530700, 35, 60, '4K'),
('UAV-02', 'UAV', 'Falcon Express Quad (Dron)', 2.00, 92, 'Disponible', 3.342500, -76.530700, 40, 80, '1080p'),
('UAV-03', 'UAV', 'Aerocam Surveyor (Dron)', 1.20, 85, 'Disponible', 3.342500, -76.530700, 30, 120, '4K')
on conflict (code) do nothing;

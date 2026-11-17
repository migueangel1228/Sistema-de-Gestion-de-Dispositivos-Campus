-- =========================================================================
-- SISTEMA CENTRALIZADO DE GESTIÓN DE ROBOTS Y DRONES (CAMPUS PUJ CALI)
-- Script de Creación, Seguridad (RLS) y Poblamiento de Base de Datos PostgreSQL / Supabase
-- Estándar ISO/IEC/IEEE 29148:2018 & RAC 100 | Entregable 3 Demo
-- =========================================================================

-- 0. Habilitar extensión UUID
create extension if not exists "uuid-ossp";

-- =========================================================================
-- 1. TABLAS PRINCIPALES DEL SISTEMA
-- =========================================================================

-- 1.1 Tabla de Perfiles de Usuario / Roles (RBAC: RF-01, RF-03, RNF-07)
create table if not exists public.profiles (
  id text primary key, -- ej. usr-001 o auth.users uuid
  email text unique not null,
  full_name text not null,
  role text check (role in ('AdminPrincipal', 'AdminOperativo', 'OperadorSeguridad')) not null,
  status text check (status in ('Activa', 'Inactiva')) default 'Activa',
  failed_attempts integer default 0,
  locked_until timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.2 Tabla de Dispositivos (UGV y UAV: RF-04, RF-05, RF-07, RR-09)
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

-- 1.3 Tabla de Puntos de Encuentro (Campus PUJ Cali: RF-11, RR-06)
create table if not exists public.meeting_points (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  description text,
  latitude numeric(10, 6) not null,
  longitude numeric(10, 6) not null,
  is_charging_station boolean default false
);

-- 1.4 Tabla de Reservas y Solicitudes (RF-08, RF-09, RF-10)
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

-- 1.5 Tabla de Misiones y Despachos activos (RF-14, RF-20, RF-22, RF-23, RF-32)
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

-- 1.6 Tabla de Bitácora Histórica e Inmutable de Auditoría (RF-28, RNF-13)
create table if not exists public.audit_logs (
  id uuid default uuid_generate_v4() primary key,
  user_email text,
  action text not null,
  details text,
  ip_address text default '127.0.0.1',
  timestamp_utc timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 1.7 Tabla de Órdenes de Mantenimiento (RF-33)
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
-- 2. POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- =========================================================================

alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.meeting_points enable row level security;
alter table public.reservations enable row level security;
alter table public.missions enable row level security;
alter table public.audit_logs enable row level security;
alter table public.maintenance_orders enable row level security;

-- Acceso de lectura pública (anon y authenticated)
create policy "Permitir lectura publica a profiles" on public.profiles for select to public using (true);
create policy "Permitir lectura publica a devices" on public.devices for select to public using (true);
create policy "Permitir lectura publica a meeting_points" on public.meeting_points for select to public using (true);
create policy "Permitir lectura publica a reservations" on public.reservations for select to public using (true);
create policy "Permitir lectura publica a missions" on public.missions for select to public using (true);
create policy "Permitir lectura publica a audit_logs" on public.audit_logs for select to public using (true);
create policy "Permitir lectura publica a maintenance_orders" on public.maintenance_orders for select to public using (true);

-- Acceso de escritura y actualización para la consola operativa
create policy "Permitir operaciones sobre profiles" on public.profiles for all to public using (true) with check (true);
create policy "Permitir operaciones sobre devices" on public.devices for all to public using (true) with check (true);
create policy "Permitir operaciones sobre meeting_points" on public.meeting_points for all to public using (true) with check (true);
create policy "Permitir operaciones sobre reservations" on public.reservations for all to public using (true) with check (true);
create policy "Permitir operaciones sobre missions" on public.missions for all to public using (true) with check (true);
create policy "Permitir insercion inmutable audit_logs" on public.audit_logs for insert to public with check (true);
create policy "Permitir operaciones sobre maintenance_orders" on public.maintenance_orders for all to public using (true) with check (true);

-- =========================================================================
-- 3. BUCKET DE ALMACENAMIENTO S3 PARA VIDEOS DE DRONES (RF-27.2, RNF-14)
-- =========================================================================

-- Crear el bucket de almacenamiento si no existe
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'drone-videos',
  'drone-videos',
  true,
  104857600, -- 100 MB máximo por streaming/grabación
  array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png'];

-- Políticas de acceso a storage.objects para el bucket drone-videos
create policy "Public Access Drone Videos"
  on storage.objects for select
  to public
  using (bucket_id = 'drone-videos');

create policy "Public Upload Drone Videos"
  on storage.objects for insert
  to public
  with check (bucket_id = 'drone-videos');

create policy "Public Update Drone Videos"
  on storage.objects for update
  to public
  using (bucket_id = 'drone-videos')
  with check (bucket_id = 'drone-videos');

-- =========================================================================
-- 4. POBLAMIENTO INICIAL DE DATOS (SEED DATA - CAMPUS PUJ CALI)
-- =========================================================================

-- 4.1 Perfiles Institucionales (RF-01, RF-03)
insert into public.profiles (id, email, full_name, role, status) values
('usr-001', 'admin@puj.edu.co', 'Dr. Fernando Echeverri (Admin Principal)', 'AdminPrincipal', 'Activa'),
('usr-002', 'operativo@puj.edu.co', 'Ing. Carlos Mendoza (Admin Operativo)', 'AdminOperativo', 'Activa'),
('usr-003', 'seguridad@puj.edu.co', 'Oficial Rómulo Rojas (Operador Seguridad)', 'OperadorSeguridad', 'Activa')
on conflict (id) do nothing;

-- 4.2 Puntos de Encuentro Oficiales PUJ Cali (RF-11, RR-06)
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

-- 4.3 Flota Inicial de 6 Dispositivos (3 UGV + 3 UAV - RR-09)
insert into public.devices (code, type, model, max_payload_kg, battery_level, status, latitude, longitude, max_speed_kmh, max_altitude_m, camera_resolution) values
('UGV-01', 'UGV', 'Scout Rover X4 (Terrestre)', 8.00, 95, 'Disponible', 3.342500, -76.530700, 15, 0, '1080p'),
('UGV-02', 'UGV', 'Titan Hauler Pro (Terrestre)', 10.00, 88, 'Disponible', 3.342500, -76.530700, 12, 0, '1080p'),
('UGV-03', 'UGV', 'Carrier Lite (Terrestre)', 5.00, 75, 'Disponible', 3.342500, -76.530700, 18, 0, '720p'),
('UAV-01', 'UAV', 'SkyCourier Hexacopter (Dron)', 1.80, 100, 'Disponible', 3.342500, -76.530700, 35, 60, '4K'),
('UAV-02', 'UAV', 'Falcon Express Quad (Dron)', 2.00, 92, 'Disponible', 3.342500, -76.530700, 40, 80, '1080p'),
('UAV-03', 'UAV', 'Aerocam Surveyor (Dron)', 1.20, 85, 'Disponible', 3.342500, -76.530700, 30, 120, '4K')
on conflict (code) do nothing;

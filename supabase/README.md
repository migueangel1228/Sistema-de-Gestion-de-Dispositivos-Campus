# 🗄️ Infraestructura de Base de Datos & Backend — Supabase

Este directorio contiene las especificaciones SQL, esquemas relacionales, políticas de seguridad a nivel de fila (Row Level Security - RLS) y datos de prueba (*seed data*) del **Sistema de Gestión de Dispositivos Autónomos Campus PUJ Cali**.

---

## 📁 Archivos Disponibles

| Archivo | Propósito |
| :--- | :--- |
| `schema.sql` | Esquema principal: Creación de tablas (`profiles`, `devices`, `meeting_points`, `reservations`, `missions`, `audit_logs`, `maintenance_orders`), políticas RLS, configuración de bucket S3 `drone-videos` y seed data de 12 puntos de encuentro y 6 dispositivos. |
| `drop_ecommerce_tables.sql` | Script de migración y saneamiento: Elimina de manera segura las tablas obsoletas del antiguo módulo de ventas/e-commerce. |

---

## 🏗️ Modelo de Entidades y Tablas

```text
       +-------------------+
       |     profiles      |  (RBAC: AdminPrincipal, AdminOperativo, OperadorSeguridad)
       +-------------------+
                 |
                 v
       +-------------------+
       |    audit_logs     |  (Inmutable, RF-28, RNF-13)
       +-------------------+

       +--------------------+          +--------------------+
       |   meeting_points   | <------- |    reservations    |  (SIU, RF-08)
       +--------------------+          +--------------------+
                 ^                               |
                 |                               v
       +--------------------+          +--------------------+
       |      devices       | <------- |      missions      |  (Telemetría 5s, OTP, Video)
       |   (UAV / UGV)      |          +--------------------+
       +--------------------+
                 |
                 v
       +--------------------+
       | maintenance_orders |  (RF-33)
       +--------------------+
```

### 1. `profiles`
Gestiona el control de acceso basado en roles (**RBAC** - RF-01, RF-03).
- Campos: `id`, `email`, `full_name`, `role`, `status`, `failed_attempts`, `locked_until`, `created_at`.
- Restricciones: Bloqueo automático de 15 minutos tras 5 intentos fallidos en una ventana de 10 minutos (RNF-02).

### 2. `devices`
Inventario centralizado de flota autónoma (**UGV** terrestres y **UAV** aéreos - RF-04 a RF-07, RR-09).
- Campos: `id`, `code`, `type`, `model`, `max_payload_kg`, `battery_level`, `status`, `latitude`, `longitude`, `max_speed_kmh`, `max_altitude_m`, `camera_resolution`, `daily_missions_count`.
- Reglas: Carga útil de Drones $\le 2.0\text{ kg}$, Robots $\le 10.0\text{ kg}$. Estados: `Disponible`, `En servicio`, `En carga`, `En mantenimiento`, `Fuera de servicio`.

### 3. `meeting_points`
Puntos de entrega y encuentro georreferenciados del campus PUJ Cali (RF-11, RR-06).
- Incluye la estación central de carga inductiva (`is_charging_station = true`) y los edificios clave del campus (Samán, Borrero Cabal, Biblioteca, Guayacanes, Troja, etc.).

### 4. `reservations`
Solicitudes institucionales integradas con el Sistema de Información Universitaria (**SIU** - RF-08, RR-05).
- Campos: `id`, `requester_id`, `requester_name`, `recipient_email`, `recipient_phone`, `service_type`, `priority`, `payload_weight_kg`, `origin_point_id`, `destination_point_id`, `scheduled_time`, `status`.

### 5. `missions`
Ciclo de vida operacional y telemetría de misiones despachadas (RF-14, RF-20 a RF-23).
- Campos: `id`, `reservation_id`, `device_id`, `otp_qr_code`, `otp_pin`, `otp_expires_at`, `video_url`, `started_at`, `completed_at`, `current_lat`, `current_lng`, `current_battery`, `status`.

### 6. `audit_logs`
Bitácora inmutable de eventos operacionales (RF-28, RNF-13).
- Almacena acciones, dirección IP, correo del operador y marca temporal UTC para auditorías ISO/IEC/IEEE 29148:2018.

### 7. `maintenance_orders`
Órdenes de servicio preventivo y correctivo para componentes mecánicos/aviónica (RF-33).

---

## 🔐 Políticas de Seguridad Row Level Security (RLS)

Todas las tablas cuentan con RLS activado:
- **Lectura Pública / Operativa**: Acceso de consulta permitido tanto a clientes anónimos como autenticados para visualización en vivo de la consola de control.
- **Inserción Inmutable en Auditoría**: Los registros de `audit_logs` solo admiten inserciones (`INSERT`); las operaciones de modificación (`UPDATE`) o eliminación (`DELETE`) están bloqueadas a nivel de motor SQL para salvaguardar la evidencia forense.

---

## 🪣 Bucket de Almacenamiento S3: `drone-videos`

El script crea y configura el bucket `drone-videos` con:
- Capacidad máxima de archivo: **100 MB** (RNF-14).
- Tipos MIME permitidos: `video/mp4`, `video/webm`, `video/quicktime`, `image/jpeg`, `image/png`.
- Políticas públicas de lectura e inserción directa para transmisiones y grabaciones de misiones de monitoreo (RF-27.2).

---

## 🚀 Cómo Aplicar el Esquema en Supabase

1. Accede a tu proyecto en el [Dashboard de Supabase](https://supabase.com/dashboard).
2. Ve a la pestaña **SQL Editor**.
3. (Opcional) Si vienes de una versión previa, ejecuta `drop_ecommerce_tables.sql`.
4. Copia el contenido completo de `schema.sql` y pulsa **Run**.
5. Las tablas, políticas RLS, el bucket de almacenamiento y los datos de prueba quedarán instantáneamente aprovisionados.

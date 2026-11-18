# Sistema de Gestión de Dispositivos Campus PUJ Cali (GCS & FMS)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20S3-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=flat-square&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Standard](https://img.shields.io/badge/Standard-ISO%2FIEC%2FIEEE%2029148%3A2018-002855?style=flat-square)](https://www.iso.org/)
[![Aviation](https://img.shields.io/badge/Regulación-RAC%20100%20Aerocivil-D97706?style=flat-square)](https://www.aerocivil.gov.co/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

Plataforma web centralizada para el comando, despacho, telemetría y supervisión de flota de **Vehículos Terrestres No Tripulados (UGV)** y **Vehículos Aéreos No Tripulados (UAV)** en el campus de la **Pontificia Universidad Javeriana Cali**.

Diseñado bajo lineamientos de ingeniería de requisitos **ISO/IEC/IEEE 29148:2018**, normativa aeronáutica civil **RAC 100**, y el sistema de diseño institucional **Google Stitch** (cero emojis informales, tipografía dual de alta precisión e iconografía vectorial).

---

## 📑 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Arquitectura de Software & Documentación](#-arquitectura-de-software--documentación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Pila Tecnológica](#-pila-tecnológica)
- [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
- [Cuentas de Demostración & Roles (RBAC)](#-cuentas-de-demostración--roles-rbac)
- [Cumplimiento Normativo (16 Subrequisitos SRS)](#-cumplimiento-normativo-16-subrequisitos-srs)
- [Integración con Supabase](#-integración-con-supabase)
- [Licencia](#-licencia)

---

## 🚀 Características Principales

### 1. Estación de Control Terrestre (GCS) y Telemetría en Vivo
- **Visualización Geoespacial en Tiempo Real**: Mapa interactivo con Leaflet que representa la geocerca oficial del campus PUJ Cali (radio 480 m), rutas activas por waypoints y marcadores dinámicos diferenciados para drones (UAV) y robots (UGV).
- **Ciclo de Telemetría (5 segundos)**: Actualización periódica de coordenadas GPS, consumo de batería por metro recorrido, velocidad y estado operacional (RNF-03).
- **Herramienta de Calibración Integrada (Modo Debug)**: Permite ajustar y arrastrar interactivamente los puntos de encuentro en el mapa con exportación automática a código JavaScript.

### 2. Algoritmo de Asignación y Despacho Inteligente
- **Selección de Tipo de Vehículo**: Asignación automática a dron para cargas ligeras ($\le 0.5\text{ kg}$) con prioridad alta, o robot terrestre para bultos mayores (hasta $1.0\text{ kg}$) conforme al nuevo SRS.
- **Validación Meteorológica RAC 100 (Falla Segura)**: Bloqueo inmediato de vuelos UAV si la velocidad del viento supera los $25\text{ km/h}$, si hay lluvia activa o si se pierde conectividad con el servicio meteorológico. En caso de condición adversa, reasigna automáticamente a robot terrestre (RF-16).
- **Evaluación Energética Pre-Despacho**: Comprobación matemática de reserva de batería residual ($\ge 20\%$) cubriendo la trayectoria completa de ida y retorno a la estación de recarga (RF-14.2).

### 3. Protocolo de Entrega Física Segura (Handover OTP)
- **Criptografía CSPRNG**: Generación de códigos OTP de 6 dígitos criptográficamente seguros y códigos QR asociados para cada misión (RF-22.1).
- **Simulación Multicanal**: Transmisión simulada de credenciales de entrega vía SMS y correo electrónico al destinatario (RF-22.2).
- **Validación de Arribo**: Apertura de compartimiento de carga únicamente tras validación exitosa del PIN o escaneo de código QR (RF-23).

### 4. Contingencias y Protocolos de Seguridad
- **Evaluación al 20% de Batería**: Análisis en pleno vuelo de reserva residual proyectada. Si la reserva al destino es $\ge 10\%$, continúa la misión; si es inferior, aborta automáticamente activando retorno a base (RTH) (RF-32).
- **Interlocks y Parada de Emergencia**: Disparador de contingencias ante desviación de ruta ($> 10\text{ m}$), pérdida de telemetría ($> 15\text{ s}$) o detección de impacto/caída (RF-30, RF-31).

### 5. Auditoría Inmutable y Evidencia en Video
- **Bitácora de Eventos**: Registro histórico de cada acción operativa con dirección IP, sello temporal UTC y correo de operador (RF-28). Exportación nativa a formatos CSV y JSON.
- **Transmisión de Video e Indexación S3**: Visualización de cámara abordo con telemetría HUD sobrepuesta y almacenamiento en bucket S3 `drone-videos` con retención de 30 días (RF-26, RF-27).

---

## 🏛 Arquitectura de Software & Documentación

Todos los artefactos de diseño, modelos UML y especificaciones formales están estructurados en el directorio [`docs/`](docs/):

```text
docs/
├── README.md                          # Guía navegable de artefactos técnicos
├── architecture/                      # Modelado C4 y dominio
│   ├── C4-Robots-Drones.drawio        # Arquitectura C4 (Contexto, Contenedor, Componentes)
│   ├── Diagrama-Arquitectura.drawio   # Diagrama integral de arquitectura de software
│   ├── Diagrama-Clases.drawio         # Diagrama de Clases UML del dominio
│   ├── Diagrama-Contexto-Drones-Robots.png # Contexto del sistema y fronteras
│   └── DESIGN.md                      # Design System Google Stitch (colores, tipografía)
├── requirements/                      # Ingeniería de requisitos
│   ├── SRS - Sistema de Gestión de Dispositivos Campus PUJ.pdf # SRS formal ISO 29148
│   ├── Cuestionario.pdf               # Instrumento de levantamiento con stakeholders
│   └── matriz-requisitos.png          # Matriz de trazabilidad y cobertura
└── diagrams/                          # Diagramas de interacción y flujo
    ├── use-cases/                     # Diagramas y especificaciones de Casos de Uso
    ├── activities/                    # Diagramas de actividades (flujo principal y baterías)
    └── sequence/                      # Diagramas de secuencia (CU-01, CU-08, CU-14, CU-21, CU-23)
```

Para mayor detalle de la arquitectura, consulta [docs/README.md](docs/README.md).

---

## 📂 Estructura del Proyecto

El código fuente sigue una arquitectura modular limpia con separación clara de responsabilidades:

```text
├── .github/
│   ├── workflows/ci.yml               # Pipeline de integración continua (CI)
│   ├── pull_request_template.md       # Plantilla estándar para PRs
│   └── ISSUE_TEMPLATE/                # Plantillas para bugs y mejoras
├── docs/                              # Documentación técnica, SRS y diagramas UML
├── public/                            # Recursos estáticos públicos
├── src/
│   ├── assets/                        # Recursos visuales
│   ├── components/                    # Componentes UI reutilizables
│   │   ├── common/                    # Iconografía vectorial y emblemas (MinimalLogos)
│   │   ├── controls/                  # Controles de clima y emergencia
│   │   ├── layout/                    # Barra superior (Navbar) y navegación lateral (Sidebar)
│   │   ├── map/                       # Visor de mapa Leaflet (MapView) y HUD
│   │   ├── modals/                    # Modales de entrega (Handover), video y auditoría SRS
│   │   └── index.js                   # Barrel central de componentes
│   ├── context/                       # Estado global (AppContext, AuthContext)
│   ├── pages/                         # Vistas del sistema (Dashboard, Monitor, Inventario, etc.)
│   ├── services/                      # Cliente Supabase y datos iniciales (seed)
│   ├── utils/                         # Criptografía OTP, simulador de telemetría y reportes
│   ├── App.jsx                        # Orquestador principal de vistas
│   ├── index.css                      # Estilos globales y tokens de diseño Tailwind
│   └── main.jsx                       # Punto de entrada de la aplicación
├── supabase/                          # Scripts SQL, esquema relacional y políticas RLS
├── jsconfig.json                      # Configuración de alias de ruta (@/*)
├── package.json                       # Dependencias y scripts de construcción
├── tailwind.config.js                 # Configuración de diseño y paleta Javeriana
└── vite.config.js                     # Configuración de empaquetado y code splitting
```

---

## 🛠 Pila Tecnológica

| Capa | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Framework UI** | React 18 | Renderizado reactivo con arquitectura de componentes y hooks |
| **Herramienta de Build** | Vite 6 | Compilación ultrarrápida, HMR instantáneo y empaquetado optimizado |
| **Estilos & Diseño** | Tailwind CSS 3 | Tokens institucionales Javeriana (`#002855`, `#FFB81C`) y diseño responsivo |
| **Mapas & GIS** | Leaflet & React-Leaflet | Visualización de capas, geocercas poligonales y marcadores SVG interactivos |
| **BaaS / Base de Datos** | Supabase (PostgreSQL) | Persistencia relacional, políticas Row Level Security (RLS) y buckets S3 |
| **Iconografía** | Lucide React & MinimalLogos | Iconos vectoriales limpios con terminaciones redondeadas (cero emojis) |
| **Criptografía** | Web Crypto API (HMAC-SHA256) | Generación aleatoria de OTP con protección contra colisiones |

---

## 💻 Instalación y Puesta en Marcha

### Prerrequisitos
- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior (o pnpm / yarn)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/migueangel1228/Sistema-de-Gesti-n-de-Dispositivos-Campus.git
cd Sistema-de-Gesti-n-de-Dispositivos-Campus
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno (Opcional)
La plataforma incluye un motor autónomo con persistencia en `localStorage` y datos de prueba preconfigurados. Si deseas conectar con una instancia real de Supabase:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

Para aplicar el esquema SQL en Supabase, consulta [supabase/README.md](supabase/README.md).

### 4. Ejecutar Servidor de Desarrollo
```bash
npm run dev
```

La consola estará disponible en `http://localhost:5173`.

### 5. Compilación para Producción
```bash
npm run build
npm run preview
```

---

## 👥 Cuentas de Demostración & Roles (RBAC)

La plataforma cuenta con un conmutador rápido de roles en la barra superior para facilitar pruebas funcionales:

| Rol | Correo de Acceso | Clave Demo | Permisos Operativos |
| :--- | :--- | :--- | :--- |
| **Admin Principal** | `admin@puj.edu.co` | `puj2026` | Acceso global irrestricto, configuración de flota, usuarios y reportes |
| **Admin Operativo** | `operativo@puj.edu.co` | `puj2026` | Despacho de misiones, gestión de inventario, mantenimiento y monitoreo |
| **Operador Seguridad** | `seguridad@puj.edu.co` | `puj2026` | Monitoreo en vivo de telemetría, atención de alertas e inspección de video |

> **Nota de Seguridad**: Si se ingresan 5 contraseñas erróneas en una ventana de 10 minutos, la cuenta se bloqueará temporalmente durante 15 minutos en cumplimiento del requisito **RNF-02**.

---

## 📋 Cumplimiento Normativo (16 Subrequisitos SRS)

El sistema cuenta con un modal de auditoría interactivo accesible desde la barra superior (`SRS Audit 16/16`) que verifica:

1. **RF-01**: Autenticación con credenciales institucionales.
2. **RF-02**: Control de inactividad con cierre automático a los 15 minutos.
3. **RF-03**: Control de acceso basado en roles (RBAC).
4. **RF-04**: Registro y catálogo de drones ($\le 0.5\text{ kg}$) y robots ($\le 1.0\text{ kg}$) según nuevo SRS.
5. **RF-08**: Integración federada con solicitudes SIU.
6. **RF-11**: Catálogo de 12 puntos de encuentro georreferenciados en el campus.
7. **RF-14**: Despacho automatizado con selección por peso y prioridad.
8. **RF-16**: Bloqueo preventivo de vuelos ante viento $> 25\text{ km/h}$ o lluvia (RAC 100).
9. **RF-20**: Telemetría GPS con actualización a 5 segundos.
10. **RF-22**: Generación y entrega de códigos OTP (PIN de 6 dígitos + QR).
11. **RF-23**: Verificación física de entrega antes de liberar la carga.
12. **RF-26**: Grabación e indexación de video en almacenamiento seguro S3.
13. **RF-28**: Bitácora inmutable de auditoría forense con exportación a archivo.
14. **RF-30**: Detección y notificación inmediata de incidentes de seguridad.
15. **RF-32**: Evaluación de contingencia de batería al $20\%$ con retorno a base (RTH).
16. **RF-33**: Gestión de órdenes de servicio técnico y mantenimiento correctivo.

---

## 🗄 Integración con Supabase

Para consultar las instrucciones de despliegue de base de datos, políticas Row Level Security y administración del bucket S3 para almacenamiento de streaming de video, consulta:
👉 **[Documentación de Supabase](supabase/README.md)**

---

## 📄 Licencia

Este proyecto se encuentra publicado bajo los términos de la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

**Pontificia Universidad Javeriana Cali**  
*Facultad de Ingeniería y Ciencias — Proyecto de Procesos de Software*

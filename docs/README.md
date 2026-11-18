# 📚 Documentación Técnica & Arquitectura del Sistema

> **Sistema Centralizado de Gestión de Dispositivos Autónomos (UGV / UAV)**  
> **Pontificia Universidad Javeriana Cali · Centro de Control Operativo de Campus**  
> *Acreditado bajo Norma ISO/IEC/IEEE 29148:2018 & Reglamentación RAC 100 de la Aeronáutica Civil*

---

## 🧭 Índice de Contenidos

1. [Visión General de la Documentación](#1-visión-general-de-la-documentación)
2. [Estructura de Directorios](#2-estructura-de-directorios)
3. [Arquitectura del Sistema & Modelo C4](#3-arquitectura-del-sistema--modelo-c4)
4. [Especificación de Requisitos de Software (SRS)](#4-especificación-de-requisitos-de-software-srs)
5. [Diagramas de Casos de Uso](#5-diagramas-de-casos-de-uso)
6. [Diagramas de Actividades y Flujo Operacional](#6-diagramas-de-actividades-y-flujo-operacional)
7. [Diagramas de Secuencia](#7-diagramas-de-secuencia)
8. [Sistema de Diseño & Identidad Visual](#8-sistema-de-diseño--identidad-visual)

---

## 1. Visión General de la Documentación

Esta carpeta centraliza todos los artefactos de ingeniería de software, arquitectura de sistemas y modelado UML producidos para el **Sistema de Gestión de Dispositivos Autónomos** del campus PUJ Cali. Los artefactos han sido elaborados y validados conforme al estándar internacional de ingeniería de requisitos **ISO/IEC/IEEE 29148:2018**.

---

## 2. Estructura de Directorios

```text
docs/
├── architecture/                     # Arquitectura de software y modelos estructurales
│   ├── C4-Robots-Drones.drawio       # Modelo C4 (Contexto, Contenedores, Componentes)
│   ├── Diagrama-Clases.drawio        # Diagrama de clases de dominio en draw.io
│   ├── Diagrama-Contexto-Drones-Robots.png # Diagrama visual de contexto operacional
│   └── DESIGN.md                     # Especificación completa del Design System (Google Stitch)
│
├── requirements/                     # Requisitos de software y validación con usuarios
│   ├── SRS - Sistema de Gestión de Dispositivos Campus PUJ.pdf # SRS oficial ISO/IEC/IEEE 29148
│   ├── Cuestionario.pdf              # Instrumento de levantamiento y entrevistas con stakeholders
│   └── matriz-requisitos.png         # Matriz de trazabilidad y cobertura de requisitos
│
└── diagrams/                         # Diagramas de comportamiento e interacción UML
    ├── use-cases/                    # Casos de uso y especificaciones formales
    │   ├── Diagrama-Casos-de-Uso-Campus-PUJ.png
    │   ├── Diagrama Casos de Usos Campus PUJ.pdf
    │   ├── Especificacion_CU-01_Iniciar_Sesion.pdf
    │   └── Especificacion_CU-14_Asignar_Despachar_Mision.pdf
    │
    ├── activities/                   # Flujos de procesos y contingencias
    │   ├── Diagrama-Actividades-Principal.png
    │   ├── Diagrama-Actividades-Contingencia-Bateria.png
    │   ├── Diagrama-de-actividades-principal.pdf
    │   └── Diagrama-de-actividades-Contingencia-de-Batería.pdf
    │
    └── sequence/                     # Interacción temporal entre subsistemas
        ├── Diagrama-Secuencia-CU-01.png # Autenticación y Control de Acceso
        ├── Diagrama-Secuencia-CU-08.png # Solicitud y Registro de Reservas
        ├── Diagrama-Secuencia-CU-14.png # Asignación y Despacho Automatizado
        ├── Diagrama-Secuencia-CU-21.png # Telemetría y Rastreo en Tiempo Real
        ├── Diagrama-Secuencia-CU-23.png # Protocolo de Emergencia e Incidentes
        └── (Archivos draw.io y PDF correspondientes)
```

---

## 3. Arquitectura del Sistema & Modelo C4

Los modelos arquitecturales definen las fronteras del sistema, sus contenedores de ejecución y los componentes internos:

- **Nivel 1: Contexto del Sistema**:
  - `docs/architecture/Diagrama-Contexto-Drones-Robots.png`: Delimita las interacciones entre Operadores de Misión, Personal de Seguridad, Destinatarios de Paquetes, y los sistemas externos (SIU Javeriano, API Meteorológica y Servicios en la Nube Supabase).
- **Nivel 2 y 3: Contenedores y Componentes (C4)**:
  - `docs/architecture/C4-Robots-Drones.drawio`: Modela la Consola Web React/Vite, el Motor de Telemetría reactiva, la Base de Datos PostgreSQL, el Bucket S3 de Video Stream y el simulador de hardware UGV/UAV.
- **Diagrama de Clases de Dominio**:
  - `docs/architecture/Diagrama-Clases.drawio`: Estructura orientada a objetos que rige las entidades `Device` (herencia `UGV` y `UAV`), `Reservation`, `Mission`, `TelemetryPacket`, `AuditEntry` y `HandoverOTP`.

---

## 4. Especificación de Requisitos de Software (SRS)

El documento principal de requisitos se encuentra en:
📄 **[SRS - Sistema de Gestión de Dispositivos Campus PUJ.pdf](requirements/SRS%20-%20Sistema%20de%20Gesti%C3%B3n%20de%20Dispositivos%20Campus%20PUJ.pdf)**

### Resumen de Requisitos Clave:
- **RF-01 a RF-03**: Autenticación RBAC con expiración de 15 min y bloqueo preventivo de 5 intentos fallidos en 10 min.
- **RF-04 a RF-07**: Inventario de flota segregada (Drones $\le 2.0\text{ kg}$ vs. Robots $\le 10.0\text{ kg}$).
- **RF-08 a RF-11**: Reservas institucionales federadas con puntos de encuentro georreferenciados del Campus PUJ.
- **RF-14 a RF-17**: Asignación automática con validación climática RAC 100 (viento $\le 25\text{ km/h}$, lluvia, falla segura) y factibilidad de reserva de batería ($\ge 20\%$).
- **RF-22 a RF-25**: Handover seguro mediante OTP de 6 dígitos con HMAC-SHA256 y QR transmitido por canales SMS/Email.
- **RF-26 a RF-27**: Streaming de video en tiempo real e indexación en Supabase Storage (retención de 30 días).
- **RF-28 a RF-29**: Bitácora de auditoría inmutable exportable a formatos CSV/JSON.
- **RF-30 a RF-34**: Protocolo de emergencia, detección de desviación ($> 10\text{ m}$), parada remota y retorno a base (RTH).

---

## 5. Diagramas de Casos de Uso

| Caso de Uso | Título | Especificación | Diagrama Visual |
| :--- | :--- | :--- | :--- |
| **CU-01** | Iniciar Sesión en el Sistema | [PDF](diagrams/use-cases/Especificacion_CU-01_Iniciar_Sesion.pdf) | [Ver Diagrama](diagrams/use-cases/Diagrama-Casos-de-Uso-Campus-PUJ.png) |
| **CU-14** | Asignar y Despachar Misión | [PDF](diagrams/use-cases/Especificacion_CU-14_Asignar_Despachar_Mision.pdf) | [Ver Diagrama](diagrams/use-cases/Diagrama-Casos-de-Uso-Campus-PUJ.png) |

---

## 6. Diagramas de Actividades y Flujo Operacional

- **Flujo Operacional Principal**:
  - `docs/diagrams/activities/Diagrama-Actividades-Principal.png`: Ruta crítica desde la recepción de la solicitud SIU, verificación meteorológica, pre-vuelo, despacho, trayecto guiado y entrega física.
- **Protocolo de Contingencia de Batería**:
  - `docs/diagrams/activities/Diagrama-Actividades-Contingencia-Bateria.png`: Algoritmo de evaluación en vuelo cuando la batería desciende al $20\%$. Si la reserva proyectada es $\ge 10\%$, continúa en modo degradado; si es $< 10\%$, se activa el retorno forzoso a base (RTH).

---

## 7. Diagramas de Secuencia

Los diagramas de secuencia ilustran la sincronización de mensajes entre la UI, los controladores de estado, la API meteorológica, el servicio criptográfico y la capa de base de datos:

1. **CU-01**: Autenticación, control de fuerza bruta y emisión de sesión (`Diagrama-Secuencia-CU-01.png`)
2. **CU-08**: Creación y validación federada de reservas de transporte (`Diagrama-Secuencia-CU-08.png`)
3. **CU-14**: Orquestación de despacho, validación de viento/lluvia y generación de OTP (`Diagrama-Secuencia-CU-14.png`)
4. **CU-21**: Ciclo de telemetría a 5 Hz / 5s, streaming de coordenadas y mapa Leaflet (`Diagrama-Secuencia-CU-21.png`)
5. **CU-23**: Gestión de alertas críticas, parada de emergencia y mitigación (`Diagrama-Secuencia-CU-23.png`)

---

## 8. Sistema de Diseño & Identidad Visual

Para conocer las pautas de UI/UX, paleta de colores institucional (`#002855`, `#FFB81C`), tipografías (*Plus Jakarta Sans* y *JetBrains Mono*), y componentes vectoriales sin emojis, consulta la especificación:
📘 **[DESIGN.md](architecture/DESIGN.md)**.

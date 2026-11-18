# Google Stitch Design System — GCS & FMS Campus PUJ

> **Sistema de Gestión de Dispositivos Autónomos (UGV / UAV)**  
> **Pontificia Universidad Javeriana Cali · Centro de Control Operativo de Campus**  
> *Especificación de Identidad Visual, Tokens de Diseño y Componentes (ISO/IEC/IEEE 29148:2018 & RAC 100)*

---

## 1. Filosofía de Diseño: "High-Craft Mission Deck"

El rediseño del sistema transiciona de un prototipo genérico con aspecto de plantilla a una **consola de operaciones de nivel institucional**. Se elimina todo uso de emojis informales, fuentes estándar desarticuladas y cajas repetitivas de baja jerarquía.

### Principios Rectores:
1. **Intencionalidad y Rigor Técnico**: Cada pixel, borde y micro-espaciado responde a la ergonomía de operadores en tiempo real (despacho, vigilancia y supervisión de flota).
2. **Identidad Institucional Javeriana**: Colores insignia (Azul Javeriano `#002855` y Oro Noble `#FFB81C`) equilibrados con una paleta neutra de alta precisión visual (`Slate 50-950`).
3. **Cero Emojis — Iconografía Vectorial Minimalista**: Todos los iconos provienen de un sistema vectorial unificado (1.75px stroke, terminaciones redondeadas, geometría limpia).
4. **Claridad Telemetría vs. Interfaz Operativa**: Diferenciación estricta entre texto narrativo (interfaz humana en *Plus Jakarta Sans*) y datos de telemetría/códigos criptográficos (lecturas técnicas en *JetBrains Mono*).

---

## 2. Paleta de Color y Tokens Semánticos

### 2.1 Colores Principales (Brand Identity)
| Token | Hex | Uso Principal |
| :--- | :--- | :--- |
| `--puj-blue-900` | `#001A38` | Fondos de alto contraste, acentos oscuros de marca |
| `--puj-blue-800` | `#002855` | **Azul Institucional Javeriana** (Botones principales, cabecera de acento, marcos de acción) |
| `--puj-blue-600` | `#0056B3` | Enlaces interactivos, estados hover y focalizaciones |
| `--puj-gold-500` | `#FFB81C` | **Dorado Javeriano** (Acentos en el blasón PUJ, indicadores de advertencia noble) |
| `--puj-amber-600`| `#D97706` | Indicadores de drones en vuelo y estados de alerta preventiva |

### 2.2 Neutros y Superficies (Google Stitch Tone Scale)
| Token | Hex | Aplicación |
| :--- | :--- | :--- |
| `--surface-canvas` | `#F8FAFC` | Fondo general de la aplicación (`slate-50`) |
| `--surface-card` | `#FFFFFF` | Tarjetas elevadas, modales y barras de herramientas |
| `--surface-muted` | `#F1F5F9` | Fondos secundarios, contenedores de telemetría inactiva (`slate-100`) |
| `--border-subtle` | `#E2E8F0` | Límites estructurados y divisores de tablas (`slate-200`) |
| `--border-strong` | `#CBD5E1` | Bordes activos y estados de hover de inputs (`slate-300`) |
| `--text-primary` | `#0F172A` | Títulos, lecturas numéricas y datos de alto valor (`slate-900`) |
| `--text-secondary`| `#475569` | Descripciones, etiquetas de contexto (`slate-600`) |
| `--text-tertiary` | `#94A3B8` | Metadatos, marcas de tiempo y etiquetas de pie (`slate-400`) |

### 2.3 Estados Operativos (Functional Signals)
- **Disponible / Apto**: Esmeralda (`#059669` / fondo `#ECFDF5` / borde `#A7F3D0`)
- **En Ruta / Despachado**: Índigo/Azul Operativo (`#2563EB` / fondo `#EFF6FF` / borde `#BFDBFE`)
- **En Carga / Reserva**: Azul Hangar (`#0284C7` / fondo `#F0F9FF` / borde `#BAE6FD`)
- **Alerta / Incidente**: Carmesí táctico (`#DC2626` / fondo `#FEF2F2` / borde `#FECACA`)

---

## 3. Tipografía & Jerarquía Escalar

El sistema utiliza dos tipografías complementarias:
1. **Plus Jakarta Sans**: Títulos, botones, descripciones y microcopy de interacción.
2. **JetBrains Mono**: Telemetría, coordenadas GPS, ID de dispositivos, códigos de misión y tokens OTP.

```
+------------------------------------------------------------------------+
| H1 (20px, 700, -0.02em)   Consola Central GCS & FMS                   |
| Subtitle (12px, 500)      Pontificia Universidad Javeriana Cali        |
| Overline (10px, 700, +0.05em, UPPERCASE)   SUPERVISIÓN DE FLOTA       |
| Mono Metric (24px, 700, Mono)              14 / 20 máx                 |
| Mono Telemetry (11px, 500, Mono)           3.342150°N -76.530200°W     |
+------------------------------------------------------------------------+
```

---

## 4. Iconografía & Logos Minimalistas

Quedan **estrictamente prohibidos los emojis** (🛸, 🤖, ⚡, 📍, 🎯, 🚀, ✔, ✕, 🔒, ⏱️). Se implementa la suite `MinimalLogos`:

1. **`PujAeroEmblem`**: Blasón heráldico estilizado con vector de trayectoria de vuelo delta y orilla de alta costura.
2. **`DroneMinimalIcon`**: Silueta técnica de cuadricóptero vista cenital con rotores en arco fino y núcleo motor.
3. **`RoverMinimalIcon`**: Silueta técnica de rover terrestre con torre LiDAR, chasis bajo y tracción 4x4.
4. **`StationMinimalIcon`**: Estación de acople con bobina de recarga inductiva y polo central.
5. **`WaypointMinimalIcon`**: Punto de encuentro y entrega con ancla de precisión milimétrica.
6. **`LivePulseDot`**: Indicador LED de latido con efecto radar pulsante para telemetría activa.

---

## 5. Elevación, Sombras y Tratamiento de Bordes

En lugar de sombras pesadas o bordes planos repetitivos, se emplea un sistema de capas sutiles:
- **Card Base**: `bg-white border border-slate-200/90 shadow-[0_1px_3px_0_rgba(15,23,42,0.03),0_4px_12px_-2px_rgba(15,23,42,0.02)] rounded-2xl`
- **Card Interactive Hover**: `hover:border-slate-300 hover:shadow-[0_4px_16px_-4px_rgba(15,23,42,0.08)] transition-all duration-200`
- **HUD / Telemetry Overlay**: `bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-md`
- **Modal Backdrops**: `bg-slate-900/40 backdrop-blur-sm`

---

## 6. Marcadores Geográficos Leaflet

Los marcadores del mapa del campus PUJ Cali no utilizan texto plano ni emojis:
- **Dron (UAV)**: Pin circular blanco con borde ámbar industrial `#D97706`, glifo vectorial de cuadricóptero, badge inferior monospace con el código de cola (`DRON-01`), y anillo de pulso radar concéntrico durante el desplazamiento.
- **Robot (UGV)**: Pin circular blanco con borde azul PUJ `#002855`, glifo vectorial de rover terrestre, badge monospace (`ROV-01`).
- **Puntos de Encuentro**: Anclajes circulares esmeralda/cielo con icono minimalista de estación o baliza de destino.

---

## 7. Cumplimiento de Especificaciones
- **SRS ISO/IEC/IEEE 29148:2018**: 16/16 subrequisitos auditables desde la barra de estado.
- **Aeronáutica Civil RAC 100**: Umbral de viento 25 km/h, bloqueo VMC fail-secure y zonas seguras de aterrizaje en campus.

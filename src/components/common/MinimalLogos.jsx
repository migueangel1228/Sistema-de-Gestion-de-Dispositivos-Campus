import React from 'react'

/**
 * Minimalist Brand & Fleet Vector System (Google Stitch Design System)
 * Replaces informal emojis and stock icons with crafted, geometric vector marks.
 */

// 1. PUJ Aero Emblem - High-end Institutional Shield & Flight Vector
export function PujAeroEmblem({ className = "w-8 h-8", variant = "default" }) {
  const isInverse = variant === "inverse"
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo PUJ Cali GCS & FMS"
    >
      {/* Outer Geometric Shield */}
      <path
        d="M20 3L6 8.5V19.2C6 28.1 12 35.8 20 38C28 35.8 34 28.1 34 19.2V8.5L20 3Z"
        fill={isInverse ? "rgba(255, 255, 255, 0.12)" : "#002855"}
        stroke={isInverse ? "#ffffff" : "#FFB81C"}
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      {/* Flight Delta Chevron / Guidance Vector */}
      <path
        d="M20 10L27 24L20 21L13 24L20 10Z"
        fill={isInverse ? "#ffffff" : "#FFB81C"}
        stroke={isInverse ? "#002855" : "#001A38"}
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      {/* Navigation Horizon & Waypoint Center */}
      <circle cx="20" cy="27" r="1.75" fill={isInverse ? "#FFB81C" : "#ffffff"} />
      <path
        d="M16 27H24"
        stroke={isInverse ? "#FFB81C" : "#ffffff"}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

// 2. DroneMinimalIcon - Geometric Minimalist UAV (Quadcopter)
export function DroneMinimalIcon({ className = "w-5 h-5", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Dispositivo UAV Dron Aéreo"
    >
      {/* Center Core Body */}
      <rect x="9.5" y="9.5" width="5" height="5" rx="1.5" fill="currentColor" fillOpacity="0.15" />
      {/* Rotor Arms (Diagonal X layout) */}
      <path d="M10 10L6.5 6.5" />
      <path d="M14 10L17.5 6.5" />
      <path d="M10 14L6.5 17.5" />
      <path d="M14 14L17.5 17.5" />
      {/* Rotors */}
      <circle cx="5" cy="5" r="2.5" strokeDasharray="1.5 1.5" />
      <circle cx="19" cy="5" r="2.5" strokeDasharray="1.5 1.5" />
      <circle cx="5" cy="19" r="2.5" strokeDasharray="1.5 1.5" />
      <circle cx="19" cy="19" r="2.5" strokeDasharray="1.5 1.5" />
      {/* Front Indicator Nose */}
      <path d="M12 7.5V9.5" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// 3. RoverMinimalIcon - Geometric Minimalist UGV (Ground Robot)
export function RoverMinimalIcon({ className = "w-5 h-5", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Dispositivo UGV Robot Terrestre"
    >
      {/* Chassis Body */}
      <rect x="5" y="8" width="14" height="8" rx="2" fill="currentColor" fillOpacity="0.15" />
      {/* 4 Heavy-duty Wheels */}
      <rect x="3" y="6" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="18" y="6" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="3" y="14" width="3" height="4" rx="1" fill="currentColor" />
      <rect x="18" y="14" width="3" height="4" rx="1" fill="currentColor" />
      {/* Sensor Mast / LiDAR Dome */}
      <path d="M12 8V5" strokeWidth="1.5" />
      <circle cx="12" cy="4" r="1.5" fill="currentColor" />
      {/* Cargo bay split line */}
      <path d="M10 10H14" strokeWidth="1.2" />
    </svg>
  )
}

// 4. StationMinimalIcon - Minimalist Fast-Charging Dock
export function StationMinimalIcon({ className = "w-4 h-4", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Estación de Carga Central"
    >
      <rect x="4" y="3" width="16" height="18" rx="3" fill="currentColor" fillOpacity="0.1" />
      <path d="M13 7L9 13H14L11 18" strokeWidth="2" strokeLinejoin="round" />
      <circle cx="12" cy="2" r="0.75" fill="currentColor" />
    </svg>
  )
}

// 5. WaypointMinimalIcon - Campus Meeting Point Node
export function WaypointMinimalIcon({ className = "w-4 h-4", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label="Punto de Encuentro Campus"
    >
      <circle cx="12" cy="10" r="3" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 2C7.58 2 4 5.58 4 10C4 15.25 12 22 12 22C12 22 20 15.25 20 10C20 5.58 16.42 2 12 2Z" />
      <circle cx="12" cy="10" r="1.5" fill="currentColor" />
    </svg>
  )
}

// 6. LivePulseDot - Sleek Telemetry Status Dot
export function LivePulseDot({ status = "active", size = "sm" }) {
  const sizeClasses = size === "xs" ? "w-2 h-2" : size === "lg" ? "w-3 h-3" : "w-2.5 h-2.5"
  const pingSizes = size === "xs" ? "w-2 h-2" : size === "lg" ? "w-3 h-3" : "w-2.5 h-2.5"

  let bg = "bg-emerald-500"
  let ping = "bg-emerald-400"

  if (status === "warning" || status === "transit") {
    bg = "bg-amber-500"
    ping = "bg-amber-400"
  } else if (status === "danger" || status === "alert") {
    bg = "bg-rose-500"
    ping = "bg-rose-400"
  } else if (status === "neutral" || status === "idle") {
    bg = "bg-slate-400"
    ping = "bg-slate-300"
  } else if (status === "charging") {
    bg = "bg-blue-500"
    ping = "bg-blue-400"
  }

  return (
    <span className="relative flex items-center justify-center shrink-0">
      <span className={`animate-ping absolute inline-flex ${pingSizes} rounded-full ${ping} opacity-75`} />
      <span className={`relative inline-flex rounded-full ${sizeClasses} ${bg}`} />
    </span>
  )
}

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { INITIAL_PROFILES } from '../services/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Inicializar usuario desde sessionStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('puj_current_user')
    return saved ? JSON.parse(saved) : null
  })

  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('puj_profiles')
    return saved ? JSON.parse(saved) : INITIAL_PROFILES
  })

  const [failedAttempts, setFailedAttempts] = useState(() => {
    const saved = localStorage.getItem('puj_failed_attempts')
    return saved ? JSON.parse(saved) : {}
  })

  const [inactivityTimer, setInactivityTimer] = useState(900) // 15 minutos en segundos (RNF-01)
  const timerRef = useRef(null)

  // Sincronizar usuarios a localStorage
  useEffect(() => {
    localStorage.setItem('puj_profiles', JSON.stringify(profiles))
  }, [profiles])

  // Temporizador de inactividad de 15 minutos (RNF-01)
  useEffect(() => {
    if (!currentUser) return

    const resetInactivity = () => {
      setInactivityTimer(900)
    }

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart']
    activityEvents.forEach(evt => window.addEventListener(evt, resetInactivity))

    timerRef.current = setInterval(() => {
      setInactivityTimer(prev => {
        if (prev <= 1) {
          logout('Sesión cerrada automáticamente tras 15 minutos de inactividad (RNF-01).')
          return 900
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, resetInactivity))
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentUser])

  // Autenticación con verificación de bloqueo de 5 intentos y bcrypt sim (RF-01, RNF-02, RNF-16)
  const login = (email, password) => {
    const profile = profiles.find(p => p.email.toLowerCase() === email.toLowerCase())
    const now = Date.now()
    const attemptRecord = failedAttempts[email] || { count: 0, firstFailedAt: 0, lockedUntil: 0 }

    // Verificar si la cuenta está bloqueada temporalmente (15 min tras 5 intentos en 10 min)
    if (attemptRecord.lockedUntil && now < attemptRecord.lockedUntil) {
      const remainingMinutes = Math.ceil((attemptRecord.lockedUntil - now) / 60000)
      return {
        success: false,
        error: `Cuenta bloqueada temporalmente por seguridad. Intenta nuevamente en ${remainingMinutes} minuto(s) (RNF-02).`
      }
    }

    if (!profile || profile.status === 'Inactiva') {
      return recordFailedAttempt(email, 'Credenciales inválidas')
    }

    // Contraseña estándar demo para cada rol o la clave por defecto 'puj2026'
    const isValidPassword = password === 'puj2026' || password === 'admin123' || password === 'demo'
    if (!isValidPassword) {
      return recordFailedAttempt(email, 'Credenciales inválidas')
    }

    // Éxito: Limpiar intentos fallidos
    const updatedAttempts = { ...failedAttempts }
    delete updatedAttempts[email]
    setFailedAttempts(updatedAttempts)
    localStorage.setItem('puj_failed_attempts', JSON.stringify(updatedAttempts))

    const userSession = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      token: 'jwt-puj-' + Math.random().toString(36).substring(2),
      loginTime: new Date().toISOString()
    }

    setCurrentUser(userSession)
    sessionStorage.setItem('puj_current_user', JSON.stringify(userSession))
    setInactivityTimer(900)

    return { success: true, user: userSession }
  }

  // Atajo rápido para demo (cambio de rol sin fricción)
  const quickLoginAs = (role) => {
    const profile = profiles.find(p => p.role === role) || profiles[0]
    const userSession = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      token: 'jwt-puj-' + Math.random().toString(36).substring(2),
      loginTime: new Date().toISOString()
    }
    setCurrentUser(userSession)
    sessionStorage.setItem('puj_current_user', JSON.stringify(userSession))
    setInactivityTimer(900)
    return userSession
  }

  const recordFailedAttempt = (email, message) => {
    const now = Date.now()
    const attempt = failedAttempts[email] || { count: 0, firstFailedAt: now, lockedUntil: 0 }

    // Si pasaron más de 10 min desde el primer fallo, reiniciar ventana
    const isWithinWindow = now - attempt.firstFailedAt < 10 * 60 * 1000
    const newCount = isWithinWindow ? attempt.count + 1 : 1
    const firstFailedAt = isWithinWindow ? attempt.firstFailedAt : now
    let lockedUntil = 0

    // Bloqueo tras 5 intentos fallidos en 10 minutos (RNF-02)
    if (newCount >= 5) {
      lockedUntil = now + 15 * 60 * 1000 // 15 minutos de bloqueo
    }

    const updated = {
      ...failedAttempts,
      [email]: { count: newCount, firstFailedAt, lockedUntil }
    }
    setFailedAttempts(updated)
    localStorage.setItem('puj_failed_attempts', JSON.stringify(updated))

    if (lockedUntil > 0) {
      return {
        success: false,
        error: 'Has superado el límite de 5 intentos fallidos. Tu cuenta ha sido bloqueada por 15 minutos (RNF-02).'
      }
    }

    return {
      success: false,
      error: `${message}. Intentos fallidos: ${newCount}/5 (RNF-02).`
    }
  }

  const logout = (reason) => {
    setCurrentUser(null)
    sessionStorage.removeItem('puj_current_user')
    if (reason) {
      alert(reason)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        quickLoginAs,
        logout,
        inactivityTimer,
        profiles,
        setProfiles
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe ser utilizado dentro de AuthProvider')
  return context
}

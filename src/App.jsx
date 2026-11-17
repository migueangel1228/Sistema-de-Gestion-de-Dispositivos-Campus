import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import LiveMonitor from './pages/LiveMonitor'
import Inventory from './pages/Inventory'
import Reservations from './pages/Reservations'
import AuditLogs from './pages/AuditLogs'
import Maintenance from './pages/Maintenance'
import Login from './pages/Login'
import HandoverModal from './components/HandoverModal'
import VideoPlayerModal from './components/VideoPlayerModal'

function MainLayout() {
  const { currentUser } = useAuth()
  const { activeHandoverModal, setActiveHandoverModal } = useApp()
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [activeVideoModal, setActiveVideoModal] = useState(null)

  // Si no hay sesión autenticada, mostrar pantalla de Login (RF-01)
  if (!currentUser) {
    return <Login />
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar onNavigate={setCurrentTab} />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Tab Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {currentTab === 'dashboard' && <Dashboard onNavigate={setCurrentTab} />}
          {currentTab === 'monitor' && (
            <LiveMonitor
              onOpenHandover={(m) => setActiveHandoverModal(m)}
              onOpenVideo={(m) => setActiveVideoModal(m)}
            />
          )}
          {currentTab === 'inventory' && <Inventory />}
          {currentTab === 'reservations' && (
            <Reservations
              onNavigate={setCurrentTab}
              onOpenHandover={(m) => setActiveHandoverModal(m)}
            />
          )}
          {currentTab === 'audit' && <AuditLogs />}
          {currentTab === 'maintenance' && <Maintenance />}
        </main>
      </div>

      {/* Handover OTP Modal (RF-22 / RF-23) */}
      {activeHandoverModal && (
        <HandoverModal
          mission={activeHandoverModal}
          onClose={() => setActiveHandoverModal(null)}
        />
      )}

      {/* Video Streaming Player Modal (RF-27.2) */}
      {activeVideoModal && (
        <VideoPlayerModal
          mission={activeVideoModal}
          onClose={() => setActiveVideoModal(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  )
}

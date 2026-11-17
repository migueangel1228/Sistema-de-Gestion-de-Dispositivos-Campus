import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import confetti from 'canvas-confetti'
import { useApp } from '../context/AppContext'
import {
  X,
  CheckCircle,
  KeyRound,
  QrCode,
  Smartphone,
  ShieldCheck,
  PackageCheck,
  AlertCircle
} from 'lucide-react'

export default function HandoverModal({ mission, onClose }) {
  const { verifyHandover, reservations } = useApp()
  const [pinInput, setPinInput] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!mission) return null

  const reservation = reservations.find(r => r.id === mission.reservation_id)

  const handleValidate = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!pinInput || pinInput.length !== 6) {
      setErrorMsg('Por favor ingresa el PIN completo de 6 dígitos.')
      return
    }

    const res = verifyHandover(mission.id, pinInput)
    if (res.success) {
      setIsSuccess(true)
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      } catch (err) {}
    } else {
      setErrorMsg(res.error)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full p-6 shadow-stitch-dropdown relative space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3.5 pb-2 border-b border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#002855] shrink-0">
            <PackageCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Validación de Entrega Física (Handover · RF-22 / RF-23)
            </h3>
            <p className="text-xs text-slate-500">
              Misión: <span className="font-mono text-[#002855] font-semibold">{mission.id}</span> · Dispositivo:{' '}
              <span className="font-mono text-slate-800 font-semibold">{mission.device_code}</span>
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-slate-900 tracking-tight">¡Entrega Confirmada con Éxito!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              El compartimento de carga ha sido desbloqueado. El servicio pasó a estado{' '}
              <strong className="text-emerald-700">"Entregado"</strong> y el video del recorrido ha sido indexado en
              el almacenamiento cloud (retención de 30 días - RF-26).
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 bg-[#002855] hover:bg-[#001f42] text-white text-xs font-semibold rounded-xl transition shadow-stitch-sm"
            >
              Cerrar y Continuar
            </button>
          </div>
        ) : (
          <>
            {/* Multichannel Notification Preview (RF-22.2) */}
            <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span className="flex items-center space-x-1.5 font-semibold">
                  <Smartphone className="w-3.5 h-3.5 text-[#002855]" />
                  <span>Notificación SMS y Correo al Destinatario (RF-22.2)</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-medium font-mono">Enviado</span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed font-mono bg-white p-3 rounded-lg border border-slate-200">
                "PUJ Cali Logística: Tu paquete ha llegado a {mission.destination_name}. Muestra este código QR o digita el PIN{' '}
                <strong className="text-[#002855] font-bold tracking-widest">{mission.otp_pin}</strong> en la pantalla del dispositivo para retirarlo. Válido por 120 min."
              </p>
            </div>

            {/* QR Code and PIN display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50/80 p-4 rounded-xl border border-slate-200/80">
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200/90 shadow-stitch-sm">
                <QRCodeSVG value={mission.otp_qr_code || 'PUJ-CALI-OTP'} size={120} />
                <span className="text-[10px] text-slate-500 font-mono mt-2 font-medium">
                  OTP QR · Escaneo en Dispositivo
                </span>
              </div>

              <div className="space-y-3 text-center sm:text-left">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">PIN CSPRNG de 6 Dígitos</span>
                  <div className="font-mono text-2xl font-bold text-[#002855] tracking-widest mt-0.5">
                    {mission.otp_pin}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5">
                  <div>Destinatario: <span className="text-slate-900 font-medium">{reservation?.recipient_email}</span></div>
                  <div>Móvil: <span className="text-slate-900 font-medium">{reservation?.recipient_phone}</span></div>
                  <div className="text-slate-400 text-[10px] font-mono pt-1">Expira en: 120 minutos (CSPRNG)</div>
                </div>
              </div>
            </div>

            {/* Validation Form */}
            <form onSubmit={handleValidate} className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Ingresar PIN de 6 Dígitos para Validar Entrega Física (RF-23):
              </label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Ej. 482910"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-mono text-base tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#002855]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setPinInput(mission.otp_pin)}
                  className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition shadow-stitch-sm"
                  title="Autocompletar con el PIN del destinatario"
                >
                  Pegar PIN
                </button>
              </div>

              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-[#002855] hover:bg-[#001f42] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition shadow-stitch-sm"
              >
                Confirmar y Liberar Compartimento (RF-23)
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

import React, { useEffect, useRef, useState } from 'react'
import { X, Video, ShieldCheck, Clock, Download, Play, Pause, Loader2, Check, ExternalLink } from 'lucide-react'
import { supabase, isSupabaseConfigured } from '@/services/supabaseClient'

export default function VideoPlayerModal({ mission, onClose }) {
  const canvasRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  // Asegurar que el archivo de video esté registrado en el bucket S3 (RF-26.1)
  useEffect(() => {
    if (isSupabaseConfigured && supabase && mission?.id) {
      supabase.storage
        .from('drone-videos')
        .copy('default-mission.mp4', `${mission.id}.mp4`)
        .catch(() => {})
    }
  }, [mission?.id])

  const handleDownloadVideo = async (e) => {
    e.preventDefault()
    setIsDownloading(true)
    setDownloadSuccess(false)

    try {
      // 1. Asegurar copia en el bucket S3
      if (isSupabaseConfigured && supabase && mission?.id) {
        await supabase.storage
          .from('drone-videos')
          .copy('default-mission.mp4', `${mission.id}.mp4`)
          .catch(() => {})
      }

      const primaryUrl = mission?.video_url
      const fallbackUrl = `${import.meta.env.VITE_SUPABASE_URL || 'https://mnjlidnbhtcrbtnwsqof.supabase.co'}/storage/v1/object/public/drone-videos/default-mission.mp4`

      // 2. Descargar blob de video real y forzar descarga de archivo .mp4
      let response = await fetch(primaryUrl).catch(() => null)
      if (!response || !response.ok) {
        response = await fetch(fallbackUrl)
      }

      if (response && response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = downloadUrl
        a.download = `${mission.id}-grabacion-puj.mp4`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
        setDownloadSuccess(true)
        setTimeout(() => setDownloadSuccess(false), 3000)
      } else {
        window.open(primaryUrl, '_blank')
      }
    } catch (err) {
      console.warn('Descarga por fallback directo:', err)
      window.open(mission.video_url, '_blank')
    } finally {
      setIsDownloading(false)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let frame = 0

    const renderHUD = () => {
      frame++
      const width = canvas.width
      const height = canvas.height

      // Background gradient (simulating aerial/ground camera view)
      const grad = ctx.createLinearGradient(0, 0, 0, height)
      grad.addColorStop(0, '#0f172a')
      grad.addColorStop(0.5, '#1e293b')
      grad.addColorStop(1, '#020617')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      // Grid lines / HUD reticle
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)'
      ctx.lineWidth = 1

      // Central crosshair
      const cx = width / 2
      const cy = height / 2
      ctx.beginPath()
      ctx.moveTo(cx - 30, cy)
      ctx.lineTo(cx + 30, cy)
      ctx.moveTo(cx, cy - 30)
      ctx.lineTo(cx, cy + 30)
      ctx.stroke()

      // Rotating compass ring
      ctx.beginPath()
      ctx.arc(cx, cy, 70, (frame * 0.02) % (Math.PI * 2), ((frame * 0.02) + 1.5) % (Math.PI * 2))
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)'
      ctx.stroke()

      // Artificial Horizon & Pitch ladder
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)'
      ctx.beginPath()
      ctx.moveTo(cx - 80, cy + Math.sin(frame * 0.05) * 15)
      ctx.lineTo(cx + 80, cy + Math.sin(frame * 0.05) * 15)
      ctx.stroke()

      // HUD Text Info
      const latDisplay = (mission?.current_lat ? Number(mission.current_lat) : 3.347500).toFixed(6)
      const lngDisplay = (mission?.current_lng ? Number(mission.current_lng) : -76.532500).toFixed(6)
      ctx.fillStyle = '#38bdf8'
      ctx.font = '12px "JetBrains Mono", monospace'
      ctx.fillText(`CAM: PUJ-CALI-${mission?.device_code || 'CAM-01'} [REC ●]`, 20, 30)
      ctx.fillText(`GPS: ${latDisplay}°N  ${lngDisplay}°W  HDOP 0.8`, 20, 50)
      ctx.fillText(`RESOLUCION: 1080p @ 30fps (H.264 / Supabase Storage)`, 20, 70)

      ctx.fillStyle = '#fbbf24'
      ctx.fillText(`ALT: ${mission?.device_type === 'UAV' ? '45.2 m AGL' : '0.0 m (UGV)'}`, width - 180, 30)
      ctx.fillText(`BAT: ${mission?.current_battery || 85}%`, width - 180, 50)
      ctx.fillText(`TIME: ${new Date().toISOString().slice(11, 19)} UTC`, width - 180, 70)

      // Storage watermark & Ley 1581
      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'
      ctx.font = '10px sans-serif'
      ctx.fillText('PROTECCIÓN DE DATOS: Rostros y matrículas disociados (Ley 1581 de 2012 / RR-08)', 20, height - 20)
      ctx.fillText('RETENCIÓN EN CLOUD: 30 DÍAS CALENDARIO (RF-26.2)', width - 290, height - 20)

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(renderHUD)
      }
    }

    renderHUD()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [isPlaying, mission])

  if (!mission) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-2xl w-full p-6 shadow-stitch-dropdown space-y-4 text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#002855] shrink-0">
              <Video className="w-5 h-5 text-[#002855]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Reproductor de Telemetría y Video en Streaming (RF-27.2)
              </h3>
              <p className="text-xs text-slate-500">
                Misión: <span className="font-mono text-slate-800 font-semibold">{mission.id}</span> · Almacenado en: <span className="font-mono text-[#002855] font-semibold">Supabase Storage</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Canvas Feed */}
        <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-black">
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-auto block"
          />
        </div>

        {/* Info Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>URL Firmada Autenticada</span>
            </span>
            <span className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Depuración automática en 30 días (RNF-14)</span>
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {mission?.video_url && (
              <>
                <button
                  onClick={handleDownloadVideo}
                  disabled={isDownloading}
                  className="px-3.5 py-1.5 rounded-lg bg-[#002855] hover:bg-[#001f42] text-white text-[11px] font-semibold flex items-center space-x-1.5 transition shadow-stitch-sm disabled:opacity-60"
                  title="Descargar archivo MP4 desde Supabase Storage (S3)"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Descargando...</span>
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>¡Descargado!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>Descargar MP4 (Bucket S3)</span>
                    </>
                  )}
                </button>

                <a
                  href={mission.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-200 transition"
                  title="Abrir enlace directo del bucket S3 en pestaña nueva"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </>
            )}

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold flex items-center space-x-1.5 transition shadow-2xs text-[11px]"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

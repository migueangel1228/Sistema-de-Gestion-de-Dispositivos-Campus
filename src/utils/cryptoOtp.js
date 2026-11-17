// Generador criptográficamente seguro de PIN (6 dígitos) y Token QR (RF-22.1, RNF-08)
// Utiliza CSPRNG estándar (window.crypto.getRandomValues)

export function generateCSPRNGPin() {
  // Generar 6 dígitos usando CSPRNG
  const array = new Uint32Array(1)
  window.crypto.getRandomValues(array)
  // Mapear a rango de 6 dígitos: 100000 - 999999
  const pin = 100000 + (array[0] % 900000)
  return pin.toString()
}

export function generateCSPRNGToken(length = 24) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const array = new Uint8Array(length)
  window.crypto.getRandomValues(array)
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length]
  }
  return result
}

export function createHandoverOtp(missionId, reservationId) {
  const pin = generateCSPRNGPin()
  const token = generateCSPRNGToken(24)
  const qrPayload = JSON.stringify({
    mission_id: missionId,
    res_id: reservationId,
    otp_token: token,
    pin: pin,
    iss: 'PUJ-CALI-GCS-FMS',
    exp: Date.now() + 120 * 60 * 1000 // 120 minutos de vigencia (RF-22.1)
  })

  return {
    pin,
    token,
    qrPayload,
    expiresAt: new Date(Date.now() + 120 * 60 * 1000).toISOString()
  }
}

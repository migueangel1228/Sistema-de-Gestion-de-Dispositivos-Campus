## 📋 Descripción del Cambio

Breve resumen de los cambios introducidos por este Pull Request y su motivación técnica.

## 🎯 Requisitos del SRS Afectados / Relacionados
- [ ] RF-01 a RF-03: Autenticación, RBAC y control de acceso
- [ ] RF-04 a RF-07: Gestión e inventario de flota (UGV / UAV)
- [ ] RF-08 a RF-11: Catálogo de puntos de encuentro y reservas SIU
- [ ] RF-14 a RF-17: Algoritmo de asignación, clima RAC 100 y despacho
- [ ] RF-20 a RF-21: Telemetría en tiempo real y visualización geográfica
- [ ] RF-22 a RF-25: Protocolo de entrega Handover con OTP (PIN/QR)
- [ ] RF-26 a RF-27: Streaming de video y almacenamiento en bucket S3
- [ ] RF-28 a RF-29: Bitácora inmutable de auditoría y reportes
- [ ] RF-30 a RF-34: Protocolos de contingencia, seguridad y mantenimiento
- [ ] No aplica (Refactorización / Documentación)

## 🧪 Pruebas Realizadas
- [ ] `npm run build` ejecutado exitosamente sin advertencias críticas.
- [ ] Verificación en navegador de los flujos de interfaz afectados.
- [ ] Pruebas con roles de usuario (`AdminPrincipal`, `AdminOperativo`, `OperadorSeguridad`).
- [ ] Verificación de modo offline / almacenamiento local y fallback.

## 📸 Capturas de Pantalla / Evidencia (Si aplica)
*(Adjunta capturas de pantalla o GIFs si hubo cambios visuales en componentes o modales)*

## 🛡️ Checklist de Calidad
- [ ] El código sigue los estándares de diseño institucionales (*Google Stitch Design System*).
- [ ] No se introdujeron emojis en la interfaz (se utilizó iconografía vectorial minimalista).
- [ ] Las rutas e importaciones utilizan alias modulares (`@/...`).

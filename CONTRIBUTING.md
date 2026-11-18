# Guía de Contribución

Agradecemos el interés en contribuir a este proyecto. Para mantener la calidad y el orden del repositorio, solicitamos seguir las siguientes directrices:

## Flujo de Trabajo
1. Crea una rama descriptiva para tu funcionalidad o corrección:
   ```bash
   git checkout -b feature/nombre-de-la-mejora
   ```
2. Realiza tus cambios asegurando que el proyecto compila sin errores:
   ```bash
   npm run build
   ```
3. Realiza commits con mensajes claros siguiendo la convención:
   - `feat:` para nuevas funcionalidades
   - `fix:` para correcciones de bugs
   - `docs:` para cambios en documentación
   - `refactor:` para reorganización de código sin cambio de comportamiento
4. Abre un Pull Request describiendo los cambios y los requisitos relacionados.

## Estilo de Código y Arquitectura
- Utiliza la estructura modular organizada en `src/components/`, `src/pages/`, `src/services/` y `src/utils/`.
- Emplea los alias `@/...` para importaciones limpias.
- Respeta la identidad visual institucional y la iconografía vectorial minimalista (sin emojis informales).

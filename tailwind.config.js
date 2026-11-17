/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        puj: {
          blue: '#002855',       // Azul Institucional Javeriana
          navy: '#001A38',       // Azul Navy Profundo
          yellow: '#FFB81C',     // Dorado/Amarillo Javeriano
          gold: '#C68A00',       // Oro sobrio
          dark: '#0A192F',       // Azul muy oscuro fondo
          card: '#112240',       // Azul navy tarjetas
          accent: '#0056B3',     // Azul acento
          light: '#F8FAFC',      // Superficie canvas limpia
          slate: '#F1F5F9',
          border: '#E2E8F0',
          success: '#059669',
          warning: '#D97706',
          danger: '#DC2626'
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      boxShadow: {
        'stitch-sm': '0 1px 2px 0 rgba(15, 23, 42, 0.04)',
        'stitch-card': '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 4px 12px -2px rgba(15, 23, 42, 0.02)',
        'stitch-hover': '0 4px 8px -1px rgba(15, 23, 42, 0.06), 0 12px 24px -4px rgba(15, 23, 42, 0.04)',
        'stitch-dropdown': '0 12px 32px -4px rgba(15, 23, 42, 0.12), 0 4px 8px -2px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}

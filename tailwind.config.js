const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  safelist: [
    {
      pattern: /(bg|text|border|ring|fill|stroke)-(blue|emerald|red|amber|gray)-(400|500|600)/,
    },
  ],
  theme: {
    extend: {
      colors: {
        // Fondo tipo Linear/Vercel: no negro puro, gris muy oscuro con superficies elevadas
        surface: {
          base: '#0b0d10',
          raised: '#14171c',
          raised2: '#1c2027',
          border: '#262b33',
        },
        // Código de color real de Ebro por vehículo/proyecto
        vehicle: {
          's400-hev': '#e5484d',      // S400 HEV - rojo
          's400-turbo': '#f5d90a',    // S400 1.5 Turbo / Plus - amarillo
          's700-phev': '#30a46c',     // S700 PHEV - verde
          'jaecoo5': '#8b949e',       // Jaecoo 5 - gris
          'omoda5': '#9a5b3c',        // Omoda 5 - marrón
          'general': '#5b6472',       // proyectos sin modelo (Body, M0 genérico, admin...)
        },
        // Prioridad (independiente del color de proyecto)
        priority: {
          alta: '#e5484d',
          media: '#f5a623',
          baja: '#5b6472',
        },
      },
      fontFamily: {
        mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
}

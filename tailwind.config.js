/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        claw: {
          bg: '#050505',       // Almost black
          panel: '#0f0f11',    // Dark grey/black panel
          primary: '#8b5cf6',  // Violet/Purple (The "Seek" color)
          accent: '#06b6d4',   // Cyan (The "Found" color)
          text: '#f8fafc',     // White/Slate-50
          dim: '#64748b',      // Slate-500
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'], // We'll need to import this font
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 4s linear infinite', // Standard spin, just slower
        'shine': 'shine 1.5s infinite',
        'glow-pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shine: {
          '100%': { left: '125%' },
        }
      }
    },
  },
  plugins: [],
}

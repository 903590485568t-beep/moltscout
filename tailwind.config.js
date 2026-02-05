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
          bg: '#0a0f1c',       // Very dark blue/black
          panel: '#151e32',    // Slightly lighter panel
          primary: '#ff3333',  // Bright lobster red
          accent: '#ff8438',   // Orange claw accent
          text: '#e2e8f0',     // Light slate text
          dim: '#94a3b8',      // Dim text
        }
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'], // We'll need to import this font
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}

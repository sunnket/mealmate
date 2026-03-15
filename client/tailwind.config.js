/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: '#0B0F14',
        'dark-2': '#111820',
        'dark-3': '#18222E',
        primary: '#22C55E',
        'primary-darker': '#16A34A',
        'primary-lighter': '#4ADE80',
        accent: '#3B82F6',
        'accent-dim': '#2563EB',
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        glass: 'rgba(255,255,255,0.04)',
        'glass-border': 'rgba(255,255,255,0.09)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.03em',
        tight: '-0.02em',
      },
      borderRadius: {
        'xl': '14px',
        '2xl': '18px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'glass': '0 1px 4px rgba(0,0,0,0.4)',
        'glass-lg': '0 4px 20px rgba(0,0,0,0.5)',
        'shadow-glass-lg': '0 8px 32px rgba(0,0,0,0.5)',
        'glow': '0 0 20px rgba(34,197,94,0.28)',
        'glow-lg': '0 0 36px rgba(34,197,94,0.32)',
        'glow-purple': '0 0 20px rgba(59,130,246,0.25)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.07)',
      },
      backdropBlur: {
        xs: '2px',
        'xl': '20px',
        '2xl': '40px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease both',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-down': 'slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-glow': 'pulseGlow 2s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
      },
    },
  },
  plugins: [],
};

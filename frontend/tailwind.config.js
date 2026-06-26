/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark background scale
        void:    '#050810',
        abyss:   '#080c18',
        surface: '#0d1221',
        elevated:'#121828',
        overlay: '#1a2235',
        hover:   '#1e2840',

        // Electric violet — primary accent
        electric: {
          DEFAULT: '#7c3aed',
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },

        // Cobalt blue — secondary accent
        cobalt: {
          DEFAULT: '#3b82f6',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },

        // Semantic
        emerald: {
          DEFAULT: '#10b981',
          soft: 'rgba(16,185,129,0.15)',
        },
        rose: {
          DEFAULT: '#ef4444',
          soft: 'rgba(239,68,68,0.15)',
        },
        amber: {
          DEFAULT: '#f59e0b',
        },

        // Text hierarchy
        'text-bright':   '#f0f4ff',
        'text-primary':  '#c8d3f5',
        'text-second':   '#7587a6',
        'text-muted':    '#4a5568',
        'text-faint':    '#2d3748',

        // Borders
        'border-faint':  'rgba(255,255,255,0.04)',
        'border-soft':   'rgba(255,255,255,0.07)',
        'border-mid':    'rgba(255,255,255,0.10)',
        'border-accent': 'rgba(124,58,237,0.35)',
      },

      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },

      borderRadius: {
        '4xl': '2rem',
      },

      boxShadow: {
        glow:     '0 0 40px rgba(124,58,237,0.25)',
        'glow-sm':'0 0 20px rgba(124,58,237,0.18)',
        'glow-lg':'0 0 80px rgba(124,58,237,0.35)',
        'cobalt':  '0 0 30px rgba(59,130,246,0.2)',
        'green':   '0 4px 20px rgba(16,185,129,0.35)',
        'red':     '0 4px 20px rgba(239,68,68,0.35)',
        card:      '0 8px 32px rgba(0,0,0,0.5)',
        float:     '0 20px 60px rgba(0,0,0,0.7)',
      },

      backdropBlur: {
        glass: '20px',
        heavy: '40px',
      },

      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-right': {
          '0%':   { opacity: '0', transform: 'translateX(14px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-left': {
          '0%':   { opacity: '0', transform: 'translateX(-14px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'aurora': {
          '0%, 100%': { transform: 'translate(0,0) rotate(0deg) scale(1)' },
          '33%':      { transform: 'translate(50px,-40px) rotate(120deg) scale(1.15)' },
          '66%':      { transform: 'translate(-30px,30px) rotate(240deg) scale(0.9)' },
        },
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgba(124,58,237,0.6)' },
          '70%':  { boxShadow: '0 0 0 20px rgba(124,58,237,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(124,58,237,0)' },
        },
        'pulse-green': {
          '0%':   { boxShadow: '0 0 0 0 rgba(16,185,129,0.6)' },
          '70%':  { boxShadow: '0 0 0 10px rgba(16,185,129,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0)' },
        },
        'typing-dot': {
          '0%, 80%, 100%': { transform: 'scale(0.65)', opacity: '0.3' },
          '40%':            { transform: 'scale(1)',    opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition:  '200% center' },
        },
      },

      animation: {
        'fade-up':    'fade-up 0.3s ease both',
        'fade-in':    'fade-in 0.25s ease both',
        'scale-in':   'scale-in 0.25s ease both',
        'slide-right':'slide-right 0.25s ease both',
        'slide-left': 'slide-left 0.25s ease both',
        'aurora':     'aurora 14s ease-in-out infinite',
        'aurora-slow':'aurora 20s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
        'pulse-green':'pulse-green 2s ease-out infinite',
        'typing-1':   'typing-dot 1.2s 0.0s infinite ease-in-out',
        'typing-2':   'typing-dot 1.2s 0.2s infinite ease-in-out',
        'typing-3':   'typing-dot 1.2s 0.4s infinite ease-in-out',
        'float':      'float 3s ease-in-out infinite',
        shimmer:      'shimmer 2s linear infinite',
      },

      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};

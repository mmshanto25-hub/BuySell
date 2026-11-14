/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        navy: {
          DEFAULT: '#101828',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },
        primary: {
          DEFAULT: '#3563E9',
          50: '#EFF4FF',
          100: '#DBE7FE',
          500: '#3563E9',
          600: '#254EDB',
          700: '#1D3EB7',
        },
        cyan: {
          DEFAULT: '#06B6D4',
          accent: '#06B6D4',
          light: '#CFFAFE',
        },
        text: {
          primary: '#101828',
          secondary: '#667085',
          muted: '#98A2B3',
        },
        border: '#E4E7EC',
        success: '#059669',
        warning: '#D97706',
        destructive: '#DC2626',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
        '2xl': '24px',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(16, 24, 40, 0.05), 0 1px 2px 0 rgba(16, 24, 40, 0.03)',
        card: '0 4px 6px -1px rgba(16, 24, 40, 0.05), 0 2px 4px -1px rgba(16, 24, 40, 0.03)',
        dropdown: '0 10px 15px -3px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.04)',
        modal: '0 20px 25px -5px rgba(16, 24, 40, 0.12), 0 10px 10px -5px rgba(16, 24, 40, 0.04)',
      },
    },
  },
  plugins: [],
};

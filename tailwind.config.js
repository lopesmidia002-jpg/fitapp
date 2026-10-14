/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--bg-main) / <alpha-value>)',
        surface: 'rgb(var(--bg-surface) / <alpha-value>)',
        card: 'rgb(var(--bg-card) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary-neon) / <alpha-value>)',
          hover: 'rgb(var(--primary-neon-hover) / <alpha-value>)',
          glow: 'rgba(var(--primary-neon), 0.25)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        foreground: 'rgb(var(--text-primary) / <alpha-value>)',
        muted: 'rgb(var(--text-secondary) / <alpha-value>)',
        border: 'rgb(var(--border-color) / <alpha-value>)',
        brand: {
          50: '#F4FDE8',
          100: '#E8FBCF',
          200: '#D5F7A4',
          300: '#C4F575',
          400: '#B8F34A',
          500: '#9CE02D',
          600: '#7BC01C',
          700: '#5C9817',
          800: '#406C14',
          900: '#26420F',
        },
        dark: {
          950: '#060709',
          900: '#0B0D10',
          850: '#101317',
          800: '#14171C',
          750: '#181C22',
          700: '#1B2027',
          600: '#232932',
          500: '#292F38',
        }
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px -3px rgba(184, 243, 74, 0.35)',
        'neon-sm': '0 0 10px -2px rgba(184, 243, 74, 0.25)',
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      }
    },
  },
  plugins: [],
}

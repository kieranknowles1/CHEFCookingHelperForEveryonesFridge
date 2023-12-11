import { type Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // Generated by https://coolors.co/242331-726e60-6369d1-60e1e0-ddca7d
      colors: {
        raisin_black: {
          DEFAULT: '#242331',
          100: '#07070a',
          200: '#0e0e13',
          300: '#15141d',
          400: '#1c1b26',
          500: '#242331',
          600: '#474562',
          700: '#6c6994',
          800: '#9d9bb8',
          900: '#cecddb'
        },
        dim_gray: {
          DEFAULT: '#726e60',
          100: '#171613',
          200: '#2e2c26',
          300: '#444239',
          400: '#5b584c',
          500: '#726e60',
          600: '#918d7c',
          700: '#ada99d',
          800: '#c8c6bd',
          900: '#e4e2de'
        },
        savoy_blue: {
          DEFAULT: '#6369d1',
          100: '#0e102f',
          200: '#1c1f5e',
          300: '#2a2f8d',
          400: '#383fbc',
          500: '#6369d1',
          600: '#8186d9',
          700: '#a1a4e3',
          800: '#c0c2ec',
          900: '#e0e1f6'
        },
        tiffany_blue: {
          DEFAULT: '#60e1e0',
          100: '#0a3636',
          200: '#156c6c',
          300: '#1fa2a2',
          400: '#2bd7d7',
          500: '#60e1e0',
          600: '#80e7e7',
          700: '#a0eded',
          800: '#c0f3f3',
          900: '#dff9f9'
        },
        citron: {
          DEFAULT: '#ddca7d',
          100: '#372f0e',
          200: '#6e5e1c',
          300: '#a58d2b',
          400: '#cfb446',
          500: '#ddca7d',
          600: '#e4d597',
          700: '#ebdfb1',
          800: '#f2eacb',
          900: '#f8f4e5'
        }
      }
    }
  },
  plugins: []
} satisfies Config
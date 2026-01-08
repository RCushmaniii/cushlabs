/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        base: 'rgb(var(--bg) / <alpha-value>)',
        foreground: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',

        'cush-orange': '#FF6A3D',
        'cush-black': '#000000',
        'cush-gray': {
          900: '#0A0A0A',
          800: '#141414',
          700: '#1A1A1A',
          600: '#2A2A2A',
          400: '#666666',
          300: '#888888',
          200: '#AAAAAA',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Source Serif 4', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};

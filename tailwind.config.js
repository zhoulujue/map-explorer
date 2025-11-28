/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        background: 'var(--color-background)',
        text: 'var(--color-text)',
        'text-secondary': 'var(--color-text-secondary)',
        border: 'var(--color-border)',
        card: 'var(--color-card)',
        primary: 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        error: 'var(--color-error)',
        success: 'var(--color-success)',
      },
    },
  },
  plugins: [],
};

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#15171C',   // Главный фон
        sidebar: '#1E2128',      // Фон сайдбара и инпутов
        surface: '#262A33',      // Фон карточек
        brand: {
          teal: '#2DD4BF',       // Акцентный бирюзовый
          orange: '#FB923C',     // Акцентный оранжевый
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Похожий на референс шрифт
      }
    },
  },
  plugins: [],
}
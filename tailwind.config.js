/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'poke-red': '#FF0000',    // 精靈球紅
        'poke-blue': '#3B4CCA',   // 標誌藍
        'poke-yellow': '#FFDE00', // 皮卡丘黃
        'iv-perfect': '#FFD700',  // 滿值金色 (Phase 4 標註用)
      },
    },
  },
  plugins: [],
}
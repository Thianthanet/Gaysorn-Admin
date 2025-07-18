/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Prompt', 'sans-serif'], // หรือเปลี่ยนชื่อเป็นอะไรก็ได้
      },
    },
  },
  plugins: [],
}

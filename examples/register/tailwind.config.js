/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: '#1EEFA4',
          secondary: '#2980E8',
          accent: 'rgba(31, 42, 46, 0.6)',
          neutral: '#1EEFA4',
          info: '#BDCED1',
          success: '#218752',
          warning: '#ED7E17',
          error: '#FF5A5A',
        },
      },
    ],
  },
  plugins: [
    // eslint-disable-next-line no-undef
      require("daisyui")
  ],
}


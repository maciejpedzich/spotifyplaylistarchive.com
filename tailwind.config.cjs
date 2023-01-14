/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/colors/themes')['[data-theme=garden]'],
          primary: '#039826',
          'primary-focus': '#02771D',
          'primary-content': '#FFFFFF'
        },
        dark: {
          ...require('daisyui/src/colors/themes')['[data-theme=forest]'],
          'primary-focus': '#6AE796',
          'primary-content': '#000000'
        }
      }
    ]
  }
};

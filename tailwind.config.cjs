/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/colors/themes')['[data-theme=garden]']
        },
        dark: {
          ...require('daisyui/src/colors/themes')['[data-theme=forest]'],
          'primary-content': '#000000'
        }
      }
    ]
  }
};

import { defineNuxtConfig } from 'nuxt';
import eslintPlugin from 'vite-plugin-eslint';

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  build: {
    transpile: ['primevue', 'chart.js']
  },
  css: [
    '~~/assets/base.css',
    'primevue/resources/primevue.min.css',
    'primevue/resources/themes/arya-green/theme.css',
    'primeflex/primeflex.min.css',
    'primeicons/primeicons.css',
    '@vuepic/vue-datepicker/dist/main.css'
  ],
  modules: ['@vueuse/nuxt'],
  vite: {
    plugins: [eslintPlugin()]
  }
});

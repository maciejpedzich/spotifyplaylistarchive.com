// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  css: [
    'primevue/resources/themes/lara-dark-teal/theme.css',
    'primeflex/primeflex.min.css',
    'primeicons/primeicons.css',
    '@/assets/global.css'
  ],
  build: {
    transpile: ['primevue']
  },
  app: {
    head: {
      title: 'Spotify Playlist Archive',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        {
          name: 'description',
          content:
            'Browse past versions of thousands of playlists saved over time'
        },
        {
          name: 'og:title',
          content: 'Spotify Playlist Archive'
        },
        {
          name: 'og:description',
          content:
            'Browse past versions of thousands of playlists saved over time'
        },
        {
          name: 'twitter:card',
          content: 'summary'
        },
        {
          name: 'twitter:title',
          content: 'Spotify Playlist Archive'
        },
        {
          name: 'twitter:description',
          content:
            'Browse past versions of thousands of playlists saved over time'
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      githubRawBaseUrl:
        'https://raw.githubusercontent.com/mackorone/spotify-playlist-archive'
    }
  }
});

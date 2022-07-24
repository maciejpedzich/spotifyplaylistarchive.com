<template>
  <NuxtLayout name="centered-content">
    <h1 class="m-0 text-5xl">Spotify Playlist Archive</h1>
    <div class="w-6 text-xl text-center">
      <p>
        &copy; 2019-{{ new Date().getFullYear() }} Mack Ward, Maciej Pędzich.
        Released under MIT License.
      </p>
      <p>
        Developed using
        <NuxtLink
          to="https://github.com/maciejpedzich/spotify-playlist-archive-website/blob/master/package.json#L11"
          target="_blank"
          >these packages</NuxtLink
        >. Hosted on
        <NuxtLink to="https://www.netlify.com" target="_blank">Netlify</NuxtLink
        >.
      </p>
      <p class="mb-2">
        Source code:
        <NuxtLink
          to="https://github.com/mackorone/spotify-playlist-archive"
          target="_blank"
          >playlist archive</NuxtLink
        >
        |
        <NuxtLink
          to="https://github.com/maciejpedzich/spotify-playlist-archive-website"
          target="_blank"
          >this website</NuxtLink
        >.
      </p>
      <p>This project is not associated with Spotify AB in any way.</p>
    </div>
  </NuxtLayout>
</template>

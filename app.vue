<script setup lang="ts">
import Toast from 'primevue/toast';

useHead({
  title: 'Spotify Playlist Archive',
  meta: [
    {
      name: 'description',
      content:
        'Browse past versions of thousands of Spotify playlists saved over time'
    }
  ]
});
</script>

<template>
  <div class="w-full h-full flex flex-column">
    <NavBar />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <ClientOnly>
      <Toast position="bottom-center" />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import Menubar from 'primevue/menubar';

interface MenuItem {
  label: string;
  icon?: string;
  to?: string;
  visible?: boolean;
  command?(): unknown;
  items?: MenuItem[];
}

const items = computed<MenuItem[]>(() => [
  {
    label: 'Home',
    icon: 'pi pi-home',
    to: '/'
  },
  {
    label: 'Add a playlist',
    icon: 'pi pi-plus',
    url: 'https://github.com/mackorone/spotify-playlist-archive/blob/main/CONTRIBUTING.md#adding-playlists',
    target: '_blank'
  },
  {
    label: "Get playlist's ID from URL",
    icon: 'pi pi-link',
    to: '/get-playlist-id'
  },
  {
    label: 'About',
    icon: 'pi pi-info-circle',
    to: '/about'
  }
]);
</script>

<template>
  <Menubar
    :model="items"
    class="fixed z-5 top-0 w-full justify-content-between md:justify-content-start"
  >
    <template #start>
      <strong class="px-2 md:px-5">Spotify Playlist Archive</strong>
    </template>
  </Menubar>
</template>

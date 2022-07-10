<script setup lang="ts">
import Menubar from 'primevue/menubar';

interface MenuItem {
  label: string;
  icon: string;
  to?: string;
  visible?: boolean;
  command?(): unknown;
}

const items = computed<MenuItem[]>(() => [
  {
    label: 'Home',
    icon: 'pi pi-home',
    to: '/'
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

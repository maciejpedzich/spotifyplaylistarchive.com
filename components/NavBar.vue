<script setup lang="ts">
import Menubar from 'primevue/menubar';

import { MenuItem } from 'primevue/menuitem';

const menuItems = ref<(MenuItem & { route?: string })[]>([
  {
    label: 'Add a playlist',
    icon: 'pi pi-plus',
    route: '/playlists/add'
  },
  {
    label: "Get playlist's ID from URL",
    icon: 'pi pi-link',
    route: '/get-playlist-id'
  },
  {
    label: 'Source code',
    icon: 'pi pi-code',
    url: 'https://github.com/maciejpedzich/spotifyplaylistarchive.com'
  }
]);
</script>

<template>
  <Menubar :model="menuItems" aria-label="Main menu">
    <template #start>
      <RouterLink
        id="nav-brand"
        class="md:px-4 px-2 no-underline text-color font-bold"
        to="/"
      >
        Spotify Playlist Archive
      </RouterLink>
    </template>
    <template #item="{ label, item, props }">
      <RouterLink
        v-if="item.route"
        v-slot="routerProps"
        :to="item.route"
        custom
      >
        <a :href="routerProps.href" v-bind="props.action">
          <span v-bind="props.icon" />
          <span>{{ label }}</span>
        </a>
      </RouterLink>
      <a v-else :href="item.url" :target="item.target" v-bind="props.action">
        <span v-bind="props.icon" />
        <span>{{ label }}</span>
      </a>
    </template>
  </Menubar>
</template>

<style scoped>
#nav-brand:hover {
  opacity: 0.5;
}
</style>

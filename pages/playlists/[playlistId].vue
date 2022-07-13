<script setup lang="ts">
import TabMenu from 'primevue/tabmenu';

import { Snapshot } from '~~/models/snapshot';

const route = useRoute();
const playlistId = route.params.playlistId;

const tabItems = [
  {
    label: 'Browse snapshots',
    icon: 'pi pi-calendar',
    to: `/playlists/${playlistId}/snapshots`
  },
  {
    label: 'Show statistics',
    icon: 'pi pi-chart-bar',
    to: `/playlists/${playlistId}/stats`
  },
  {
    label: 'Compare snapshots (SOON)',
    icon: 'pi pi-sort-alt',
    to: `/playlists/${playlistId}/snapshots/compare`,
    disabled: true
  }
];

const { error, data: playlist } = await useFetch<Snapshot>(
  () =>
    `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/pretty/${playlistId}.json`,
  {
    parseResponse: (body) =>
      body === '404: Not Found' ? null : JSON.parse(body),
    key: `playlist-${playlistId}`
  }
);

const isNotFoundError = computed(
  () => typeof error.value !== 'boolean' && error.value.message.includes('404')
);
</script>

<template>
  <div class="flex flex-column align-items-center mt-7">
    <p v-if="error" class="text-xl">
      <span v-if="isNotFoundError">
        This playlist was not found in the registry
      </span>
      <span v-else>Something went wrong while fetching playlist's data</span>
    </p>
    <template v-else-if="playlist">
      <h1 class="text-3xl mb-3">
        <NuxtLink :to="playlist.url" target="_blank">
          {{ playlist.unique_name }}
          <span v-if="playlist.unique_name !== playlist.original_name">
            ({{ playlist.original_name }})
          </span>
        </NuxtLink>
        by
        <NuxtLink :to="playlist.owner?.url" target="_blank">
          {{ playlist.owner?.name }}
        </NuxtLink>
      </h1>
      <TabMenu class="w-full mb-4" :model="tabItems" />
      <NuxtPage />
    </template>
  </div>
</template>

<style scoped>
:deep(ul.p-tabmenu-nav) {
  margin-left: 5rem;
  margin-right: 5rem;
  justify-content: center;
}

:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem a.p-menuitem-link) {
  background-color: transparent;
}
</style>

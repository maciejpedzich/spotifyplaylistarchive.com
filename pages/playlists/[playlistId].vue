<script setup lang="ts">
import TabMenu from 'primevue/tabmenu';

import { Playlist } from '~~/models/playlist';

const route = useRoute();
const playlistId = route.params.playlistId;

const tabItems = [
  {
    label: 'Browse snapshots',
    icon: 'pi pi-calendar',
    to: `./snapshots`
  },
  {
    label: 'Compare snapshots',
    icon: 'pi pi-sort-alt',
    to: `./snapshots/compare`
  },
  {
    label: 'Show statistics',
    icon: 'pi pi-chart-bar',
    to: `./statistics`
  }
];

const { error, data } = await useFetch<Playlist & { notFound?: true }>(
  () =>
    `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/master/playlists/pretty/${playlistId}.json`,
  {
    parseResponse: (body) =>
      body.includes('404') ? { notFound: true } : JSON.parse(body),
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
    <template v-else>
      <h1 class="text-3xl mb-3">
        <NuxtLink :to="data.url" target="_blank">
          {{ data.unique_name }}
          <span v-if="data.unique_name !== data.original_name">
            ({{ data.original_name }})
          </span>
        </NuxtLink>
        by
        <NuxtLink :to="data.owner.url" target="_blank">
          {{ data.owner.name }}
        </NuxtLink>
      </h1>
      <TabMenu class="w-full mb-5" :model="tabItems" />
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

:deep(li.p-tabmenuitem) {
  margin-left: 1rem;
}

:deep(li.p-tabmenuitem:first-of-type) {
  margin-left: 0;
}

:deep(.p-tabmenu .p-tabmenu-nav .p-tabmenuitem a.p-menuitem-link) {
  background-color: transparent;
}
</style>

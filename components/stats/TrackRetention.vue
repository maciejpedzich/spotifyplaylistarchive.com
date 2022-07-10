<script setup lang="ts">
import { $fetch } from 'ohmyfetch';

import { Cumulative } from '~~/models/cumulative';

const route = useRoute();
const playlistId = route.params.playlistId as string;

const {
  pending,
  error,
  data: tracks
} = await useLazyAsyncData(
  `longest-standing-tracks-${playlistId}`,
  async () => {
    const { tracks } = await $fetch<Cumulative>(
      `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/cumulative/${playlistId}.json`,
      { parseResponse: JSON.parse }
    );
    const now = new Date().toISOString();

    return tracks
      .map((track) => {
        track.retention =
          Date.parse(track.date_removed || now) - Date.parse(track.date_added);

        return track;
      })
      .sort((a, b) => b.retention - a.retention);
  }
);
</script>

<template>
  <NuxtLayout name="centered-content">
    <ClientOnly>
      <p v-if="error">
        Something went wrong while fetching the longest standing tracks
      </p>
      <TrackEntriesTable :loading="pending" :tracks="tracks" page="stats" />
    </ClientOnly>
  </NuxtLayout>
</template>

<style scoped>
:deep(div.p-datatable) {
  width: 100%;
  padding: 0 1rem;
}

@media only screen and (min-width: 768px) {
  :deep(div.p-datatable) {
    padding: 0 8rem;
  }
}
</style>

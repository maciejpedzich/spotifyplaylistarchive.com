<script setup lang="ts">
import { $fetch } from 'ohmyfetch';

import { Cumulative } from '~~/models/cumulative';
import { Track } from '~~/models/track';

const route = useRoute();
const playlistId = route.params.playlistId as string;

const {
  pending,
  error,
  data: tracks
} = await useLazyAsyncData(
  `track-retention-${playlistId}`,
  async () => {
    const now = Date.now();

    const { tracks } = await $fetch<Cumulative>(
      `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/cumulative/${playlistId}.json`,
      { parseResponse: JSON.parse }
    );

    return tracks
      .map((track) => {
        track.retention =
          (Date.parse(track.date_removed) || now) -
          Date.parse(track.date_added);

        return track;
      })
      .sort((a, b) => b.retention - a.retention);
  },
  { default: () => [] as Track[] }
);
</script>

<template>
  <NuxtLayout name="centered-content">
    <p v-if="error">
      Something went wrong while fetching the longest standing tracks
    </p>
    <SnapshotTrackEntries :loading="pending" :tracks="tracks" page="stats" />
  </NuxtLayout>
</template>

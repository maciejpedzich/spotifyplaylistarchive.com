<script setup lang="ts">
import { $fetch } from 'ohmyfetch';
import { intervalToDuration, formatDuration } from 'date-fns';

import ProgressSpinner from 'primevue/progressspinner';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import { Cumulative } from '~~/models/cumulative';

const route = useRoute();
const playlistId = route.params.playlistId as string;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const formatDate = (date: string | null) =>
  date ? dateFormatter.format(new Date(date)) : 'N/A';

const displayRetentionText = (retention: number) => {
  const durationObject = intervalToDuration({ start: 0, end: retention });
  const displayText = formatDuration(durationObject, {
    format: ['years', 'months', 'days']
  });

  return displayText;
};

const {
  pending,
  error,
  data: tracks
} = await useAsyncData(`longest-standing-tracks-${playlistId}`, async () => {
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
    .sort((a, b) => b.retention - a.retention)
    .map((track, index) => {
      track.position = `${index + 1}.`;

      return track;
    });
});
</script>

<template>
  <NuxtLayout name="centered-content">
    <ClientOnly>
      <ProgressSpinner v-if="pending" />
      <p v-else-if="error">
        Something went wrong while fetching the longest standing tracks
      </p>
      <DataTable
        class="w-full mx-5 mt-3 mb-5"
        :value="tracks"
        paginator
        :rows="10"
        :rows-per-page-options="[10, 20, 50, 100]"
        paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        current-page-report-template="Showing {first} to {last} of {totalRecords}"
        responsive-layout="scroll"
      >
        <Column field="position" header="No."></Column>
        <Column field="name" header="Title">
          <template #body="{ data: track }">
            <NuxtLink :to="track.url" target="_blank">
              {{ track.name }}
            </NuxtLink>
          </template>
        </Column>
        <Column field="artists" header="Artist(s)">
          <template #body="{ data: track }">
            <div v-for="(artist, index) of track.artists" :key="artist.url">
              <NuxtLink :to="artist.url" target="_blank">
                {{ artist.name }}
              </NuxtLink>
              <span v-if="index !== track.artists.length - 1" class="md:mr-1"
                >,</span
              >
            </div>
          </template>
        </Column>
        <Column field="album.name" header="Album">
          <template #body="{ data: track }">
            <NuxtLink :to="track.album.url" target="_blank">
              {{ track.album.name }}
            </NuxtLink>
          </template>
        </Column>
        <Column field="date_added" header="Date added">
          <template #body="{ data: track }">
            <span>
              {{ formatDate(track.date_added) }}
            </span>
          </template>
        </Column>
        <Column field="date_removed" header="Date removed">
          <template #body="{ data: track }">
            <span>
              {{ formatDate(track.date_removed) }}
            </span>
          </template>
        </Column>
        <Column field="retention" header="Retention">
          <template #body="{ data: track }">
            <span>
              {{ displayRetentionText(track.retention) }}
            </span>
          </template>
        </Column>
      </DataTable>
    </ClientOnly>
  </NuxtLayout>
</template>

<style scoped>
@media only screen and (min-width: 768px) {
  :deep(div.p-datatable) {
    width: 100%;
    padding: 0 8rem;
  }
}
</style>

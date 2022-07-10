<script setup lang="ts">
import formatDuration from 'format-duration';
import {
  intervalToDuration,
  formatDuration as dateFnsFormatDuration
} from 'date-fns';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import { Track } from '~~/models/track';

const props = defineProps<{
  loading: boolean;
  tracks: Track[] | null;
  page: 'snapshot' | 'stats';
}>();

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const formatDate = (date: string | null) =>
  date ? dateFormatter.format(new Date(date)) : 'N/A';

const displayRetentionText = (retention: number) => {
  const durationObject = intervalToDuration({ start: 0, end: retention });
  const displayText = dateFnsFormatDuration(durationObject, {
    format: ['years', 'months', 'days'],
    delimiter: ', '
  });

  return displayText;
};
</script>

<template>
  <DataTable
    class="w-full mx-5 mt-3 mb-5"
    :loading="props.loading"
    :value="props.tracks"
    :rows="10"
    :rows-per-page-options="[10, 20, 50, 100]"
    paginator
    paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
    current-page-report-template="Showing {first} to {last} of {totalRecords}"
    responsive-layout="stack"
  >
    <Column field="name" header="Title">
      <template #body="{ data: track }">
        <NuxtLink :to="track.url" target="_blank">
          {{ track.name }}
        </NuxtLink>
      </template>
    </Column>
    <Column field="artists" header="Artist(s)">
      <template #body="{ data: track }">
        <div>
          <div v-for="(artist, index) of track.artists" :key="artist.url">
            <NuxtLink :to="artist.url" target="_blank">
              {{ artist.name }}
            </NuxtLink>
            <span v-if="index !== track.artists.length - 1" class="md:mr-1"
              >,</span
            >
          </div>
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
    <template v-if="props.page === 'snapshot'">
      <Column field="added_at" header="Date added" sortable>
        <template #body="{ data: track }">
          {{ formatDate(track.added_at) }}
        </template>
      </Column>
      <Column field="duration_ms" header="Duration" sortable>
        <template #body="{ data: track }">
          {{ formatDuration(track.duration_ms) }}
        </template>
      </Column>
    </template>
    <template v-else>
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
    </template>
  </DataTable>
</template>

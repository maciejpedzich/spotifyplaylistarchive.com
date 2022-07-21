<script setup lang="ts">
import formatDuration from 'format-duration';
import {
  intervalToDuration as intervalToDateFnsDuration,
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

const formatRetentionText = (retention: number) => {
  const durationObject = intervalToDateFnsDuration({
    start: 0,
    end: retention
  });
  const formattedText = dateFnsFormatDuration(durationObject, {
    format: ['years', 'months', 'days'],
    delimiter: ', '
  });

  return formattedText;
};

const datatablePropsToEnable = computed(() =>
  props.page === 'snapshot'
    ? {}
    : {
        paginator: true,
        paginatorTemplate:
          'CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown',
        currentPageReportTemplate:
          'Showing {first} to {last} of {totalRecords}',
        rows: 10,
        rowsPerPageOptions: [10, 20, 50, 100]
      }
);

const firstCellMarginTop = computed(() =>
  props.page === 'stats' ? '3.5rem' : '0'
);
</script>

<template>
  <DataTable
    class="h-full mt-3 mb-5"
    :class="[props.page === 'snapshot' ? 'w-12' : 'w-10']"
    :loading="props.loading"
    :value="props.tracks"
    show-gridlines
    v-bind="datatablePropsToEnable"
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
          <span v-for="(artist, index) of track.artists" :key="artist.url">
            <NuxtLink :to="artist.url" target="_blank">
              {{ artist.name }}
            </NuxtLink>
            <span v-if="index !== track.artists.length - 1" class="md:mr-1"
              >,</span
            >
          </span>
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
      <Column field="added_at" header="Date added">
        <template #body="{ data: track }">
          {{ formatDate(track.added_at) }}
        </template>
      </Column>
      <Column field="duration_ms" header="Duration">
        <template #body="{ data: track }">
          {{ formatDuration(track.duration_ms) }}
        </template>
      </Column>
    </template>
    <template v-else-if="props.page === 'stats'">
      <Column field="date_added" header="Date added">
        <template #body="{ data: track }">
          {{ formatDate(track.date_added) }}
        </template>
      </Column>
      <Column field="date_removed" header="Date removed">
        <template #body="{ data: track }">
          {{ formatDate(track.date_removed) }}
        </template>
      </Column>
      <Column field="retention" header="Retention">
        <template #body="{ data: track }">
          {{ formatRetentionText(track.retention) }}
        </template>
      </Column>
    </template>
  </DataTable>
</template>

<style scoped>
:deep(tbody.p-datatable-tbody > tr:first-of-type > td) {
  margin-top: 0;
}

@media only screen and (min-width: 768px) {
  :deep(tbody.p-datatable-tbody > tr:first-of-type > td) {
    margin-top: v-bind(firstCellMarginTop);
  }
}
</style>

<script setup lang="ts">
import { decode as decodeHtmlEntities } from 'html-entities';
import formatDuration from 'format-duration';

import DataTable from 'primevue/datatable';
import Column from 'primevue/column';

import { Playlist } from '~~/models/playlist';

const route = useRoute();
const playlistId = route.params.playlistId as string;
const commitSha = route.params.commitSha as string;

const { error, data: snapshot } = useFetch<Playlist>(
  () =>
    `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/${commitSha}/playlists/pretty/${playlistId}.json`,
  { key: `snapshot-${commitSha}`, parseResponse: JSON.parse }
);

const totalTrackDuration = computed(() =>
  (snapshot.value?.tracks || []).reduce(
    (total, track) => (total += track.duration_ms),
    0
  )
);

const numberFormatter = new Intl.NumberFormat('en-US');
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const humanizeNumber = (num: number) => numberFormatter.format(num);
const formatDate = (date: string) => dateFormatter.format(Date.parse(date));
</script>

<template>
  <div class="w-full">
    <p v-if="error">Something went wrong while fetching this snapshot</p>
    <template v-else-if="snapshot">
      <div class="text-lg text-center flex flex-column align-items-center">
        <p class="mt-0 px-3 text-gray-300">
          {{ decodeHtmlEntities(snapshot.description) }}
        </p>
        <ul id="snapshot-meta" class="m-0 p-0">
          <li>
            {{ humanizeNumber(snapshot.num_followers) }}
            followers
          </li>
          <li>
            {{ snapshot.tracks.length }}
            tracks,
            <span class="text-gray-200">
              {{ formatDuration(totalTrackDuration) }}
            </span>
          </li>
        </ul>
      </div>
      <ClientOnly>
        <DataTable
          :value="snapshot.tracks"
          paginator
          :rows="10"
          :rows-per-page-options="[10, 20, 50, 100]"
          paginator-template="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          current-page-report-template="Showing {first} to {last} of {totalRecords}"
          responsive-layout="stack"
        >
          <Column field="name" header="Title" sortable>
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
          <Column field="album.name" header="Album" sortable>
            <template #body="{ data: track }">
              <NuxtLink :to="track.album.url" target="_blank">
                {{ track.album.name }}
              </NuxtLink>
            </template>
          </Column>
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
        </DataTable>
      </ClientOnly>
    </template>
  </div>
</template>

<style scoped>
#snapshot-meta > li:first-of-type {
  list-style: disc;
}

:deep(div.p-datatable) {
  width: 100%;
  margin: 2rem 0 3rem 0;
  padding: 0 1rem;
}

@media screen and (min-width: 768px) {
  #snapshot-meta > li {
    float: left;
    margin-left: 1.5rem;
  }

  #snapshot-meta > li:first-of-type {
    margin-left: 0;
    list-style: none;
  }

  :deep(div.p-datatable) {
    padding: 0 8rem;
  }
}
</style>

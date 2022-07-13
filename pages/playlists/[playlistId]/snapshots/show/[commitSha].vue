<script setup lang="ts">
import { decode as decodeHtmlEntities } from 'html-entities';
import formatDuration from 'format-duration';

import { Playlist } from '~~/models/playlist';

const route = useRoute();
const playlistId = route.params.playlistId as string;
const commitSha = route.params.commitSha as string;

const {
  pending,
  error,
  data: snapshot
} = useFetch<Playlist>(
  () =>
    `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/${commitSha}/playlists/pretty/${playlistId}.json`,
  {
    key: `snapshot-${commitSha}`,
    parseResponse: JSON.parse
  }
);

const totalTrackDuration = computed(() =>
  (snapshot.value?.tracks || []).reduce(
    (total, track) => (total += track.duration_ms),
    0
  )
);

const numberFormatter = new Intl.NumberFormat('en-US');

const humanizeNumber = (num: number) => numberFormatter.format(num);
</script>

<template>
  <div>
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
        <SnapshotTrackEntries
          :loading="pending"
          :tracks="snapshot.tracks"
          page="snapshot"
        />
      </ClientOnly>
    </template>
  </div>
</template>

<style scoped>
#snapshot-meta > li:first-of-type {
  list-style: disc;
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
}
</style>

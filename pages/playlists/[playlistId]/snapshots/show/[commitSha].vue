<script setup lang="ts">
import { decode as decodeHtmlEntities } from 'html-entities';
import formatDuration from 'format-duration';

import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

import { Snapshot } from '~~/models/snapshot';

const route = useRoute();
const toast = useToast();

const { copy } = useClipboard();
const { canCopyToClipboard } = useCanCopyToClipboard();

const playlistId = route.params.playlistId as string;
const commitSha = route.params.commitSha as string;
const snapshotDataUrl = `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/${commitSha}/playlists/pretty/${playlistId}.json`;

const {
  pending,
  error,
  data: snapshot
} = useFetch<Snapshot>(snapshotDataUrl, {
  key: `snapshot-${commitSha}`,
  parseResponse: JSON.parse
});

const snapshotJsonFileName = computed(
  () => `${snapshot.value?.unique_name}.json`
);

const snapshotJsonDownloadUrl = computed(() => {
  if (!snapshot.value) return;

  const blob = new Blob([JSON.stringify(snapshot.value, null, 2)]);
  const url = URL.createObjectURL(blob);

  return url;
});

const totalTrackDuration = computed(() =>
  (snapshot.value?.tracks || []).reduce(
    (total, track) => (total += track.duration_ms),
    0
  )
);

const numberFormatter = new Intl.NumberFormat('en-US');
const humanizeNumber = (num: number) => numberFormatter.format(num);

const copyTrackUrls = async () => {
  const trackUrls = snapshot.value.tracks.map(({ url }) => url).join('\n');

  await copy(trackUrls);

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'URLs have been copied to clipboard',
    life: 5000
  });
};
</script>

<template>
  <div class="w-10">
    <p v-if="error">Something went wrong while fetching this snapshot</p>
    <template v-else-if="snapshot">
      <div class="text-lg text-center flex flex-column align-items-center">
        <p class="mt-0 px-3 text-gray-300">
          {{ decodeHtmlEntities(snapshot.description) }}
        </p>
        <ul id="snapshot-meta" class="mt-0 mb-2 p-0">
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
        <div class="my-2 flex justify-content-center">
          <Button
            v-if="canCopyToClipboard"
            class="p-button-text"
            label="Copy track URLs"
            icon="pi pi-clone"
            @click="copyTrackUrls"
          />
          <a
            id="export-to-json"
            class="p-component p-button p-button-text"
            :href="snapshotJsonDownloadUrl"
            :download="snapshotJsonFileName"
          >
            <span
              class="pi pi-download p-button-icon p-button-icon-left"
            ></span>
            <span class="p-button-label">Export to JSON</span>
          </a>
        </div>
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
#export-to-json:hover {
  background-color: rgba(129, 199, 132, 0.04);
  border-color: transparent;
  color: #81c784;
}

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

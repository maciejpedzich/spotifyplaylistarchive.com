<script setup lang="ts">
import AutoComplete from 'primevue/autocomplete';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';

import { Searcher } from 'fast-fuzzy';

import { Playlist } from '@/models/playlist';
import { getPlaylistIdFromUrl } from '@/utils/getPlaylistIdFromUrl';

interface SearchResult {
  id: string;
  original_name: string;
  display_name: string;
}

const runtimeConfig = useRuntimeConfig();

const searchTerm = ref('');
const searchResults = ref<SearchResult[]>([]);

const {
  pending: loadingPlaylistRegistry,
  data: playlistRegistry,
  error: playlistRegistryLoadError,
  refresh: reloadPlaylistRegistry
} = useAsyncData<SearchResult[]>(
  'playlistRegistry',
  async () => {
    const registryFileContent = await $fetch<Record<string, Playlist>>(
      `${runtimeConfig.public.githubRawBaseUrl}/main/playlists/metadata.json`,
      { parseResponse: JSON.parse }
    );

    return Object.entries(registryFileContent).map(
      ([id, { original_name, unique_name }]) => ({
        id,
        original_name,
        display_name:
          original_name === unique_name
            ? original_name
            : `${unique_name} (${original_name})`
      })
    );
  },
  { default: () => [] }
);

const fuzzySearcher = new Searcher(playlistRegistry.value, {
  keySelector: (obj) => obj.original_name
});

const performSearch = async () => {
  // Assume search term is a valid playlist URL and obtain a playlist ID
  const playlistId = getPlaylistIdFromUrl(searchTerm.value);

  if (playlistId) {
    // Search term is a valid playlist URL
    // Find an object with an id equal to obtained playlistId
    const playlistUrlSearchResults = playlistRegistry.value.filter(
      (p) => p.id === playlistId
    );

    searchResults.value = playlistUrlSearchResults;
  } else {
    // Search term is not a valid playlist URL
    // Perform a fuzzy search against playlists' original names
    // Limit results to 10 best matches
    const fuzzySearchResults = fuzzySearcher
      .search(searchTerm.value)
      .slice(0, 10);

    searchResults.value = fuzzySearchResults;
  }
};

const goToSnapshotCalendar = async ({
  value: playlist
}: {
  value: SearchResult;
}) => {
  await navigateTo(`/playlists/${playlist.id}`);
};
</script>

<template>
  <div
    class="w-full h-full flex flex-column gap-2 justify-content-center align-items-center"
  >
    <h1 class="m-0 text-6xl">Spotify Playlist Archive</h1>
    <div>
      <p class="mt-0 mb-4 text-2xl">
        Browse past versions of thousands of playlists saved over time
      </p>
      <Skeleton v-if="loadingPlaylistRegistry" class="w-full h-3rem" />
      <Message
        v-else-if="playlistRegistryLoadError"
        class="text-0"
        severity="error"
        :closable="false"
      >
        <div class="w-full flex align-items-center">
          <span class="flex-1">Failed to load playlist search bar</span>
          <Button
            size="small"
            severity="danger"
            label="Try again"
            @click="reloadPlaylistRegistry()"
          />
        </div>
      </Message>
      <AutoComplete
        v-else
        class="w-full"
        aria-label="Playlist Search Bar"
        :suggestions="searchResults"
        :min-length="3"
        placeholder="Start typing a playlist's title or paste its URL"
        field="display_name"
        @complete="performSearch"
        @item-select="goToSnapshotCalendar"
        v-model="searchTerm"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.p-autocomplete-input) {
  width: 100%;
}

:deep(.p-message-text) {
  width: 100%;
}

:deep(.p-autocomplete-input::placeholder) {
  text-align: center;
}
</style>

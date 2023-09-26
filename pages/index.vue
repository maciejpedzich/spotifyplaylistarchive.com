<script setup lang="ts">
import AutoComplete from 'primevue/autocomplete';
import Message from 'primevue/message';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';

import { Searcher } from 'fast-fuzzy';
import { getPlaylistIdFromUrl } from '@/utils/getPlaylistIdFromUrl';

interface RegistryEntry {
  id: string;
  name: string;
}

const runtimeConfig = useRuntimeConfig();

const searchTerm = ref('');
const minSearchTermLength = ref(3);
const searchResults = ref<RegistryEntry[]>([]);

const {
  pending: loadingPlaylistRegistry,
  data: playlistRegistry,
  error: playlistRegistryLoadError,
  refresh: reloadPlaylistRegistry
} = useAsyncData<RegistryEntry[]>(
  'playlistRegistry',
  async () => {
    const registryFileContent = await $fetch<Record<string, string>>(
      `/main/playlists/metadata/metadata-compact.json`,
      {
        baseURL: runtimeConfig.public.githubRawBaseUrl,
        parseResponse: JSON.parse
      }
    );

    return Object.entries(registryFileContent).map(([id, name]) => ({
      id,
      name
    }));
  },
  { default: () => [], server: false }
);

const fuzzySearcher = new Searcher(playlistRegistry.value, {
  keySelector: (obj) => obj.name
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
    // Perform a fuzzy search against playlists' names
    const fuzzySearchResults = fuzzySearcher
      .search(searchTerm.value)
      .slice(0, 10);

    searchResults.value = fuzzySearchResults;
  }
};

const goToSnapshotCalendar = async ({
  value: playlist
}: {
  value: RegistryEntry;
}) => {
  await navigateTo(`/playlists/${playlist.id}`);
};
</script>

<template>
  <div
    class="p-4 w-full h-full flex flex-column gap-2 justify-content-center align-items-center text-center"
  >
    <h1 class="m-0 md:text-6xl text-4xl">Spotify Playlist Archive</h1>
    <div>
      <p class="mt-0 mb-4 md:text-2xl text-xl">
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
        placeholder="Start typing a playlist's title or paste its URL"
        :suggestions="searchResults"
        :min-length="minSearchTermLength"
        field="name"
        :complete-on-focus="searchTerm.length >= minSearchTermLength"
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

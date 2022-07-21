<script setup lang="ts">
import { $fetch } from 'ohmyfetch';
import AutoComplete from 'primevue/autocomplete';

import { SearchResult } from '~~/models/search-result';

const router = useRouter();

const searchHistory = useCookie<SearchResult[]>('searchHistory');
searchHistory.value = searchHistory.value || [];

const searchText = ref('');
const suggestions = ref([]);

// For some odd reason, if you don't do JSON.parse(JSON.stringify),
// suggestions ref won't get populated.
const displaySearchHistory = () =>
  (suggestions.value = JSON.parse(JSON.stringify(searchHistory.value)));

const findPlaylists = async () => {
  if (searchText.value.length === 0) return displaySearchHistory();

  try {
    const urlObject = new URL(searchText.value);
    const [collectionName, playlistId] = urlObject.pathname
      .split('/')
      .filter(Boolean);

    if (
      urlObject.hostname === 'open.spotify.com' &&
      collectionName === 'playlist' &&
      playlistId
    ) {
      const searchResults = await $fetch(
        `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/pretty/${playlistId}.json`,
        {
          parseResponse: (body) =>
            body === '404: Not Found'
              ? []
              : [
                  {
                    id: playlistId,
                    title: JSON.parse(body).original_name
                  }
                ]
        }
      ).catch((e) => e.data);

      return (suggestions.value = searchResults);
    } else {
      throw new Error('This is not a valid playlist link');
    }
  } catch (error) {
    if (error.message === 'This is not a valid playlist link') return [];

    const searchResults = await $fetch<SearchResult[]>(
      `/api/playlists/search?title=${searchText.value}`
    );

    return (suggestions.value = searchResults);
  }
};

const openSnapshotsCalendar = async ({
  value: entry
}: {
  value: SearchResult;
}) => {
  const existingHistoryEntry = searchHistory.value.find(
    (e) => e.id === entry.id
  );

  if (searchHistory.value.length === 0 || !existingHistoryEntry) {
    searchHistory.value.unshift(entry);
    searchHistory.value = searchHistory.value.slice(0, 10);
  }

  await router.push(`/playlists/${entry.id}/snapshots`);
};
</script>

<template>
  <NuxtLayout name="centered-content">
    <h1 class="m-0 md:text-5xl text-4xl">Spotify Playlist Archive</h1>
    <div class="md:p-0 p-2 flex flex-column justify-content-center text-center">
      <p class="md:mt-3 mt-2 text-lg text-gray-300">
        Browse past versions of thousands of playlists saved over time
      </p>
      <div class="w-full md:px-0 px-3">
        <AutoComplete
          v-model="searchText"
          :suggestions="suggestions"
          class="w-full"
          placeholder="Type in at least 3 characters, or paste a playlist link"
          field="title"
          :min-length="3"
          complete-on-focus
          @complete="findPlaylists"
          @item-select="openSnapshotsCalendar"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped>
:deep(.p-autocomplete-input) {
  width: 100%;
  text-align: center;
}

:deep(.p-autocomplete-input::placeholder) {
  text-align: center;
}
</style>

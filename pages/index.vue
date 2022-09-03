<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core';
import { $fetch } from 'ohmyfetch';
import AutoComplete from 'primevue/autocomplete';

import { SearchResult } from '~~/models/search-result';

const router = useRouter();
const getPlaylistId = useGetPlaylistId();

const searchHistory = useLocalStorage('searchHistory', []);
const searchName = ref('');
const suggestions = ref<SearchResult[]>([]);

// For some odd reason, if you don't call JSON.parse(JSON.stringify(...)),
// suggestions ref won't get populated.
const displaySearchHistory = () =>
  (suggestions.value = JSON.parse(JSON.stringify(searchHistory.value)));

const findPlaylists = async () => {
  if (searchName.value.length === 0) return displaySearchHistory();

  try {
    const playlistId = getPlaylistId(searchName.value);
    const searchResults = await $fetch(
      `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/pretty/${playlistId}.json`,
      {
        parseResponse: (body) =>
          body === '404: Not Found'
            ? []
            : [
                {
                  id: playlistId,
                  name: JSON.parse(body).original_name
                }
              ]
      }
    ).catch((e) => e.data);

    suggestions.value = searchResults;
  } catch (error) {
    if (error.message === 'This is not a valid playlist URL') return [];

    const searchResults = await $fetch<SearchResult[]>(
      `/api/playlists/search?name=${searchName.value}`
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
    <h1 class="m-0 md:text-5xl text-3xl">Spotify Playlist Archive</h1>
    <div class="md:p-0 p-2 flex flex-column justify-content-center text-center">
      <p class="md:mt-3 mt-2 text-lg text-gray-300">
        Browse past versions of thousands of playlists saved over time
      </p>
      <div class="w-full md:px-0 px-3">
        <AutoComplete
          v-model="searchName"
          :suggestions="suggestions"
          class="w-full"
          placeholder="Start typing or paste a playlist URL"
          field="name"
          :min-length="3"
          complete-on-focus
          @complete="findPlaylists"
          @item-select="openSnapshotsCalendar"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

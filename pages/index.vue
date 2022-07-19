<script setup lang="ts">
import { $fetch } from 'ohmyfetch';
import AutoComplete from 'primevue/autocomplete';

import { SearchResult } from '~~/models/search-result';

const router = useRouter();

const searchText = ref('');
const suggestions = ref([]);

const findPlaylists = async () => {
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

      suggestions.value = searchResults;
    } else {
      throw new Error('This is not a valid playlist link');
    }
  } catch (error) {
    if (error.message === 'This is not a valid playlist link') return [];

    const searchResults = await $fetch<SearchResult[]>(
      `/api/playlists/search?title=${searchText.value}`
    );

    suggestions.value = searchResults;
  }
};

const openSnapshotsCalendar = async ({
  value: entry
}: {
  value: SearchResult;
}) => {
  await router.push(`/playlists/${entry.id}/snapshots`);
};
</script>

<template>
  <NuxtLayout name="centered-content">
    <h1 class="m-0 text-5xl">Spotify Playlist Archive</h1>
    <div class="flex flex-column justify-content-center text-center">
      <p class="text-xl text-gray-300">
        Browse past versions of thousands of playlists saved over time
      </p>
      <div class="w-full">
        <AutoComplete
          v-model="searchText"
          :suggestions="suggestions"
          class="w-full"
          placeholder="Type in at least 3 characters, or paste a playlist link"
          field="title"
          :min-length="3"
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

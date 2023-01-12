<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { search } from 'fast-fuzzy';
import { debounce } from 'debounce';

import type { PlaylistSnapshot } from '@/models/playlist-snapshot';
import type { SearchSuggestion } from '@/models/search-suggestion';
import { getPlaylistIdFromUrl } from '@/utils/getPlaylistIdFromUrl';

const searchTerm = ref('');
const searchHistory = ref<SearchSuggestion[]>(
  JSON.parse(localStorage.getItem('searchHistory') || '[]')
);

const playlistRegistry = ref<SearchSuggestion[]>([]);
const searchSuggestions = ref<SearchSuggestion[]>(searchHistory.value);

const isFetchingPlaylists = ref(true);
const registryFetchErrorOccurred = ref(false);

const isPreparingSuggestions = ref(false);
const canShowSuggestions = ref(false);

const fetchAvailablePlaylists = async () => {
  try {
    isFetchingPlaylists.value = true;
    registryFetchErrorOccurred.value = false;

    const githubResponse = await fetch(
      'https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/metadata.json'
    );

    if (!githubResponse.ok) throw new Error(githubResponse.statusText);

    const playlistMetadata: Record<string, PlaylistSnapshot> =
      await githubResponse.json();

    const playlistEntries = Object.entries(playlistMetadata).map(
      ([id, { original_name }]) => ({ id, name: original_name })
    );

    playlistRegistry.value = playlistEntries;
  } catch (error) {
    console.error(error);
    registryFetchErrorOccurred.value = true;
  } finally {
    isFetchingPlaylists.value = false;
  }
};

const showSearchHistory = () => (searchSuggestions.value = searchHistory.value);

const findMatchingPlaylists = debounce(async (name: string) => {
  try {
    isPreparingSuggestions.value = true;

    if (name.length === 0) return showSearchHistory();
    else if (name.length < 3) return (searchSuggestions.value = []);

    const playlistId = getPlaylistIdFromUrl(name);
    const githubResponse = await fetch(
      `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/pretty/${playlistId}.json`
    );

    if (!githubResponse.ok)
      throw new Error(`GitHub ${githubResponse.status.toString()}`);

    const playlist: PlaylistSnapshot = await githubResponse.json();
    const suggestion = { id: playlistId, name: playlist.original_name };

    searchSuggestions.value = [suggestion];
  } catch (error) {
    const errorMessage = (error as Error).message;

    if (errorMessage === 'GitHub 404') return (searchSuggestions.value = []);

    const suggestions = search(name, playlistRegistry.value, {
      keySelector: (obj) => obj.name
    });

    searchSuggestions.value = suggestions.slice(0, 5);
  } finally {
    isPreparingSuggestions.value = false;
    canShowSuggestions.value = true;
  }
}, 250);

const saveMatchToHistory = (suggestion: SearchSuggestion) => {
  const isNewHistoryEntry = searchHistory.value.every(
    (entry) => entry.id !== suggestion.id
  );

  if (isNewHistoryEntry) {
    searchHistory.value = [suggestion, ...searchHistory.value].slice(0, 5);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
  }
};

onMounted(fetchAvailablePlaylists);

watch(searchTerm, (newSearchTerm) => findMatchingPlaylists(newSearchTerm));
</script>

<template>
  <i
    v-if="isFetchingPlaylists"
    class="fa-solid fa-spinner fa-spin text-5xl"
  ></i>
  <div
    v-else-if="registryFetchErrorOccurred"
    class="alert alert-error shadow-lg"
  >
    <div>
      <span>Failed to load playlist registry</span>
    </div>
    <div class="flex-none">
      <button class="btn btn-sm btn-ghost" @click="fetchAvailablePlaylists">
        Retry
      </button>
    </div>
  </div>
  <div v-else class="w-full relative inline-block">
    <input
      type="search"
      class="w-full input input-bordered rounded-none placeholder:text-center placeholder:text-base-content placeholder:opacity-80 active:outline-primary focus:outline-primary"
      placeholder="Start typing or paste a playlist URL"
      @blur="canShowSuggestions = false"
      @focus="canShowSuggestions = true"
      v-model="searchTerm"
    />
    <div
      v-show="canShowSuggestions"
      class="w-full absolute z-10 top-full left-0 right-0 bg-base-100 text-left border-l-[1px] border-r-[1px] border-solid border-base-content border-opacity-20"
    >
      <div
        v-if="isPreparingSuggestions"
        class="search-suggestion text-xl text-center"
      >
        <i class="fa-solid fa-spinner fa-spin"></i>
      </div>
      <template v-else>
        <div
          v-if="searchTerm.length > 3 && searchSuggestions.length === 0"
          class="search-suggestion text-center"
        >
          <em>No archived playlists were found</em>
        </div>
        <template v-else>
          <a
            v-for="suggestion in searchSuggestions"
            class="search-suggestion hover:bg-primary hover:text-primary-content focus:bg-primary focus:text-primary-content"
            :href="`/playlists/${suggestion.id}/snapshots`"
            @mousedown.prevent="saveMatchToHistory(suggestion)"
          >
            <!-- Changing the above to click will cause blur to fire first, -->
            <!-- thus removing the anchor before navigation is triggered -->
            {{ suggestion.name }}
          </a>
        </template>
      </template>
    </div>
  </div>
</template>

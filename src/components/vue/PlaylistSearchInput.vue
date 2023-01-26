<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { search } from 'fast-fuzzy';
import { debounce } from 'debounce';

import type { PlaylistSnapshot } from '@/models/PlaylistSnapshot';
import type { SearchSuggestion } from '@/models/SearchSuggestion';
import { getPlaylistIdFromUrl } from '@/utils/getPlaylistIdFromUrl';

const searchTerm = ref('');
const searchHistory = ref<SearchSuggestion[]>(
  JSON.parse(localStorage.getItem('searchHistory') || '[]')
);

const playlistRegistry = ref<SearchSuggestion[]>([]);
const searchSuggestions = ref<SearchSuggestion[]>(searchHistory.value);

const loadingRegistry = ref(true);
const registryLoadErrorOccurred = ref(false);

const isLoadingSuggestions = ref(false);
const canShowSuggestions = ref(false);

const loadPlaylistRegistry = async () => {
  try {
    loadingRegistry.value = true;
    registryLoadErrorOccurred.value = false;

    const githubResponse = await fetch(
      'https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/metadata.json'
    );

    if (!githubResponse.ok) throw new Error(`Archive ${githubResponse.status}`);

    const metadataJson: Record<string, PlaylistSnapshot> =
      await githubResponse.json();

    const playlistEntries = Object.entries(metadataJson).map(
      ([id, { original_name }]) => ({ id, name: original_name })
    );

    playlistRegistry.value = playlistEntries;
  } catch (error) {
    console.error(error);
    registryLoadErrorOccurred.value = true;
  } finally {
    loadingRegistry.value = false;
  }
};

const showSearchHistory = () => (searchSuggestions.value = searchHistory.value);

const findMatchingPlaylists = debounce(async (term: string) => {
  try {
    if (term.length === 0) return showSearchHistory();
    else if (term.length < 3) return (searchSuggestions.value = []);

    isLoadingSuggestions.value = true;

    // Assume the term is a vaild Spotify playlist URL
    // If so, grab the playlist's ID from the URL and load its archive entry
    const playlistId = getPlaylistIdFromUrl(term);
    const githubResponse = await fetch(
      `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/pretty/${playlistId}.json`
    );

    if (!githubResponse.ok) throw new Error(`Archive ${githubResponse.status}`);

    const { original_name }: PlaylistSnapshot = await githubResponse.json();
    const suggestion = { id: playlistId, name: original_name };

    searchSuggestions.value = [suggestion];
  } catch (error) {
    const errorMessage = (error as Error).message;

    // Valid playlist URL was provided, but the archive entry wasn't found
    if (errorMessage === 'Archive 404') return (searchSuggestions.value = []);

    // The term is not a valid playlist URL
    // Perform a fuzzy search against the playlist registry
    const suggestions = search(term, playlistRegistry.value, {
      keySelector: (obj) => obj.name
    });

    searchSuggestions.value = suggestions.slice(0, 5);
  } finally {
    isLoadingSuggestions.value = false;
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

onMounted(loadPlaylistRegistry);

watch(searchTerm, (newSearchTerm) => findMatchingPlaylists(newSearchTerm));
</script>

<template>
  <i v-if="loadingRegistry" class="fa-solid fa-spinner fa-spin text-5xl"></i>
  <div
    v-else-if="registryLoadErrorOccurred"
    class="alert alert-error shadow-lg"
  >
    <div>
      <span>Failed to load playlist registry</span>
    </div>
    <div class="flex-none">
      <button class="btn btn-sm btn-ghost" @click="loadPlaylistRegistry">
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
        v-if="isLoadingSuggestions"
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

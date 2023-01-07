<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

import { search } from 'fast-fuzzy';
import { debounce } from 'debounce';
import { getPlaylistIdFromUrl } from '../../utils/getPlaylistIdFromUrl';

interface PlaylistEntry {
  name: string;
  id: string;
}

const searchTerm = ref('');
const searchHistory = ref<PlaylistEntry[]>(
  JSON.parse(localStorage.getItem('searchHistory') || '[]')
);

const playlistRegistry = ref<PlaylistEntry[]>([]);
const searchSuggestions = ref<PlaylistEntry[]>(searchHistory.value);

const isFetchingPlaylists = ref(true);
const errorOccurred = ref(false);
const canShowSuggestions = ref(false);

const fetchAvailablePlaylists = async () => {
  try {
    isFetchingPlaylists.value = true;
    errorOccurred.value = false;

    const readmeFileContent = await (
      await fetch(
        'https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/README.md'
      )
    ).text();

    const [, playlistLinksMdList] = readmeFileContent.split(
      /## Playlists \\\([0-9]*\\\)\n\n/gm
    );

    const playlistEntries: PlaylistEntry[] = playlistLinksMdList
      .replaceAll('- [', '')
      .replaceAll('\\', '')
      .replaceAll('](', '')
      .replaceAll('.md)', '')
      .split('\n')
      .map((textEntry) => {
        const [name, id] = textEntry.split('/playlists/pretty/');

        return { name, id };
      });

    playlistRegistry.value = playlistEntries;
  } catch (error) {
    console.error(error);
    errorOccurred.value = true;
  } finally {
    isFetchingPlaylists.value = false;
  }
};

const showSearchHistory = () => (searchSuggestions.value = searchHistory.value);

const findMatchingPlaylists = debounce(async (name: string) => {
  try {
    if (name.length === 0) return showSearchHistory();
    else if (name.length < 3) return (searchSuggestions.value = []);

    const playlistId = getPlaylistIdFromUrl(name);
    const githubResponse = await fetch(
      `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/pretty/${playlistId}.json`
    );

    if (!githubResponse.ok) throw new Error('Entry does not exist');

    const playlist = await githubResponse.json();

    return (searchSuggestions.value = [
      { id: playlistId, name: playlist.original_name }
    ]);
  } catch (error) {
    const noopErrorMessages = ['Invalid playlist URL', 'Entry does not exist'];

    if (noopErrorMessages.includes((error as Error).message)) {
      return (searchSuggestions.value = []);
    }

    const matches = search(name, playlistRegistry.value, {
      keySelector: (obj) => obj.name
    });

    searchSuggestions.value = matches.slice(0, 5);
  }
}, 250);

const saveMatchToHistory = (match: PlaylistEntry) => {
  const isNewHistoryEntry = searchHistory.value.every(
    (entry) => entry.id !== match.id
  );

  if (isNewHistoryEntry) {
    searchHistory.value = [match, ...searchHistory.value].slice(0, 5);
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
  <div v-else-if="errorOccurred" class="alert alert-error shadow-lg">
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
      <a
        v-for="match in searchSuggestions"
        class="block p-3 text-inherit border-b-[1px] hover:bg-primary hover:text-primary-content focus:bg-primary focus:text-primary-content border-solid border-base-content border-opacity-20"
        :href="`/playlists/${match.id}/snapshots`"
        @mousedown.prevent="saveMatchToHistory(match)"
      >
        <!-- Changing the above to click will cause blur to fire first, -->
        <!-- thus removing the anchor before navigation is triggered -->
        {{ match.name }}
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const router = useRouter();
const playlistLink = ref('');

const openSnapshotCalendar = async () => {
  const urlObject = new URL(playlistLink.value);
  const params = urlObject.pathname.split('/').filter((p) => p);
  const [collectionName, itemId] = params;

  if (
    urlObject.hostname === 'open.spotify.com' &&
    collectionName === 'playlist' &&
    itemId
  ) {
    await router.push(`/playlists/${itemId}/snapshots`);
  } else {
    throw new Error('This is not a valid playlist link');
  }
};
</script>

<template>
  <NuxtLayout name="centered-content">
    <h1 class="mb-0 text-5xl">Spotify Playlist Archive</h1>
    <div class="flex flex-column justify-content-center text-center">
      <p class="text-xl text-gray-300">
        Browse past versions of thousands of playlists saved over time
      </p>
      <form
        class="w-full"
        @submit.prevent="openSnapshotCalendar"
        @keypress.enter="openSnapshotCalendar"
      >
        <InputText
          v-model="playlistLink"
          type="url"
          class="w-full text-center mt-1 mb-3"
          placeholder="Enter a playlist link"
        />
        <Button
          type="submit"
          label="Browse snapshots"
          :disabled="playlistLink.length === 0"
        />
      </form>
    </div>
  </NuxtLayout>
</template>

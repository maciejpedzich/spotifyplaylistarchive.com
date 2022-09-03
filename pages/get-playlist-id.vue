<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const getPlaylistId = useGetPlaylistId();

const { copy } = useClipboard();
const { isSupported, clipboardWirtePermission, canCopyToClipboard } =
  useCanCopyToClipboard();

const playlistUrl = ref('');
const idToShow = ref('');

const actionButtonLabel = computed(() =>
  canCopyToClipboard.value ? 'Copy ID' : 'Show ID'
);

const copyOrShowPlaylistId = async () => {
  idToShow.value = '';

  const playlistId = getPlaylistId(playlistUrl.value);

  if (!canCopyToClipboard.value) return (idToShow.value = playlistId);

  await copy(playlistId);
  playlistUrl.value = '';

  toast.add({
    severity: 'success',
    summary: 'Success',
    detail: 'Playlist ID has been copied to clipboard',
    life: 5000
  });
};
</script>

<template>
  <NuxtLayout name="centered-content">
    <div class="mx-4">
      <h1 id="get-playlist-id-headline" class="m-0">
        Get playlist's ID from URL
      </h1>
      <ClientOnly>
        <template #fallback>
          <ProgressSpinner />
        </template>
        <p v-if="!canCopyToClipboard">
          You could have the button below copy the ID upon clicking, but
          <span v-if="!isSupported">
            your browser doesn't support functionality required to do so.
          </span>
          <span v-else-if="clipboardWirtePermission !== 'granted'">
            you need to grant this website permission to copy text to clipboard.
          </span>
        </p>
        <InputText
          v-model="playlistUrl"
          class="w-full my-3"
          type="text"
          placeholder="Paste a playlist URL here"
        />
        <Button
          :disabled="playlistUrl.length === 0"
          :label="actionButtonLabel"
          @click="copyOrShowPlaylistId"
        />
        <p v-if="!canCopyToClipboard && idToShow">
          This playlist's ID is: <strong>{{ idToShow }}</strong>
        </p>
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>

<style scoped>
#get-playlist-id-headline {
  font-size: 2.25rem;
}
</style>

<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';

const toast = useToast();
const getPlaylistId = useGetPlaylistId();

const { copy } = useClipboard();
const { canCopyToClipboard } = useCanCopyToClipboard();

const playlistUrl = ref('');
const idToShow = ref('');
const canShowFallbackDialog = ref(false);

const actionButtonLabel = computed(() =>
  canCopyToClipboard.value ? 'Copy ID' : 'Show ID'
);

const copyOrShowPlaylistId = async () => {
  idToShow.value = '';

  const playlistId = getPlaylistId(playlistUrl.value);

  if (!canCopyToClipboard.value) {
    idToShow.value = playlistId;
    canShowFallbackDialog.value = true;
    return;
  }

  await copy(playlistId);
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
      <ClientOnly>
        <template #fallback>
          <ProgressSpinner />
        </template>
        <h1 id="get-playlist-id-headline" class="m-0">
          Get playlist's ID from URL
        </h1>
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
        <Dialog
          header="Success"
          :visible="canShowFallbackDialog"
          :draggable="false"
          :closable="false"
          modal
        >
          This playlist's ID is: <strong>{{ idToShow }}</strong>
          <template #footer>
            <Button label="OK" @click="canShowFallbackDialog = false" />
          </template>
        </Dialog>
      </ClientOnly>
    </div>
  </NuxtLayout>
</template>

<style scoped>
#get-playlist-id-headline {
  font-size: 2.25rem;
}
</style>

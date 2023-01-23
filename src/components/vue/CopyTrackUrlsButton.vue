<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{ urls: string[] }>();

const textToCopy = ref('');
const copySuccess = ref<boolean | null>(null);

const copyTrackUrls = async () => {
  try {
    copySuccess.value = null;
    textToCopy.value = props.urls.join('\n');

    if (!navigator.clipboard) {
      throw new Error('Clipboard API is not supported');
    }

    const { state: clipboardWritePerm } = await navigator.permissions.query({
      name: 'clipboard-write' as PermissionName
    });

    if (clipboardWritePerm === 'denied') {
      throw new Error('Permission to write to clipboard has been denied');
    }

    await navigator.clipboard.writeText(textToCopy.value);

    copySuccess.value = true;
    setTimeout(() => (copySuccess.value = null), 5000);
  } catch (error) {
    copySuccess.value = false;
  }
};
</script>

<template>
  <button
    class="btn btn-ghost hover:text-primary-focus text-base normal-case"
    @click="copyTrackUrls()"
  >
    <i class="fa-solid fa-clipboard-list mr-3"></i>
    Copy Track URLs
  </button>
  <Teleport to="body">
    <template v-if="copySuccess !== null">
      <div v-if="copySuccess === true" class="toast toast-center">
        <div class="alert alert-success min-w-max">
          <div>
            <span>URLs have been copied!</span>
          </div>
        </div>
      </div>
      <div v-else class="modal modal-open">
        <div class="modal-box md:max-w-xl max-w-xs text-center">
          <h3 class="font-bold text-2xl">Error</h3>
          <p class="py-4 text-md">
            Failed to copy track URLs! Select and manually copy the text below:
          </p>
          <div class="w-full max-h-72 overflow-y-auto">
            <pre>{{ textToCopy }}</pre>
          </div>
          <div class="modal-action justify-center">
            <button class="btn" @click="copySuccess = null">Done</button>
          </div>
        </div>
      </div>
    </template>
  </Teleport>
</template>

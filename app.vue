<script setup lang="ts">
import Toast from 'primevue/toast';
</script>

<template>
  <div class="w-full h-full flex flex-column">
    <NavBar />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <ClientOnly>
      <Toast position="bottom-right" />
    </ClientOnly>
  </div>
</template>

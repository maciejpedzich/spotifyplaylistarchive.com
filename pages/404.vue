<template>
  <NuxtLayout name="centered-content">
    <ClientOnly>
      <img id="roland" src="/halved-808.png" alt="Halved TR-808 drum machine" />
    </ClientOnly>
    <p class="mt-0 md:text-2xl text-xl">
      Hello, is it the page you're looking for?
    </p>
    <p class="md:text-sm text-xs text-gray-300">
      <a
        href="https://commons.wikimedia.org/wiki/File:Roland_TR-808_(large).png"
      >
        Roland_TR-808_&amp;_909.jpg: Brandon Danielderivative work: Clusternote </a
      >,
      <a href="https://creativecommons.org/licenses/by-sa/2.0">CC BY-SA 2.0</a>,
      via Wikimedia Commons
    </p>
  </NuxtLayout>
</template>

<style scoped>
#roland {
  max-width: 265px;
}
</style>

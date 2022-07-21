<template>
  <div class="md:text-lg text-base">
    <p class="mt-0 mb-4 mx-3 text-center">
      Click on a highlighted date to show a snapshot captured that day.
    </p>
    <ClientOnly>
      <SnapshotCalendar page="snapshot-pick" />
    </ClientOnly>
  </div>
</template>

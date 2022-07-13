<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core';

import ProgressSpinner from 'primevue/progressspinner';
import Calendar from 'primevue/calendar';

import { CalendarEntry } from '~~/models/calendar-entry';

// Moving these interfaces to separate files makes TypeScript scream at you
interface PrimeVueDate {
  day: number;
  month: number;
  year: number;
  today: boolean;
  otherMonth: boolean;
}

interface DateChangePayload {
  month: number;
  year: number;
}

defineProps<{ page: 'snapshot-pick' | 'compare' }>();

const route = useRoute();
const playlistId = route.params.playlistId;

const isPortableScreen = useMediaQuery('(max-width: 768px)');

const calendarDisplayDate = ref(new Date());
const queryMonth = ref(calendarDisplayDate.value.getMonth());
const queryYear = ref(calendarDisplayDate.value.getFullYear());

const hoursOffset = -(calendarDisplayDate.value.getTimezoneOffset() / 60);
const sinceDateParam = computed(() =>
  new Date(queryYear.value, queryMonth.value, 1, hoursOffset).toISOString()
);
const untilDateParam = computed(() =>
  new Date(queryYear.value, queryMonth.value + 1, 1, hoursOffset).toISOString()
);

const queryString = computed(() => {
  const queryParamsObj = new URLSearchParams();

  queryParamsObj.set('sinceDate', sinceDateParam.value);
  queryParamsObj.set('untilDate', untilDateParam.value);

  return queryParamsObj.toString();
});

const {
  pending: loadingCalendarEntries,
  error: calendarEntriesLoadError,
  data: calendarEntries,
  refresh: reloadCalendarEntries
} = useFetch<CalendarEntry[]>(
  () => `/api/playlists/${playlistId}/snapshots?${queryString.value}`,
  {
    key: `snapshots-calendar-of-${playlistId}`,
    server: false
  }
);

const snapshotLinkMap = computed<Record<string, string>>(() =>
  (calendarEntries.value || []).reduce((map, entry) => {
    const dateCapturedKey = entry.dateCaptured.substring(0, 10);
    map[dateCapturedKey] = `./snapshots/show/${entry.commitSha}`;

    return map;
  }, {})
);

const updateQueryAndReload = async ({ month, year }: DateChangePayload) => {
  queryMonth.value = month;
  queryYear.value = year;

  await reloadCalendarEntries();
};

const primeVueDateToString = ({ year, month, day }: PrimeVueDate) =>
  // PrimeVue Calendar dates' months are zero-based
  // Just like in JavaScript date objects
  [year, month + 1, day]
    .map((num) => num.toString().padStart(2, '0'))
    .join('-');

const getSnapshotLinkFromDate = (calendarDate: PrimeVueDate) =>
  snapshotLinkMap.value[primeVueDateToString(calendarDate)];

const isDateCaptured = (calendarDate: PrimeVueDate) =>
  !!getSnapshotLinkFromDate(calendarDate);
</script>

<template>
  <NuxtLayout name="centered-content">
    <ClientOnly>
      <ProgressSpinner
        v-if="loadingCalendarEntries"
        class="abosulte top-0 right-0"
      />
      <p
        v-else-if="!loadingCalendarEntries && calendarEntriesLoadError"
        class="text-2xl"
      >
        Something went wrong while fetching archive entries
      </p>
      <!-- Changing v-show to v-if breaks month/year change handling -->
      <Calendar
        v-show="!loadingCalendarEntries"
        v-model="calendarDisplayDate"
        :disabled="loadingCalendarEntries"
        :touch-u-i="isPortableScreen"
        inline
        @month-change="updateQueryAndReload"
        @year-change="updateQueryAndReload"
      >
        <template #date="{ date }">
          <NuxtLink
            v-if="isDateCaptured(date as PrimeVueDate)"
            :to="getSnapshotLinkFromDate(date as PrimeVueDate)"
          >
            <span class="bg-primary hover:bg-green-400 text-0 p-3 border-round">
              {{ (date as PrimeVueDate).day }}
            </span>
          </NuxtLink>
          <span v-else>
            {{ (date as PrimeVueDate).day }}
          </span>
        </template>
      </Calendar>
    </ClientOnly>
  </NuxtLayout>
</template>

<style scoped>
:deep(.p-datepicker table td.p-datepicker-today > span.p-highlight) {
  background-color: transparent;
}

:deep(.p-datepicker table.p-datepicker-calendar td > span.p-highlight) {
  background-color: transparent;
}
</style>

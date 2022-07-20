<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';
import Datepicker from '@vuepic/vue-datepicker';

import { CalendarEntry } from '~~/models/calendar-entry';

// Moving this interfaces to separate files makes TypeScript scream at you
interface DateChangePayload {
  month: number;
  year: number;
}

defineProps<{ page: 'snapshot-pick' | 'compare' }>();

const route = useRoute();
const playlistId = route.params.playlistId;

const now = new Date();
const minDate = new Date('2021-12-01');
const queryMonth = ref(now.getMonth());
const queryYear = ref(now.getFullYear());
const displayDate = reactive({ month: queryMonth, year: queryYear });

const hoursOffset = -(now.getTimezoneOffset() / 60);
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
    const dayCapturedKey = entry.dateCaptured.substring(8, 10);

    map[dayCapturedKey] = `./snapshots/show/${entry.commitSha}`;

    return map;
  }, {})
);
const allowedDates = computed(() =>
  Object.keys(JSON.parse(JSON.stringify(snapshotLinkMap.value))).map(
    (dayKey) =>
      new Date(queryYear.value, queryMonth.value, Number(dayKey), hoursOffset)
  )
);

const updateQueryAndReload = async ({ month, year }: DateChangePayload) => {
  queryMonth.value = month;
  queryYear.value = year;

  await reloadCalendarEntries();
};

const getSnapshotLinkFromDate = (day: number) =>
  snapshotLinkMap.value[day.toString().padStart(2, '0')];

const isDayCaptured = (day: number) => !!getSnapshotLinkFromDate(day);

const isQueryMonth = (date: Date) => date.getMonth() === queryMonth.value;
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
      <Datepicker
        v-show="!loadingCalendarEntries"
        v-model="displayDate"
        :min-date="minDate"
        :max-date="now"
        :allowed-dates="allowedDates"
        :enable-time-picker="false"
        :month-change-on-arrows="false"
        :month-change-on-scroll="false"
        no-today
        prevent-min-max-navigation
        inline
        dark
        @update-month-year="updateQueryAndReload"
      >
        <template #day="{ day, date }">
          <NuxtLink
            v-if="isQueryMonth(date) && isDayCaptured(day)"
            class="w-full h-full"
            :to="getSnapshotLinkFromDate(day)"
          >
            <div
              class="w-full h-full flex justify-content-center align-items-center bg-primary hover:bg-green-400 text-0 border-round"
            >
              {{ day }}
            </div>
          </NuxtLink>
          <div v-else class="m-2">
            {{ day }}
          </div>
        </template>
      </Datepicker>
    </ClientOnly>
  </NuxtLayout>
</template>

<style scoped>
:deep(div.dp__calendar_header) {
  width: 100%;
  padding: 0.4rem 0.2rem;
}

:deep(div.dp__cell_inner) {
  margin: 0.5rem;
  padding: 0;
}

:deep(div.dp__overlay_cell_active) {
  background-color: var(--primary-color);
  color: var(--surface-0);
}

:deep(div.dp__action_row:last-of-type) {
  display: none;
}
</style>

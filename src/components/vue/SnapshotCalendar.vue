<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref } from 'vue';

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import type { SnapshotMeta } from '@/models/snapshot-meta';
import type { UpdateMonthYearPayload } from '@/models/update-month-year-payload';

import { queryParamsToDate } from '@/utils/queryParamsToDate';

const props = defineProps<{ playlistId: string }>();

const queryParams = ref<URLSearchParams | null>(null);
const minDate = ref(new Date('2021-01-01'));
const maxDate = ref(new Date());
const startDate = ref(new Date());

const loadingSnapshots = ref(true);
const errorOccurred = ref(false);
const snapshots = ref<SnapshotMeta[]>([]);

const allowedDates = computed(() =>
  snapshots.value.map(({ dateCaptured }) => new Date(dateCaptured))
);

const dateToCommitShaMap = computed<Record<string, string>>(() =>
  snapshots.value.reduce((obj, { dateCaptured, commitSha }) => {
    obj[dateCaptured.substring(8, 10)] = commitSha;

    return obj;
  }, {} as Record<string, string>)
);

const loadSnapshots = async () => {
  try {
    loadingSnapshots.value = true;
    errorOccurred.value = false;

    const queryString = queryParams.value?.toString();
    const apiResponse = await fetch(
      `/playlists/${props.playlistId}/snapshots.json?${queryString}`
    );

    if (!apiResponse.ok) {
      throw new Error(`API ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    snapshots.value = data;
  } catch (error) {
    console.error(error);
    errorOccurred.value = true;
  } finally {
    loadingSnapshots.value = false;
  }
};

const isDisplayedMonth = (date: Date) =>
  date.getMonth() === startDate.value.getMonth();

const getCommitSha = (day: number) =>
  dateToCommitShaMap.value[day.toString().padStart(2, '0')];

const getSnapshotHref = (day: number) =>
  `/playlists/${props.playlistId}/snapshots/${getCommitSha(day)}`;

const updateQueryAndReloadSnapshots = async ({
  month,
  year
}: UpdateMonthYearPayload) => {
  const url = new URL(location.href);

  queryParams.value?.set('month', (month + 1).toString());
  queryParams.value?.set('year', year.toString());
  startDate.value = queryParamsToDate(queryParams.value as URLSearchParams);

  const queryString = queryParams.value?.toString();
  url.search = `?${queryString}`;

  window.history.pushState({}, '', url);
  await loadSnapshots();
};

onBeforeMount(() => {
  queryParams.value = new URLSearchParams(location.search);
  startDate.value = queryParamsToDate(queryParams.value);
});

onMounted(loadSnapshots);
</script>

<template>
  <i v-if="loadingSnapshots" class="fa-solid fa-spinner fa-spin text-5xl"></i>
  <div v-else-if="errorOccurred" class="alert alert-error shadow-lg max-w-sm">
    <div>
      <span>Failed to load playlist registry</span>
    </div>
    <div class="flex-none">
      <button class="btn btn-sm btn-ghost" @click="loadSnapshots">Retry</button>
    </div>
  </div>
  <Datepicker
    v-show="!(loadingSnapshots || errorOccurred)"
    :min-date="minDate"
    :max-date="maxDate"
    :start-date="startDate"
    :allowed-dates="allowedDates"
    :enable-time-picker="false"
    :month-change-on-arrows="false"
    :month-change-on-scroll="false"
    no-swipe
    no-today
    prevent-min-max-navigation
    inline
    @update-month-year="updateQueryAndReloadSnapshots"
  >
    <template #day="{ day, date }">
      <a
        v-if="isDisplayedMonth(date) && getCommitSha(day)"
        class="w-full h-full flex justify-center items-center bg-primary text-primary-content"
        :href="getSnapshotHref(day)"
      >
        {{ day }}
      </a>
      <template v-else>
        {{ day }}
      </template>
    </template>
  </Datepicker>
</template>

<style scoped lang="postcss">
:deep(div.dp__menu) {
  @apply bg-base-100 shadow-xl border-base-content border-opacity-20;
}

:deep(div.dp__calendar_header) {
  @apply w-full px-1 py-2 text-base-content border-base-content border-opacity-20;
}

:deep(div.dp__month_year_row) {
  @apply text-base-content;
}

:deep(div.dp__inner_nav_disabled) {
  @apply bg-transparent opacity-30;
}

:deep(div.dp__calendar_header_separator) {
  @apply bg-base-content opacity-20;
}

:deep(div.dp__month_year_select),
:deep(div.dp__inner_nav),
:deep(div.dp__overlay_cell) {
  @apply hover:bg-primary hover:text-primary-content;
}

:deep(div.dp__inner_nav_disabled) {
  @apply hover:bg-transparent hover:text-inherit;
}

:deep(div.dp__calendar_item) {
  @apply text-base-content;
}

:deep(div.dp__cell_inner) {
  @apply md:mx-2 md:my-1.5 mx-1.5 my-1 p-0 hover:bg-transparent hover:text-inherit;
}

:deep(div.dp__cell_inner > a) {
  @apply hover:opacity-75 hover:text-primary-content focus:text-primary-content active:text-primary-content rounded-full;
}

:deep(div.dp__cell_disabled) {
  @apply text-base-content opacity-30;
}

:deep(div.dp__active_date) {
  @apply bg-transparent text-inherit;
}

:deep(div.dp__action_row:last-of-type) {
  @apply hidden;
}

:deep(div.dp__overlay),
:deep(div.dp__button.dp__overlay_action) {
  @apply bg-base-100 text-base-content;
}

:deep(div.dp__overlay_cell) {
  @apply bg-transparent;
}

:deep(div.dp__overlay_cell_active) {
  @apply bg-primary text-primary-content;
}

:deep(div.dp__overlay_cell_disabled) {
  @apply opacity-30 hover:bg-transparent hover:text-inherit;
}
</style>

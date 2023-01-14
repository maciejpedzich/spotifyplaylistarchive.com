<script setup lang="ts">
import { onBeforeMount, ref } from 'vue';

import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

import type { UpdateMonthYearPayload } from '@/models/update-month-year-payload';

const today = new Date();

const minDate = ref(new Date('2021-01-01'));
const startDate = ref(new Date());

const getStartDateArgs = () => {
  const queryParams = new URLSearchParams(location.search);

  const year = queryParams.has('year')
    ? Math.max(
        Math.min(
          Number(queryParams.get('year')) || today.getFullYear(),
          today.getFullYear()
        ),
        2021
      )
    : today.getFullYear();

  const normalisedMonthParam = Math.min(
    // Query param months aren't zero-based, but JS Date months are
    Math.max((Number(queryParams.get('month')) || 1) - 1, 0),
    11
  );

  const month = queryParams.has('month')
    ? year === today.getFullYear()
      ? Math.min(normalisedMonthParam, today.getMonth())
      : normalisedMonthParam
    : today.getMonth();

  return { month, year };
};

const updateSearchParams = ({ month, year }: UpdateMonthYearPayload) => {
  const url = new URL(location.href);

  url.searchParams.set('month', (month + 1).toString());
  url.searchParams.set('year', year.toString());
  window.history.pushState({}, '', url);
};

onBeforeMount(() => {
  const { month, year } = getStartDateArgs();
  startDate.value = new Date(year, month, 1);
});
</script>

<template>
  <Datepicker
    :min-date="minDate"
    :max-date="today"
    :start-date="startDate"
    :enable-time-picker="false"
    :month-change-on-arrows="false"
    :month-change-on-scroll="false"
    no-swipe
    no-today
    prevent-min-max-navigation
    inline
    @update-month-year="updateSearchParams"
  >
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

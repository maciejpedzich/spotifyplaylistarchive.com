<script setup lang="ts">
import { $fetch } from 'ohmyfetch';

import ProgressSpinner from 'primevue/progressspinner';
import Dropdown from 'primevue/dropdown';
import Chart from 'primevue/chart';

import { CalendarEntry } from '~~/models/calendar-entry';

const route = useRoute();
const playlistId = route.params.playlistId as string;

const chartPeriodOptions = ['Last week', 'Last month'];
const chartPeriod = useState(`chartPeriod${playlistId}`, () => 'Last week');

const sinceDate = computed(() => {
  const baseDate = new Date();

  if (chartPeriod.value === 'Last week') {
    baseDate.setDate(baseDate.getDate() - 7);
  } else {
    baseDate.setMonth(baseDate.getMonth() - 1);
  }

  return baseDate.toISOString();
});

const chartOptions = {
  responsive: true,
  scales: {
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.2)'
      }
    },
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.2)'
      }
    }
  },
  plugins: {
    legend: {
      display: false
    }
  }
};

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric'
});

const { pending, error, data, refresh } = await useLazyAsyncData(
  `playlist-${playlistId}-follower-growth`,
  async () => {
    const snapshots = (
      await $fetch<CalendarEntry[]>(
        `/api/playlists/${playlistId}/snapshots?sinceDate=${sinceDate.value}`
      )
    ).reverse();

    const labels = snapshots.map((snapshot) =>
      dateFormatter.format(Date.parse(snapshot.dateCaptured))
    );
    const numFollowersData = snapshots.map(({ numFollowers }) => numFollowers);

    return {
      labels,
      datasets: [
        {
          type: 'line',
          label: 'Followers',
          borderColor: '#90cd93',
          data: numFollowersData
        }
      ]
    };
  },
  { server: false }
);

watch(chartPeriod, async () => await refresh());
</script>

<template>
  <NuxtLayout name="centered-content">
    <ClientOnly>
      <p class="my-0 text-lg">
        Period:
        <Dropdown
          v-model="chartPeriod"
          :options="chartPeriodOptions"
          :disabled="pending"
        />
      </p>
      <ProgressSpinner v-if="pending" class="mt-3" />
      <p v-else-if="error">
        Something went wrong while fetching follwer growth data
      </p>
      <Chart
        v-else-if="data"
        class="md:w-7 w-full h-4 mt-3"
        type="line"
        :options="chartOptions"
        :data="data"
      />
    </ClientOnly>
  </NuxtLayout>
</template>

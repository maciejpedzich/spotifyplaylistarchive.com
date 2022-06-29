export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (
    error: Error & { status?: number },
    _context
  ) => {
    // eslint-disable-next-line no-console
    console.error(error);

    nuxtApp.vueApp.config.globalProperties.$toast.add({
      severity: 'error',
      summary: 'Error',
      life: 5000,
      detail: error.message
    });
  };
});

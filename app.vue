<template>
  <div>
    <header class="fixed w-full top-0 left-0">
      <NavBar />
    </header>
    <main class="w-screen h-screen">
      <RouterView />
    </main>
    <footer
      class="p-4 flex flex-column items-center text-center gap-2 surface-card border-top-1 surface-border"
    >
      <p class="m-0">
        &copy; {{ new Date().getFullYear() }} Mack Ward, Maciej Pędzich
      </p>
      <p class="m-0">
        This project is not associated with Spotify AB or any of its partners
      </p>
    </footer>
  </div>
</template>

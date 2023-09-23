declare module 'nuxt/schema' {
  interface PublicRuntimeConfig {
    githubRawBaseUrl: string;
  }
}
// It is always important to ensure you import/export something when augmenting a type
export {};

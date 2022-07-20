import { $fetch } from 'ohmyfetch';

export default defineEventHandler(async (event) => {
  const query = useQuery(event);

  const readmeFileContent = await $fetch<string>(
    'https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/README.md'
  );
  const [, playlistLinksMdList] = readmeFileContent.split('## Playlists\n\n');
  const archiveEntries = playlistLinksMdList
    .replaceAll('- [', '')
    .replaceAll('\\', '')
    .replaceAll('](', ' ')
    .replaceAll('.md)', '')
    .split('\n')
    .map((textEntry) => {
      const [title, id] = textEntry.split(' /playlists/pretty/');

      return { title, id };
    })
    .filter((entry) =>
      entry.title.toLowerCase().includes((query.title as string).toLowerCase())
    );

  return archiveEntries;
});

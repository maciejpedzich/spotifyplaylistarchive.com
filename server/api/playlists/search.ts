import { $fetch } from 'ohmyfetch';

export default defineEventHandler(async (event) => {
  const query = useQuery(event);
  const searchTitle = query.title as string;
  const searchPhrases = searchTitle.trim().split(/[ ]{1,}/);

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
      searchPhrases.every((phrase) =>
        entry.title.toLowerCase().includes(phrase.toLowerCase())
      )
    );

  return archiveEntries;
});

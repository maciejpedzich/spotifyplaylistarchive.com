import { $fetch } from 'ohmyfetch';
import { Searcher } from 'fast-fuzzy';

export default defineEventHandler(async (event) => {
  const query = useQuery(event);
  const searchName = query.name as string;

  if (!searchName || searchName.length < 3) return [];

  const readmeFileContent = await $fetch<string>(
    'https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/index.md'
  );
  const [, playlistLinksMdList] = readmeFileContent.split(
    /## Playlists \\\([0-9]*\\\)\n\n/gm
  );
  const archiveEntries = playlistLinksMdList
    .replaceAll('- [', '')
    .replaceAll('\\', '')
    .replaceAll('](', ' ')
    .replaceAll('.md)', '')
    .split('\n')
    .map((textEntry) => {
      const [name, id] = textEntry.split(' /playlists/pretty/');

      return { name, id };
    });

  const fuzzySearcher = new Searcher(archiveEntries, {
    keySelector: (obj) => obj.name
  });
  const searchResults = fuzzySearcher.search(searchName).slice(0, 10);

  return searchResults;
});

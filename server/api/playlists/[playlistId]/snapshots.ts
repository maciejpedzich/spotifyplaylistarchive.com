import { $fetch } from 'ohmyfetch';

import { octokit } from '~~/server/utils/octokit';
import { filterByUniqueKeyValue } from '~~/server/utils/filterByUniqueKeyValue';

export default defineEventHandler(async (event) => {
  const query = useQuery(event);
  const sinceDateParam = (query.sinceDate as unknown as string) || '2021-12-01';
  const untilDateParam =
    (query.untilDate as unknown as string) || new Date().toISOString();
  const DECEMBER_1ST_2021_TIMESTAMP = 16383168e5;

  const since = new Date(
    Math.max(Date.parse(sinceDateParam), DECEMBER_1ST_2021_TIMESTAMP)
  ).toISOString();

  const until = new Date(
    Math.min(Date.parse(untilDateParam), Date.now())
  ).toISOString();

  const playlistId = event.context.params.playlistId;
  const { data: commitListings } = await octokit.rest.repos.listCommits({
    owner: 'mackorone',
    repo: 'spotify-playlist-archive',
    author: 'github-actions[bot]@users.noreply.github.com',
    path: `playlists/pretty/${playlistId}.json`,
    since,
    until
  });

  const snapshotFileContents = await Promise.all(
    commitListings.map(({ sha }) =>
      $fetch<{ snapshot_id: string }>(
        `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/${sha}/playlists/pretty/${playlistId}.json`,
        { parseResponse: JSON.parse }
      )
    )
  );
  const possiblyDuplicateSnapshotEntries = snapshotFileContents.map(
    ({ snapshot_id }, index) => ({
      snapshotId: snapshot_id,
      commitSha: commitListings[index].sha,
      dateCaptured: commitListings[index].commit.author.date
    })
  );
  const uniqueSnapshotEntries = filterByUniqueKeyValue(
    possiblyDuplicateSnapshotEntries,
    'snapshotId'
  );

  return uniqueSnapshotEntries;
});

import type { APIRoute } from 'astro';
import type { PlaylistSnapshot } from '@/models/playlist-snapshot';

import { Octokit } from '@octokit/rest';
import { queryParamsToDate } from '@/utils/queryParamsToDate';

export const get: APIRoute = async ({ request, params }) => {
  try {
    const playlistId = params.playlistId;
    const queryParams = new URLSearchParams(new URL(request.url).search);

    const sinceDate = queryParamsToDate(queryParams);
    const untilDate = new Date(
      sinceDate.getFullYear(),
      sinceDate.getMonth() + 1
    );

    const octokit = new Octokit();
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner: 'mackorone',
      repo: 'spotify-playlist-archive',
      path: `playlists/pretty/${playlistId}.json`,
      since: sinceDate.toISOString(),
      until: untilDate.toISOString()
    });

    const possiblyDuplicateSnapshots = await Promise.all(
      commits.map(async ({ sha, commit }) => {
        const githubResponse = await fetch(
          `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/${sha}/playlists/pretty/${playlistId}.json`
        );

        if (!githubResponse.ok) {
          throw new Error(`GitHub ${githubResponse.status}`);
        }

        const { snapshot_id, num_followers } =
          (await githubResponse.json()) as PlaylistSnapshot;

        return {
          snapshotId: snapshot_id,
          commitSha: sha,
          dateCaptured: commit.author?.date,
          numFollowers: num_followers
        };
      })
    );

    const body = JSON.stringify(
      queryParams.get('allowDuplicates') === 'yes'
        ? possiblyDuplicateSnapshots
        : // Since commits are sorted by the latest dateCaptured first,
          // the following code will preserve the last item with a duplicate snapshotId value.
          // Therefore, we'll be left with entries containing the earliest dateCaptured.
          [
            ...new Map(
              possiblyDuplicateSnapshots.map((snapshot) => [
                snapshot.snapshotId,
                snapshot
              ])
            ).values()
          ]
    );

    return {
      headers: {
        'Cache-Control': 'max-age=86400'
      },
      body
    };
  } catch (error) {
    console.error(error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to load snapshots'
    });
  }
};

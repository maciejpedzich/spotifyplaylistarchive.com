import type { APIRoute } from 'astro';
import type { PlaylistSnapshot } from '@/models/PlaylistSnapshot';

import { Octokit } from '@octokit/rest';
import { queryParamsToDate } from '@/utils/queryParamsToDate';

export const get: APIRoute = async ({ request, params }) => {
  try {
    const { playlistId } = params;
    const queryParams = new URLSearchParams(new URL(request.url).search);

    const sinceDate = queryParamsToDate(queryParams);
    const untilDate = new Date(
      sinceDate.getFullYear(),
      sinceDate.getMonth() + 1
    );

    const octokit = new Octokit();
    const {
      data: commits,
      headers: { etag }
    } = await octokit.rest.repos.listCommits({
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

    const payload =
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
          ];

    const body = JSON.stringify(payload);

    const cacheControlDirectives =
      Date.now() > untilDate.getTime()
        ? 'max-age=31536000, immutable'
        : 'max-age=86400';

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Cache-Control': `public, ${cacheControlDirectives}`,
        ETag: etag as string
      }
    });
  } catch (error) {
    console.error(error);
    return new Response(null, {
      status: 500,
      statusText: 'Failed to load snapshots'
    });
  }
};

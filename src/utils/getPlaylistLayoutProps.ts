import { decode } from 'html-entities';

import type { AstroGlobal } from 'astro';
import type { PlaylistSnapshot } from '../models/playlist-snapshot';

export async function getPlaylistLayoutProps(Astro: Readonly<AstroGlobal>) {
  const { playlistId } = Astro.params;

  let playlist: PlaylistSnapshot | null = null;
  let title = '';
  let description = '';

  try {
    const githubResponse = await fetch(
      `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/pretty/${playlistId}.json`
    );

    if (!githubResponse.ok) {
      const errorMessage =
        githubResponse.status === 404
          ? "Astro playlist doesn't exist"
          : "Failed to fetch playlist's data";

      throw new Error(errorMessage);
    }

    playlist = (await githubResponse.json()) as PlaylistSnapshot;
    description = decode(playlist.description, { level: 'html5' });

    title =
      playlist.unique_name !== playlist.original_name
        ? `${playlist.unique_name} (${playlist.original_name})`
        : playlist.original_name;
  } catch (e) {
    const expectedErrorMessages = [
      "Failed to fetch playlist's data",
      "Astro playlist doesn't exist"
    ];
    const [miscError] = expectedErrorMessages;
    const errorMessage = (e as Error).message;

    title = 'Error';
    description = expectedErrorMessages.includes(errorMessage)
      ? errorMessage
      : miscError;

    Astro.response.status = description === miscError ? 500 : 404;
    Astro.response.statusText = errorMessage;
  }

  return { playlist, title, description };
}

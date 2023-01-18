import { decode } from 'html-entities';

import type { AstroGlobal } from 'astro';
import type { PlaylistSnapshot } from '../models/playlist-snapshot';

export async function getPlaylistLayoutProps(Astro: Readonly<AstroGlobal>) {
  const { playlistId } = Astro.params;

  let playlist: PlaylistSnapshot | null = null;
  let title = '';
  let description = '';
  let errorOccurred = false;

  try {
    const githubResponse = await fetch(
      `https://raw.githubusercontent.com/mackorone/spotify-playlist-archive/main/playlists/pretty/${playlistId}.json`
    );

    if (!githubResponse.ok) {
      throw new Error(githubResponse.status.toString());
    }

    playlist = (await githubResponse.json()) as PlaylistSnapshot;
    description = decode(playlist.description, { level: 'html5' });

    title =
      playlist.unique_name !== playlist.original_name
        ? `${playlist.unique_name} (${playlist.original_name})`
        : playlist.original_name;
  } catch (error) {
    const isNotFoundError = (error as Error).message === '404';

    errorOccurred = true;
    title = 'Error';
    description = isNotFoundError
      ? "This playlist hasn't been archived yet."
      : "Failed to load playlist's archive entry.";

    Astro.response.status = isNotFoundError ? 404 : 500;
    Astro.response.statusText = description;
  }

  return { playlist, title, description, errorOccurred };
}

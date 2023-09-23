export const getPlaylistIdFromUrl = (url: string) => {
  try {
    const urlObject = new URL(url);
    const [collectionName, playlistId] = urlObject.pathname
      .split('/')
      .filter(Boolean);

    const isValidPlaylistUrl =
      urlObject.hostname === 'open.spotify.com' &&
      collectionName === 'playlist' &&
      playlistId;

    return isValidPlaylistUrl ? playlistId : null;
  } catch {
    return null;
  }
};

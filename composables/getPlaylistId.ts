export const useGetPlaylistId = () => (url: string) => {
  const urlObject = new URL(url);
  const [collectionName, playlistId] = urlObject.pathname
    .split('/')
    .filter(Boolean);

  const isValidPlaylistUrl =
    urlObject.hostname === 'open.spotify.com' &&
    collectionName === 'playlist' &&
    playlistId;

  if (!isValidPlaylistUrl) throw new Error('This is not a valid playlist URL');

  return playlistId;
};

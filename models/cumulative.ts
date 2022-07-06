import { Track } from './track';

export interface Cumulative {
  date_first_scraped: string;
  description: string;
  name: string;
  published_playlist_ids: string[];
  tracks: Track[];
  url: string;
}

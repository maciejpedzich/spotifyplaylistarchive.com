import { Owner } from './owner';
import { Track } from './track';

export interface Playlist {
  description: string;
  num_followers: number;
  original_name: string;
  owner: Owner;
  snapshot_id: string;
  tracks: Track[];
  unique_name: string;
  url: string;
}

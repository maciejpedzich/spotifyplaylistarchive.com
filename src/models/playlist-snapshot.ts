import type { User } from './user';
import type { Track } from './track';

export interface PlaylistSnapshot {
  description: string;
  num_followers: number;
  original_name: string;
  owner: User;
  snapshot_id: string;
  tracks: Track[];
  unique_name: string;
  url: string;
}

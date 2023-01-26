import type { User } from './User';
import type { Track } from './Track';

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

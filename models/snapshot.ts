import { User } from './user';
import { Track } from './track';

export interface Snapshot {
  description: string;
  num_followers: number;
  original_name: string;
  owner: User;
  snapshot_id: string;
  tracks: Track[];
  unique_name: string;
  url: string;
}

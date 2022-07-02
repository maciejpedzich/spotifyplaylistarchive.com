import { Owner } from './owner';

export interface Track {
  added_at: string;
  album: {
    name: string;
    url: string;
  };
  artists: Owner[];
  duration_ms: number;
  name: string;
  url: string;
}

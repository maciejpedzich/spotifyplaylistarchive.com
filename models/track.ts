import { User } from './user';

export interface Track {
  added_at: string;
  album: {
    name: string;
    url: string;
  };
  artists: User[];
  duration_ms: number;
  name: string;
  url: string;
  date_added: string;
  date_added_asterisk: boolean;
  date_removed: string | null;
  position?: string;
  retention?: number;
}

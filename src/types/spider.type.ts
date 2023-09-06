import type { GameStatus } from '../enum/game-status.enum';
import type { User } from './user.type';

export type Spider = {
  id?: number;
  user_id?: number;
  Status?: GameStatus;
  Moves?: number;
  Elapsed?: number;
  Suits?: number;
  created_at?: Date;
  updated_at?: Date;

  user?: User;
};

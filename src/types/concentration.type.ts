import type { GameStatus } from '../enum/game-status.enum';
import type { User } from './user.type';

export type Concentration = {
	id?: number;
	user_id?: number;
	Status?: GameStatus;
	Moves?: number;
	Matched?: number;
	Elapsed?: number;
	created_at?: Date;
	updated_at?: Date;

	user?: User;
};

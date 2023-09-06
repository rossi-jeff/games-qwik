import type { GameStatus } from '../enum/game-status.enum';
import type { TenGrandTurn } from './ten-grand-turn.type';
import type { User } from './user.type';

export type TenGrand = {
	id?: number;
	user_id?: number;
	Status?: GameStatus;
	Score?: number;
	created_at?: Date;
	updated_at?: Date;

	user?: User;
	turns?: TenGrandTurn[];
};
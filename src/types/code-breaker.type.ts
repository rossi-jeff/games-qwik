import type { GameStatus } from '../enum/game-status.enum';
import type { CodeBreakerCode } from './code-breaker-code.type';
import type { CodeBreakerGuess } from './code-breaker-guess.type';
import type { User } from './user.type';

export type CodeBreaker = {
	id?: number;
	user_id?: number;
	Status?: GameStatus;
	Columns?: number;
	Colors?: number;
	Available?: string;
	Score?: number;
	created_at?: Date;
	updated_at?: Date;

	codes?: CodeBreakerCode[];
	guesses?: CodeBreakerGuess[];
	user?: User;
};

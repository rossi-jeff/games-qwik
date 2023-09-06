import type { GameStatus } from '../enum/game-status.enum';
import type { GuessWordGuess } from './guess-word-guess.type';
import type { User } from './user.type';
import type { Word } from './word.type';

export type GuessWord = {
	id?: number;
	user_id?: number;
	WordId?: number;
	Status?: GameStatus;
	Score?: number;
	created_at?: Date;
	updated_at?: Date;

	word?: Word;
	guesses?: GuessWordGuess[];
	user?: User;
};

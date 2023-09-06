import type { GuessWordGuessRating } from './guess-word-guess-rating.type';

export type GuessWordGuess = {
	id?: number;
	GuessWordId?: number;
	Guess?: string;
	created_at?: Date;
	updated_at?: Date;

	ratings?: GuessWordGuessRating[];
};

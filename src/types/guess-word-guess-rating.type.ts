import type { Rating } from '../enum/rating.enum';

export type GuessWordGuessRating = {
	id?: number;
	GuessWordGuessId?: number;
	Rating?: Rating;
	created_at?: Date;
	updated_at?: Date;
};

import type { Color } from '../enum/color.enum';

export type CodeBreakerGuessColor = {
	id?: number;
	code_breaker_guess_id?: number;
	Color?: Color;
	created_at?: Date;
	updated_at?: Date;
};

import type { CodeBreakerGuessColor } from './code-breaker-guess-color.type';
import type { CodeBreakerGuessKey } from './code-breaker-guess-key.type';

export type CodeBreakerGuess = {
	id?: number;
	code_breaker_id?: number;
	created_at?: Date;
	updated_at?: Date;

	colors?: CodeBreakerGuessColor[];
	keys?: CodeBreakerGuessKey[];
};

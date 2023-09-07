import { component$ } from '@builder.io/qwik'
import type { GuessWordGuess } from '../../types/guess-word-guess.type'

export interface GuessWordGuessItemProps {
	guess: GuessWordGuess
}

export const GuessWordGuessItem = component$<GuessWordGuessItemProps>(
	(props) => {
		const { guess } = props
		return (
			<div class="guess-word-guess mb-2">
				{guess.ratings &&
					guess.ratings.map((r, i) => (
						<div key={r.id} class={r.Rating}>
							{guess.Guess ? guess.Guess[i] : ''}
						</div>
					))}
			</div>
		)
	}
)

import { component$ } from '@builder.io/qwik'
import type { GuessWordGuess } from '../../types/guess-word-guess.type'
import { GuessWordGuessItem } from '../guess-word-guess-item/guess-word-guess-item'

export interface GuessWordGuessListProps {
	guesses: GuessWordGuess[]
}

export const GuessWordGuessList = component$<GuessWordGuessListProps>(
	(props) => {
		const { guesses } = props
		return (
			<div>
				<h1>Guesses</h1>
				{guesses.map((guess) => (
					<GuessWordGuessItem key={guess.id} guess={guess} />
				))}
			</div>
		)
	}
)

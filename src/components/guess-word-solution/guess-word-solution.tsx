import { component$ } from '@builder.io/qwik'

export interface GuessWordSolutionProps {
	word: string
}

export const GuessWordSolution = component$<GuessWordSolutionProps>((props) => {
	const { word } = props
	return (
		<div>
			The correct word was <b>{word.toUpperCase()}</b>
		</div>
	)
})

import {
	type QRL,
	component$,
	$,
	useSignal,
	type QwikChangeEvent,
} from '@builder.io/qwik'

export interface GuessWordOptionsProps {
	newGuessWord: QRL<(length: number) => void>
}

export const GuessWordOptions = component$<GuessWordOptionsProps>((props) => {
	const length = useSignal(5)
	const lengths = [4, 5, 6, 7, 8]

	const lengthChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
		length.value = parseInt(e.target.value)
	})

	const newGame = $(() => {
		props.newGuessWord(length.value)
	})
	return (
		<div>
			<label for="length">Length</label>
			<select name="length" value={length.value} onChange$={lengthChanged}>
				{lengths.map((l) => (
					<option key={l} value={l}>
						{l.toString()}
					</option>
				))}
			</select>
			<button onClick$={newGame}>New game</button>
		</div>
	)
})

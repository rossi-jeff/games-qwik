import {
	component$,
	useSignal,
	useTask$,
	$,
	type QwikChangeEvent,
	type QRL,
} from '@builder.io/qwik'

export interface GuessWordGuessFormProps {
	length: number
	sendGuesWordGuess: QRL<(letters: string[]) => void>
}

export const GuessWordGuessForm = component$<GuessWordGuessFormProps>(
	(props) => {
		const letters = useSignal<string[]>([])

		const letterChanged = $((e: QwikChangeEvent<HTMLInputElement>) => {
			const idx = parseInt(e.target.name.split('-').pop() || '-1')
			const letter = e.target.value
			if (idx != -1) letters.value[idx] = letter
		})

		const guessReady = $(() => {
			for (const letter of letters.value) {
				if (letter == '') return false
			}
			return true
		})

		const sendGuess = $(async () => {
			const ready = await guessReady()
			if (!ready) return
			props.sendGuesWordGuess(letters.value)
		})

		useTask$(({ track }) => {
			const length = track(() => props.length)
			letters.value = []
			for (let i = 0; i < length; i++) {
				letters.value.push('')
			}
		})
		return (
			<div class="flex flex-wrap">
				<div class="guess-word-letters">
					{letters.value.map((l, i) => (
						<input
							key={i}
							type="text"
							name={'letter-' + i}
							value={l}
							onChange$={letterChanged}
							maxLength={1}
						/>
					))}
				</div>
				<button onClick$={sendGuess}>Send Guess</button>
			</div>
		)
	}
)

import {
	type QRL,
	component$,
	$,
	useSignal,
	useTask$,
	type QwikChangeEvent,
} from '@builder.io/qwik'
import { DieDisplayLg } from '../die-display-lg/die-display-lg'

export interface YachtTurnDisplayProps {
	roll: string
	heading: string
	btnLabel: string
	rollDice: QRL<(keep: number[]) => void>
	disabled: boolean
}

export const YachtTurnDisplay = component$<YachtTurnDisplayProps>((props) => {
	const { heading, btnLabel, disabled } = props
	const keep = useSignal<number[]>([])
	const dice = useSignal<number[]>([])
	const checked = useSignal<number[]>([])

	const dieChecked = $((e: QwikChangeEvent<HTMLInputElement>) => {
		const value = parseInt(e.target.value)
		const idx = checked.value.indexOf(value)
		if (idx == -1) {
			checked.value.push(value)
		} else {
			checked.value.splice(idx, 1)
		}
		keep.value = []
		for (const idx of checked.value) {
			const d = dice.value[idx]
			keep.value.push(d)
		}
	})

	const rollClicked = $(() => {
		props.rollDice(keep.value)
	})

	useTask$(async () => {
		const { roll } = props
		dice.value = []
		checked.value = []
		for (const d of roll.split(',')) {
			if (d) dice.value.push(parseInt(d))
		}
	})
	return (
		<div class="yacht-turn-display">
			<h1>{heading}</h1>
			<div class="flex flex-wrap">
				{dice.value.map((d, i) => (
					<div key={i} class="mr-4">
						<DieDisplayLg face={d} />
						<div class="w-20 text-center">
							<input
								type="checkbox"
								name={'die-' + i}
								value={i}
								onChange$={dieChecked}
								disabled={disabled}
							/>
						</div>
					</div>
				))}
			</div>
			<button onClick$={rollClicked} disabled={disabled}>
				{btnLabel}
			</button>
		</div>
	)
})

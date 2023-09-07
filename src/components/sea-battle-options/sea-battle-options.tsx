import {
	type QRL,
	component$,
	useSignal,
	$,
	type QwikChangeEvent,
	useTask$,
} from '@builder.io/qwik'
import { ShipTypeArray } from '../../enum/ship-type.enum'

export type SeaBattleGameOptions = {
	Axis: number
	ships: { [key: string]: number }
}

export interface SeaBattleOptionsProps {
	newSeaBattle: QRL<(options: SeaBattleGameOptions) => void>
}

export const SeaBattleOptions = component$<SeaBattleOptionsProps>((props) => {
	const axis = useSignal(8)
	const ships = useSignal<{ [key: string]: number }>({})
	const perType = [0, 1, 2, 3]
	const axes = [6, 8, 10, 12]

	const axisChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
		axis.value = parseInt(e.target.value)
	})

	const shipTypeChanged = $((e: QwikChangeEvent<HTMLSelectElement>) => {
		ships.value[e.target.name] = parseInt(e.target.value)
	})

	const newGame = $(() => {
		props.newSeaBattle({ Axis: axis.value, ships: ships.value })
	})

	useTask$(async () => {
		for (const st of ShipTypeArray) {
			ships.value[st] = 1
		}
	})
	return (
		<div>
			<div class="flex flex-wrap">
				<label for="axis" class="w-24">
					Axis
				</label>
				<select name="axis" onChange$={axisChanged}>
					{axes.map((a, i) => (
						<option key={i} value={a}>
							{a.toString()}
						</option>
					))}
				</select>
			</div>
			{ShipTypeArray.map((st, i) => (
				<div key={i} class="flex flex-wrap">
					<label for={st} class="w-24">
						{st}
					</label>
					<select name={st} value={ships.value[st]} onChange$={shipTypeChanged}>
						{perType.map((q, i) => (
							<option key={i} value={q}>
								{q.toString()}
							</option>
						))}
					</select>
				</div>
			))}
			<button onClick$={newGame}>Place Ships</button>
		</div>
	)
})

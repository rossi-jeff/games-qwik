import {
	type QRL,
	component$,
	useSignal,
	$,
	type QwikChangeEvent,
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
	const ships = useSignal<{ [key: string]: number }>({
		BattleShip: 1,
		Carrier: 1,
		Cruiser: 1,
		PatrolBoat: 1,
		SubMarine: 1,
	})
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
	return (
		<div>
			<div class="flex flex-wrap mb-2">
				<label for="axis" class="w-24">
					Axis
				</label>
				<select name="axis" onChange$={axisChanged}>
					{axes.map((a, i) => (
						<option key={i} value={a} selected={a == axis.value}>
							{a.toString()}
						</option>
					))}
				</select>
			</div>
			{ShipTypeArray.map((st, i) => (
				<div key={i} class="flex flex-wrap mb-2">
					<label for={st} class="w-24">
						{st}
					</label>
					<select name={st} onChange$={shipTypeChanged}>
						{perType.map((q, i) => (
							<option key={i} value={q} selected={q == ships.value[st]}>
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
